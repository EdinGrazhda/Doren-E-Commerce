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
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type', 20);
            $table->unsignedInteger('quantity');
            $table->unsignedInteger('balance_after');
            $table->unsignedInteger('unit_amount_cents')->nullable();
            $table->string('product_name');
            $table->string('variant_name');
            $table->string('sku');
            $table->string('reference', 80)->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['type', 'created_at']);
            $table->index(['product_variant_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
    }
};
