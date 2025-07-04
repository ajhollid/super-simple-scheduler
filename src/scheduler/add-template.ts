import { IScheduler } from "./scheduler.js";

export async function addTemplate(
  this: IScheduler,
  name: string,
  template: (data?: any) => void | Promise<void>
) {
  return await this.store.addTemplate(name, template);
}
