<?php

use App\Actions\Images\ImageUploadFailed;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();

        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);

        $middleware->redirectUsersTo(fn (): string => route('dashboard'));

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            SecurityHeaders::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->api(append: [
            SecurityHeaders::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->respond(function (Response $response, Throwable $exception, Request $request): Response {
            if ($response->getStatusCode() < 500
                || ! $request->is('api/admin/products', 'api/admin/products/*')
                || ! in_array($request->method(), ['POST', 'PUT', 'PATCH'], true)) {
                return $response;
            }

            $reference = (string) Str::uuid();
            $code = match (true) {
                $exception instanceof ImageUploadFailed => $exception->reason,
                $exception instanceof QueryException => 'product_database_failed',
                default => 'product_save_failed',
            };

            Log::error('Product save failed', [
                'reference' => $reference,
                'code' => $code,
                'method' => $request->method(),
                'path' => $request->path(),
                'exception' => $exception,
            ]);

            return response()->json([
                'message' => 'The product save failed. Check the server log using the reference.',
                'code' => $code,
                'reference' => $reference,
            ], $response->getStatusCode());
        });
    })->create();
