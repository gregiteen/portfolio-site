import { test, describe, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import {
  createSigningRequest,
  fetchDocumentStatus,
  startDocumensoPoller,
} from '../scripts/lib/documenso.mjs';

describe('Documenso API Client', () => {
  let originalFetch;
  let originalEnv;
  let originalSetInterval;
  let fetchMock;

  beforeEach(() => {
    originalFetch = global.fetch;
    originalEnv = { ...process.env };
    originalSetInterval = global.setInterval;

    process.env.DOCUMENSO_BASE_URL = 'https://mock.documenso.xyz';
    process.env.DOCUMENSO_API_KEY = 'mock-api-key';

    fetchMock = mock.fn(async (url, options) => {
      // Default to 404 so unhandled routes fail
      return { ok: false, status: 404, text: async () => 'Not found' };
    });
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
    global.setInterval = originalSetInterval;
    mock.restoreAll();
  });

  test('createSigningRequest returns null if env vars are missing', async () => {
    delete process.env.DOCUMENSO_BASE_URL;
    const res = await createSigningRequest({ pdfBuffer: Buffer.from('test') });
    assert.equal(res, null);
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  test('createSigningRequest orchestrates document creation, upload, field placement, and sending', async () => {
    const urlsCalled = [];
    fetchMock.mock.mockImplementation(async (url, options) => {
      urlsCalled.push(url.toString());
      
      // 1. Create document
      if (url.toString().endsWith('/api/v1/documents') && options.method === 'POST') {
        assert.equal(options.headers['Authorization'], 'Bearer mock-api-key');
        const body = JSON.parse(options.body);
        assert.equal(body.title, 'Test.pdf');
        assert.equal(body.recipients[0].email, 'client@example.com');
        return {
          ok: true,
          json: async () => ({
            uploadUrl: 'https://minio.mock/upload/123',
            documentId: 'doc-123',
            recipients: [{ recipientId: 'rec-456', signingUrl: 'https://mock.documenso.xyz/sign/rec-456' }]
          })
        };
      }
      
      // 2. Presigned PDF upload
      if (url.toString() === 'https://minio.mock/upload/123' && options.method === 'PUT') {
        assert.equal(options.body.toString(), 'pdf-bytes');
        return { ok: true };
      }
      
      // 3. Signature-field placement
      if (url.toString().endsWith('/api/v1/documents/doc-123/fields') && options.method === 'POST') {
        const body = JSON.parse(options.body);
        assert.equal(body.recipientId, 'rec-456');
        assert.equal(body.type, 'SIGNATURE');
        assert.equal(body.pageNumber, 2); // Custom field input
        return { ok: true };
      }
      
      // 4. Send document
      if (url.toString().endsWith('/api/v1/documents/doc-123/send') && options.method === 'POST') {
        return { ok: true };
      }
      
      return { ok: false, status: 500, text: async () => 'Unexpected call' };
    });

    const res = await createSigningRequest({
      pdfBuffer: Buffer.from('pdf-bytes'),
      filename: 'Test.pdf',
      clientEmail: 'client@example.com',
      clientName: 'Client',
      field: { pageNumber: 2 }
    });

    assert.deepEqual(res, { signingUrl: 'https://mock.documenso.xyz/sign/rec-456', submissionId: 'doc-123' });
    assert.equal(urlsCalled.length, 4);
    assert.match(urlsCalled[0], /\/api\/v1\/documents$/);
    assert.equal(urlsCalled[1], 'https://minio.mock/upload/123');
    assert.match(urlsCalled[2], /\/api\/v1\/documents\/doc-123\/fields$/);
    assert.match(urlsCalled[3], /\/api\/v1\/documents\/doc-123\/send$/);
  });

  test('createSigningRequest fails and surfaces network errors on document creation', async () => {
    fetchMock.mock.mockImplementation(async (url) => {
      return { ok: false, status: 401, text: async () => 'Unauthorized access' };
    });

    await assert.rejects(
      () => createSigningRequest({ pdfBuffer: Buffer.from('test') }),
      /Documenso create-document error 401: Unauthorized access/
    );
  });

  test('createSigningRequest fails if uploadUrl or documentId is missing in response', async () => {
    fetchMock.mock.mockImplementation(async (url) => {
      return {
        ok: true,
        json: async () => ({ uploadUrl: 'url' }) // missing documentId
      };
    });

    await assert.rejects(
      () => createSigningRequest({ pdfBuffer: Buffer.from('test') }),
      /missing uploadUrl\/documentId\/recipientId/
    );
  });

  test('createSigningRequest fails on presigned upload failure', async () => {
    fetchMock.mock.mockImplementation(async (url, options) => {
      if (options.method === 'POST') {
        return {
          ok: true,
          json: async () => ({
            uploadUrl: 'https://minio.mock/upload/123',
            documentId: 'doc-123',
            recipients: [{ recipientId: 'rec-456' }]
          })
        };
      }
      if (options.method === 'PUT') {
        return { ok: false, status: 403, text: async () => 'S3 forbidden' };
      }
    });

    await assert.rejects(
      () => createSigningRequest({ pdfBuffer: Buffer.from('test') }),
      /Documenso PDF upload error 403: S3 forbidden/
    );
  });

  test('Poller recovers a missed webhook and updates state', async () => {
    // Mock the poller's interval
    let pollerFn = null;
    global.setInterval = (fn, ms) => {
      pollerFn = fn;
      return 999;
    };

    fetchMock.mock.mockImplementation(async (url) => {
      if (url.toString().endsWith('/api/v1/documents/doc-missed')) {
        return { ok: true, json: async () => ({ status: 'COMPLETED' }) };
      }
      return { ok: false, status: 404, text: async () => 'Not found' };
    });

    const threadsMap = new Map([
      ['thread-1', { signingDocumentId: 'doc-missed', status: 'sent' }],
      ['thread-2', { signingDocumentId: 'doc-pending', status: 'sent' }],
      ['thread-3', { signingDocumentId: 'doc-done', status: 'signed' }] // should be ignored
    ]);

    const upserted = [];
    const notified = [];
    const upsertFn = async (id, thread) => upserted.push({ id, thread });
    const notifyFn = async (id, label) => notified.push({ id, label });

    startDocumensoPoller(threadsMap, upsertFn, notifyFn);
    assert.ok(pollerFn, 'setInterval should have been called');

    // Run the poller cycle
    await pollerFn();

    // Check that thread-1 was updated to signed
    assert.equal(upserted.length, 1);
    assert.equal(upserted[0].id, 'thread-1');
    assert.equal(upserted[0].thread.status, 'signed');
    
    assert.equal(notified.length, 1);
    assert.equal(notified[0].id, 'thread-1');
    assert.equal(notified[0].label, 'signed');

    assert.equal(threadsMap.get('thread-1').status, 'signed');
  });
  
  test('Poller swallows errors gracefully', async () => {
    let pollerFn = null;
    global.setInterval = (fn) => { pollerFn = fn; return 999; };

    fetchMock.mock.mockImplementation(async () => {
      throw new Error('Network down');
    });

    const threadsMap = new Map([
      ['thread-err', { signingDocumentId: 'doc-err', status: 'sent' }]
    ]);

    startDocumensoPoller(threadsMap, async () => {}, async () => {});
    
    // Should not throw
    await assert.doesNotReject(async () => {
      await pollerFn();
    });
    
    assert.equal(threadsMap.get('thread-err').status, 'sent');
  });
});
