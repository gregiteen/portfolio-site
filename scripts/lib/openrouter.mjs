import https from 'node:https';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSecret } from 'total-recall-brain/src/core/secrets-store.mjs';

// Text generation/repair model. Kimi K3 (1M ctx) replaced DeepSeek V4 Pro after
// a run where DeepSeek never converged on the structural class-binding gate:
// ~11 candidates x 4 repair passes, every one rejected, tokens spent for zero
// designs. K3 costs materially more ($3/$15 per M vs $0.435/$0.87), so keep it
// overridable — THEME_TEXT_MODEL=deepseek/deepseek-v4-pro reverts in one env var.
export const TEXT_MODEL = process.env.THEME_TEXT_MODEL || 'moonshotai/kimi-k3';
export const CLAUDE_VISION_MODEL = 'anthropic/claude-sonnet-5';
export const IMAGE_MODEL = 'fal-ai/flux-pro/v1.1';
export const IMAGE_MODEL_LITE = 'fal-ai/ideogram/v4';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_RECALL_DIR = join(__dirname, '..', '..', '.agent', 'skills', 'total-recall');
let recallKeyPromise = null;
let falKeyPromise = null;

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

// OpenRouter sometimes returns a hard failure inside an HTTP 200 body, e.g.
// `200 {"message":"...requires more credits...","code":402}`. Taking
// res.statusCode unconditionally stamped those as status 200, which slipped
// past the >= 400 non-retryable branch and got retried as if transient.
// The body's own code wins whenever the HTTP layer did not signal an error.
function failureStatus(statusCode, json) {
  const httpStatus = Number(statusCode) || 0;
  const bodyCode = Number(json?.error?.code) || Number(json?.code) || 0;
  if (httpStatus >= 400) return httpStatus;
  return bodyCode || httpStatus;
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
          failure.status = failureStatus(res.statusCode, json);
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
          failure.status = failureStatus(res.statusCode, json);
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
  model = TEXT_MODEL,
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

// ─── Fal.ai image generation ─────────────────────────────────────────────────

export async function resolveFalApiKey({
  apiKey = process.env.FAL_KEY || '',
  recallDir = process.env.TOTAL_RECALL_DIR || DEFAULT_RECALL_DIR,
} = {}) {
  if (apiKey) return apiKey;
  if (!falKeyPromise) {
    falKeyPromise = (async () => {
      const result = await getSecret(recallDir, 'FAL_KEY', {
        actor: 'portfolio-site',
        action: 'runtime_read',
      });
      if (result.found && result.value) return result.value;
      throw new Error('FAL_KEY is missing from Total Recall secrets');
    })().catch((error) => {
      falKeyPromise = null;
      throw error;
    });
  }
  return falKeyPromise;
}

function falRequestOnce({ apiKey, model, body, timeoutMs = 300_000 }) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const url = new URL(`https://fal.run/${model}`);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json;
        try {
          json = JSON.parse(data);
        } catch (error) {
          const malformed = new Error(`Fal returned invalid JSON: ${String(error)}`);
          malformed.status = res.statusCode || 0;
          reject(malformed);
          return;
        }
        if ((res.statusCode || 500) >= 400 || json?.detail) {
          const failure = new Error(`Fal error ${res.statusCode || 0}: ${JSON.stringify(json?.detail || json).slice(0, 300)}`);
          failure.status = res.statusCode || 0;
          reject(failure);
          return;
        }
        const image = json?.images?.[0];
        if (!image?.url) {
          const missing = new Error(`Fal returned no image: ${JSON.stringify(json).slice(0, 300)}`);
          missing.status = res.statusCode || 0;
          reject(missing);
          return;
        }
        // Fetch the image from the returned URL
        https.get(image.url, (imgRes) => {
          const chunks = [];
          imgRes.on('data', (chunk) => chunks.push(chunk));
          imgRes.on('end', () => {
            resolve({
              buffer: Buffer.concat(chunks),
              mediaType: image.content_type || 'image/png',
              usage: null,
            });
          });
          imgRes.on('error', reject);
        }).on('error', reject);
      });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('Fal request timed out'));
    });
    req.write(payload);
    req.end();
  });
}

export async function callFalImage({
  model = IMAGE_MODEL,
  prompt,
  imageUrl = null,
  aspectRatio = '1:1',
  apiKey = null,
  requestRetries = 2,
}) {
  const resolvedKey = await resolveFalApiKey({ apiKey: apiKey || undefined });
  // Fal uses 'landscape_16_9', 'portrait_3_4', 'square' etc.
  const falAspect = aspectRatio === '16:9' ? 'landscape_16_9'
    : aspectRatio === '3:4' ? 'portrait_3_4'
    : aspectRatio === '4:3' ? 'landscape_4_3'
    : 'square';
  const body = { prompt, image_size: falAspect, num_images: 1 };
  if (imageUrl) body.image_url = imageUrl;
  let lastError;
  for (let attempt = 0; attempt <= requestRetries; attempt++) {
    try {
      return await falRequestOnce({ apiKey: resolvedKey, model, body });
    } catch (error) {
      lastError = error;
      const status = Number(error?.status) || 0;
      const retryable = status === 429 || status >= 500 || /timeout|timed out|ECONN/i.test(error?.message || '');
      if (!retryable || attempt === requestRetries) throw error;
      const delay = Math.min(8_000, 1_000 * (2 ** attempt));
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
