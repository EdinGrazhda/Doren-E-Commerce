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
        Schema::create('virtual_try_ons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->char('owner_hash', 64);
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('queued');
            $table->string('category');
            $table->string('garment_photo_type');
            $table->text('garment_image_url');
            $table->timestamp('expires_at')->index();
            $table->index(['owner_hash', 'status']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('virtual_try_ons');
    }
};
