import { addJob } from "../../../src/scheduler/add-job.js";
import { jest } from "@jest/globals";

describe("addJob function", () => {
  let mockStore;
  let context;

  beforeEach(() => {
    mockStore = {
      getJob: jest.fn(),
      addJob: jest.fn(),
      updateJob: jest.fn(),
      getTemplate: jest.fn().mockResolvedValue(() => {}),
    };

    context = {
      store: mockStore,
      emit: jest.fn(),
    };
  });

  it("returns false if template does not exist", async () => {
    mockStore.getTemplate.mockResolvedValue(null);

    const result = await addJob.call(context, {
      id: "job1",
      template: "nonexistent",
    });

    expect(result).toBe(false);
    expect(context.emit).toHaveBeenCalledWith("scheduler:error", expect.any(Error));
    expect(mockStore.addJob).not.toHaveBeenCalled();
    expect(mockStore.updateJob).not.toHaveBeenCalled();
  });

  it("updates job and returns true if job with id already exists", async () => {
    mockStore.getJob.mockResolvedValue({ id: "job1" }); // simulate job exists

    const result = await addJob.call(context, {
      id: "job1",
      template: "template2",
    });

    expect(result).toBe(true);
    expect(mockStore.updateJob).toHaveBeenCalledWith(
      "job1",
      expect.objectContaining({
        template: "template2",
      })
    );
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
