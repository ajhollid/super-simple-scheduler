import { stop } from "../../../src/scheduler/stop.js";
import { jest } from "@jest/globals";

describe("stop function", () => {
  let context;
  let mockStore;
  beforeEach(() => {
    mockStore = {
      close: jest.fn().mockResolvedValue(true),
    };

    context = {
      store: mockStore,
      emit: jest.fn(),
      running: new Set(),
    };
  });

  afterEach(() => {
    if (context.intervalId) {
      clearInterval(context.intervalId);
      context.intervalId = null;
    }
    jest.clearAllMocks();
  });

  it("should return true if the scheduler is stopped", async () => {
    const result = await stop.call(context);
    expect(result).toBe(true);
    expect(context.emit).toHaveBeenCalledWith("scheduler:stop");
  });
  it("should return false if the store didn't close", async () => {
    mockStore.close.mockResolvedValue(false);
    const result = await stop.call(context);
    expect(result).toBe(false);
    expect(context.emit).toHaveBeenCalledWith("scheduler:stop");
    expect(mockStore.close).toHaveBeenCalled();
  });

  it("should clear the intervalId if it exists", async () => {
    const originalIntervalId = setInterval(() => {}, 1000);
    context.intervalId = originalIntervalId;

    const clearSpy = jest.spyOn(global, "clearInterval");

    await stop.call(context);
    expect(clearSpy).toHaveBeenCalledWith(originalIntervalId);
    expect(context.intervalId).toBeNull();
  });

  it("should wait for in-flight jobs before closing store", async () => {
    let jobResolved = false;
    const jobPromise = new Promise((resolve) => {
      setTimeout(() => {
        jobResolved = true;
        resolve();
      }, 50);
    });
    context.running = new Set([jobPromise]);

    await stop.call(context);
    expect(jobResolved).toBe(true);
    expect(context.emit).toHaveBeenCalledWith("scheduler:drain", 1);
    expect(mockStore.close).toHaveBeenCalled();
  });
});
