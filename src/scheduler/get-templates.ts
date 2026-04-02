import { IScheduler } from "./types.js";

export async function getTemplates(this: IScheduler) {
  return await this.store.getTemplates();
}
