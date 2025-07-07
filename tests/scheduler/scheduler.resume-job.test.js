import { resumeJob } from "../../src/scheduler/resume-job.js";
import { jest } from "@jest/globals";

describe("resumeJob function", () => {
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

  it("returns true if resuming the job is successful", async () => {
    mockStore.updateJob.mockResolvedValue(true);

    const result = await resumeJob.call(context, "job1");

    expect(result).toBe(true);
    expect(mockStore.updateJob).toHaveBeenCalledWith("job1", { active: true });
  });

  it("returns false if resuming the job fails", async () => {
    mockStore.updateJob.mockResolvedValue(false);

    const result = await resumeJob.call(context, "job1");

    expect(result).toBe(false);
    expect(mockStore.updateJob).toHaveBeenCalledWith("job1", { active: true });
  });
});
