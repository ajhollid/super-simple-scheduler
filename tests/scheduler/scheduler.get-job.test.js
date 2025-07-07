import { getJob } from "../../src/scheduler/get-job.js";
import { jest } from "@jest/globals";

describe("getJob function", () => {
  let mockStore;
  let context;

  beforeEach(() => {
    mockStore = {
      getJob: jest.fn(),
    };

    context = {
      store: mockStore,
    };
  });

  it("returns the job if it exists", async () => {
    mockStore.getJob.mockResolvedValue({ id: "job1" });
    const result = await getJob.call(context, "job1");
    expect(result).toEqual({ id: "job1" });
    expect(mockStore.getJob).toHaveBeenCalledWith("job1");
  });

  it("returns null if the job does not exist", async () => {
    mockStore.getJob.mockResolvedValue(null);
    const result = await getJob.call(context, "job1");
    expect(result).toBeNull();
  });
});
