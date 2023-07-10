import { KafkaDLQManager } from "../src/DLQManager";

describe("KafkaDLQManager", () => {
  let mockClient: any;
  let mockAdmin: any;
  let mockProducer: any;
  let mockConsumer: any;
  let wrapper: KafkaDLQManager;

  beforeEach(() => {
    mockProducer = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      send: jest.fn(),
    };

    mockConsumer = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      subscribe: jest.fn(),
      run: jest.fn(),
      commitOffsets: jest.fn(),
    };

    mockAdmin = {
      connect: jest.fn(),
      createTopics: jest.fn(),
      disconnect: jest.fn(),
    };

    mockClient = {
      producer: jest.fn(() => mockProducer),
      consumer: jest.fn(() => mockConsumer),
      admin: jest.fn(() => mockAdmin),
    };

    wrapper = new KafkaDLQManager(mockClient, "test-topic");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createDLQ", () => {
    it("should connect to admin and create DLQ topic", async () => {
      await wrapper.createDLQ();
      expect(mockAdmin.connect).toHaveBeenCalled();
      expect(mockAdmin.createTopics).toHaveBeenCalledWith({
        topics: [
          {
            topic: "test-topic.deadLetterQueue",
            numPartitions: 1,
            replicationFactor: 1,
            replicaAssignment: [{ partition: 0, replicas: [0, 1, 2] }],
          },
        ],
      });
      expect(mockAdmin.disconnect).toHaveBeenCalled();
    });

    it("should handle error and disconnect admin", async () => {
      mockAdmin.createTopics.mockRejectedValueOnce(new Error("Test Error"));
      await wrapper.createDLQ();
      expect(mockAdmin.connect).toHaveBeenCalled();
      expect(mockAdmin.createTopics).toHaveBeenCalled();
      expect(mockAdmin.disconnect).toHaveBeenCalled();
    });
  });

  describe("producerConnect", () => {
    it("should connect the producer and create DLQ", async () => {
      const connect = wrapper.producerConnect();
      await connect();
      expect(mockProducer.connect).toHaveBeenCalled();
      expect(wrapper.createDLQ).toHaveBeenCalled();
    });
  });

  describe("producerDisconnect", () => {
    it("should disconnect the producer", async () => {
      const disconnect = wrapper.producerDisconnect();
      await disconnect();
      expect(mockProducer.disconnect).toHaveBeenCalled();
    });
  });

  describe("producerSend", () => {
    it("should send message through the producer", async () => {
      const message = {
        topic: "test-topic",
        messages: [{ value: "test-message" }],
      };
      const send = wrapper.producerSend(message);
      await send();
      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: "test-topic",
        messages: [{ value: "test-message" }],
      });
    });

    it("should send message to DLQ and disconnect producer if send fails", async () => {
      const message = {
        topic: "test-topic",
        messages: [{ value: "test-message" }],
      };
      mockProducer.send.mockRejectedValueOnce(new Error("Test Error"));
      const send = wrapper.producerSend(message);
      await send();
      expect(mockProducer.send).toHaveBeenCalledTimes(2);
      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: "test-topic.deadLetterQueue",
        messages: [{ value: "test-message" }],
      });
      expect(mockProducer.disconnect).toHaveBeenCalled();
    });
  });

  describe("consumerConnect", () => {
    it("should connect the consumer and create DLQ", async () => {
      const groupId = { groupId: "test-group" };
      const connect = wrapper.consumerConnect(groupId);
      await connect();
      expect(mockConsumer.connect).toHaveBeenCalled();
      expect(wrapper.createDLQ).toHaveBeenCalled();
    });
  });

  describe("consumerSubscribe", () => {
    it("should subscribe the consumer to the topic with default options", async () => {
      const input = {};
      const subscribe = wrapper.consumerSubscribe(input);
      await subscribe();
      expect(mockConsumer.subscribe).toHaveBeenCalledWith({
        topic: "test-topic",
        fromBeginning: false,
      });
    });
  });

  describe("consumerRun", () => {
    it("should run the consumer with message handling", async () => {
      const eachMessage = jest.fn();
      const input = { eachMessage };
      const run = wrapper.consumerRun(input);
      await run();
      expect(mockConsumer.run).toHaveBeenCalledWith({
        eachMessage: expect.any(Function),
      });
      const eachMessageHandler = mockConsumer.run.mock.calls[0][0].eachMessage;
      const message = {
        topic: "test-topic",
        partitions: 1,
        message: "test-message",
      };
      await eachMessageHandler(message);
      expect(eachMessage).toHaveBeenCalledWith(message);
    });

    it("should handle error, send message to DLQ, and disconnect producer", async () => {
      const eachMessage = jest.fn();
      const input = { eachMessage };
      const run = wrapper.consumerRun(input);
      mockConsumer.run.mockRejectedValueOnce(new Error("Test Error"));
      await run();
      expect(mockConsumer.run).toHaveBeenCalledWith({
        eachMessage: expect.any(Function),
      });
      const eachMessageHandler = mockConsumer.run.mock.calls[0][0].eachMessage;
      const message = {
        topic: "test-topic",
        partitions: 1,
        message: "test-message",
      };
      await eachMessageHandler(message);
      expect(mockProducer.send).toHaveBeenCalledTimes(3);
      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: "test-topic.deadLetterQueue",
        messages: [
          { topic: "test-topic", messages: [{ value: "test-message" }] },
        ],
      });
      expect(mockProducer.disconnect).toHaveBeenCalled();
    });
  });

  describe("retryConnect", () => {
    it("should connect the DLQ consumer", async () => {
      const connect = wrapper.retryConnect();
      await connect();
      expect(mockConsumer.connect).toHaveBeenCalled();
    });
  });

  describe("retryProcessMessages", () => {
    it("should process messages from DLQ and retry", async () => {
      const processMessages = wrapper.retryProcessMessages();
      await processMessages();
      expect(mockConsumer.subscribe).toHaveBeenCalledWith({
        topic: "test-topic.deadLetterQueue",
        fromBeginning: true,
      });
      expect(mockConsumer.run).toHaveBeenCalledWith({
        eachMessage: expect.any(Function),
      });
      const eachMessageHandler = mockConsumer.run.mock.calls[0][0].eachMessage;
      const message = { value: "test-message" };
      await eachMessageHandler({ message });
      expect(mockProducer.send).toHaveBeenCalledTimes(2);
      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: "test-topic",
        messages: [{ value: "test-message" }],
      });
      expect(mockConsumer.commitOffsets).toHaveBeenCalled();
      expect(mockProducer.connect).toHaveBeenCalled();
    });

    it("should handle error if retry fails", async () => {
      const processMessages = wrapper.retryProcessMessages();
      mockProducer.send.mockRejectedValueOnce(new Error("Test Error"));
      await processMessages();
      expect(mockConsumer.subscribe).toHaveBeenCalledWith({
        topic: "test-topic.deadLetterQueue",
        fromBeginning: true,
      });
      expect(mockConsumer.run).toHaveBeenCalledWith({
        eachMessage: expect.any(Function),
      });
      const eachMessageHandler = mockConsumer.run.mock.calls[0][0].eachMessage;
      const message = { value: "test-message" };
      await eachMessageHandler({ message });
      expect(mockProducer.send).toHaveBeenCalledTimes(2);
      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: "test-topic",
        messages: [{ value: "test-message" }],
      });
      expect(mockConsumer.commitOffsets).toHaveBeenCalled();
      expect(mockProducer.connect).toHaveBeenCalled();
    });
  });
});
