import { processJobs } from "../../src/scheduler/process-jobs.js";
import { jest } from "@jest/globals";

describe("processJobs function", () => {
  let mockLogger;
  let mockStore;
  let context;

  beforeEach(() => {
    mockLogger = {
      warn: jest.fn(),
      error: jest.fn(),
    };

    mockStore = {
      getJobs: jest.fn(),
      getTemplate: jest.fn(),
      updateJob: jest.fn(),
    };

    context = {
      logger: mockLogger,
      store: mockStore,
    };
  });

  it("should process jobs", async () => {
    mockStore.getJobs.mockResolvedValue([
      { id: "job1", template: "template1", active: true },
      { id: "job2", template: "template2", active: true },
    ]);

    await processJobs.call(context);
  });

  it("should not process jobs that are not active", async () => {
    mockStore.getJobs.mockResolvedValue([
      { id: "job1", template: "template1", active: false },
    ]);

    await processJobs.call(context);
  });

  it("should not process jobs that haven't reached their start time yet", async () => {
    mockStore.getJobs.mockResolvedValue([
      {
        id: "job1",
        template: "template1",
        startAt: Date.now() + 1000,
        active: true,
      },
    ]);

    await processJobs.call(context);
  });

  it("should not process jobs that have an invalid template", async () => {
    mockStore.getTemplate.mockResolvedValue(null);
    mockStore.getJobs.mockResolvedValue([
      { id: "job1", template: "template1", repeat: 500, active: true },
    ]);

    await processJobs.call(context);
  });

  it("should process jobs that have a valid template", async () => {
    mockStore.getTemplate.mockResolvedValue(() => {});
    mockStore.getJobs.mockResolvedValue([
      { id: "job1", template: "template1", repeat: 500, active: true },
    ]);

    await processJobs.call(context);
  });

  it("should ignore jobs that have run and have no repeat interval", async () => {
    mockStore.getTemplate.mockResolvedValue(() => {});
    mockStore.getJobs.mockResolvedValue([
      {
        id: "job1",
        template: "template1",
        lastRunAt: Date.now() - 1000,
        repeat: null,
        active: true,
      },
    ]);

    await processJobs.call(context);
  });

  it("should process jobs that have run and have a repeat interval", async () => {
    mockStore.getTemplate.mockResolvedValue(() => {});
    mockStore.getJobs.mockResolvedValue([
      {
        id: "job1",
        template: "template1",
        lastRunAt: Date.now() - 1000,
        repeat: 500,
        active: true,
      },
    ]);

    await processJobs.call(context);
  });

  it("should skip jobs that are locked", async () => {
    mockStore.getTemplate.mockResolvedValue(() => {});
    mockStore.getJobs.mockResolvedValue([
      { id: "job1", template: "template1", lockedAt: Date.now(), active: true },
    ]);

    await processJobs.call(context);
  });

  it("should process jobs that throw an error", async () => {
    mockStore.getTemplate.mockResolvedValue(() => {
      throw new Error("Test error");
    });
    mockStore.getJobs.mockResolvedValue([
      { id: "job1", template: "template1", active: true, repeat: 500 },
    ]);

    await processJobs.call(context);
  });

  it("should process jobs that throw something other than error", async () => {
    mockStore.getTemplate.mockResolvedValue(
      jest.fn().mockRejectedValue("Test error")
    );
    mockStore.getJobs.mockResolvedValue([
      { id: "job1", template: "template1", active: true, repeat: 500 },
    ]);

    await processJobs.call(context);
  });

  it("should remove non-repeating jobs", async () => {
    mockStore.getTemplate.mockResolvedValue(() => {
      throw new Error("Test error");
    });
    mockStore.getJobs.mockResolvedValue([
      {
        id: "job1",
        template: "template1",
        active: true,
        repeat: null,
        lastRunAt: null,
      },
    ]);

    await processJobs.call(context);
  });
});
