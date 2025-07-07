import { stop } from "../../src/scheduler/stop.js";
import { jest } from "@jest/globals";

describe("stop function", () => {
  let mockLogger;
  let context;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
    };

    context = {
      logger: mockLogger,
    };
  });

  afterEach(() => {
    if (context.intervalId) {
      clearInterval(context.intervalId);
      context.intervalId = null;
    }
  });

  it("should return true if the scheduler is stopped", async () => {
    const result = await stop.call(context);
    expect(result).toBe(true);
    expect(mockLogger.info).toHaveBeenCalledWith("Scheduler stopped");
  });

  it("should clear the intervalId if it exists", async () => {
    const originalIntervalId = setInterval(() => {}, 1000);
    context.intervalId = originalIntervalId;

    const clearSpy = jest.spyOn(global, "clearInterval");

    await stop.call(context);
    expect(clearSpy).toHaveBeenCalledWith(originalIntervalId);
    expect(context.intervalId).toBeNull();
  });
});
