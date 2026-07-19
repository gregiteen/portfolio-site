import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEEPSEEK_REPAIR_MODEL,
  IMAGE_MODEL,
  buildOpenRouterBody,
  buildOpenRouterImageBody,
  normalizeJsonSchema,
} from '../scripts/lib/openrouter.mjs';

test('OpenRouter normalizes Gemini-style schema type casing recursively', () => {
  assert.deepEqual(normalizeJsonSchema({
    type: 'OBJECT',
    properties: {
      layouts: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
    },
  }), {
    type: 'object',
    properties: {
      layouts: {
        type: 'array',
        items: { type: 'string' },
      },
    },
  });
});

test('repair requests target DeepSeek V4 Pro with bounded reasoning and structured output', () => {
  const messages = [{ role: 'user', content: 'repair this candidate' }];
  const body = buildOpenRouterBody({
    model: DEEPSEEK_REPAIR_MODEL,
    messages,
    schema: {
      type: 'OBJECT',
      properties: { css: { type: 'STRING' } },
      required: ['css'],
    },
    reasoningEffort: 'low',
  });

  assert.equal(body.model, 'deepseek/deepseek-v4-pro');
  assert.equal(body.messages, messages);
  assert.deepEqual(body.reasoning, { effort: 'low', exclude: true });
  assert.equal(body.response_format.type, 'json_schema');
  assert.equal(body.response_format.json_schema.schema.type, 'object');
  assert.equal(body.response_format.json_schema.schema.properties.css.type, 'string');
});

test('image requests use the OpenRouter image API contract with reference images', () => {
  const inputReferences = [{
    type: 'image_url',
    image_url: { url: 'data:image/png;base64,AAAA' },
  }];
  const body = buildOpenRouterImageBody({
    model: IMAGE_MODEL,
    prompt: 'restyle this verified logo',
    inputReferences,
    resolution: '1K',
    aspectRatio: '16:9',
  });

  assert.deepEqual(body, {
    model: 'google/gemini-3.1-flash-image',
    prompt: 'restyle this verified logo',
    n: 1,
    resolution: '1K',
    aspect_ratio: '16:9',
    input_references: inputReferences,
  });
});
