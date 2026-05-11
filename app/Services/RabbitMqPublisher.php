<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Log;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

final class RabbitMqPublisher
{
    private ?AMQPStreamConnection $connection = null;

    /** @param  array<string, mixed>  $config */
    public function __construct(
        private readonly array $config,
    ) {}

    /**
     * Publish a JSON message to the configured topic exchange.
     *
     * @param  array<string, mixed>  $payload
     */
    public function publish(string $routingKey, array $payload): void
    {
        if (! ($this->config['enabled'] ?? false)) {
            return;
        }

        try {
            $channel = $this->connection()->channel();
            $exchange = (string) $this->config['exchange'];
            $channel->exchange_declare($exchange, 'topic', false, true, false);

            $body = json_encode($payload, JSON_THROW_ON_ERROR);
            $message = new AMQPMessage($body, [
                'content_type' => 'application/json',
                'delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT,
            ]);
            $channel->basic_publish($message, $exchange, $routingKey);
            $channel->close();
        } catch (\Throwable $e) {
            Log::warning('rabbitmq.publish_failed', [
                'routing_key' => $routingKey,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function connection(): AMQPStreamConnection
    {
        if ($this->connection instanceof AMQPStreamConnection) {
            return $this->connection;
        }

        $this->connection = new AMQPStreamConnection(
            (string) $this->config['host'],
            (int) $this->config['port'],
            (string) $this->config['user'],
            (string) $this->config['password'],
            (string) $this->config['vhost'],
        );

        return $this->connection;
    }
}
