<?php

namespace App\Http\Requests;

use App\DTOs\TransactionSort;
use Illuminate\Validation\Rule;

class IndexTransactionRequest extends TransactionFilterRequest
{
    public const DEFAULT_PER_PAGE = 20;

    public const MAX_PER_PAGE = 100;

    /**
     * The shared filters, plus the sorting and pagination parameters that only
     * the listing endpoint understands.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            ...parent::rules(),
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
