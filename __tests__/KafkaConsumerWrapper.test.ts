import { KafkaConsumerWrapper } from "../src/KafkaConsumerWrapper";

describe("KafkaConsumerWrapper", () => {
  let mockClient: any;
  let mockConsumer: any;
  let wrapper: KafkaConsumerWrapper;

  beforeEach(() => {
    mockConsumer = {
      connect: jest.fn(),
      subscribe: jest.fn(),
      run: jest.fn(),
    };

    mockClient = {
      consumer: jest.fn(() => mockConsumer),
      disconnect: jest.fn(),
    };

    wrapper = new KafkaConsumerWrapper(mockClient, "test-topic");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("connect", () => {
    it("should connect the consumer with the provided groupId", () => {
      const groupId = { groupId: "test-group" };
      const consumer = wrapper.connect(groupId);
      expect(mockClient.consumer).toHaveBeenCalledWith(groupId);
      expect(consumer.connect).toHaveBeenCalled();
    });
  });

  describe("subscribe", () => {
    it("should subscribe the consumer to the topic with default options", () => {
      const consumer = {
        subscribe: jest.fn(),
      };
      wrapper.subscribe(consumer);
      expect(consumer.subscribe).toHaveBeenCalledWith({
        topic: "test-topic",
        fromBeginning: false,
      });
    });

    it("should subscribe the consumer to the topic with custom options", () => {
      const consumer = {
        subscribe: jest.fn(),
      };
      const options = { fromBeginning: true, otherOption: "value" };
      wrapper.subscribe(consumer, options);
      expect(consumer.subscribe).toHaveBeenCalledWith({
        topic: "test-topic",
        fromBeginning: true,
        otherOption: "value",
      });
    });

    describe("run", () => {
      it("should run the consumer with message handling", async () => {
        const consumer = {
          run: jest.fn(),
        };
        const eachMessage = jest.fn();
        const input = { eachMessage };
        await wrapper.run(consumer, input);
        expect(consumer.run).toHaveBeenCalledWith({
          eachMessage: expect.any(Function),
        });
        const eachMessageHandler = consumer.run.mock.calls[0][0].eachMessage;
        await eachMessageHandler({
          topic: "test-topic",
          partitions: 1,
          message: "test-message",
        });
        expect(eachMessage).toHaveBeenCalledWith({
          topic: "test-topic",
          partitions: 1,
          message: "test-message",
        });
      });
    });

    it("should throw an error if the callback returns false", async () => {
      const consumer = {};
      const eachMessage = jest.fn();
      const callback = jest.fn(() => false);
      const input = { eachMessage, callback };
      await expect(wrapper.run(consumer, input)).rejects.toThrow(Error);
      expect(eachMessage).not.toHaveBeenCalled();
    });
  });

  describe("disconnect", () => {
    it("should disconnect the client if it exists", () => {
      wrapper.disconnect();
      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it("should do nothing if the client does not exist", () => {
      wrapper = new KafkaConsumerWrapper(undefined, "test-topic");
      expect(wrapper.disconnect()).toBeUndefined();
    });
  });
});
