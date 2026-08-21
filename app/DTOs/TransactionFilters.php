<?php

namespace App\DTOs;

use Carbon\CarbonImmutable;

/**
 * The filters shared by every transaction listing endpoint.
 *
 * Both the list and the summary endpoint accept exactly this set, so parsing
 * lives here once and the repository applies it in a single place.
 */
final readonly class TransactionFilters
{
    public function __construct(
        public ?CarbonImmutable $dateFrom = null,
        public ?CarbonImmutable $dateTo = null,
        public ?string $category = null,
        public ?string $status = null,
        public ?string $search = null,
    ) {}

    /**
     * @param  array{date_from?: string|null, date_to?: string|null, category?: string|null, status?: string|null, search?: string|null}  $validated
     */
    public static function fromArray(array $validated): self
    {
        $search = trim((string) ($validated['search'] ?? ''));

        return new self(
            dateFrom: self::parseDate($validated['date_from'] ?? null),
            dateTo: self::parseDate($validated['date_to'] ?? null),
            category: $validated['category'] ?? null,
            status: $validated['status'] ?? null,
            search: $search === '' ? null : $search,
        );
    }

    private static function parseDate(?string $date): ?CarbonImmutable
    {
        return $date === null ? null : CarbonImmutable::createFromFormat('Y-m-d', $date);
    }
}
