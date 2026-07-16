<?php

use App\Services\RabbitMqCirculationConsumer;
use App\Services\RabbitMqWaitlistConsumer;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('library:consume-waitlist', function (): void {
  $this->info('Waitlist consumer listening for book.returned and book.borrowed…');
  app(RabbitMqWaitlistConsumer::class)->consume();
})->purpose('Consume RabbitMQ waitlist events and create library user notifications');

Artisan::command('library:consume-circulation', function (): void {
  $this->info('Circulation consumer listening for book.returned and book.borrowed…');
  app(RabbitMqCirculationConsumer::class)->consume();
})->purpose('Consume RabbitMQ borrow/return events into the desk activity feed');
