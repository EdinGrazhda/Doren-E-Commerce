<?php

namespace App\Http\Controllers\Api\Admin;

use App\Actions\Campaigns\SaveCampaign;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCampaignRequest;
use App\Http\Requests\Admin\UpdateCampaignRequest;
use App\Models\Campaign;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class CampaignController extends Controller
{
    public function index(): JsonResponse
    {
        $campaigns = Campaign::query()
            ->with('products:id,name,price_cents,currency,primary_image_url')
            ->withCount('products')
            ->latest()
            ->paginate(15);
        $products = Product::query()
            ->select(['id', 'name', 'price_cents', 'currency', 'primary_image_url'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json(['data' => ['campaigns' => $campaigns, 'products' => $products]]);
    }

    public function store(StoreCampaignRequest $request, SaveCampaign $saveCampaign): JsonResponse
    {
        return response()->json([
            'data' => $saveCampaign->execute($request->validated()),
            'message' => 'Campaign created.',
        ], 201);
    }

    public function update(UpdateCampaignRequest $request, Campaign $campaign, SaveCampaign $saveCampaign): JsonResponse
    {
        return response()->json([
            'data' => $saveCampaign->execute($request->validated(), $campaign),
            'message' => 'Campaign updated.',
        ]);
    }

    public function destroy(Campaign $campaign): JsonResponse
    {
        $campaign->delete();

        return response()->json(['message' => 'Campaign deleted.']);
    }
}
