# RTK - Rust Token Killer

RTK is installed for this project environment and provides token-optimized wrappers around common shell commands. It is useful when command output would otherwise be large or repetitive.

The user should not need to request RTK by name. Agents should choose RTK automatically for noisy shell commands and use native commands when exact output matters.

RTK is a wrapper around the canonical command, not a new Laravel command syntax. Keep Laravel commands written as `php artisan ...`, and prepend `rtk` when the output is expected to be noisy or repetitive. Use `rtk test php artisan test ...` for test runs so Pest/Laravel output is compact while the command remains a real Artisan command.

## How RTK Fits With Graphify

Graphify is the project map. Use it first for codebase understanding, locating implementation areas, architectural questions, and source-change planning.

RTK is the output filter. Use it after Graphify when shell commands are still needed and their output is expected to be noisy.

If a task involves both codebase understanding and shell output, run Graphify first, then use RTK for follow-up commands such as status, diff, search, Artisan discovery, route lists, tests, logs, build, and lint.

## RTK With Laravel Commands

Default to RTK for noisy Artisan commands, especially commands that list, scan, test, or dump application state. Keep short exact commands native when their full output matters.

```bash
rtk php artisan list
rtk php artisan route:list --except-vendor
rtk php artisan config:show app
rtk php artisan about
rtk test php artisan test --compact
rtk test php artisan test --compact tests/Feature/AdminPanelTest.php
rtk php artisan pail --timeout=10
```

Use native `php artisan ...` when creating files, running migrations, generating code, or when exact interactive output is important. Examples: `php artisan make:test --pest SomeFeatureTest --no-interaction`, `php artisan wayfinder:generate --no-interaction`, `php artisan migrate --pretend`.

## Good RTK Uses

```bash
rtk git status
rtk git diff
rtk rg "pattern" .
rtk find "*.tsx" web/src
rtk ls -la
rtk php artisan route:list --except-vendor
rtk php artisan list
rtk php artisan config:show database
rtk npm run build
rtk test npm test
rtk test php artisan test --compact
rtk docker ps
rtk docker logs <container>
```

## Avoid RTK For

- `graphify query`, `graphify path`, `graphify explain`, and `graphify update`
- exact full file reads
- exact diagnostics where truncated output could hide relevant lines
- Artisan commands that create or mutate files or database state, unless the user specifically asks for compact output
- commands where the user explicitly asks to see raw output
- short deterministic commands where filtering adds no value

Use the native command for exact output. Use `rtk proxy <cmd>` only when raw passthrough plus RTK tracking is useful.

## Useful Checks

```bash
rtk --version
rtk gain
rtk discover
rtk rewrite "git status"
```
