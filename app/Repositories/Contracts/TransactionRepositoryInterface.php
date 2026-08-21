<?php

namespace App\Repositories\Contracts;

use App\DTOs\TransactionFilters;
use App\DTOs\TransactionSort;
use App\Models\Transaction;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface TransactionRepositoryInterface
{
    /**
     * @return LengthAwarePaginator<int, Transaction>
     */
    public function paginate(
        TransactionFilters $filters,
        TransactionSort $sort,
        int $perPage,
    ): LengthAwarePaginator;

    /**
     * The overall figures for the matching transactions.
     *
     * @return array{count: int, total_amount: float}
     */
    public function totals(TransactionFilters $filters): array;

    /**
     * The same figures broken down per category, keyed by category. Only the
     * categories actually present in the matching rows are returned.
     *
     * @return array<string, array{count: int, total_amount: float}>
     */
    public function totalsByCategory(TransactionFilters $filters): array;
}
