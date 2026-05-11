<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        Book::query()->insert([
            ['title' => 'The GraphQL Guide', 'author' => 'Demo Author', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Redis in Practice', 'author' => 'Cache Writer', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
