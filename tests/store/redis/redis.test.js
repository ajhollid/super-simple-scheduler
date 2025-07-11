import RedisMock from "ioredis-mock";
import { jest } from "@jest/globals";

jest.doMock("ioredis", () => ({
  __esModule: true,
  default: RedisMock,
  Redis: RedisMock,
}));
const { RedisStore } = await import("../../../src/store/redis/redisStore.js");

describe("RedisStore", () => {
  let mockLogger;
  let mockStore;

  beforeEach(() => {
    mockLogger = {
      warn: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    };

    mockStore = new RedisStore({ uri: "redis://localhost:6379" }, mockLogger);
  });

  afterEach(async () => {
    if (mockStore["redis"]) {
      await mockStore["redis"].disconnect();
    }

    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("init", () => {
    it("should initialize RedisStore", async () => {
      expect(await mockStore.init()).toBe(true);
    });
    it("should log Redis errors via logger.error", async () => {
      await mockStore.init();

      const testError = new Error("Simulated Redis error");
      mockStore["redis"].emit("error", testError);

      await new Promise((r) => setTimeout(r, 10));

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it("should log disconnect and update isConnected", async () => {
      await mockStore.init();

      expect(mockStore["isConnected"]).toBe(true);

      mockStore["redis"].emit("disconnect");

      await new Promise((r) => setTimeout(r, 10));

      expect(mockLogger.info).toHaveBeenCalled();
      expect(mockStore["isConnected"]).toBe(false);
    });
  });

  describe("addJob", () => {
    it("should add a job", async () => {
      await mockStore.init();
      const job = {
        id: "1",
        name: "test",
        data: {},
      };
      const result = await mockStore.addJob(job);
      expect(result).toBe(true);
    });

    it("should return false if job is not added", async () => {
      await mockStore.init();
      const result = await mockStore.addJob(null);
      expect(result).toBe(false);
    });
  });

  describe("getJob", () => {
    it("should get a job", async () => {
      await mockStore.init();
      const job = {
        id: "1",
        name: "test",
        data: {},
      };
      await mockStore.addJob(job);
      const result = await mockStore.getJob(job.id);
      expect(result).toEqual(job);
    });

    it("should return null if job is not found", async () => {
      await mockStore.init();
      await mockStore.flushJobs();
      const result = await mockStore.getJob("1");
      expect(result).toBeNull();
    });
  });

  describe("removeJob", () => {
    it("should return true if a job is removed", async () => {
      await mockStore.init();
      const job = {
        id: "1",
        name: "test",
        data: {},
      };
      await mockStore.addJob(job);
      const result = await mockStore.removeJob(job.id);
      expect(result).toBe(true);
    });

    it("should return false if a job is not removed", async () => {
      await mockStore.init();
      const result = await mockStore.removeJob("1");
      expect(result).toBe(false);
    });
  });

  describe("updateJob", () => {
    it("should return true if a job is updated", async () => {
      await mockStore.init();
      const job = {
        id: "1",
        name: "test",
        data: {},
      };
      await mockStore.addJob(job);
      const result = await mockStore.updateJob(job.id, {
        name: "test2",
      });
      expect(result).toBe(true);
    });

    it("should return false if a job is not updated", async () => {
      await mockStore.init();
      await mockStore.flushJobs();
      const result = await mockStore.updateJob("1", {
        name: "test2",
      });
      expect(result).toBe(false);
    });
  });

  describe("getJobs", () => {
    it("should return an empty array if there are no jobs", async () => {
      await mockStore.init();
      await mockStore.flushJobs();
      const result = await mockStore.getJobs();
      expect(result).toEqual([]);
    });

    it("should return an array of jobs if there are jobs", async () => {
      await mockStore.init();
      const job = {
        id: "1",
        name: "test",
        data: {},
      };
      await mockStore.addJob(job);
      const result = await mockStore.getJobs();
      expect(result).toEqual([job]);
    });
  });

  describe("flushJobs", () => {
    it("should return false if jobs are no jobs to flush", async () => {
      await mockStore.init();
      await mockStore.flushJobs();
      const result = await mockStore.flushJobs();
      expect(result).toBe(false);
    });
  });

  describe("addTemplate", () => {
    it("should return true if template is added", async () => {
      const result = await mockStore.addTemplate("test", () => {});
      expect(result).toBe(true);
    });
  });

  describe("getTemplate", () => {
    it("should return template if it exists", async () => {
      const fn = () => {};
      await mockStore.addTemplate("test", fn);
      const result = await mockStore.getTemplate("test");
      expect(result).toBe(fn);
    });

    it("should return null if template does not exist", async () => {
      const result = await mockStore.getTemplate("test");
      expect(result).toBeNull();
    });
  });

  describe("close", () => {
    it("should return true if the store is closed", async () => {
      await mockStore.init();
      const result = await mockStore.close();
      expect(result).toBe(true);
    });

    it("should return true if there is no redis", async () => {
      const result = await mockStore.close();
      expect(result).toBe(true);
    });

    it("should return false if the store fails to close", async () => {
      await mockStore.init();
      const disconnectSpy = jest
        .spyOn(mockStore["redis"], "disconnect")
        .mockImplementation(() => {
          throw new Error("Connection failed");
        });
      const result = await mockStore.close();
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
      disconnectSpy.mockRestore();
    });
  });
});
