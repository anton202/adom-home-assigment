<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

// Example endpoint — proves the API plumbing works end to end.
// Add your transaction endpoints below.
Route::get('/categories', CategoryController::class);

// Declared before any `/transactions/{id}` route so the literal segment wins.
Route::get('/transactions/summary', [TransactionController::class, 'summary']);
Route::get('/transactions', [TransactionController::class, 'index']);
