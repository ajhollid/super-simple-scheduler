import { cloneJob } from "../../../src/utils/cloneJob.js";

describe("cloneJob", () => {
  it("should deep clone a job with plain data via structuredClone", () => {
    const job = {
      id: "1",
      template: "test",
      active: true,
      data: { nested: { value: "hello" } },
    };

    const cloned = cloneJob(job);

    expect(cloned).toEqual(job);
    expect(cloned).not.toBe(job);
    expect(cloned.data).not.toBe(job.data);
  });

  it("should clone a job with no data field", () => {
    const job = { id: "1", template: "test", active: true };

    const cloned = cloneJob(job);

    expect(cloned).toEqual(job);
    expect(cloned).not.toBe(job);
  });

  it("should fall back to JSON clone when data is not structuredClone-able", () => {
    const job = {
      id: "1",
      template: "test",
      active: true,
      data: { fn: () => "hello", name: "test" },
    };

    const cloned = cloneJob(job);

    expect(cloned.id).toBe("1");
    expect(cloned.template).toBe("test");
    expect(cloned.active).toBe(true);
    // JSON clone strips functions but clones the rest
    expect(cloned.data.name).toBe("test");
    expect(cloned.data.fn).toBeUndefined();
    // data should be a different reference
    expect(cloned.data).not.toBe(job.data);
  });

  it("should fall back to reference when data is not JSON-serializable either", () => {
    const circular = { self: null };
    circular.self = circular;
    // Add a function so structuredClone fails, and circular ref so JSON fails
    circular.fn = () => {};

    const job = {
      id: "1",
      template: "test",
      active: true,
      data: circular,
    };

    const cloned = cloneJob(job);

    expect(cloned.id).toBe("1");
    expect(cloned.template).toBe("test");
    // data is passed by reference as last resort
    expect(cloned.data).toBe(job.data);
  });

  it("should clone job metadata fields independently of data", () => {
    const job = {
      id: "1",
      template: "test",
      active: true,
      data: { callback: () => {} },
      lastRunAt: 1000,
      runCount: 5,
      failCount: 2,
      lastFailReason: "error",
    };

    const cloned = cloneJob(job);

    expect(cloned.lastRunAt).toBe(1000);
    expect(cloned.runCount).toBe(5);
    expect(cloned.failCount).toBe(2);
    expect(cloned.lastFailReason).toBe("error");
  });
});
