<?php

namespace Tests\Feature;

use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class TransactionIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_paginates_with_twenty_per_page_by_default(): void
    {
        Transaction::factory()->count(25)->create();

        $response = $this->getJson('/api/transactions');

        $response
            ->assertOk()
            ->assertJsonCount(20, 'data')
            ->assertJsonPath('meta.total', 25)
            ->assertJsonPath('meta.per_page', 20)
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonStructure([
                'data' => [
                    ['id', 'occurred_at', 'merchant', 'category', 'amount', 'status', 'flagged'],
                ],
                'links',
                'meta',
            ]);
    }

    public function test_it_sorts_by_occurred_at_descending_by_default(): void
    {
        $oldest = Transaction::factory()->create(['occurred_at' => '2026-01-01 10:00:00']);
        $newest = Transaction::factory()->create(['occurred_at' => '2026-03-01 10:00:00']);
        $middle = Transaction::factory()->create(['occurred_at' => '2026-02-01 10:00:00']);

        $response = $this->getJson('/api/transactions');

        $response
            ->assertOk()
            ->assertJsonPath('data.0.id', $newest->id)
            ->assertJsonPath('data.1.id', $middle->id)
            ->assertJsonPath('data.2.id', $oldest->id);
    }

    public function test_it_filters_by_an_inclusive_date_range(): void
    {
        $before = Transaction::factory()->create(['occurred_at' => '2026-01-31 23:59:59']);
        $lowerBoundary = Transaction::factory()->create(['occurred_at' => '2026-02-01 00:00:00']);
        $upperBoundary = Transaction::factory()->create(['occurred_at' => '2026-02-28 23:59:59']);
        $after = Transaction::factory()->create(['occurred_at' => '2026-03-01 00:00:00']);

        $response = $this->getJson('/api/transactions?date_from=2026-02-01&date_to=2026-02-28');

        $response
            ->assertOk()
            ->assertJsonPath('meta.total', 2)
            ->assertJsonPath('data.0.id', $upperBoundary->id)
            ->assertJsonPath('data.1.id', $lowerBoundary->id);

        $this->assertNotContains(
            $before->id,
            array_column($response->json('data'), 'id'),
        );
        $this->assertNotContains(
            $after->id,
            array_column($response->json('data'), 'id'),
        );
    }

    public function test_it_filters_by_category_and_status_together(): void
    {
        $match = Transaction::factory()->create(['category' => 'travel', 'status' => 'pending']);
        Transaction::factory()->create(['category' => 'travel', 'status' => 'completed']);
        Transaction::factory()->create(['category' => 'dining', 'status' => 'pending']);

        $response = $this->getJson('/api/transactions?category=travel&status=pending');

        $response
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $match->id);
    }

    public function test_it_searches_merchants_case_insensitively_on_a_partial_match(): void
    {
        $match = Transaction::factory()->create(['merchant' => 'Shufersal']);
        Transaction::factory()->create(['merchant' => 'Rami Levy']);

        foreach (['shufer', 'SHUFER', 'ShUfEr', 'ersal'] as $term) {
            $this->getJson('/api/transactions?search='.$term)
                ->assertOk()
                ->assertJsonPath('meta.total', 1)
                ->assertJsonPath('data.0.id', $match->id);
        }
    }

    public function test_it_treats_like_wildcards_in_the_search_term_as_literal_characters(): void
    {
        $literal = Transaction::factory()->create(['merchant' => 'Save 100% Store']);
        Transaction::factory()->create(['merchant' => 'Rami Levy']);

        $this->getJson('/api/transactions?search=100%25')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $literal->id);

        $this->getJson('/api/transactions?search=%25')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $literal->id);
    }

    public function test_it_sorts_by_amount_in_the_requested_direction(): void
    {
        $cheap = Transaction::factory()->create(['amount' => 10.50]);
        $expensive = Transaction::factory()->create(['amount' => 999.99]);
        $mid = Transaction::factory()->create(['amount' => 100.00]);

        $this->getJson('/api/transactions?sort=amount&direction=asc')
            ->assertOk()
            ->assertJsonPath('data.0.id', $cheap->id)
            ->assertJsonPath('data.1.id', $mid->id)
            ->assertJsonPath('data.2.id', $expensive->id);

        $this->getJson('/api/transactions?sort=amount&direction=desc')
            ->assertOk()
            ->assertJsonPath('data.0.id', $expensive->id);
    }

    public function test_it_keeps_filters_sorting_and_pagination_consistent_across_pages(): void
    {
        foreach ([50, 40, 30, 20, 10] as $amount) {
            Transaction::factory()->create([
                'category' => 'dining',
                'amount' => $amount,
                'occurred_at' => '2026-02-10 10:00:00',
            ]);
        }
        Transaction::factory()->count(3)->create(['category' => 'travel']);

        $query = 'category=dining&sort=amount&direction=asc&per_page=2';

        $firstPage = $this->getJson("/api/transactions?{$query}&page=1")->assertOk();
        $secondPage = $this->getJson("/api/transactions?{$query}&page=2")->assertOk();

        $this->assertEqualsWithDelta([10, 20], array_column($firstPage->json('data'), 'amount'), 0.001);
        $this->assertEqualsWithDelta([30, 40], array_column($secondPage->json('data'), 'amount'), 0.001);
        $firstPage->assertJsonPath('meta.total', 5)->assertJsonPath('meta.last_page', 3);
    }

    public function test_it_returns_deterministic_pages_when_the_sorted_column_ties(): void
    {
        Transaction::factory()->count(6)->create([
            'occurred_at' => '2026-02-10 10:00:00',
            'amount' => 25.00,
        ]);

        $firstPage = $this->getJson('/api/transactions?per_page=3&page=1')->assertOk();
        $secondPage = $this->getJson('/api/transactions?per_page=3&page=2')->assertOk();

        $ids = array_merge(
            array_column($firstPage->json('data'), 'id'),
            array_column($secondPage->json('data'), 'id'),
        );

        $this->assertCount(6, array_unique($ids));
    }

    public function test_it_honours_a_custom_per_page_and_preserves_filters_in_pagination_links(): void
    {
        Transaction::factory()->count(5)->create(['category' => 'health']);

        $response = $this->getJson('/api/transactions?category=health&per_page=100');

        $response
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.per_page', 100);

        $this->assertStringContainsString('category=health', $response->json('links.first'));
    }

    public function test_it_returns_an_empty_page_beyond_the_last_page(): void
    {
        Transaction::factory()->count(3)->create();

        $this->getJson('/api/transactions?page=9999')
            ->assertOk()
            ->assertJsonCount(0, 'data')
            ->assertJsonPath('meta.total', 3);
    }

    public function test_it_returns_an_empty_result_set_when_nothing_matches(): void
    {
        Transaction::factory()->count(3)->create(['category' => 'dining']);

        $this->getJson('/api/transactions?category=travel')
            ->assertOk()
            ->assertJsonCount(0, 'data')
            ->assertJsonPath('meta.total', 0);
    }

    /**
     * @return array<string, array{string, array<int, string>}>
     */
    public static function invalidQueryProvider(): array
    {
        return [
            'unknown status' => ['status=banana', ['status']],
            'unknown category' => ['category=nope', ['category']],
            'unsortable column' => ['sort=merchant', ['sort']],
            'unknown direction' => ['direction=sideways', ['direction']],
            'impossible date' => ['date_from=2026-13-45', ['date_from']],
            'wrong date format' => ['date_from=18-08-2026', ['date_from']],
            'date_to before date_from' => ['date_from=2026-02-10&date_to=2026-02-01', ['date_to']],
            'per_page below minimum' => ['per_page=0', ['per_page']],
            'per_page above maximum' => ['per_page=101', ['per_page']],
            'non numeric per_page' => ['per_page=abc', ['per_page']],
            'page below minimum' => ['page=0', ['page']],
            'array injection' => ['category[]=travel', ['category']],
            'several invalid params' => ['status=banana&sort=merchant', ['status', 'sort']],
        ];
    }

    /**
     * @param  array<int, string>  $expectedErrorKeys
     */
    #[DataProvider('invalidQueryProvider')]
    public function test_it_rejects_invalid_query_parameters_with_a_422(string $query, array $expectedErrorKeys): void
    {
        Transaction::factory()->count(2)->create();

        $this->getJson('/api/transactions?'.$query)
            ->assertStatus(422)
            ->assertJsonValidationErrors($expectedErrorKeys);
    }

    public function test_it_ignores_parameters_it_does_not_know_about(): void
    {
        Transaction::factory()->count(2)->create();

        $this->getJson('/api/transactions?foo=bar')
            ->assertOk()
            ->assertJsonPath('meta.total', 2);
    }
}
