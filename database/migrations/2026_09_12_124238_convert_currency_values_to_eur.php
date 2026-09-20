<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('products')->where('currency', 'USD')->update(['currency' => 'EUR']);
        DB::table('orders')->where('currency', 'USD')->update(['currency' => 'EUR']);
        DB::table('order_items')->where('currency', 'USD')->update(['currency' => 'EUR']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('products')->where('currency', 'EUR')->update(['currency' => 'USD']);
        DB::table('orders')->where('currency', 'EUR')->update(['currency' => 'USD']);
        DB::table('order_items')->where('currency', 'EUR')->update(['currency' => 'USD']);
    }
};
