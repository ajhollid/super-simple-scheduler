import { addTemplate } from "../../../src/scheduler/add-template.js";
import { jest } from "@jest/globals";

describe("addTemplate function", () => {
  let mockStore;
  let context;

  beforeEach(() => {
    mockStore = {
      addTemplate: jest.fn(),
    };

    context = {
      store: mockStore,
    };
  });

  it("should add a template to the store and return true", async () => {
    mockStore.addTemplate.mockResolvedValue(true);
    const templateFn = () => {};
    const result = await addTemplate.call(context, "test", templateFn);
    expect(result).toBe(true);
    expect(mockStore.addTemplate).toHaveBeenCalledWith("test", templateFn);
  });

  it("should return false if adding the template fails", async () => {
    mockStore.addTemplate.mockResolvedValue(false);
    const result = await addTemplate.call(context, "test", () => {});
    expect(result).toBe(false);
  });
});
