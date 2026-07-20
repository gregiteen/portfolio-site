/**
 * Unit tests for sanitizeAuditVerdict (scripts/render-audit.mjs) — the
 * mechanical enforcement of the reviewer contract. The fixtures below are
 * near-verbatim issues from the 2026-07-20 "SPACE" incident (21 repair
 * passes), which is exactly the behavior this contract exists to prevent.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { sanitizeAuditVerdict } from '../scripts/render-audit.mjs';

const LABELS = [
  'home desktop 1440px',
  'home mobile 390px',
  'projects desktop 1440px',
  'designs desktop 1440px',
  'contact desktop 1440px',
];

test('a properly evidenced blocking issue passes through unchanged', () => {
  const verdict = sanitizeAuditVerdict({
    approved: false,
    score: 4,
    issues: [{
      target: 'home',
      severity: 'blocking',
      issue: 'Stray literal text " } floats beside every project card',
      evidence: 'home desktop 1440px — right of the festech.live card',
    }],
  }, { screenshotLabels: LABELS });
  assert.equal(verdict.issues.length, 1);
  assert.equal(verdict.issues[0].severity, 'blocking');
  assert.equal(verdict.issues[0].issue, 'Stray literal text " } floats beside every project card');
});

test('a blocking issue with no screenshot evidence is demoted to minor', () => {
  const verdict = sanitizeAuditVerdict({
    issues: [{
      target: 'css',
      severity: 'blocking',
      issue: 'The typography feels generic and does not embody the brief',
      evidence: 'general impression',
    }],
  }, { screenshotLabels: LABELS });
  assert.equal(verdict.issues[0].severity, 'minor');
  assert.match(verdict.issues[0].issue, /demoted: no screenshot evidence/);
});

test('content-volume complaints cannot block (SPACE incident regression)', () => {
  const verdict = sanitizeAuditVerdict({
    issues: [{
      target: 'designs_index',
      severity: 'blocking',
      issue: 'The Designs index page only shows two cards in the grid, leaving roughly half the viewport as empty space',
      evidence: 'designs desktop 1440px — below the second card',
    }],
  }, { screenshotLabels: LABELS });
  assert.equal(verdict.issues[0].severity, 'minor');
  assert.match(verdict.issues[0].issue, /demoted: out-of-scope/);
});

test('flipper-bar and CNA-banner complaints cannot block (SPACE incident regression)', () => {
  const verdict = sanitizeAuditVerdict({
    issues: [
      {
        target: 'shell',
        severity: 'blocking',
        issue: 'A persistent top utility bar reading Prev Design / Next Design appears on every page and reads as a leftover debug element',
        evidence: 'home desktop 1440px — top bar',
      },
      {
        target: 'shell',
        severity: 'blocking',
        issue: 'A CNA banner overlaps the header area',
        evidence: 'contact desktop 1440px — top of page',
      },
    ],
  }, { screenshotLabels: LABELS });
  assert.equal(verdict.issues[0].severity, 'minor');
  assert.equal(verdict.issues[1].severity, 'minor');
});

test('filler issues are dropped outright (SPACE incident regression)', () => {
  const verdict = sanitizeAuditVerdict({
    issues: [
      { target: 'home', severity: 'minor', issue: 'placeholder', evidence: 'home desktop 1440px' },
      { target: 'home', severity: 'blocking', issue: 'TBD', evidence: 'home desktop 1440px' },
      { target: 'home', severity: 'minor', issue: '', evidence: 'home desktop 1440px' },
    ],
  }, { screenshotLabels: LABELS });
  assert.equal(verdict.issues.length, 0);
});

test('minor issues keep their severity regardless of evidence', () => {
  const verdict = sanitizeAuditVerdict({
    issues: [{
      target: 'css',
      severity: 'minor',
      issue: 'Slightly tight vertical spacing between the hero quote and bio text',
      evidence: 'somewhere',
    }],
  }, { screenshotLabels: LABELS });
  assert.equal(verdict.issues[0].severity, 'minor');
  assert.doesNotMatch(verdict.issues[0].issue, /demoted/);
});

test('resolved_since_last_pass is normalized to an array', () => {
  assert.deepEqual(sanitizeAuditVerdict({ issues: [] }).resolved_since_last_pass, []);
  assert.deepEqual(
    sanitizeAuditVerdict({ issues: [], resolved_since_last_pass: ['1. stray text fixed'] }).resolved_since_last_pass,
    ['1. stray text fixed'],
  );
});

test('without screenshot labels, evidence enforcement is skipped but scope still applies', () => {
  const verdict = sanitizeAuditVerdict({
    issues: [
      {
        target: 'home',
        severity: 'blocking',
        issue: 'Text overlaps the hero heading badly',
        evidence: '',
      },
      {
        target: 'designs_index',
        severity: 'blocking',
        issue: 'Not enough designs shown in the grid to fill the page',
        evidence: '',
      },
    ],
  }, { screenshotLabels: [] });
  assert.equal(verdict.issues[0].severity, 'blocking');
  assert.equal(verdict.issues[1].severity, 'minor');
});
