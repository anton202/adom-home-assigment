<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * The body of `PATCH /api/transactions/{id}/flag`.
 */
class FlagTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * The flag is the only accepted field and must be given explicitly, so a
     * missing or non-boolean body is rejected rather than defaulting to false.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'flagged' => ['required', 'boolean'],
        ];
    }

    public function flagged(): bool
    {
        return (bool) $this->validated('flagged');
    }
}
