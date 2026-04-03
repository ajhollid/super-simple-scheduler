import { IScheduler } from "./types.js";
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
    data?: unknown;
    active?: boolean;
    startAt?: number;
  },
) {
  // Check if template exists
  const templateFn = await this.store.getTemplate(template);
  if (!templateFn) {
    this.emit(
      "scheduler:error",
      new Error(`Template "${template}" does not exist, cannot add job`),
    );
    return false;
  }

  let jobId = id;
  if (typeof jobId === "undefined") jobId = uuidv4();

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
      failCount: 0,
      runCount: 0,
      lastFailedAt: null,
      lastFailReason: null,
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
