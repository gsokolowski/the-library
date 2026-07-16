<?php

namespace App\Providers;

use App\Models\Book;
use App\Observers\BookObserver;
use App\Services\CirculationFeedHandler;
use App\Services\RabbitMqCirculationConsumer;
use App\Services\RabbitMqPublisher;
use App\Services\RabbitMqWaitlistConsumer;
use App\Services\WaitlistOnBorrowHandler;
use App\Services\WaitlistOnReturnHandler;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(RabbitMqPublisher::class, function ($app): RabbitMqPublisher {
            return new RabbitMqPublisher($app['config']->get('rabbitmq'));
        });

        $this->app->singleton(RabbitMqWaitlistConsumer::class, function ($app): RabbitMqWaitlistConsumer {
            return new RabbitMqWaitlistConsumer(
                $app['config']->get('rabbitmq'),
                $app->make(WaitlistOnReturnHandler::class),
                $app->make(WaitlistOnBorrowHandler::class),
            );
        });

        $this->app->singleton(RabbitMqCirculationConsumer::class, function ($app): RabbitMqCirculationConsumer {
            return new RabbitMqCirculationConsumer(
                $app['config']->get('rabbitmq'),
                $app->make(CirculationFeedHandler::class),
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Book::observe(BookObserver::class);
    }
}
