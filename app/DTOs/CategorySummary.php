<?php

namespace App\DTOs;

/**
 * The aggregated figures for a single category under the active filters.
 */
final readonly class CategorySummary
{
    public function __construct(
        public string $category,
        public int $count,
        public float $totalAmount,
    ) {}
}
