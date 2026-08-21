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
}
