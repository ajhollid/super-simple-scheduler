import { addJob } from "../../src/scheduler/add-job.js";
import { jest } from "@jest/globals";

describe("addJob function", () => {
  let mockLogger;
  let mockStore;
  let context;

  beforeEach(() => {
    mockLogger = {
      warn: jest.fn(),
      info: jest.fn(),
    };

    mockStore = {
      getJob: jest.fn(),
      addJob: jest.fn(),
    };

    context = {
      logger: mockLogger,
      store: mockStore,
    };
  });

  it("returns false and logs info if job with id already exists", async () => {
    mockStore.getJob.mockResolvedValue({ id: "job1" }); // simulate job exists

    const result = await addJob.call(context, {
      id: "job1",
      template: "template1",
    });

    expect(result).toBe(false);
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Job with id job1 already exists"
    );
    expect(mockStore.getJob).toHaveBeenCalledWith("job1");
    expect(mockStore.addJob).not.toHaveBeenCalled();
  });

  it("adds job and returns true when job id is unique", async () => {
    mockStore.getJob.mockResolvedValue(null); // no existing job
    mockStore.addJob.mockResolvedValue(true);

    const jobData = {
      id: "job2",
      template: "template2",
      repeat: 5,
      data: { foo: "bar" },
      active: false,
    };

    const result = await addJob.call(context, jobData);

    expect(result).toBe(true);
    expect(mockStore.getJob).toHaveBeenCalledWith("job2");
    expect(mockStore.addJob).toHaveBeenCalledWith({
      id: "job2",
      template: "template2",
      data: { foo: "bar" },
      repeat: 5,
      lastRunAt: null,
      lockedAt: null,
      active: false,
    });
  });

  it("adds job and returns true when job id is not provided", async () => {
    mockStore.getJob.mockResolvedValue(null); // no existing job
    mockStore.addJob.mockResolvedValue(true);

    const jobData = {
      template: "template2",
      repeat: 5,
      data: { foo: "bar" },
      active: false,
    };

    const result = await addJob.call(context, jobData);
    expect(result).toBe(true);
    expect(mockStore.addJob).toHaveBeenCalledWith({
      id: expect.any(String),
      template: "template2",
      data: { foo: "bar" },
      repeat: 5,
      lastRunAt: null,
      lockedAt: null,
      active: false,
    });
  });
});
