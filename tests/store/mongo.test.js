import { MongoStore } from "../../src/store/mongo/mongoStore.js";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { jest } from "@jest/globals";
import { JobModel } from "../../src/job/job.js";

describe("MongoStore", () => {
  let mockLogger;
  let mockStore;
  let mongoServer;
  beforeEach(async () => {
    mockLogger = {
      warn: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    };

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri() + "jest";
    mockStore = new MongoStore({ uri }, mockLogger);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  describe("init", () => {
    it("should return true", async () => {
      const result = await mockStore.init();
      expect(result).toBe(true);
    });

    it("should return false if connection fails", async () => {
      const connectSpy = jest
        .spyOn(mongoose, "connect")
        .mockRejectedValue(new Error("Mock connection error"));

      const store = new MongoStore(
        { uri: "mongodb://invalid-host" },
        mockLogger
      );
      const result = await store.init();

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to connect to MongoDB",
        {
          error: expect.any(Error),
        }
      );
    });
  });

  describe("addJob", () => {
    it("should return true if job is added", async () => {
      await mockStore.init();
      const result = await mockStore.addJob({
        id: "1",
        template: "test",
        active: true,
      });
      expect(result).toBe(true);
    });

    it("should return false if job is not added", async () => {
      const result = await mockStore.addJob({
        id: "1",
        template: "test",
      });
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith("Failed to add job", {
        error: expect.any(Error),
      });
    });
  });

  describe("getJob", () => {
    it("should return job if it exists", async () => {
      await mockStore.init();
      await mockStore.addJob({
        id: "1",
        template: "test",
        active: true,
      });
      const result = await mockStore.getJob("1");
      expect(result.id).toBe("1");
    });

    it("should return null if job does not exist", async () => {
      await mockStore.init();
      const result = await mockStore.getJob("1");
      expect(result).toBeNull();
    });

    it("returns null and logs error when findOne throws", async () => {
      jest.spyOn(JobModel, "findOne").mockImplementationOnce(() => {
        throw new Error("DB failure");
      });

      const result = await mockStore.getJob("some-id");

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe("removeJob", () => {
    it("should return true if job is removed", async () => {
      await mockStore.init();
      await mockStore.addJob({
        id: "1",
        template: "test",
        active: true,
      });
      const result = await mockStore.removeJob("1");
      expect(result).toBe(true);
    });

    it("should return false if job is not removed", async () => {
      await mockStore.init();
      const result = await mockStore.removeJob("a");
      expect(result).toBe(false);
    });

    it("returns false and logs error when findOneAndDelete throws", async () => {
      jest.spyOn(JobModel, "findOneAndDelete").mockImplementationOnce(() => {
        throw new Error("DB failure");
      });

      const result = await mockStore.removeJob("some-id");
      expect(mockLogger.error).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe("updateJob", () => {
    it("should return true if job is updated", async () => {
      await mockStore.init();
      await mockStore.addJob({
        id: "1",
        template: "test",
        active: true,
      });
      const result = await mockStore.updateJob("1", { active: false });
      expect(result).toBe(true);
    });

    it("returns false and logs error when findOneAndUpdate throws", async () => {
      jest.spyOn(JobModel, "findOneAndUpdate").mockImplementationOnce(() => {
        throw new Error("DB failure");
      });

      const result = await mockStore.updateJob("some-id", { active: false });
      expect(mockLogger.error).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe("getJobs", () => {
    it("should return all jobs if there are any", async () => {
      await mockStore.init();
      await mockStore.addJob({
        id: "1",
        template: "test",
        active: true,
      });
      await mockStore.addJob({
        id: "2",
        template: "test",
        active: true,
      });
      const result = await mockStore.getJobs();
      expect(result.length).toBe(2);
    });

    it("should return an empty array if there are no jobs", async () => {
      await mockStore.init();
      const result = await mockStore.getJobs();
      expect(result).toEqual([]);
    });

    it("returns empty array and logs error when find throws", async () => {
      jest.spyOn(JobModel, "find").mockImplementationOnce(() => {
        throw new Error("DB failure");
      });

      const result = await mockStore.getJobs();
      expect(result).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalled();
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

  describe("flushJobs", () => {
    it("should return true if jobs are flushed", async () => {
      await mockStore.init();
      await mockStore.addJob({
        id: "1",
        template: "test",
        active: true,
      });
      const result = await mockStore.flushJobs();
      expect(result).toBe(true);
    });

    it("returns false and logs error when deleteMany throws", async () => {
      jest.spyOn(JobModel, "deleteMany").mockImplementationOnce(() => {
        throw new Error("DB failure");
      });

      const result = await mockStore.flushJobs();
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe("close", () => {
    it("should return true if the store is closed", async () => {
      const result = await mockStore.close();
      expect(result).toBe(true);
    });

    it("should return false if the store is not closed", async () => {
      const originalClose = mongoose.connection.close;
      mongoose.connection.close = jest
        .fn()
        .mockRejectedValue(new Error("Connection failed"));
      const result = await mockStore.close();
      mongoose.connection.close = originalClose;
      expect(result).toBe(false);
    });
  });
});
