const kafkaClient = new ClientWrapper(client, "my-topic");
const producer = kafkaClient.createProducer();

// Connecting the producer
await producer.connect();

// Sending a message
const message = {
topic: "my-topic",
messages: [{ value: "Hello, Kafka!" }],
};
await producer.send(message);

const kafkaClient = new ClientWrapper(client, "my-topic");
const consumer = kafkaClient.createConsumer({ groupId: "my-group" });

// Connecting the consumer
await consumer.connect();

// Subscribing to the topic
await consumer.subscribe();

// Running the consumer to process messages
await consumer.run({
eachMessage: async ({ topic, partitions, message }) => {
console.log(`Received message: ${message.value} from topic ${topic}`);
// Handle the message processing logic here
},
});
