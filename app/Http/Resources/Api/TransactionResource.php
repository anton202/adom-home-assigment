<?php

namespace App\Http\Resources\Api;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Transaction
 */
class TransactionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'occurred_at' => $this->occurred_at->toIso8601String(),
            'merchant' => $this->merchant,
            'category' => $this->category,
            'amount' => (float) $this->amount,
            'status' => $this->status,
            'flagged' => $this->flagged,
        ];
    }
}
