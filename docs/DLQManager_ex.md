const kafkaDLQManager = new KafkaDLQManager(client, "my-topic");

// Creating a Dead Letter Queue
await kafkaDLQManager.createDLQ();

// Connecting the DLQ consumer
await kafkaDLQManager.retryConnect();

// Retrying failed messages from the DLQ
const processMessages = kafkaDLQManager.retryProcessMessages();
await processMessages();

// Disconnecting the DLQ consumer
await kafkaDLQManager.disconnect();
