import { updateJob } from "../../../src/scheduler/update-job.js";
import { jest } from "@jest/globals";

describe("updateJob function", () => {
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
  it("should return true if the job is updated", async () => {
    mockStore.updateJob.mockResolvedValue(true);

    const updates = { name: "new name" };
    const result = await updateJob.call(context, "job1", updates);

    expect(result).toBe(true);
    expect(mockStore.updateJob).toHaveBeenCalledWith("job1", updates);
  });

  it("should return false if the job is not updated", async () => {
    mockStore.updateJob.mockResolvedValue(false);

    const updates = { name: "new name" };
    const result = await updateJob.call(context, "job1", updates);

    expect(result).toBe(false);
    expect(mockStore.updateJob).toHaveBeenCalledWith("job1", updates);
  });
});
