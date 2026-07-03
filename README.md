# portfolio-site

An [SSSS](https://github.com/gregiteen/ssss)-native project: a Markdown **vault** is
the source of truth, validated and packaged by the dependency-free `@ssss/cli`.

## Layout

```
vault/         Your SSSS documents (structural + tenant_private primitives).
test/          Conformance test — replays the canonical fixtures + round-trips the vault.
```

## Use

```bash
npm install
npm test                              # prove the toolchain + vault are conformant
npx ssss export vault --profile sale --out dist/bundle.ucw.json   # a tradeable bundle
npx ssss inspect dist/bundle.ucw.json --files
npx ssss help portability             # why a sale export is safe to share
```

The `sale` profile ships every `structural` primitive and **drops** `tenant_private`
ones (the starter `vault/tasks/` file) — see `ssss help portability`.

## Total Recall (memory OS)

This project is also wired for [Total Recall](https://github.com/gregiteen/total-recall):

```bash
npx -p total-recall-brain total-recall init      # seed .agent/skills/total-recall
npx total-recall remember fact "..."             # persist a fact
npx total-recall recall "..."                    # semantic recall
```
