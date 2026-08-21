<?php

namespace App\DTOs;

/**
 * The sort column and direction for a transaction listing, with the defaults applied.
 *
 * The allowed values are enforced by the form request; this object only carries
 * them, which keeps the raw strings from being passed around positionally.
 */
final readonly class TransactionSort
{
    public const COLUMNS = ['occurred_at', 'amount'];

    public const DIRECTIONS = ['asc', 'desc'];

    public const DEFAULT_COLUMN = 'occurred_at';

    public const DEFAULT_DIRECTION = 'desc';

    public function __construct(
        public string $column = self::DEFAULT_COLUMN,
        public string $direction = self::DEFAULT_DIRECTION,
    ) {}

    /**
     * @param  array{sort?: string|null, direction?: string|null}  $validated
     */
    public static function fromArray(array $validated): self
    {
        return new self(
            column: $validated['sort'] ?? self::DEFAULT_COLUMN,
            direction: $validated['direction'] ?? self::DEFAULT_DIRECTION,
        );
    }
}
