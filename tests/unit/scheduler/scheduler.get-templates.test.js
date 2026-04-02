import { getTemplates } from "../../../src/scheduler/get-templates.js";
import { jest } from "@jest/globals";

describe("getTemplates function", () => {
  let mockStore;
  let context;

  beforeEach(() => {
    mockStore = {
      getTemplates: jest.fn(),
    };

    context = {
      store: mockStore,
    };
  });

  it("returns templates from the store", async () => {
    const fakeTemplates = [() => {}, () => {}];
    mockStore.getTemplates.mockResolvedValue(fakeTemplates);

    const result = await getTemplates.call(context);

    expect(result).toEqual(fakeTemplates);
    expect(mockStore.getTemplates).toHaveBeenCalled();
  });

  it("returns empty array when no templates exist", async () => {
    mockStore.getTemplates.mockResolvedValue([]);

    const result = await getTemplates.call(context);

    expect(result).toEqual([]);
  });
});
