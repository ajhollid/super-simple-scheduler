import { pauseJob } from "../../src/scheduler/pause-job.js";
import { jest } from "@jest/globals";

describe("pauseJob function", () => {
  let mockStore;
  let context;

  beforeEach(() => {
    mockStore = {
      updateJob: jest.fn(),
    };

    context = {
      store: mockStore,
    };
  });

  it("returns true if pausing the job is successful", async () => {
    mockStore.updateJob.mockResolvedValue(true);

    const result = await pauseJob.call(context, "job1");

    expect(result).toBe(true);
    expect(mockStore.updateJob).toHaveBeenCalledWith("job1", { active: false });
  });

  it("returns false if pausing the job fails", async () => {
    mockStore.updateJob.mockResolvedValue(false);

    const result = await pauseJob.call(context, "job1");

    expect(result).toBe(false);
    expect(mockStore.updateJob).toHaveBeenCalledWith("job1", { active: false });
  });
});
