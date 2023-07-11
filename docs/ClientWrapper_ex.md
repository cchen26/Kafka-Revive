# ClientWrapper

The ClientWrapper class is used to create a wrapper around a Kafka client object. It provides methods for creating a producer and consumer, and handles the connection, subscription, and message processing functionalities.

## When to use it

Use the ClientWrapper when you need to interact with Kafka as a producer or consumer. It simplifies the process of establishing connections, sending messages, and consuming messages from a specific topic. This class is useful for building Kafka-based applications that require message production and consumption capabilities.

## Example

```js
import { ClientWrapper } from "./ClientWrapper";

// Create an instance of the ClientWrapper
const clientWrapper = new ClientWrapper(client, "my-topic", messageCallback);

// Producer operations
const producer = clientWrapper.createProducer();
await producer.connect();
console.log("Producer connected");

const message = {
  topic: "my-topic",
  messages: [{ value: "Hello, Kafka!" }],
};
await producer.send(message);
console.log("Message sent");

// Consumer operations
const groupId = { groupId: "my-consumer-group" };
const consumer = clientWrapper.createConsumer(groupId);
await consumer.connect();
console.log("Consumer connected");

const options = {
  topic: "my-topic",
  fromBeginning: false,
};
await consumer.subscribe(options);
console.log("Consumer subscribed");

await consumer.run({
  eachMessage: async ({ topic, partitions, message }) => {
    console.log(`Received message: ${message.value}`);
  },
});
console.log("Consumer running");
```

## Explanation

In the example above, we create an instance of ClientWrapper by providing the Kafka client (client), the topic to interact with (my-topic), and an optional callback function (messageCallback). We then perform the following operations:

1. Create a producer using createProducer() and establish a connection to the Kafka broker using connect().
2. Send a message to the Kafka broker using send().
3. Create a consumer using createConsumer() and establish a connection to the Kafka broker using connect().
4. Subscribe to the specified topic using subscribe() and receive messages using run().
