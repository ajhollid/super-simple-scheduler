import { IScheduler } from "./scheduler.js";
import { v4 as uuidv4 } from "uuid";

export async function addJob(
  this: IScheduler,
  {
    id,
    template,
    repeat,
    data,
    active = true,
  }: {
    id?: string | number;
    template: string;
    repeat?: number;
    data?: any;
    active?: boolean;
  }
) {
  if (!id) {
    this.logger.warn(`Job id is required`);
    return false;
  }
  const existingJob = await this.store.getJob(id);

  if (existingJob) {
    this.logger.info(`Job with id ${id} already exists`);
    return false;
  }

  await this.store.addJob({
    id: id ?? uuidv4(),
    template: template,
    data: data,
    repeat: repeat,
    lastRunAt: null,
    lockedAt: null,
    active: active,
  });
  return true;
}
