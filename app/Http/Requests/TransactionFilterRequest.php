<?php

namespace App\Http\Requests;

use App\Models\Transaction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * The filter parameters shared by every transaction endpoint.
 *
 * `GET /api/transactions/summary` uses this request as-is; the listing request
 * extends it with sorting and pagination, so a new filter is only ever declared
 * in one place.
 */
class TransactionFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Every parameter is optional, but an unrecognised value is rejected rather
     * than silently dropped. The `string` rules also keep array input
     * (`?category[]=travel`) from reaching the query builder.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'category' => ['nullable', 'string', Rule::in(Transaction::CATEGORIES)],
            'status' => ['nullable', 'string', Rule::in(Transaction::STATUSES)],
            'search' => ['nullable', 'string', 'max:255'],
        ];
    }
}
