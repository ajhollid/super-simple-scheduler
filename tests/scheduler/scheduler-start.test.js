import { start } from "../../src/scheduler/start.js";
import { jest } from "@jest/globals";

describe("start function", () => {
  let mockStore;
  let mockLogger;
  let context;

  beforeEach(() => {
    mockStore = {
      init: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
    };

    context = {
      store: mockStore,
      logger: mockLogger,
      processJobs: jest.fn(),
    };
  });

  afterEach(() => {
    if (context.intervalId) {
      clearInterval(context.intervalId);
      context.intervalId = null;
    }
  });

  it("should return false if the store does not initialize", async () => {
    mockStore.init.mockResolvedValue(false);

    const result = await start.call(context);

    expect(result).toBe(false);
  });

  it("should return true if the store initializes", async () => {
    mockStore.init.mockResolvedValue(true);

    const result = await start.call(context);

    expect(result).toBe(true);
  });

  it("should set the intervalId if the store initializes", async () => {
    mockStore.init.mockResolvedValue(true);
    await start.call(context);
    expect(context.intervalId).toBeDefined();
  });

  it("should clear existing interval if intervalId is already set", async () => {
    const originalIntervalId = setInterval(() => {}, 1000);
    context.intervalId = originalIntervalId;

    const clearSpy = jest.spyOn(global, "clearInterval");

    mockStore.init.mockResolvedValue(true);
    await start.call(context);

    expect(clearSpy).toHaveBeenCalledWith(originalIntervalId);

    clearSpy.mockRestore();
  });

  it("should call processJobs on interval", async () => {
    jest.useFakeTimers();

    mockStore.init.mockResolvedValue(true);
    const processJobsMock = jest.fn();
    context.processJobs = processJobsMock;
    context.processEvery = 5000;

    await start.call(context);

    // Fast-forward timers by 5 seconds
    jest.advanceTimersByTime(5000);

    expect(processJobsMock).toHaveBeenCalled();

    jest.useRealTimers(); // restore
  });
});
