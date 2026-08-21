<?php

namespace App\DTOs;

/**
 * The summary figures for the transactions matching a set of filters.
 */
final readonly class TransactionSummary
{
    /**
     * @param  list<CategorySummary>  $byCategory
     */
    public function __construct(
        public int $totalCount,
        public float $totalAmount,
        public array $byCategory,
    ) {}
}
