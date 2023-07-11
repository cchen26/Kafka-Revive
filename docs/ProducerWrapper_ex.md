# ProducerWrapper

The ProducerWrapper class is a wrapper around the KafkaJS client's producer. It simplifies the process of sending messages to a Kafka topic and provides event handling for successful message sending.

## When to use it

Use the ProducerWrapper when you need to send messages to a Kafka topic in your application. It abstracts away the complexity of directly interacting with the KafkaJS producer, providing a more streamlined and convenient interface.

## Example

```js
import { ProducerWrapper } from "./ProducerWrapper";

// Create an instance of the ProducerWrapper
const producer = new ProducerWrapper(3, kafkaJSClient);

// Connect the producer to the Kafka broker
await producer.connect();

// Send a message to the Kafka topic
const message = {
  topic: "my-topic",
  messages: [{ value: "Hello, Kafka!" }, { value: "Another message" }],
};
await producer.send(message);

// Handle success events when a message is successfully sent
producer.onSuccess((result: any) => {
  console.log("Message successfully sent:", result);
});

// Disconnect the producer from the Kafka broker
await producer.disconnect();
```

## Explanation

In the example above, we create an instance of ProducerWrapper by providing the desired number of retries (3) and the KafkaJS client (kafkaJSClient). We then connect the producer to the Kafka broker using connect(). Next, we send a message to the Kafka topic using send() and handle success events by registering a success event handler with onSuccess(). Finally, we disconnect the producer from the Kafka broker using disconnect().
