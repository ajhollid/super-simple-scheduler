import { addTemplate } from "../../src/scheduler/add-template.js";
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

  it("should add a template to the store", async () => {
    const result = await addTemplate.call(context, "test", () => {});
  });
});
