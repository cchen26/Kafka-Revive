<img src="docs/Logo.png" alt="Logo" width="100" height="110>

# Table of Contents

1. [About](#about)
2. [Documentation](#documentation)
3. [Author](#author)

## About<a name="about"></a> Kafka-Revive

The Kafka-Revive library consists of multiple TypeScript files that provide a comprehensive solution for message re-processing in Apache Kafka using the KafkaJS client. It includes a ClientWrapper class that wraps around the KafkaJS client, allowing the creation of producers and consumers with simplified methods for connecting, subscribing, and processing messages. Additionally, the library provides a DLQManager class for managing Dead Letter Queues (DLQs), enabling the creation of DLQ topics, retrying failed messages, and handling error scenarios.

Please note that Kafka-Revive is not officially associated with Apache Kafka.

## Install<a name="install"></a>

To incorporate Kafka-Revive into your project, follow these steps:

Install Kafka-Revive as an NPM package by executing the following command in your terminal:

`npm install kafka-revive`

Utilize Kafka-Revive in your code by including it using the require keyword, just as you would with any other library:

```js
const KafkaRevive = require("kafka-revive");
```

## Documentation<a name="documentation"></a>

1. [ClientWrapper](docs/ClientWrapper_ex.md)
2. [ProducerWrapper](docs/ProducerWrapper_ex.md)
3. [ConsumerWrapper](docs/ConsumerWrapper_ex.md)
4. [DLQManager](docs/DLQManager_ex.md)

## Author<a name="author"></a>

#### [Chao Chen](https://github.com/cchen26)
