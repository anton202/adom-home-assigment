<?php

namespace Tests\Feature;

use App\Models\Transaction;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class ApiRateLimitTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_reports_the_configured_limit_on_api_responses(): void
    {
        Transaction::factory()->create();

        $this->getJson('/api/transactions')
            ->assertOk()
            ->assertHeader('X-RateLimit-Limit', 120)
            ->assertHeader('X-RateLimit-Remaining', 119);
    }

    public function test_it_rejects_requests_once_the_limit_is_exhausted(): void
    {
        $this->limitApiTo(2);

        $this->getJson('/api/categories')->assertOk();
        $this->getJson('/api/categories')->assertOk();

        $this->getJson('/api/categories')
            ->assertStatus(429)
            ->assertHeader('Retry-After')
            ->assertJsonStructure(['message']);
    }

    public function test_it_counts_each_origin_address_separately(): void
    {
        $this->limitApiTo(1);

        $this->getJson('/api/categories')->assertOk();
        $this->getJson('/api/categories')->assertStatus(429);

        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])
            ->getJson('/api/categories')
            ->assertOk();
    }

    public function test_it_leaves_non_api_routes_unthrottled(): void
    {
        $this->limitApiTo(1);

        $this->getJson('/api/categories')->assertOk();
        $this->getJson('/api/categories')->assertStatus(429);

        $this->get('/')->assertOk();
    }

    /**
     * Redefine the `api` limiter for the duration of one test.
     *
     * The wiring is what is under test, not the production ceiling, so exhausting
     * a deliberately tiny limit beats issuing 121 real requests.
     */
    private function limitApiTo(int $perMinute): void
    {
        RateLimiter::for('api', fn (Request $request): Limit => Limit::perMinute($perMinute)->by($request->ip()));
    }
}
