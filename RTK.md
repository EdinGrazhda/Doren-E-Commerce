# RTK terminal policy

Use RTK for every terminal command in this project, without waiting for the user to request it.

- Prefer supported compact wrappers for noisy output: `rtk git status`, `rtk git diff`, `rtk rg "pattern" app`, `rtk php artisan route:list --except-vendor`, and `rtk test php artisan test --compact tests/Feature/ExampleTest.php`.
- Use `rtk proxy <command> <args>` for unsupported commands, exact file reads, machine-readable output, scripts, and mutations. Examples: `rtk proxy cat AGENTS.md`, `rtk proxy php artisan make:test --pest ExampleTest --no-interaction`, and `rtk proxy graphify update .`.
- `rtk proxy` preserves raw output and tracks usage; it does not compress output. Use focused searches and small file ranges to keep it concise.
- Preserve the original command arguments, exit status, working directory, environment, and required approvals. Never repeat a mutation just to obtain different output.
- Prefer separate calls for dependent commands. Wrap each executable in a pipeline or command sequence; do not hide unwrapped commands inside a shell script merely to satisfy the prefix rule.
- When filtering obscures an error, obtain exact diagnostics through `rtk proxy`. Do not silently bypass RTK. If RTK is missing or broken, report it and use native commands only as a necessary recovery fallback.
- Native tools such as Boost MCP and apply_patch do not need RTK. RTK commands themselves do not need another wrapper.

Keep Laravel syntax canonical: RTK wraps `php artisan ...`; it does not replace Artisan. For Node tools, use the project's compatible Node runtime; a wrapper does not fix an incorrect Node version.

Use `rtk gain` when savings are requested. Do not dump savings reports after every command. No global shell hook is assumed: agents must explicitly follow this policy.

See [GRAPHIFY.md](GRAPHIFY.md) for the mandatory refresh after changes.
