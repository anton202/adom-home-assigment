<?php

namespace App\Http\Requests;

use App\DTOs\TransactionSort;
use App\Models\Transaction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexTransactionRequest extends FormRequest
{
    public const DEFAULT_PER_PAGE = 20;

    public const MAX_PER_PAGE = 100;

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
            'sort' => ['nullable', 'string', Rule::in(TransactionSort::COLUMNS)],
            'direction' => ['nullable', 'string', Rule::in(TransactionSort::DIRECTIONS)],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:'.self::MAX_PER_PAGE],
        ];
    }

    public function perPage(): int
    {
        return (int) ($this->validated('per_page') ?? self::DEFAULT_PER_PAGE);
    }
}
