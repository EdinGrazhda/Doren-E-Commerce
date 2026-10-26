<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\RunSeoAudit;
use App\Models\SeoAuditRun;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class SeoController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => [
                'runs' => SeoAuditRun::query()
                    ->latest('id')
                    ->limit(max(1, min(50, (int) config('seo.audit.history_limit', 20))))
                    ->get(),
                'automation_enabled' => (bool) config('seo.audit.enabled', false),
                'scope' => 'Catalog content and application configuration only. Page responses, search rankings, traffic, conversions and AI citations are not measured by this audit.',
                'external_data_available' => false,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $run = SeoAuditRun::create([
            'source' => 'admin',
            'triggered_by' => $request->user()->id,
        ]);

        try {
            RunSeoAudit::dispatch($run->id);
        } catch (Throwable $exception) {
            (new RunSeoAudit($run->id))->failed($exception);
            report($exception);

            return response()->json(['message' => 'The audit could not be queued. Please try again later.'], 503);
        }

        return response()->json(['data' => ['run' => $run->refresh()]], 202);
    }
}
