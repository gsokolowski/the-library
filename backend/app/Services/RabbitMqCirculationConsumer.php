<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Log;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

final class RabbitMqCirculationConsumer
{
    private const string QUEUE = 'library.circulation';

    /** @param  array<string, mixed>  $config */
    public function __construct(
        private readonly array $config,
        private readonly CirculationFeedHandler $handler,
    ) {}

    public function consume(): void
    {
        if (! ($this->config['enabled'] ?? false)) {
            throw new \RuntimeException('RabbitMQ is disabled. Set RABBITMQ_ENABLED=true to run the circulation consumer.');
        }

        $connection = $this->connection();
        $channel = $connection->channel();
        $exchange = (string) $this->config['exchange'];

        $channel->exchange_declare($exchange, 'topic', false, true, false);
        $channel->queue_declare(self::QUEUE, false, true, false, false);
        $channel->queue_bind(self::QUEUE, $exchange, 'book.returned');
        $channel->queue_bind(self::QUEUE, $exchange, 'book.borrowed');

        $channel->basic_qos(null, 1, null);

        $channel->basic_consume(
            self::QUEUE,
            '',
            false,
            false,
            false,
            false,
            function (AMQPMessage $message): void {
                $this->handleMessage($message);
            },
        );

        Log::info('rabbitmq.circulation_consumer_started', ['queue' => self::QUEUE]);

        while ($channel->is_consuming()) {
            $channel->wait();
        }
    }

    private function handleMessage(AMQPMessage $message): void
    {
        $routingKey = $message->getRoutingKey();

        try {
            /** @var array<string, mixed> $payload */
            $payload = json_decode($message->getBody(), true, 512, JSON_THROW_ON_ERROR);

            if ($routingKey === 'book.returned') {
                $this->handler->handleReturned($payload);
            } elseif ($routingKey === 'book.borrowed') {
                $this->handler->handleBorrowed($payload);
            }

            $message->ack();
        } catch (\Throwable $e) {
            Log::warning('rabbitmq.circulation_consumer_failed', [
                'routing_key' => $routingKey,
                'error' => $e->getMessage(),
            ]);
            $message->nack(false, true);
        }
    }

    private function connection(): AMQPStreamConnection
    {
        return new AMQPStreamConnection(
            (string) $this->config['host'],
            (int) $this->config['port'],
            (string) $this->config['user'],
            (string) $this->config['password'],
            (string) $this->config['vhost'],
        );
    }
}
