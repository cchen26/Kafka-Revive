# DLQManager

The DLQManager class is responsible for managing a Dead Letter Queue (DLQ) in a Kafka-based application. It provides methods for creating a DLQ, sending messages to the DLQ, and processing messages from the DLQ for retry purposes.

## When to use it

Use the DLQManager when you need to handle messages that have failed processing in a Kafka consumer. The DLQ allows you to store these failed messages separately for further analysis and potential retry attempts. This class helps manage the creation of the DLQ, sending messages to the DLQ, and consuming and processing messages from the DLQ for retrying.

## Example

```js
import { DLQManager } from "./DLQManager";

// Create an instance of the DLQManager
const dlqManager = new DLQManager(client, "my-topic", messageCallback);

// Create the Dead Letter Queue (DLQ)
await dlqManager.createDLQ();

// Producer operations
const producerConnect = dlqManager.producerConnect();
const producerDisconnect = dlqManager.producerDisconnect();
const producerSend = dlqManager.producerSend({
  topic: "my-topic",
  messages: [{ value: "Hello, Kafka!" }],
});

// Connect the producer to the Kafka broker
await producerConnect();
console.log("Producer connected");

// Send a message to the Kafka topic or the DLQ if an error occurs
await producerSend();
console.log("Message sent");

// Disconnect the producer from the Kafka broker
await producerDisconnect();
console.log("Producer disconnected");

// Consumer operations
const groupId = { groupId: "my-consumer-group" };
const consumerConnect = dlqManager.consumerConnect(groupId);
const consumerSubscribe = dlqManager.consumerSubscribe();
const consumerRun = dlqManager.consumerRun({
  eachMessage: async ({ topic, partitions, message }) => {
    console.log(`Received message: ${message.value}`);
  },
});

// Connect the consumer to the Kafka broker and subscribe to the DLQ topic
await consumerConnect();
console.log("Consumer connected");
await consumerSubscribe();
console.log("Consumer subscribed");

// Process messages from the DLQ
await consumerRun();
console.log("Consumer running");

// Retry operations
await dlqManager.retryConnect();
console.log("Retrying messages");
const retryProcessMessages = dlqManager.retryProcessMessages();
await retryProcessMessages();
console.log("Retry completed");

// Disconnect the consumer from the Kafka broker
await dlqManager.disconnect();
console.log("Consumer disconnected");
```

## Explanation

In the example above, we create an instance of DLQManager by providing the KafkaJS client (client), the topic for the DLQ (my-topic), and an optional callback function (messageCallback). We then perform the following operations:

1. Create the Dead Letter Queue (DLQ) using createDLQ().
2. Establish a connection with the Kafka broker and create the DLQ topic using producerConnect().
3. Send a message to the Kafka topic or the DLQ if an error occurs during send using producerSend().
4. Disconnect the producer from the Kafka broker using producerDisconnect().
5. Establish a connection with the Kafka broker for consuming messages and create the DLQ topic using consumerConnect().
6. Subscribe to the DLQ topic using consumerSubscribe().
7. Run the consumer to process messages from the DLQ using consumerRun().
8. Establish a connection with the Kafka broker for retrying DLQ messages using retryConnect().
9. Process messages from the DLQ for retry purposes using retryProcessMessages().
10. Disconnect the consumer from the Kafka broker using disconnect().
