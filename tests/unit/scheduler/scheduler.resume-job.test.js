import { resumeJob } from "../../../src/scheduler/resume-job.js";
import { jest } from "@jest/globals";

describe("resumeJob function", () => {
  let mockStore;
  let context;

  beforeEach(() => {
    mockStore = {
      getJob: jest.fn(),
      updateJob: jest.fn(),
    };

    context = {
      store: mockStore,
      emit: jest.fn(),
    };
  });

  it("returns true if resuming the job is successful", async () => {
    mockStore.getJob.mockResolvedValue({ id: "job1", active: false });
    mockStore.updateJob.mockResolvedValue(true);

    const result = await resumeJob.call(context, "job1");

    expect(result).toBe(true);
    expect(mockStore.updateJob).toHaveBeenCalledWith("job1", { active: true });
  });

  it("returns false if resuming the job fails", async () => {
    mockStore.getJob.mockResolvedValue({ id: "job1", active: false });
    mockStore.updateJob.mockResolvedValue(false);

    const result = await resumeJob.call(context, "job1");

    expect(result).toBe(false);
    expect(mockStore.updateJob).toHaveBeenCalledWith("job1", { active: true });
  });

  it("returns false if the job does not exist", async () => {
    mockStore.getJob.mockResolvedValue(null);

    const result = await resumeJob.call(context, "nonexistent");

    expect(result).toBe(false);
    expect(context.emit).toHaveBeenCalledWith("scheduler:error", expect.any(Error));
    expect(mockStore.updateJob).not.toHaveBeenCalled();
  });
});
