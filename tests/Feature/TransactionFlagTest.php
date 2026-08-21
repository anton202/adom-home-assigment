<?php

namespace Tests\Feature;

use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class TransactionFlagTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_flags_an_unflagged_transaction(): void
    {
        $transaction = Transaction::factory()->create(['flagged' => false]);

        $this->patchJson("/api/transactions/{$transaction->id}/flag", ['flagged' => true])
            ->assertOk()
            ->assertJsonPath('data.id', $transaction->id)
            ->assertJsonPath('data.flagged', true);

        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'flagged' => true,
        ]);
    }

    public function test_it_unflags_a_flagged_transaction(): void
    {
        $transaction = Transaction::factory()->create(['flagged' => true]);

        $this->patchJson("/api/transactions/{$transaction->id}/flag", ['flagged' => false])
            ->assertOk()
            ->assertJsonPath('data.flagged', false);

        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'flagged' => false,
        ]);
    }

    public function test_it_returns_the_updated_transaction_in_the_listing_shape(): void
    {
        $transaction = Transaction::factory()->create([
            'occurred_at' => '2026-02-10 10:00:00',
            'merchant' => 'Shufersal',
            'category' => 'groceries',
            'amount' => 123.45,
            'status' => 'completed',
            'flagged' => false,
        ]);

        $this->patchJson("/api/transactions/{$transaction->id}/flag", ['flagged' => true])
            ->assertOk()
            ->assertJsonStructure([
                'data' => ['id', 'occurred_at', 'merchant', 'category', 'amount', 'status', 'flagged'],
            ])
            ->assertJsonPath('data.merchant', 'Shufersal')
            ->assertJsonPath('data.category', 'groceries')
            ->assertJsonPath('data.amount', 123.45)
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.occurred_at', $transaction->occurred_at->toIso8601String());
    }

    public function test_it_leaves_the_other_fields_untouched(): void
    {
        $transaction = Transaction::factory()->create([
            'merchant' => 'Rami Levy',
            'category' => 'groceries',
            'amount' => 42.00,
            'status' => 'pending',
            'flagged' => false,
        ]);

        $this->patchJson("/api/transactions/{$transaction->id}/flag", ['flagged' => true])
            ->assertOk();

        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'merchant' => 'Rami Levy',
            'category' => 'groceries',
            'amount' => 42.00,
            'status' => 'pending',
        ]);
    }

    public function test_it_is_idempotent(): void
    {
        $transaction = Transaction::factory()->create(['flagged' => true]);

        $this->patchJson("/api/transactions/{$transaction->id}/flag", ['flagged' => true])
            ->assertOk()
            ->assertJsonPath('data.flagged', true);
    }

    public function test_it_only_updates_the_requested_transaction(): void
    {
        $target = Transaction::factory()->create(['flagged' => false]);
        $other = Transaction::factory()->create(['flagged' => false]);

        $this->patchJson("/api/transactions/{$target->id}/flag", ['flagged' => true])
            ->assertOk();

        $this->assertDatabaseHas('transactions', ['id' => $other->id, 'flagged' => false]);
    }

    public function test_it_returns_a_404_for_an_unknown_id(): void
    {
        Transaction::factory()->create();

        $this->patchJson('/api/transactions/999999/flag', ['flagged' => true])
            ->assertNotFound();
    }

    public function test_it_returns_a_404_for_a_non_numeric_id(): void
    {
        $this->patchJson('/api/transactions/abc/flag', ['flagged' => true])
            ->assertNotFound();
    }

    /**
     * @return array<string, array{array<string, mixed>}>
     */
    public static function invalidBodyProvider(): array
    {
        return [
            'missing flag' => [[]],
            'null flag' => [['flagged' => null]],
            'non boolean string' => [['flagged' => 'maybe']],
            'array injection' => [['flagged' => []]],
            'numeric out of range' => [['flagged' => 2]],
        ];
    }

    /**
     * @param  array<string, mixed>  $body
     */
    #[DataProvider('invalidBodyProvider')]
    public function test_it_rejects_an_invalid_body_with_a_422(array $body): void
    {
        $transaction = Transaction::factory()->create(['flagged' => false]);

        $this->patchJson("/api/transactions/{$transaction->id}/flag", $body)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['flagged']);

        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'flagged' => false,
        ]);
    }

    /**
     * The `boolean` rule also accepts the `1`/`0` a form-encoded client sends.
     *
     * @return array<string, array{mixed, bool}>
     */
    public static function acceptedBooleanProvider(): array
    {
        return [
            'true' => [true, true],
            'false' => [false, false],
            'one' => [1, true],
            'zero' => [0, false],
            'string one' => ['1', true],
            'string zero' => ['0', false],
        ];
    }

    #[DataProvider('acceptedBooleanProvider')]
    public function test_it_accepts_the_boolean_representations_a_client_may_send(mixed $flagged, bool $expected): void
    {
        $transaction = Transaction::factory()->create(['flagged' => ! $expected]);

        $this->patchJson("/api/transactions/{$transaction->id}/flag", ['flagged' => $flagged])
            ->assertOk()
            ->assertJsonPath('data.flagged', $expected);
    }
}
