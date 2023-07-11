import { ClientWrapper } from "../src/ClientWrapper";

describe("ClientWrapper", () => {
  let mockClient: any;
  let mockProducer: any;
  let mockConsumer: any;
  let wrapper: ClientWrapper;

  beforeEach(() => {
    mockProducer = {
      connect: jest.fn(),
      send: jest.fn(),
    };

    mockConsumer = {
      connect: jest.fn(),
      subscribe: jest.fn(),
      run: jest.fn(),
    };

    mockClient = {
      producer: jest.fn(() => mockProducer),
      consumer: jest.fn(() => mockConsumer),
      admin: jest.fn(),
    };

    wrapper = new ClientWrapper(mockClient, "test-topic");
  });

  describe("createProducer", () => {
    it("should connect to the producer", async () => {
      const producer = wrapper.createProducer();
      await producer.connect();
      expect(mockProducer.connect).toHaveBeenCalled();
    });

    it("should send a message through the producer", async () => {
      const producer = wrapper.createProducer();
      const message = {
        topic: "test-topic",
        messages: [{ value: "test-message" }],
      };
      await producer.send(message);
      expect(mockProducer.send).toHaveBeenCalledWith(message);
    });
  });

  describe("createConsumer", () => {
    it("should connect the consumer", () => {
      const consumer = wrapper.createConsumer({ groupId: "test-group" });
      consumer.connect();
      expect(mockConsumer.connect).toHaveBeenCalled();
    });

    it("should subscribe the consumer to the topic", () => {
      const consumer = wrapper.createConsumer({ groupId: "test-group" });
      consumer.subscribe();
      expect(mockConsumer.subscribe).toHaveBeenCalledWith({
        topic: "test-topic",
        fromBeginning: false,
      });
    });

    it("should run the consumer with message processing", () => {
      const consumer = wrapper.createConsumer({ groupId: "test-group" });
      const mockCallback = jest.fn();
      const input = {
        eachMessage: jest.fn(),
        callback: mockCallback,
      };
      consumer.run(input);
      expect(mockConsumer.run).toHaveBeenCalledWith({
        ...input,
        eachMessage: expect.any(Function),
      });
    });

    it("should throw an error if the callback returns false", async () => {
      const consumer = wrapper.createConsumer({ groupId: "test-group" });
      const input = {
        eachMessage: jest.fn(),
        callback: jest.fn(() => false),
      };
      const run = async () => {
        consumer.run(input);
      };
      await expect(run).rejects.toThrow(
        "Error processing message: Callback returned false"
      );
    });
  });
});
