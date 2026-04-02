import { processJobs, processNextJob, shouldJobRun } from "../../../src/scheduler/process-jobs.js";
import { jest } from "@jest/globals";

describe("processJobs function", () => {
  let mockLogger;
  let mockStore;
  let context;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    mockStore = {
      getJobs: jest.fn().mockResolvedValue([]),
      getJob: jest.fn().mockResolvedValue(null),
      getTemplate: jest.fn().mockResolvedValue(null),
      updateJob: jest.fn().mockResolvedValue(true),
      lockJob: jest.fn().mockResolvedValue(true),
      unlockJob: jest.fn().mockResolvedValue(true),
      removeJob: jest.fn().mockResolvedValue(true),
    };

    context = {
      logger: mockLogger,
      store: mockStore,
      emit: jest.fn(),
    };
  });

  describe("shouldJobRun", () => {
    it("should skip inactive jobs", () => {
      const result = shouldJobRun.call(context, { id: "1", active: false });
      expect(result).toBe(false);
    });

    it("should skip jobs that haven't reached their start time", () => {
      const result = shouldJobRun.call(context, {
        id: "1",
        active: true,
        startAt: Date.now() + 10000,
      });
      expect(result).toBe(false);
    });

    it("should run jobs that have never run before", () => {
      const result = shouldJobRun.call(context, {
        id: "1",
        active: true,
        lastRunAt: null,
      });
      expect(result).toBe(true);
    });

    it("should skip one-time jobs that have already run", () => {
      const result = shouldJobRun.call(context, {
        id: "1",
        active: true,
        lastRunAt: Date.now() - 1000,
        repeat: null,
      });
      expect(result).toBe(false);
    });

    it("should run repeating jobs when enough time has passed", () => {
      const result = shouldJobRun.call(context, {
        id: "1",
        active: true,
        lastRunAt: Date.now() - 1000,
        repeat: 500,
      });
      expect(result).toBe(true);
    });

    it("should skip repeating jobs when not enough time has passed", () => {
      const result = shouldJobRun.call(context, {
        id: "1",
        active: true,
        lastRunAt: Date.now() - 100,
        repeat: 500,
      });
      expect(result).toBe(false);
    });
  });

  describe("processJobs", () => {
    it("should skip jobs with no matching template", async () => {
      mockStore.getJobs.mockResolvedValue([
        { id: "1", template: "missing", active: true },
      ]);
      mockStore.getTemplate.mockResolvedValue(null);

      await processJobs.call(context);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("missing")
      );
      expect(mockStore.lockJob).not.toHaveBeenCalled();
    });

    it("should process jobs with valid templates", async () => {
      mockStore.getJobs.mockResolvedValue([
        { id: "1", template: "test", active: true },
      ]);
      mockStore.getTemplate.mockResolvedValue(() => {});

      await processJobs.call(context);
      expect(mockStore.lockJob).toHaveBeenCalledWith("1");
    });

    it("should respect concurrency limit", async () => {
      const jobs = Array.from({ length: 12 }, (_, i) => ({
        id: `job-${i}`,
        template: "test",
        active: true,
      }));
      mockStore.getJobs.mockResolvedValue(jobs);

      let concurrent = 0;
      let maxConcurrent = 0;
      mockStore.getTemplate.mockResolvedValue(async () => {
        concurrent++;
        maxConcurrent = Math.max(maxConcurrent, concurrent);
        await new Promise((r) => setTimeout(r, 10));
        concurrent--;
      });

      await processJobs.call(context);
      expect(maxConcurrent).toBeLessThanOrEqual(10);
    });

    it("should catch unexpected errors from processNextJob", async () => {
      mockStore.getJobs.mockResolvedValue([
        { id: "1", template: "test", active: true },
      ]);
      mockStore.getTemplate.mockResolvedValue(() => {});
      mockStore.lockJob.mockRejectedValue(new Error("unexpected"));

      await processJobs.call(context);
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Unexpected error while processing job:",
        expect.any(Error)
      );
    });
  });

  describe("processNextJob", () => {
    it("should return early if lock is not acquired", async () => {
      mockStore.lockJob.mockResolvedValue(false);
      const jobFn = jest.fn();

      await processNextJob.call(
        context,
        { id: "1", active: true },
        jobFn
      );

      expect(jobFn).not.toHaveBeenCalled();
      expect(mockStore.updateJob).not.toHaveBeenCalled();
    });

    it("should execute job and update store on success", async () => {
      const jobFn = jest.fn();
      await processNextJob.call(
        context,
        { id: "1", active: true, repeat: 1000, runCount: 0, failCount: 0 },
        jobFn
      );

      expect(jobFn).toHaveBeenCalled();
      expect(mockStore.unlockJob).toHaveBeenCalledWith("1");
      expect(mockStore.updateJob).toHaveBeenCalledWith("1", {
        lastRunAt: expect.any(Number),
        lastFinishedAt: expect.any(Number),
        lastFailedAt: null,
        lastFailReason: null,
        runCount: 1,
        failCount: 0,
        lockedAt: null,
      });
    });

    it("should pass job data to the template function", async () => {
      const jobFn = jest.fn();
      const data = { userId: 123 };

      await processNextJob.call(
        context,
        { id: "1", active: true, data, repeat: 1000 },
        jobFn
      );

      expect(jobFn).toHaveBeenCalledWith(data);
    });

    it("should retry on failure up to maxRetries", async () => {
      const jobFn = jest.fn().mockRejectedValue(new Error("fail"));
      mockStore.getJob.mockResolvedValue({ id: "1" });

      await processNextJob.call(
        context,
        { id: "1", active: true, repeat: 1000, maxRetries: 2 },
        jobFn
      );

      expect(jobFn).toHaveBeenCalledTimes(2);
      expect(mockStore.updateJob).toHaveBeenCalledWith("1", expect.objectContaining({
        failCount: 2,
        lastFailReason: "fail",
        lastFailedAt: expect.any(Number),
      }));
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("failed after 2 immediate attempts")
      );
    });

    it("should use default maxRetries of 3", async () => {
      const jobFn = jest.fn().mockRejectedValue(new Error("fail"));
      mockStore.getJob.mockResolvedValue({ id: "1" });

      await processNextJob.call(
        context,
        { id: "1", active: true, repeat: 1000 },
        jobFn
      );

      expect(jobFn).toHaveBeenCalledTimes(3);
    });

    it("should handle non-Error throws", async () => {
      const jobFn = jest.fn().mockRejectedValue("string error");
      mockStore.getJob.mockResolvedValue({ id: "1" });

      await processNextJob.call(
        context,
        { id: "1", active: true, repeat: 1000, maxRetries: 1 },
        jobFn
      );

      expect(mockStore.updateJob).toHaveBeenCalledWith("1", expect.objectContaining({
        lastFailReason: "Unknown error",
      }));
    });

    it("should abort if job is removed during execution", async () => {
      const jobFn = jest.fn().mockRejectedValue(new Error("fail"));
      mockStore.getJob.mockResolvedValue(null);

      await processNextJob.call(
        context,
        { id: "1", active: true, repeat: 1000, maxRetries: 3 },
        jobFn
      );

      expect(jobFn).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("has been removed")
      );
      // Should not log the "failed after N attempts" error
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it("should remove one-time jobs after execution", async () => {
      const jobFn = jest.fn();

      await processNextJob.call(
        context,
        { id: "1", active: true, repeat: undefined },
        jobFn
      );

      expect(mockStore.removeJob).toHaveBeenCalledWith("1");
    });

    it("should not remove repeating jobs after execution", async () => {
      const jobFn = jest.fn();

      await processNextJob.call(
        context,
        { id: "1", active: true, repeat: 1000 },
        jobFn
      );

      expect(mockStore.removeJob).not.toHaveBeenCalled();
    });

    it("should increment runCount from existing value", async () => {
      const jobFn = jest.fn();

      await processNextJob.call(
        context,
        { id: "1", active: true, repeat: 1000, runCount: 5 },
        jobFn
      );

      expect(mockStore.updateJob).toHaveBeenCalledWith("1", expect.objectContaining({
        runCount: 6,
      }));
    });

    it("should increment failCount from existing value", async () => {
      const jobFn = jest.fn().mockRejectedValue(new Error("fail"));
      mockStore.getJob.mockResolvedValue({ id: "1" });

      await processNextJob.call(
        context,
        { id: "1", active: true, repeat: 1000, maxRetries: 1, failCount: 3 },
        jobFn
      );

      expect(mockStore.updateJob).toHaveBeenCalledWith("1", expect.objectContaining({
        failCount: 4,
      }));
    });

    it("should succeed on retry after initial failure", async () => {
      let callCount = 0;
      const jobFn = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) throw new Error("transient");
      });
      mockStore.getJob.mockResolvedValue({ id: "1" });

      await processNextJob.call(
        context,
        { id: "1", active: true, repeat: 1000, maxRetries: 3 },
        jobFn
      );

      expect(jobFn).toHaveBeenCalledTimes(2);
      expect(mockLogger.error).not.toHaveBeenCalled();
      expect(mockStore.updateJob).toHaveBeenCalledWith("1", expect.objectContaining({
        runCount: 2,
        failCount: 1,
      }));
    });
  });
});
