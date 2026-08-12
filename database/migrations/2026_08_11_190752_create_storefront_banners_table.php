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
        Schema::create('storefront_banners', function (Blueprint $table) {
            $table->id();
            $table->string('position', 32);
            $table->string('eyebrow')->nullable();
            $table->string('title')->nullable();
            $table->text('subtitle')->nullable();
            $table->text('body')->nullable();
            $table->string('primary_action_label')->nullable();
            $table->string('primary_action_url')->nullable();
            $table->string('secondary_action_label')->nullable();
            $table->string('secondary_action_url')->nullable();
            $table->string('image_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['position', 'is_active', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('storefront_banners');
    }
};
