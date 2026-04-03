import { removeJob } from "../../../src/scheduler/remove-job.js";
import { jest } from "@jest/globals";

describe("removeJob function", () => {
  let mockStore;
  let context;

  beforeEach(() => {
    mockStore = {
      getJob: jest.fn(),
      removeJob: jest.fn(),
    };

    context = {
      store: mockStore,
      emit: jest.fn(),
    };
  });

  it("should return false if the job does not exist", async () => {
    mockStore.getJob.mockResolvedValue(null);

    const result = await removeJob.call(context, "job1");

    expect(result).toBe(false);
    expect(mockStore.getJob).toHaveBeenCalledWith("job1");
  });

  it("should return true if the job is removed", async () => {
    mockStore.getJob.mockResolvedValue({ id: "job1" });
    mockStore.removeJob.mockResolvedValue(true);

    const result = await removeJob.call(context, "job1");

    expect(result).toBe(true);
    expect(mockStore.removeJob).toHaveBeenCalledWith("job1");
  });

  it("should return false if removing the job fails", async () => {
    mockStore.getJob.mockResolvedValue({ id: "job1" });
    mockStore.removeJob.mockResolvedValue(false);

    const result = await removeJob.call(context, "job1");

    expect(result).toBe(false);
    expect(mockStore.removeJob).toHaveBeenCalledWith("job1");
  });
});
