import { flushJobs } from "../../src/scheduler/flush-jobs.js";
import { jest } from "@jest/globals";

describe("flushJobs function", () => {
  let mockStore;
  let context;

  beforeEach(() => {
    mockStore = {
      flushJobs: jest.fn(),
    };

    context = {
      store: mockStore,
    };
  });

  it("returns true if flushJobs is successful", async () => {
    mockStore.flushJobs.mockResolvedValue(true);
    const result = await flushJobs.call(context);
    expect(result).toBe(true);
    expect(mockStore.flushJobs).toHaveBeenCalled();
  });

  it("returns false if flushJobs is not successful", async () => {
    mockStore.flushJobs.mockResolvedValue(false);
    const result = await flushJobs.call(context);
    expect(result).toBe(false);
    expect(mockStore.flushJobs).toHaveBeenCalled();
  });
});
