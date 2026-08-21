<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;

/**
 * Example endpoint — returns the distinct categories present in the data.
 * You may use it to populate your category filter.
 */
class CategoryController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $categories = Transaction::query()
            ->select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return response()->json(['data' => $categories]);
    }
}
