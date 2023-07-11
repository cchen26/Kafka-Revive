# ConsumerWrapper

The ConsumerWrapper class is a wrapper around the KafkaJS client's consumer. It simplifies the process of consuming messages from a Kafka topic and provides convenient methods for connecting, subscribing, running the consumer, and disconnecting.

## When to use it

Use the ConsumerWrapper when you need to consume messages from a Kafka topic in your application. It abstracts away the complexity of directly interacting with the KafkaJS consumer, providing a more streamlined and convenient interface.

## Example

```js
import { ConsumerWrapper } from "./ConsumerWrapper";

// Create an instance of the ConsumerWrapper
const consumerWrapper = new ConsumerWrapper(
  client,
  "my-topic",
  messageCallback
);

// Connect the consumer to the Kafka broker
const groupId = { groupId: "my-consumer-group" };
const consumer = consumerWrapper.connect(groupId);

// Subscribe the consumer to the topic
const options = {
  fromBeginning: true,
};
consumerWrapper.subscribe(consumer, options);

// Define the message handler function
const handler = {
  eachMessage: async ({ topic, partitions, message }) => {
    console.log(`Received message: ${message.value}`);
  },
};

// Run the consumer with the message handler
consumerWrapper.run(consumer, handler);

// Disconnect the consumer from the Kafka broker when finished
await consumerWrapper.disconnect();
```

## Explanation

In the example above, we create an instance of ConsumerWrapper by providing the KafkaJS client (client), the topic to consume from (my-topic), and an optional callback function (messageCallback). We then connect the consumer to the Kafka broker using connect() and provide the desired groupId. Next, we subscribe the consumer to the topic using subscribe() and pass optional subscription options. We define the message handler function in handler and run the consumer with the handler using run(). Finally, we disconnect the consumer from the Kafka broker using disconnect() when we are finished consuming messages
