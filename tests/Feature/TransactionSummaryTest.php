<?php

namespace Tests\Feature;

use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class TransactionSummaryTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_totals_every_transaction_when_unfiltered(): void
    {
        Transaction::factory()->create(['amount' => '10.50']);
        Transaction::factory()->create(['amount' => '20.25']);
        Transaction::factory()->create(['amount' => '4.25']);

        $response = $this->getJson('/api/transactions/summary')
            ->assertOk()
            ->assertJsonPath('data.total_count', 3)
            ->assertJsonStructure([
                'data' => [
                    'total_count',
                    'total_amount',
                    'by_category' => [
                        ['category', 'count', 'total_amount'],
                    ],
                ],
            ]);

        $this->assertTotalAmount(35.0, $response);
    }

    public function test_it_totals_within_an_inclusive_date_range(): void
    {
        Transaction::factory()->create(['occurred_at' => '2026-01-31 23:59:59', 'amount' => '100.00']);
        Transaction::factory()->create(['occurred_at' => '2026-02-01 00:00:00', 'amount' => '10.00']);
        Transaction::factory()->create(['occurred_at' => '2026-02-28 23:59:59', 'amount' => '20.00']);
        Transaction::factory()->create(['occurred_at' => '2026-03-01 00:00:00', 'amount' => '100.00']);

        $response = $this->getJson('/api/transactions/summary?date_from=2026-02-01&date_to=2026-02-28')
            ->assertOk()
            ->assertJsonPath('data.total_count', 2);

        $this->assertTotalAmount(30.0, $response);
    }

    public function test_it_totals_only_the_requested_category(): void
    {
        Transaction::factory()->count(2)->create(['category' => 'travel', 'amount' => '15.00']);
        Transaction::factory()->create(['category' => 'dining', 'amount' => '99.00']);

        $response = $this->getJson('/api/transactions/summary?category=travel')
            ->assertOk()
            ->assertJsonPath('data.total_count', 2);

        $this->assertTotalAmount(30.0, $response);
    }

    public function test_it_totals_only_the_requested_status(): void
    {
        Transaction::factory()->count(3)->create(['status' => 'pending', 'amount' => '7.00']);
        Transaction::factory()->create(['status' => 'completed', 'amount' => '99.00']);

        $response = $this->getJson('/api/transactions/summary?status=pending')
            ->assertOk()
            ->assertJsonPath('data.total_count', 3);

        $this->assertTotalAmount(21.0, $response);
    }

    public function test_it_totals_case_insensitive_partial_merchant_matches(): void
    {
        Transaction::factory()->create(['merchant' => 'Blue Bottle Coffee', 'amount' => '12.00']);
        Transaction::factory()->create(['merchant' => 'blue lagoon', 'amount' => '8.00']);
        Transaction::factory()->create(['merchant' => 'Red Rooster', 'amount' => '99.00']);

        $response = $this->getJson('/api/transactions/summary?search=BLUE')
            ->assertOk()
            ->assertJsonPath('data.total_count', 2);

        $this->assertTotalAmount(20.0, $response);
    }

    public function test_its_totals_agree_with_the_listing_for_the_same_combined_filters(): void
    {
        Transaction::factory()->count(30)->create();
        Transaction::factory()->count(4)->create([
            'occurred_at' => '2026-02-10 12:00:00',
            'merchant' => 'Northwind Rail',
            'status' => 'completed',
            'category' => 'travel',
        ]);

        $query = 'date_from=2026-02-01&date_to=2026-02-28&status=completed&category=travel&search=northwind';

        $summary = $this->getJson('/api/transactions/summary?'.$query)->assertOk();
        $listing = $this->getJson('/api/transactions?'.$query.'&per_page=100')->assertOk();

        $this->assertSame(
            $listing->json('meta.total'),
            $summary->json('data.total_count'),
        );
        $this->assertTotalAmount(
            round(array_sum(array_column($listing->json('data'), 'amount')), 2),
            $summary,
        );
    }

    public function test_it_breaks_the_totals_down_per_category(): void
    {
        Transaction::factory()->count(2)->create(['category' => 'groceries', 'amount' => '10.00']);
        Transaction::factory()->create(['category' => 'travel', 'amount' => '45.50']);

        $response = $this->getJson('/api/transactions/summary')->assertOk();

        $byCategory = collect($response->json('data.by_category'))->keyBy('category');

        $this->assertSame(2, $byCategory['groceries']['count']);
        $this->assertSame(20.0, (float) $byCategory['groceries']['total_amount']);
        $this->assertSame(1, $byCategory['travel']['count']);
        $this->assertSame(45.5, (float) $byCategory['travel']['total_amount']);
    }

    public function test_it_reports_every_known_category_zero_filled(): void
    {
        Transaction::factory()->create(['category' => 'groceries', 'amount' => '10.00']);

        $response = $this->getJson('/api/transactions/summary')->assertOk();

        $categories = array_column($response->json('data.by_category'), 'category');

        $expected = Transaction::CATEGORIES;
        sort($expected);

        $this->assertSame($expected, $categories);

        $health = collect($response->json('data.by_category'))->firstWhere('category', 'health');

        $this->assertSame(0, $health['count']);
        $this->assertSame(0.0, (float) $health['total_amount']);
    }

    public function test_it_returns_zeroes_when_the_filters_match_nothing(): void
    {
        Transaction::factory()->count(3)->create(['category' => 'travel']);

        $response = $this->getJson('/api/transactions/summary?category=health')
            ->assertOk()
            ->assertJsonPath('data.total_count', 0);

        $this->assertTotalAmount(0.0, $response);

        $this->assertSame(
            [0],
            array_values(array_unique(array_column($response->json('data.by_category'), 'count'))),
        );
    }

    public function test_it_sums_amounts_to_the_cent(): void
    {
        Transaction::factory()->create(['category' => 'dining', 'amount' => '10.10']);
        Transaction::factory()->create(['category' => 'dining', 'amount' => '20.20']);

        $response = $this->getJson('/api/transactions/summary?category=dining')->assertOk();

        $this->assertTotalAmount(30.3, $response);
    }

    /**
     * JSON has no separate integer type, so a whole-number total arrives as
     * `35` rather than `35.0`. Compare the numeric value, not its notation.
     */
    private function assertTotalAmount(float $expected, TestResponse $response): void
    {
        $this->assertSame($expected, (float) $response->json('data.total_amount'));
    }

    /**
     * @return array<string, array{string, array<int, string>}>
     */
    public static function invalidQueryProvider(): array
    {
        return [
            'unknown status' => ['status=banana', ['status']],
            'unknown category' => ['category=nope', ['category']],
            'malformed date_from' => ['date_from=2026-13-01', ['date_from']],
            'date_to before date_from' => ['date_from=2026-02-10&date_to=2026-02-01', ['date_to']],
            'array injection' => ['category[]=travel', ['category']],
            'several invalid params' => ['status=banana&category=nope', ['status', 'category']],
        ];
    }

    /**
     * @param  array<int, string>  $expectedErrorKeys
     */
    #[DataProvider('invalidQueryProvider')]
    public function test_it_rejects_invalid_filters_with_a_422(string $query, array $expectedErrorKeys): void
    {
        Transaction::factory()->count(2)->create();

        $this->getJson('/api/transactions/summary?'.$query)
            ->assertStatus(422)
            ->assertJsonValidationErrors($expectedErrorKeys);
    }
}
