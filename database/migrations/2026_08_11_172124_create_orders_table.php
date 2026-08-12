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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->string('status', 30)->default('pending');
            $table->string('payment_status', 30)->default('pending');
            $table->string('customer_first_name');
            $table->string('customer_last_name');
            $table->string('customer_email');
            $table->string('customer_phone', 40)->nullable();
            $table->string('shipping_city');
            $table->string('shipping_street_address');
            $table->string('shipping_address_line_two')->nullable();
            $table->string('shipping_postal_code', 40);
            $table->char('shipping_country_code', 2)->default('US');
            $table->text('customer_note')->nullable();
            $table->unsignedInteger('subtotal_cents');
            $table->unsignedInteger('shipping_cents')->default(0);
            $table->unsignedInteger('tax_cents')->default(0);
            $table->unsignedInteger('discount_cents')->default(0);
            $table->unsignedInteger('total_cents');
            $table->char('currency', 3)->default('USD');
            $table->timestamp('placed_at')->nullable()->index();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index(['payment_status', 'created_at']);
            $table->index(['customer_email', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
