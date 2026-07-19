import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEEPSEEK_REPAIR_MODEL,
  buildOpenRouterBody,
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

test('repair requests target DeepSeek V4 Pro with xhigh reasoning and structured output', () => {
  const messages = [{ role: 'user', content: 'repair this candidate' }];
  const body = buildOpenRouterBody({
    model: DEEPSEEK_REPAIR_MODEL,
    messages,
    schema: {
      type: 'OBJECT',
      properties: { css: { type: 'STRING' } },
      required: ['css'],
    },
    reasoningEffort: 'xhigh',
  });

  assert.equal(body.model, 'deepseek/deepseek-v4-pro');
  assert.equal(body.messages, messages);
  assert.deepEqual(body.reasoning, { effort: 'xhigh', exclude: true });
  assert.equal(body.response_format.type, 'json_schema');
  assert.equal(body.response_format.json_schema.schema.type, 'object');
  assert.equal(body.response_format.json_schema.schema.properties.css.type, 'string');
});
