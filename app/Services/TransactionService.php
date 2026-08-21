<?php

namespace App\Services;

use App\DTOs\TransactionFilters;
use App\DTOs\TransactionSort;
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
}
