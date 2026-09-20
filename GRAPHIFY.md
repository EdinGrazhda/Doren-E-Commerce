# Graphify workflow

Graphify is the local project map. Use focused queries when locating code or assessing dependencies, then verify the relevant source before editing:

```bash
rtk proxy graphify query "specific feature or symbol" --budget 800
rtk proxy graphify explain "SymbolName"
rtk proxy graphify affected "SymbolName"
```

## Automatic refresh after changes

For every user prompt that changes website code, routes, configuration, tests, assets, dependencies, or project instructions:

1. Finish edits, required generation, formatting, and relevant checks.
2. From the repository root run `rtk proxy graphify update .` without asking for confirmation.
3. Wait for completion, check its exit status and warnings, and confirm `graphify-out/graph.json` is readable. Do not treat a preserved old graph as a successful refresh.
4. If source files change afterward, refresh again before the final reply. Graphify's own generated output does not trigger another refresh.

Run once per completed change batch. Skip refreshes for read-only questions. This is an agent completion requirement, not a background watcher or a scheduled job; no commit is required.

`graphify update` refreshes code locally without LLM extraction. Keep normal refreshes token-free: do not automatically run semantic extraction, community labeling, or remote model calls. Report any pending semantic work separately. Keep queries small and do not read the entire graph into context.

If update fails, diagnose it and retry after correcting the cause. Do not automatically use `--force`: first establish why the graph would shrink. If blocked, state that the graph is stale in the final response. Do not overwrite unrelated changes or discard existing semantic nodes to force a successful refresh.

Route all Graphify terminal calls through `rtk proxy` to preserve their exact output. See [RTK.md](RTK.md).
