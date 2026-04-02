import { IScheduler } from "./types.js";

export async function removeTemplate(this: IScheduler, name: string) {
  const template = await this.store.getTemplate(name);
  if (!template) {
    this.logger.warn(`Template with name "${name}" not found, cannot remove.`);
    return false;
  }
  return await this.store.removeTemplate(name);
}
