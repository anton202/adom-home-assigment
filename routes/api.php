<?php

use App\Http\Controllers\Api\CategoryController;
use Illuminate\Support\Facades\Route;

// Example endpoint — proves the API plumbing works end to end.
// Add your transaction endpoints below.
Route::get('/categories', CategoryController::class);
