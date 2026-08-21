<?php

namespace App\Providers;

use App\Repositories\Contracts\TransactionRepositoryInterface;
use App\Repositories\EloquentTransactionRepository;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            TransactionRepositoryInterface::class,
            EloquentTransactionRepository::class,
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    /**
     * The limiter behind the `api` middleware group.
     *
     * The endpoints are public and unauthenticated, so the only thing a request
     * can be attributed to is its origin address. The ceiling is deliberately far
     * above what the dashboard asks for — a page load costs three requests, and
     * filters only fetch on submit — so it bounds automated hammering without
     * standing in the way of anyone using the UI.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('api', fn (Request $request): Limit => Limit::perMinute(120)->by($request->ip()));
    }
}
