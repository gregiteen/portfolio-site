import https from 'node:https';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSecret } from 'total-recall-brain/src/core/secrets-store.mjs';

export const DEEPSEEK_REPAIR_MODEL = 'deepseek/deepseek-v4-pro';
export const CLAUDE_VISION_MODEL = 'anthropic/claude-sonnet-5';
export const IMAGE_MODEL = 'google/gemini-3.1-flash-image';
export const IMAGE_MODEL_LITE = 'google/gemini-3.1-flash-lite-image';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_RECALL_DIR = join(__dirname, '..', '..', '.agent', 'skills', 'total-recall');
let recallKeyPromise = null;

export function normalizeJsonSchema(value) {
  if (Array.isArray(value)) return value.map(normalizeJsonSchema);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [
    key,
    key === 'type' && typeof child === 'string'
      ? child.toLowerCase()
      : normalizeJsonSchema(child),
  ]));
}

export function buildOpenRouterBody({
  model,
  messages,
  schema = null,
  maxTokens = 32_768,
  reasoningEffort = 'low',
}) {
  const body = {
    model,
    messages,
    max_tokens: maxTokens,
    reasoning: { effort: reasoningEffort, exclude: true },
    provider: { require_parameters: true },
  };
  if (schema) {
    body.response_format = {
      type: 'json_schema',
      json_schema: {
        name: 'portfolio_result',
        strict: true,
        schema: normalizeJsonSchema(schema),
      },
    };
  }
  return body;
}

export function buildOpenRouterImageBody({
  model = IMAGE_MODEL,
  prompt,
  inputReferences = [],
  resolution = '1K',
  aspectRatio = '1:1',
}) {
  const body = {
    model,
    prompt,
    n: 1,
    resolution,
    aspect_ratio: aspectRatio,
  };
  if (inputReferences.length) body.input_references = inputReferences;
  return body;
}

export async function resolveOpenRouterApiKey({
  apiKey = process.env.OPENROUTER_API_KEY || '',
  recallDir = process.env.TOTAL_RECALL_DIR || DEFAULT_RECALL_DIR,
} = {}) {
  if (apiKey) return apiKey;
  if (!recallKeyPromise) {
    recallKeyPromise = (async () => {
      const upper = await getSecret(recallDir, 'OPENROUTER_API_KEY', {
        actor: 'portfolio-site',
        action: 'runtime_read',
      });
      if (upper.found && upper.value) return upper.value;
      const lower = await getSecret(recallDir, 'openrouter_api_key', {
        actor: 'portfolio-site',
        action: 'runtime_read',
      });
      if (lower.found && lower.value) return lower.value;
      throw new Error('OPENROUTER_API_KEY is missing from Total Recall');
    })().catch((error) => {
      recallKeyPromise = null;
      throw error;
    });
  }
  return recallKeyPromise;
}

function responseContent(json) {
  const content = json?.choices?.[0]?.message?.content;
  if (typeof content === 'string' && content.trim()) return content;
  if (Array.isArray(content)) {
    const text = content.map((part) => part?.text || '').join('');
    if (text.trim()) return text;
  }
  throw new Error(`OpenRouter returned no message content: ${JSON.stringify(json).slice(0, 300)}`);
}

function requestOnce({ apiKey, body, timeoutMs = 300_000 }) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request({
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'HTTP-Referer': 'https://gregiteen.xyz',
        'X-OpenRouter-Title': 'Greg Iteen Portfolio',
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json;
        try {
          json = JSON.parse(data);
        } catch (error) {
          const malformed = new Error(`OpenRouter returned invalid JSON: ${String(error)}`);
          malformed.status = res.statusCode || 0;
          reject(malformed);
          return;
        }
        if ((res.statusCode || 500) >= 400 || json?.error) {
          const failure = new Error(`OpenRouter error ${res.statusCode || 0}: ${JSON.stringify(json?.error || json).slice(0, 300)}`);
          failure.status = res.statusCode || Number(json?.error?.code) || 0;
          const retryAfter = Number(res.headers['retry-after']);
          if (Number.isFinite(retryAfter) && retryAfter > 0) {
            failure.retryAfterMs = Math.min(60_000, retryAfter * 1000);
          }
          reject(failure);
          return;
        }
        try {
          resolve(responseContent(json));
        } catch (error) {
          error.status = res.statusCode || 0;
          reject(error);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('OpenRouter request timed out'));
    });
    req.write(payload);
    req.end();
  });
}

function requestImageOnce({ apiKey, body, timeoutMs = 300_000 }) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request({
      hostname: 'openrouter.ai',
      path: '/api/v1/images',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'HTTP-Referer': 'https://gregiteen.xyz',
        'X-OpenRouter-Title': 'Greg Iteen Portfolio',
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json;
        try {
          json = JSON.parse(data);
        } catch (error) {
          const malformed = new Error(`OpenRouter image API returned invalid JSON: ${String(error)}`);
          malformed.status = res.statusCode || 0;
          reject(malformed);
          return;
        }
        if ((res.statusCode || 500) >= 400 || json?.error) {
          const failure = new Error(`OpenRouter image error ${res.statusCode || 0}: ${JSON.stringify(json?.error || json).slice(0, 300)}`);
          failure.status = res.statusCode || Number(json?.error?.code) || 0;
          const retryAfter = Number(res.headers['retry-after']);
          if (Number.isFinite(retryAfter) && retryAfter > 0) {
            failure.retryAfterMs = Math.min(60_000, retryAfter * 1000);
          }
          reject(failure);
          return;
        }
        const image = json?.data?.[0];
        if (!image?.b64_json) {
          const missing = new Error(`OpenRouter image API returned no image data: ${JSON.stringify(json).slice(0, 300)}`);
          missing.status = res.statusCode || 0;
          reject(missing);
          return;
        }
        resolve({
          buffer: Buffer.from(image.b64_json, 'base64'),
          mediaType: image.media_type || 'image/png',
          usage: json.usage || null,
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('OpenRouter image request timed out'));
    });
    req.write(payload);
    req.end();
  });
}

export function isRetryableOpenRouterError(error) {
  const status = Number(error?.status) || 0;
  if (status === 408 || status === 409 || status === 429 || status >= 500) return true;
  if (status >= 400) return false;
  return /timeout|timed out|ECONN|ENET|EAI_AGAIN|socket|invalid JSON|no message content/i
    .test(error instanceof Error ? error.message : String(error));
}

export async function callOpenRouter({
  prompt = null,
  content = null,
  messages = null,
  model = DEEPSEEK_REPAIR_MODEL,
  schema = null,
  maxTokens = 32_768,
  reasoningEffort = 'low',
  apiKey = null,
  requestRetries = 2,
}) {
  const resolvedKey = await resolveOpenRouterApiKey({ apiKey: apiKey || undefined });
  const resolvedMessages = messages || [{
    role: 'user',
    content: content || prompt || '',
  }];
  const body = buildOpenRouterBody({
    model,
    messages: resolvedMessages,
    schema,
    maxTokens,
    reasoningEffort,
  });
  let lastError;
  for (let attempt = 0; attempt <= requestRetries; attempt++) {
    try {
      return await requestOnce({ apiKey: resolvedKey, body });
    } catch (error) {
      lastError = error;
      if (!isRetryableOpenRouterError(error) || attempt === requestRetries) throw error;
      const delay = error.retryAfterMs || Math.min(8_000, 1_000 * (2 ** attempt));
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

export async function callOpenRouterImage({
  model = IMAGE_MODEL,
  prompt,
  inputReferences = [],
  resolution = '1K',
  aspectRatio = '1:1',
  apiKey = null,
  requestRetries = 2,
}) {
  const resolvedKey = await resolveOpenRouterApiKey({ apiKey: apiKey || undefined });
  const body = buildOpenRouterImageBody({
    model,
    prompt,
    inputReferences,
    resolution,
    aspectRatio,
  });
  let lastError;
  for (let attempt = 0; attempt <= requestRetries; attempt++) {
    try {
      return await requestImageOnce({ apiKey: resolvedKey, body });
    } catch (error) {
      lastError = error;
      if (!isRetryableOpenRouterError(error) || attempt === requestRetries) throw error;
      const delay = error.retryAfterMs || Math.min(8_000, 1_000 * (2 ** attempt));
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
