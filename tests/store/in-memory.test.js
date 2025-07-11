import { InMemoryStore } from "../../src/store/inMemory/inMemoryStore.js";

describe("InMemoryStore", () => {
  let store;

  beforeEach(() => {
    store = new InMemoryStore();
  });

  describe("init", () => {
    it("should return true", async () => {
      const result = await store.init();
      expect(result).toBe(true);
    });
  });

  describe("addJob", () => {
    it("should return true if the job is added", async () => {
      const result = await store.addJob({
        id: "1",
        name: "test",
      });

      expect(result).toBe(true);
    });
  });

  describe("getJob", () => {
    it("should return the job if it exists", async () => {
      const result = await store.addJob({
        id: "1",
        name: "test",
      });

      const job = await store.getJob("1");
      expect(job).toEqual({ id: "1", name: "test" });
    });

    it("should return null if the job does not exist", async () => {
      const result = await store.getJob("1");
      expect(result).toBeNull();
    });
  });

  describe("removeJob", () => {
    it("should return true if the job is removed", async () => {
      await store.addJob({
        id: "1",
        name: "test",
      });

      const result = await store.removeJob("1");
      expect(result).toBe(true);
    });

    it("should return false if the job is not removed", async () => {
      const result = await store.removeJob("1");
      expect(result).toBe(false);
    });
  });

  describe("updateJob", () => {
    it("should return false if the job does not exist", async () => {
      const result = await store.updateJob("1", {
        name: "test2",
      });
      expect(result).toBe(false);
    });

    it("should return true if the job is updated", async () => {
      await store.addJob({
        id: "1",
        name: "test",
      });

      const result = await store.updateJob("1", {
        name: "test2",
      });

      expect(result).toBe(true);
    });
  });

  describe("getJobs", () => {
    it("should return an empty array if there are no jobs", async () => {
      const result = await store.getJobs();
      expect(result).toEqual([]);
    });

    it("should return the jobs if there are jobs", async () => {
      await store.addJob({
        id: "1",
        name: "test",
      });

      const result = await store.getJobs();
      expect(result).toEqual([{ id: "1", name: "test" }]);
    });
  });

  describe("addTemplate", () => {
    it("should return true if the template is added", async () => {
      const result = await store.addTemplate("test", () => {});
      expect(result).toBe(true);
    });
  });

  describe("getTemplate", () => {
    it("should return the template if it exists", async () => {
      const fn = () => {};
      await store.addTemplate("test", fn);
      const result = await store.getTemplate("test");
      expect(result).toEqual(fn);
    });

    it("should return null if the template does not exist", async () => {
      const result = await store.getTemplate("test");
      expect(result).toBeNull();
    });
  });

  describe("flushJobs", () => {
    it("should return true if the jobs are flushed", async () => {
      await store.addJob({
        id: "1",
        name: "test",
      });

      const result = await store.flushJobs();
      expect(result).toBe(true);
    });
  });

  describe("close", () => {
    it("should return true if the store is closed", async () => {
      const result = await store.close();
      expect(result).toBe(true);
    });
  });
});
