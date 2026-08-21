<?php

namespace App\Services;

use App\DTOs\CategorySummary;
use App\DTOs\TransactionFilters;
use App\DTOs\TransactionSort;
use App\DTOs\TransactionSummary;
use App\Models\Transaction;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TransactionService
{
    public function __construct(private TransactionRepositoryInterface $transactions) {}

    /**
     * @return LengthAwarePaginator<int, Transaction>
     */
    public function list(
        TransactionFilters $filters,
        TransactionSort $sort,
        int $perPage,
    ): LengthAwarePaginator {
        return $this->transactions->paginate($filters, $sort, $perPage);
    }

    /**
     * The summary figures for the same filters the listing accepts.
     *
     * Every known category is reported, zero-filled when the filters match none
     * of its transactions, so the dashboard renders a stable set of cards.
     */
    public function summary(TransactionFilters $filters): TransactionSummary
    {
        $totals = $this->transactions->totals($filters);
        $byCategory = $this->transactions->totalsByCategory($filters);

        $categories = Transaction::CATEGORIES;
        sort($categories);

        return new TransactionSummary(
            totalCount: $totals['count'],
            totalAmount: $totals['total_amount'],
            byCategory: array_map(
                fn (string $category) => new CategorySummary(
                    category: $category,
                    count: $byCategory[$category]['count'] ?? 0,
                    totalAmount: $byCategory[$category]['total_amount'] ?? 0.0,
                ),
                $categories,
            ),
        );
    }
}
