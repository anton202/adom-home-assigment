<?php

namespace Tests\Feature;

use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Example feature test — shows the testing setup works (in-memory SQLite,
 * factories, JSON assertions). Use it as a starting point for your own tests.
 */
class CategoriesTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_the_distinct_categories_sorted(): void
    {
        Transaction::factory()->count(5)->create(['category' => 'travel']);
        Transaction::factory()->count(3)->create(['category' => 'dining']);

        $response = $this->getJson('/api/categories');

        $response
            ->assertOk()
            ->assertExactJson(['data' => ['dining', 'travel']]);
    }
}
