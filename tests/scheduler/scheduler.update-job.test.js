import { updateJob } from "../../src/scheduler/update-job.js";
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

    const result = await updateJob.call(context, "job1", {
      name: "new name",
    });

    expect(result).toBe(true);
  });

  it("should return false if the job is not updated", async () => {
    mockStore.updateJob.mockResolvedValue(false);

    const result = await updateJob.call(context, "job1", {
      name: "new name",
    });

    expect(result).toBe(false);
  });
});
