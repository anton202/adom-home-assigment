<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    public const CATEGORIES = [
        'groceries',
        'dining',
        'travel',
        'utilities',
        'entertainment',
        'shopping',
        'health',
    ];

    public const STATUSES = ['completed', 'pending', 'failed'];

    protected $fillable = [
        'occurred_at',
        'merchant',
        'category',
        'amount',
        'status',
        'flagged',
    ];

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
            'amount' => 'decimal:2',
            'flagged' => 'boolean',
        ];
    }
}
