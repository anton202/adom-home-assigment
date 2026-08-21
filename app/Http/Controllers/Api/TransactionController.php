<?php

namespace App\Http\Controllers\Api;

use App\DTOs\TransactionFilters;
use App\DTOs\TransactionSort;
use App\Http\Controllers\Controller;
use App\Http\Requests\FlagTransactionRequest;
use App\Http\Requests\IndexTransactionRequest;
use App\Http\Requests\TransactionFilterRequest;
use App\Http\Resources\Api\TransactionResource;
use App\Http\Resources\Api\TransactionSummaryResource;
use App\Services\TransactionService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TransactionController extends Controller
{
    public function __construct(private TransactionService $transactions) {}

    /**
     * List transactions, filtered, sorted and paginated in the database.
     */
    public function index(IndexTransactionRequest $request): AnonymousResourceCollection
    {
        $validated = $request->validated();

        $transactions = $this->transactions->list(
            filters: TransactionFilters::fromArray($validated),
            sort: TransactionSort::fromArray($validated),
            perPage: $request->perPage(),
        );

        return TransactionResource::collection($transactions);
    }

    /**
     * Summary figures for the transactions matching the same filters the
     * listing accepts, aggregated in the database.
     */
    public function summary(TransactionFilterRequest $request): TransactionSummaryResource
    {
        $summary = $this->transactions->summary(
            filters: TransactionFilters::fromArray($request->validated()),
        );

        return new TransactionSummaryResource($summary);
    }

    /**
     * Set the flag on a single transaction.
     */
    public function flag(FlagTransactionRequest $request, int $id): TransactionResource
    {
        return new TransactionResource(
            $this->transactions->setFlagged($id, $request->flagged()),
        );
    }
}
