import { KafkaProducerWrapper } from "../src/KafkaProducerWrapper";
import { ErrorHandling } from "../src/ErrorHandling";

describe("KafkaProducerWrapper", () => {
  let mockKafkaJSClient: any;
  let wrapper: KafkaProducerWrapper;

  beforeEach(() => {
    mockKafkaJSClient = {
      producer: jest.fn(() => ({
        connect: jest.fn(),
        disconnect: jest.fn(),
        send: jest.fn(),
      })),
    };

    wrapper = new KafkaProducerWrapper(3, mockKafkaJSClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("connect", () => {
    it("should connect the producer", () => {
      wrapper.connect();
      expect(mockKafkaJSClient.producer().connect).toHaveBeenCalled();
    });
  });

  describe("disconnect", () => {
    it("should disconnect the producer", () => {
      wrapper.disconnect();
      expect(mockKafkaJSClient.producer().disconnect).toHaveBeenCalled();
    });
  });

  describe("send", () => {
    it("should send the message and emit success event", async () => {
      const message = {
        topic: "test-topic",
        messages: [{ value: "test-message" }],
      };
      const mockProducer = mockKafkaJSClient.producer();
      const mockSend = mockProducer.send;
      const mockEmitSuccessEvent = jest.spyOn(
        wrapper as any,
        "emitSuccessEvent"
      );

      await wrapper.send(message);

      expect(mockKafkaJSClient.producer).toHaveBeenCalledWith({
        retry: { retries: 3 },
      });
      expect(mockProducer.send).toHaveBeenCalledWith(message);
      expect(mockEmitSuccessEvent).toHaveBeenCalled();
      expect(mockProducer.disconnect).not.toHaveBeenCalled();
    });

    it("should send the message, catch error, disconnect producer, and throw error", async () => {
      const message = {
        topic: "test-topic",
        messages: [{ value: "test-message" }],
      };
      const mockProducer = mockKafkaJSClient.producer();
      const mockSend = mockProducer.send;
      const mockDisconnect = mockProducer.disconnect;
      const mockErrorHandling = jest.fn().mockImplementation(() => {
        throw new Error("Test Error");
      });

      const error = new Error("Test Error");
      mockSend.mockRejectedValueOnce(error);

      await expect(wrapper.send(message)).rejects.toThrowError(ErrorHandling);
      expect(mockKafkaJSClient.producer).toHaveBeenCalledWith({
        retry: { retries: 3 },
      });
      expect(mockSend).toHaveBeenCalledWith(message);
      expect(mockErrorHandling).toHaveBeenCalledWith(
        error,
        "KafkaProducerWrapper",
        "send"
      );
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe("onSuccess", () => {
    it("should register success event handler", () => {
      const handler = jest.fn();
      wrapper.onSuccess(handler);
      expect(wrapper["successEventHandlers"]).toContain(handler);
    });
  });
});
