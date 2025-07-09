import { RedisStore } from "../../../src/store/redis/redisStore.js";
import { jest } from "@jest/globals";

describe("RedisStore real", () => {
  let mockLogger;
  let mockStore;

  beforeEach(() => {
    mockLogger = {
      warn: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    };
  });

  afterEach(async () => {
    if (mockStore["redis"]) {
      await mockStore["redis"].disconnect();
    }
  });

  describe("init", () => {
    it("should return false if connection fails", async () => {
      mockStore = new RedisStore({ uri: "redis://invalid-host" }, mockLogger);
      const result = await mockStore.init(1);
      expect(result).toBe(false);
    });
  });

  describe("addJob", () => {
    it("should return false if there is no connection", async () => {
      mockStore = new RedisStore({ uri: "redis://invalid-host" }, mockLogger);
      const result = await mockStore.addJob({});
      expect(result).toBe(false);
    });
  });

  describe("getJob", () => {
    it("should return null if there is no connection", async () => {
      mockStore = new RedisStore({ uri: "redis://invalid-host" }, mockLogger);
      const result = await mockStore.getJob("1");
      expect(result).toBeNull();
    });
  });

  describe("removeJob", () => {
    it("should return false if there is no connection", async () => {
      mockStore = new RedisStore({ uri: "redis://invalid-host" }, mockLogger);
      const result = await mockStore.removeJob("1");
      expect(result).toBe(false);
    });
  });

  describe("updateJob", () => {
    it("should return false if there is no connection", async () => {
      mockStore = new RedisStore({ uri: "redis://invalid-host" }, mockLogger);
      const result = await mockStore.updateJob("1", {});
      expect(result).toBe(false);
    });
  });

  describe("getJobs", () => {
    it("should return an empty array if there is no connection", async () => {
      mockStore = new RedisStore({ uri: "redis://invalid-host" }, mockLogger);
      const result = await mockStore.getJobs();
      expect(result).toEqual([]);
    });
  });

  describe("flushJobs", () => {
    it("should return false if there is no connection", async () => {
      mockStore = new RedisStore({ uri: "redis://invalid-host" }, mockLogger);
      const result = await mockStore.flushJobs();
      expect(result).toBe(false);
    });
  });
});
