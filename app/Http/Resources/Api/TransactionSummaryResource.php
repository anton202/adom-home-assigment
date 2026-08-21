<?php

namespace App\Http\Resources\Api;

use App\DTOs\CategorySummary;
use App\DTOs\TransactionSummary;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin TransactionSummary
 */
class TransactionSummaryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'total_count' => $this->totalCount,
            'total_amount' => $this->totalAmount,
            'by_category' => array_map(
                fn (CategorySummary $summary) => [
                    'category' => $summary->category,
                    'count' => $summary->count,
                    'total_amount' => $summary->totalAmount,
                ],
                $this->byCategory,
            ),
        ];
    }
}
