const kafkaConsumer = new ConsumerWrapper(client, "my-topic");

const consumer = kafkaConsumer.connect({ groupId: "my-group" });

// Connecting the consumer
await consumer.connect();

// Subscribing to the topic
await kafkaConsumer.subscribe(consumer);

// Running the consumer to process messages
await kafkaConsumer.run(consumer, {
eachMessage: async ({ topic, partitions, message }) => {
console.log(`Received message: ${message.value} from topic ${topic}`);
// Handle the message processing logic here
},
});

// Disconnecting the consumer
await kafkaConsumer.disconnect();
