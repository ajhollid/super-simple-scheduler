import { pauseJob } from "../../../src/scheduler/pause-job.js";
import { jest } from "@jest/globals";

describe("pauseJob function", () => {
  let mockStore;
  let mockLogger;
  let context;

  beforeEach(() => {
    mockLogger = {
      warn: jest.fn(),
    };

    mockStore = {
      getJob: jest.fn(),
      updateJob: jest.fn(),
    };

    context = {
      logger: mockLogger,
      store: mockStore,
    };
  });

  it("returns true if pausing the job is successful", async () => {
    mockStore.getJob.mockResolvedValue({ id: "job1", active: true });
    mockStore.updateJob.mockResolvedValue(true);

    const result = await pauseJob.call(context, "job1");

    expect(result).toBe(true);
    expect(mockStore.updateJob).toHaveBeenCalledWith("job1", { active: false });
  });

  it("returns false if pausing the job fails", async () => {
    mockStore.getJob.mockResolvedValue({ id: "job1", active: true });
    mockStore.updateJob.mockResolvedValue(false);

    const result = await pauseJob.call(context, "job1");

    expect(result).toBe(false);
    expect(mockStore.updateJob).toHaveBeenCalledWith("job1", { active: false });
  });

  it("returns false if the job does not exist", async () => {
    mockStore.getJob.mockResolvedValue(null);

    const result = await pauseJob.call(context, "nonexistent");

    expect(result).toBe(false);
    expect(mockLogger.warn).toHaveBeenCalled();
    expect(mockStore.updateJob).not.toHaveBeenCalled();
  });
});
