<?php

namespace Database\Factories;

use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transaction>
 */
class TransactionFactory extends Factory
{
    private const MERCHANTS = [
        'groceries' => ['Shufersal', 'Rami Levy', 'Victory', 'Tiv Taam', 'Yochananof'],
        'dining' => ['Aroma', 'Cafe Greg', 'Wolt', 'Japanika', 'Landwer', 'Miznon'],
        'travel' => ['El Al', 'Isrotel', 'Gett', 'Booking.com', 'Israir', 'Yango'],
        'utilities' => ['IEC Electric', 'Mei Avivim', 'Partner', 'HOT', 'Cellcom', 'Bezeq'],
        'entertainment' => ['Netflix', 'Spotify', 'Cinema City', 'Yes Planet', 'Steam'],
        'shopping' => ['Amazon', 'AliExpress', 'Zara', 'KSP', 'Ivory', 'Fox'],
        'health' => ['Super-Pharm', 'Maccabi Pharm', 'Clalit', 'GoodPharm'],
    ];

    private const AMOUNT_RANGES = [
        'groceries' => [40, 900],
        'dining' => [15, 400],
        'travel' => [30, 4500],
        'utilities' => [80, 1200],
        'entertainment' => [20, 250],
        'shopping' => [25, 2500],
        'health' => [15, 600],
    ];

    public function definition(): array
    {
        $category = $this->faker->randomElement(Transaction::CATEGORIES);
        [$min, $max] = self::AMOUNT_RANGES[$category];
        $statusRoll = $this->faker->numberBetween(1, 100);

        return [
            'occurred_at' => $this->faker->dateTimeBetween('-90 days', 'now'),
            'merchant' => $this->faker->randomElement(self::MERCHANTS[$category]),
            'category' => $category,
            'amount' => $this->faker->randomFloat(2, $min, $max),
            'status' => match (true) {
                $statusRoll <= 85 => 'completed',
                $statusRoll <= 95 => 'pending',
                default => 'failed',
            },
            'flagged' => $this->faker->boolean(3),
        ];
    }
}
