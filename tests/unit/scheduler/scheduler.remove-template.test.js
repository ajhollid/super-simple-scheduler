import { removeTemplate } from "../../../src/scheduler/remove-template.js";
import { jest } from "@jest/globals";

describe("removeTemplate function", () => {
  let mockStore;
  let mockLogger;
  let context;

  beforeEach(() => {
    mockLogger = {
      warn: jest.fn(),
    };

    mockStore = {
      getTemplate: jest.fn(),
      removeTemplate: jest.fn(),
    };

    context = {
      logger: mockLogger,
      store: mockStore,
    };
  });

  it("returns true if the template is removed", async () => {
    mockStore.getTemplate.mockResolvedValue(() => {});
    mockStore.removeTemplate.mockResolvedValue(true);

    const result = await removeTemplate.call(context, "myTemplate");

    expect(result).toBe(true);
    expect(mockStore.removeTemplate).toHaveBeenCalledWith("myTemplate");
  });

  it("returns false if the template does not exist", async () => {
    mockStore.getTemplate.mockResolvedValue(null);

    const result = await removeTemplate.call(context, "nonexistent");

    expect(result).toBe(false);
    expect(mockLogger.warn).toHaveBeenCalled();
    expect(mockStore.removeTemplate).not.toHaveBeenCalled();
  });
});
