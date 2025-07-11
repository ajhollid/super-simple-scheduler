import { jest } from "@jest/globals";
import { MongoStore } from "../../src/store/mongo/mongoStore.js";
import { RedisStore } from "../../src/store/redis/redisStore.js";
import { InMemoryStore } from "../../src/store/inMemory/inMemoryStore.js";

let mockStart;
let mockStop;
let mockProcessJobs;
let mockProcessNextJob;
let mockAddJob;
let mockPauseJob;
let mockResumeJob;
let mockRemoveJob;
let mockUpdateJob;
let mockFlushJobs;
let mockAddTemplate;
let Scheduler;

jest.unstable_mockModule("../../src/scheduler/start.js", () => {
  mockStart = jest.fn().mockResolvedValue(true);
  return { start: mockStart };
});

jest.unstable_mockModule("../../src/scheduler/stop.js", () => {
  mockStop = jest.fn().mockResolvedValue(true);
  return { stop: mockStop };
});

jest.unstable_mockModule("../../src/scheduler/process-jobs.js", () => {
  mockProcessJobs = jest.fn().mockResolvedValue();
  return { processJobs: mockProcessJobs };
});

jest.unstable_mockModule("../../src/scheduler/add-job.js", () => {
  mockAddJob = jest.fn().mockResolvedValue(true);
  return { addJob: mockAddJob };
});

jest.unstable_mockModule("../../src/scheduler/pause-job.js", () => {
  mockPauseJob = jest.fn().mockResolvedValue(true);
  return { pauseJob: mockPauseJob };
});

jest.unstable_mockModule("../../src/scheduler/resume-job.js", () => {
  mockResumeJob = jest.fn().mockResolvedValue(true);
  return { resumeJob: mockResumeJob };
});

jest.unstable_mockModule("../../src/scheduler/get-job.js", () => {
  mockGetJob = jest.fn();
  return { getJob: mockGetJob };
});

jest.unstable_mockModule("../../src/scheduler/get-jobs.js", () => {
  mockGetJobs = jest.fn();
  return { getJobs: mockGetJobs };
});

jest.unstable_mockModule("../../src/scheduler/remove-job.js", () => {
  mockRemoveJob = jest.fn().mockResolvedValue(true);
  return { removeJob: mockRemoveJob };
});

jest.unstable_mockModule("../../src/scheduler/update-job.js", () => {
  mockUpdateJob = jest.fn().mockResolvedValue(true);
  return { updateJob: mockUpdateJob };
});

jest.unstable_mockModule("../../src/scheduler/flush-jobs.js", () => {
  mockFlushJobs = jest.fn();
  return { flushJobs: mockFlushJobs };
});

jest.unstable_mockModule("../../src/scheduler/add-template.js", () => {
  mockAddTemplate = jest.fn();
  return { addTemplate: mockAddTemplate };
});

beforeAll(async () => {
  const module = await import("../../src/scheduler/index.js");
  createScheduler = module.default;
});

describe("Scheduler", () => {
  let scheduler;

  beforeEach(() => {
    scheduler = createScheduler({ storeType: "inMemory", dev: true });
    mockStart.mockClear();
    mockStop.mockClear();
    mockProcessJobs.mockClear();
    mockAddJob.mockClear();
    mockPauseJob.mockClear();
    mockResumeJob.mockClear();
    mockGetJob.mockClear();
    mockGetJobs.mockClear();
  });

  const fakeJob = {
    id: "test-job-1",
    template: "template1",
    data: {},
    repeat: 1,
    maxRetries: 3,
    active: true,
    lastRunAt: null,
    lastFinishedAt: null,
    lockedAt: null,
    lastFailedAt: null,
    lastFailReason: null,
    failCount: 0,
    runCount: 0,
  };

  describe("constructor", () => {});

  describe("start", () => {
    it("calls startFn when scheduler.start() is invoked", async () => {
      const result = await scheduler.start();
      expect(mockStart).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe("stop", () => {
    it("calls stopFn when scheduler.stop() is invoked", async () => {
      const result = await scheduler.stop();
      expect(mockStop).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe("processJobs", () => {
    it("calls processJobsFn when scheduler.processJobs() is invoked", async () => {
      const result = await scheduler.processJobs();
      expect(mockProcessJobs).toHaveBeenCalled();
      expect(result).toBe(undefined);
    });
  });

  describe("addJob", () => {
    it("calls addJobFn with correct parameters and returns true", async () => {
      mockAddJob.mockResolvedValue(true);

      const jobParams = {
        id: "job-123",
        template: "template1",
        repeat: 5,
        data: { foo: "bar" },
        active: true,
      };

      const result = await scheduler.addJob(jobParams);

      expect(mockAddJob).toHaveBeenCalledWith(jobParams);
      expect(result).toBe(true);
    });

    it("returns false when addJobFn returns false", async () => {
      mockAddJob.mockResolvedValue(false);

      const jobParams = {
        template: "template2",
      };

      const result = await scheduler.addJob(jobParams);

      expect(mockAddJob).toHaveBeenCalledWith(jobParams);
      expect(result).toBe(false);
    });
  });

  describe("pauseJob", () => {
    it("calls pauseJobFn and returns true when pause succeeds", async () => {
      mockPauseJob.mockResolvedValue(true);

      const result = await scheduler.pauseJob("job-123");

      expect(mockPauseJob).toHaveBeenCalledWith("job-123");
      expect(result).toBe(true);
    });

    it("returns false when pauseJobFn returns false", async () => {
      mockPauseJob.mockResolvedValue(false);

      const result = await scheduler.pauseJob("job-456");

      expect(mockPauseJob).toHaveBeenCalledWith("job-456");
      expect(result).toBe(false);
    });
  });

  describe("resumeJob", () => {
    it("calls resumeJobFn and returns true when resume succeeds", async () => {
      mockResumeJob.mockResolvedValue(true);
      const result = await scheduler.resumeJob("job-123");
      expect(mockResumeJob).toHaveBeenCalledWith("job-123");
      expect(result).toBe(true);
    });

    it("returns false when resumeJobFn returns false", async () => {
      mockResumeJob.mockResolvedValue(false);
      const result = await scheduler.resumeJob("job-456");
      expect(mockResumeJob).toHaveBeenCalledWith("job-456");
      expect(result).toBe(false);
    });
  });

  describe("getJob", () => {
    it("calls getJobFn when scheduler.getJob() is invoked", async () => {
      mockGetJob.mockResolvedValue(fakeJob);
      const job = await scheduler.getJob("test-job-1");
      expect(mockGetJob).toHaveBeenCalledWith("test-job-1");
      expect(job).toEqual(fakeJob);
    });

    it("returns null when scheduler.getJob() is called with non-existent id", async () => {
      mockGetJob.mockResolvedValue(null);
      const job = await scheduler.getJob("non-existent-id");
      expect(mockGetJob).toHaveBeenCalledWith("non-existent-id");
      expect(job).toBeNull();
    });
  });

  describe("getJobs", () => {
    it("calls getJobsFn and returns list of jobs", async () => {
      const fakeJobs = [
        { id: "job1", template: "template1" /*...*/ },
        { id: "job2", template: "template2" /*...*/ },
      ];

      mockGetJobs.mockResolvedValue(fakeJobs);

      const jobs = await scheduler.getJobs();

      expect(mockGetJobs).toHaveBeenCalled();
      expect(jobs).toEqual(fakeJobs);
    });

    it("returns empty array when no jobs", async () => {
      mockGetJobs.mockResolvedValue([]);

      const jobs = await scheduler.getJobs();

      expect(mockGetJobs).toHaveBeenCalled();
      expect(jobs).toEqual([]);
    });
  });

  describe("removeJob", () => {
    it("calls removeJobFn when scheduler.removeJob() is invoked", async () => {
      const result = await scheduler.removeJob();
      expect(mockRemoveJob).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe("updateJob", () => {
    it("calls updateJobFn and returns true when update succeeds", async () => {
      mockUpdateJob.mockResolvedValue(true);

      const updates = { active: false };
      const result = await scheduler.updateJob("job-id-1", updates);
      expect(mockUpdateJob).toHaveBeenCalledWith("job-id-1", updates);
      expect(result).toBe(true);
    });

    it("returns false when updateJobFn returns false", async () => {
      mockUpdateJob.mockResolvedValue(false);
      const updates = { repeat: 10 };
      const result = await scheduler.updateJob("job-id-2", updates);
      expect(mockUpdateJob).toHaveBeenCalledWith("job-id-2", updates);
      expect(result).toBe(false);
    });
  });

  describe("flushJobs", () => {
    it("calls flushJobsFn and returns true when flush succeeds", async () => {
      mockFlushJobs.mockResolvedValue(true);
      const result = await scheduler.flushJobs();
      expect(mockFlushJobs).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("returns false when flushJobsFn returns false", async () => {
      mockFlushJobs.mockResolvedValue(false);
      const result = await scheduler.flushJobs();
      expect(mockFlushJobs).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe("addTemplate", () => {
    it("calls addTemplateFn with name and template function and returns true", async () => {
      mockAddTemplate.mockResolvedValue(true);

      const templateFn = jest.fn();

      const result = await scheduler.addTemplate("myTemplate", templateFn);

      expect(mockAddTemplate).toHaveBeenCalledWith("myTemplate", templateFn);
      expect(result).toBe(true);
    });

    it("returns false when addTemplateFn returns false", async () => {
      mockAddTemplate.mockResolvedValue(false);

      const templateFn = async () => {};

      const result = await scheduler.addTemplate("otherTemplate", templateFn);

      expect(mockAddTemplate).toHaveBeenCalledWith("otherTemplate", templateFn);
      expect(result).toBe(false);
    });
  });
});

describe("Scheduler - Mongo", () => {
  let scheduler;

  beforeEach(() => {
    scheduler = createScheduler({ storeType: "inMemory", dev: true });
    mockStart.mockClear();
    mockStop.mockClear();
    mockProcessJobs.mockClear();
    mockAddJob.mockClear();
    mockPauseJob.mockClear();
    mockResumeJob.mockClear();
    mockGetJob.mockClear();
    mockGetJobs.mockClear();
  });

  it("should create a new scheduler with mongo store", () => {
    const scheduler = createScheduler({ storeType: "mongo", dev: true });
    expect(scheduler.store).toBeInstanceOf(MongoStore);
  });
});

describe("Scheduler - Redis", () => {
  let scheduler;

  beforeEach(() => {
    scheduler = createScheduler({ storeType: "inMemory", dev: true });
    mockStart.mockClear();
    mockStop.mockClear();
    mockProcessJobs.mockClear();
    mockAddJob.mockClear();
    mockPauseJob.mockClear();
    mockResumeJob.mockClear();
    mockGetJob.mockClear();
    mockGetJobs.mockClear();
  });

  it("should create a new scheduler with redis store", () => {
    const scheduler = createScheduler({ storeType: "redis", dev: true });
    expect(scheduler.store).toBeInstanceOf(RedisStore);
  });
});

describe("Scheduler - Default and Optional Values", () => {
  let scheduler;

  beforeEach(() => {
    scheduler = createScheduler({ dev: true });
    mockStart.mockClear();
    mockStop.mockClear();
    mockProcessJobs.mockClear();
    mockAddJob.mockClear();
    mockPauseJob.mockClear();
    mockResumeJob.mockClear();
    mockGetJob.mockClear();
    mockGetJobs.mockClear();
  });
  it("should use default values when options are not provided", () => {
    const scheduler = createScheduler({ storeType: "inMemory" });

    expect(scheduler.processEvery).toBe(1000);
    expect(scheduler.intervalId).toBeNull();
    expect(scheduler.logger).toBeDefined();
    expect(scheduler.store).toBeDefined();
  });

  it("should use custom values when options are provided", () => {
    const scheduler = createScheduler({
      storeType: "inMemory",
      logLevel: "debug",
      dev: true,
      processEvery: 5000,
      dbUri: "test-uri",
    });

    expect(scheduler.processEvery).toBe(5000);
    expect(scheduler.intervalId).toBeNull();
    expect(scheduler.logger).toBeDefined();
    expect(scheduler.store).toBeDefined();
  });

  it("should use inMemory db when invalid storeType provided", () => {
    const scheduler = createScheduler({
      storeType: "invalid",
      logLevel: "debug",
      dev: true,
      processEvery: 5000,
      dbUri: "test-uri",
    });

    expect(scheduler.processEvery).toBe(5000);
    expect(scheduler.intervalId).toBeNull();
    expect(scheduler.logger).toBeDefined();
    expect(scheduler.store).toBeInstanceOf(InMemoryStore);
  });
});
