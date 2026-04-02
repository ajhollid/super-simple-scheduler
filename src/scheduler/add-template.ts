import { IScheduler } from "./types.js";

export async function addTemplate(
  this: IScheduler,
  name: string,
  template: (data?: unknown) => void | Promise<void>,
) {
  return await this.store.addTemplate(name, template);
}
