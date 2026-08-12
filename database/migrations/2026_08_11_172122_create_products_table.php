<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku')->nullable()->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('price_cents');
            $table->unsignedInteger('compare_at_price_cents')->nullable();
            $table->char('currency', 3)->default('USD');
            $table->string('primary_image_url')->nullable();
            $table->json('gallery_image_urls')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['product_category_id', 'is_active', 'sort_order']);
            $table->index(['is_active', 'is_featured', 'sort_order']);
            $table->index(['is_active', 'published_at']);
            $table->index(['price_cents']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
