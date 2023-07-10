const kafkaProducer = new KafkaProducerWrapper(3, kafkaJSClient);

// Connecting the producer
await kafkaProducer.connect();

// Sending a message
const message = {
topic: "my-topic",
messages: [{ value: "Hello, Kafka!" }],
};
await kafkaProducer.send(message);

// Handling success events
kafkaProducer.onSuccess((result: any) => {
console.log("Message successfully sent:", result);
});

// Disconnecting the producer
await kafkaProducer.disconnect();
