import { getJobs } from "../../src/scheduler/get-jobs.js";
import { jest } from "@jest/globals";

describe("getJobs function", () => {
  let mockStore;
  let context;

  beforeEach(() => {
    mockStore = {
      getJobs: jest.fn(),
    };

    context = {
      store: mockStore,
    };
  });

  it("returns jobs if they exist", async () => {
    mockStore.getJobs.mockResolvedValue([{ id: "job1" }]);

    const result = await getJobs.call(context);

    expect(result).toEqual([{ id: "job1" }]);
    expect(mockStore.getJobs).toHaveBeenCalled();
  });

  it("returns an empty array if no jobs exist", async () => {
    mockStore.getJobs.mockResolvedValue([]);

    const result = await getJobs.call(context);

    expect(result).toEqual([]);
    expect(mockStore.getJobs).toHaveBeenCalled();
  });
});
