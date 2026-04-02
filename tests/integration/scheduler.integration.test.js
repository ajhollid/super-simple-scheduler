import Scheduler from "../../src/scheduler/index.js";
import { jest } from "@jest/globals";

describe("Scheduler Integration", () => {
  let scheduler;

  beforeEach(() => {
    scheduler = new Scheduler({ logLevel: "none", processEvery: 50 });
  });

  afterEach(async () => {
    await scheduler.stop();
  });

  describe("job lifecycle", () => {
    it("should add, retrieve, and remove a job", async () => {
      await scheduler.addTemplate("greet", () => {});

      const added = await scheduler.addJob({
        id: "job-1",
        template: "greet",
        data: { name: "Alex" },
      });
      expect(added).toBe(true);

      const job = await scheduler.getJob("job-1");
      expect(job).not.toBeNull();
      expect(job.id).toBe("job-1");
      expect(job.template).toBe("greet");
      expect(job.data).toEqual({ name: "Alex" });
      expect(job.active).toBe(true);

      const removed = await scheduler.removeJob("job-1");
      expect(removed).toBe(true);

      const after = await scheduler.getJob("job-1");
      expect(after).toBeNull();
    });

    it("should generate an id when none is provided", async () => {
      await scheduler.addTemplate("test", () => {});
      await scheduler.addJob({ template: "test" });

      const jobs = await scheduler.getJobs();
      expect(jobs).toHaveLength(1);
      expect(jobs[0].id).toBeDefined();
      expect(typeof jobs[0].id).toBe("string");
    });

    it("should update an existing job when addJob is called with the same id", async () => {
      await scheduler.addTemplate("v1", () => {});
      await scheduler.addTemplate("v2", () => {});

      await scheduler.addJob({ id: "job-1", template: "v1", data: { v: 1 } });
      await scheduler.addJob({ id: "job-1", template: "v2", data: { v: 2 } });

      const jobs = await scheduler.getJobs();
      expect(jobs).toHaveLength(1);

      const job = await scheduler.getJob("job-1");
      expect(job.template).toBe("v2");
      expect(job.data).toEqual({ v: 2 });
    });
  });

  describe("pause and resume", () => {
    it("should pause and resume a job", async () => {
      await scheduler.addTemplate("test", () => {});
      await scheduler.addJob({ id: "job-1", template: "test" });

      await scheduler.pauseJob("job-1");
      let job = await scheduler.getJob("job-1");
      expect(job.active).toBe(false);

      await scheduler.resumeJob("job-1");
      job = await scheduler.getJob("job-1");
      expect(job.active).toBe(true);
    });

    it("should not execute paused jobs", async () => {
      const fn = jest.fn();
      await scheduler.addTemplate("test", fn);
      await scheduler.addJob({ id: "job-1", template: "test" });
      await scheduler.pauseJob("job-1");

      await scheduler.processJobs();
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe("updateJob", () => {
    it("should update job fields", async () => {
      await scheduler.addTemplate("test", () => {});
      await scheduler.addJob({
        id: "job-1",
        template: "test",
        repeat: 1000,
      });

      await scheduler.updateJob("job-1", { repeat: 5000 });
      const job = await scheduler.getJob("job-1");
      expect(job.repeat).toBe(5000);
    });

    it("should return false for nonexistent job", async () => {
      const result = await scheduler.updateJob("nonexistent", { repeat: 100 });
      expect(result).toBe(false);
    });
  });

  describe("flushJobs", () => {
    it("should remove all jobs", async () => {
      await scheduler.addTemplate("test", () => {});
      await scheduler.addJob({ id: "job-1", template: "test" });
      await scheduler.addJob({ id: "job-2", template: "test" });

      const before = await scheduler.getJobs();
      expect(before).toHaveLength(2);

      await scheduler.flushJobs();

      const after = await scheduler.getJobs();
      expect(after).toHaveLength(0);
    });
  });

  describe("job execution", () => {
    it("should execute a one-time job and remove it", async () => {
      const fn = jest.fn();
      await scheduler.addTemplate("once", fn);
      await scheduler.addJob({ id: "job-1", template: "once" });

      await scheduler.processJobs();
      expect(fn).toHaveBeenCalledTimes(1);

      const job = await scheduler.getJob("job-1");
      expect(job).toBeNull();
    });

    it("should pass job data to the template function", async () => {
      const fn = jest.fn();
      await scheduler.addTemplate("test", fn);
      await scheduler.addJob({
        id: "job-1",
        template: "test",
        data: { userId: 42 },
      });

      await scheduler.processJobs();
      expect(fn).toHaveBeenCalledWith({ userId: 42 });
    });

    it("should execute a repeating job and keep it in the store", async () => {
      const fn = jest.fn();
      await scheduler.addTemplate("repeat", fn);
      await scheduler.addJob({
        id: "job-1",
        template: "repeat",
        repeat: 100,
      });

      await scheduler.processJobs();
      expect(fn).toHaveBeenCalledTimes(1);

      const job = await scheduler.getJob("job-1");
      expect(job).not.toBeNull();
      expect(job.lastRunAt).toEqual(expect.any(Number));
      expect(job.runCount).toBe(1);
      expect(job.lockedAt).toBeNull();
    });

    it("should not re-execute a repeating job before the interval elapses", async () => {
      const fn = jest.fn();
      await scheduler.addTemplate("repeat", fn);
      await scheduler.addJob({
        id: "job-1",
        template: "repeat",
        repeat: 60000,
      });

      await scheduler.processJobs();
      expect(fn).toHaveBeenCalledTimes(1);

      await scheduler.processJobs();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should skip jobs whose startAt is in the future", async () => {
      const fn = jest.fn();
      await scheduler.addTemplate("delayed", fn);
      await scheduler.addJob({
        id: "job-1",
        template: "delayed",
        startAt: Date.now() + 60000,
      });

      await scheduler.processJobs();
      expect(fn).not.toHaveBeenCalled();
    });

    it("should reject adding a job with no registered template", async () => {
      const result = await scheduler.addJob({
        id: "job-1",
        template: "nonexistent",
      });

      expect(result).toBe(false);

      const job = await scheduler.getJob("job-1");
      expect(job).toBeNull();
    });

    it("should execute multiple jobs concurrently", async () => {
      const order = [];
      await scheduler.addTemplate("slow", async (data) => {
        order.push(`start-${data.id}`);
        await new Promise((r) => setTimeout(r, 20));
        order.push(`end-${data.id}`);
      });

      await scheduler.addJob({ id: "a", template: "slow", data: { id: "a" } });
      await scheduler.addJob({ id: "b", template: "slow", data: { id: "b" } });

      await scheduler.processJobs();

      expect(order[0]).toBe("start-a");
      expect(order[1]).toBe("start-b");
      expect(order).toHaveLength(4);
    });
  });

  describe("retry and failure handling", () => {
    it("should retry a failing job up to maxRetries", async () => {
      const fn = jest.fn().mockRejectedValue(new Error("fail"));
      await scheduler.addTemplate("flaky", fn);
      await scheduler.addJob({
        id: "job-1",
        template: "flaky",
        repeat: 1000,
        maxRetries: 3,
      });

      await scheduler.processJobs();
      expect(fn).toHaveBeenCalledTimes(3);

      const job = await scheduler.getJob("job-1");
      expect(job.failCount).toBe(3);
      expect(job.lastFailReason).toBe("fail");
      expect(job.lastFailedAt).toEqual(expect.any(Number));
    });

    it("should succeed on retry if a transient error clears", async () => {
      let calls = 0;
      await scheduler.addTemplate("transient", () => {
        calls++;
        if (calls === 1) throw new Error("transient");
      });
      await scheduler.addJob({
        id: "job-1",
        template: "transient",
        repeat: 1000,
        maxRetries: 3,
      });

      await scheduler.processJobs();

      const job = await scheduler.getJob("job-1");
      expect(job.runCount).toBe(2);
      expect(job.failCount).toBe(1);
    });

    it("should abort execution if job is removed mid-retry", async () => {
      let callCount = 0;
      await scheduler.addTemplate("remove-mid", async () => {
        callCount++;
        if (callCount === 1) {
          await scheduler.removeJob("job-1");
          throw new Error("fail");
        }
      });

      await scheduler.addJob({
        id: "job-1",
        template: "remove-mid",
        repeat: 1000,
        maxRetries: 5,
      });

      await scheduler.processJobs();
      expect(callCount).toBe(1);

      const job = await scheduler.getJob("job-1");
      expect(job).toBeNull();
    });

    it("should use default maxRetries of 3", async () => {
      const fn = jest.fn().mockRejectedValue(new Error("fail"));
      await scheduler.addTemplate("default-retry", fn);
      await scheduler.addJob({
        id: "job-1",
        template: "default-retry",
        repeat: 1000,
      });

      await scheduler.processJobs();
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  describe("locking", () => {
    it("should not execute an already locked job", async () => {
      const fn = jest.fn();
      await scheduler.addTemplate("test", fn);
      await scheduler.addJob({ id: "job-1", template: "test" });

      // Manually lock the job via the store
      await scheduler.store.lockJob("job-1");

      await scheduler.processJobs();
      expect(fn).not.toHaveBeenCalled();
    });

    it("should release the lock after execution", async () => {
      await scheduler.addTemplate("test", () => {});
      await scheduler.addJob({
        id: "job-1",
        template: "test",
        repeat: 1000,
      });

      await scheduler.processJobs();

      const job = await scheduler.getJob("job-1");
      expect(job.lockedAt).toBeNull();
    });

    it("should release the lock even after failure", async () => {
      await scheduler.addTemplate("fail", () => {
        throw new Error("fail");
      });
      await scheduler.addJob({
        id: "job-1",
        template: "fail",
        repeat: 1000,
        maxRetries: 1,
      });

      await scheduler.processJobs();

      const job = await scheduler.getJob("job-1");
      expect(job.lockedAt).toBeNull();
    });
  });

  describe("start and stop", () => {
    it("should start and process jobs on interval", async () => {
      jest.useFakeTimers();

      const fn = jest.fn();
      await scheduler.addTemplate("interval", fn);
      await scheduler.addJob({
        id: "job-1",
        template: "interval",
        repeat: 10,
      });

      const started = await scheduler.start();
      expect(started).toBe(true);
      expect(scheduler.intervalId).not.toBeNull();

      jest.advanceTimersByTime(50);
      await Promise.resolve();

      jest.useRealTimers();
      await scheduler.stop();
      expect(scheduler.intervalId).toBeNull();
    });

    it("should stop cleanly with no jobs", async () => {
      await scheduler.start();
      const result = await scheduler.stop();
      expect(result).toBe(true);
      expect(scheduler.intervalId).toBeNull();
    });
  });

  describe("template management", () => {
    it("should add and retrieve templates", async () => {
      const fn1 = () => {};
      const fn2 = () => {};
      await scheduler.addTemplate("t1", fn1);
      await scheduler.addTemplate("t2", fn2);

      const templates = await scheduler.getTemplates();
      expect(templates).toHaveLength(2);
    });

    it("should remove a template", async () => {
      await scheduler.addTemplate("removable", () => {});

      const result = await scheduler.removeTemplate("removable");
      expect(result).toBe(true);

      const templates = await scheduler.getTemplates();
      expect(templates).toHaveLength(0);
    });

    it("should return false when removing a nonexistent template", async () => {
      const result = await scheduler.removeTemplate("nonexistent");
      expect(result).toBe(false);
    });
  });

  describe("data isolation", () => {
    it("should not leak caller data references into the store", async () => {
      await scheduler.addTemplate("test", () => {});

      const data = { value: "original" };
      await scheduler.addJob({ id: "job-1", template: "test", data });

      data.value = "mutated";

      const job = await scheduler.getJob("job-1");
      expect(job.data.value).toBe("original");
    });

    it("should not leak store references to callers", async () => {
      await scheduler.addTemplate("test", () => {});
      await scheduler.addJob({
        id: "job-1",
        template: "test",
        data: { value: "original" },
      });

      const job1 = await scheduler.getJob("job-1");
      job1.data.value = "mutated";

      const job2 = await scheduler.getJob("job-1");
      expect(job2.data.value).toBe("original");
    });
  });
});
