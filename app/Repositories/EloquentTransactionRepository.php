<?php

namespace App\Repositories;

use App\DTOs\TransactionFilters;
use App\DTOs\TransactionSort;
use App\Models\Transaction;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class EloquentTransactionRepository implements TransactionRepositoryInterface
{
    /**
     * `!` is used as the LIKE escape character because, unlike a backslash, it
     * needs no further escaping inside a SQL string literal on any driver.
     */
    private const LIKE_ESCAPE_CHARACTER = '!';

    /**
     * @return LengthAwarePaginator<int, Transaction>
     */
    public function paginate(
        TransactionFilters $filters,
        TransactionSort $sort,
        int $perPage,
    ): LengthAwarePaginator {
        return $this->applyFilters(Transaction::query(), $filters)
            ->orderBy($sort->column, $sort->direction)
            ->orderBy('id', $sort->direction)
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * @return array{count: int, total_amount: float}
     */
    public function totals(TransactionFilters $filters): array
    {
        $totals = $this->applyFilters(Transaction::query(), $filters)
            ->toBase()
            ->selectRaw('count(*) as count, coalesce(sum(amount), 0) as total_amount')
            ->first();

        return [
            'count' => (int) ($totals->count ?? 0),
            'total_amount' => round((float) ($totals->total_amount ?? 0), 2),
        ];
    }

    /**
     * @return array<string, array{count: int, total_amount: float}>
     */
    public function totalsByCategory(TransactionFilters $filters): array
    {
        $rows = $this->applyFilters(Transaction::query(), $filters)
            ->toBase()
            ->selectRaw('category, count(*) as count, coalesce(sum(amount), 0) as total_amount')
            ->groupBy('category')
            ->get();

        $totals = [];

        foreach ($rows as $row) {
            $totals[$row->category] = [
                'count' => (int) $row->count,
                'total_amount' => round((float) $row->total_amount, 2),
            ];
        }

        return $totals;
    }

    /**
     * Filtering happens entirely in the database and is shared by every
     * transaction listing endpoint.
     *
     * @param  Builder<Transaction>  $query
     * @return Builder<Transaction>
     */
    private function applyFilters(Builder $query, TransactionFilters $filters): Builder
    {
        return $query
            ->when(
                $filters->dateFrom,
                fn (Builder $query, $dateFrom) => $query->where('occurred_at', '>=', $dateFrom->startOfDay()),
            )
            ->when(
                $filters->dateTo,
                fn (Builder $query, $dateTo) => $query->where('occurred_at', '<=', $dateTo->endOfDay()),
            )
            ->when(
                $filters->category,
                fn (Builder $query, string $category) => $query->where('category', $category),
            )
            ->when(
                $filters->status,
                fn (Builder $query, string $status) => $query->where('status', $status),
            )
            ->when(
                $filters->search,
                fn (Builder $query, string $search) => $query->whereRaw(
                    "lower(merchant) like ? escape '".self::LIKE_ESCAPE_CHARACTER."'",
                    ['%'.mb_strtolower($this->escapeLikeWildcards($search)).'%'],
                ),
            );
    }

    /**
     * Keeps `%` and `_` in a search term literal instead of letting them act as
     * LIKE wildcards.
     */
    private function escapeLikeWildcards(string $search): string
    {
        $escape = self::LIKE_ESCAPE_CHARACTER;

        return str_replace(
            [$escape, '%', '_'],
            [$escape.$escape, $escape.'%', $escape.'_'],
            $search,
        );
    }
}
