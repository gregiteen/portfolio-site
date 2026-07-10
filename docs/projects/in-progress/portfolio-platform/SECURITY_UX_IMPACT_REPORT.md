# Security and UX impact — release gate hardening

## Scope

The generated-theme release path now verifies untrusted model output before it
can create a public skin. The Documenso webhook continues to require its
dedicated timing-safe shared secret.

## User-visible effect

- Invalid source, malformed markup, placeholder drift, or unreviewed image
  artifacts fail closed rather than appearing at a public design URL.
- Generation remains asynchronous: the request returns immediately while the
  full review runs in the background.
- A verified fixed brand asset is size-bounded and duplicate navigation is
  hidden, avoiding layout takeover by generated image output.

## Security controls

- Complete CSS and every layout body receive deterministic validation and a
  `gemini-3.1-pro-preview` release review before persistence.
- The visual review rejects watermarks, checkerboards, garbled text, malformed
  imagery, and UI/HUD artifacts; one corrective hero retry is allowed, then
  the run fails closed.
- The post-public legacy improver no longer has permission to replace an
  approved skin with a lower-assurance result.
- Unauthenticated Documenso webhook delivery receives HTTP 401.

## Residual trade-off

The strongest review path can take longer than a raw first-draft generation.
The page request remains fast and asynchronous; only release waits for the
quality gate.
