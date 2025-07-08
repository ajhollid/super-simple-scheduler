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
    startAt,
  }: {
    id?: string | number;
    template: string;
    repeat?: number;
    data?: any;
    active?: boolean;
    startAt?: number;
  }
) {
  let jobId = id;
  if (!jobId) jobId = uuidv4();

  const existingJob = await this.store.getJob(jobId);

  if (existingJob) {
    await this.store.updateJob(jobId, {
      template: template,
      data: data,
      repeat: repeat,
      startAt: startAt,
      lastRunAt: null,
      lockedAt: null,
      active: active,
    });
    return true;
  }

  await this.store.addJob({
    id: jobId,
    template: template,
    data: data,
    repeat: repeat,
    startAt: startAt,
    lastRunAt: null,
    lockedAt: null,
    active: active,
  });
  return true;
}
