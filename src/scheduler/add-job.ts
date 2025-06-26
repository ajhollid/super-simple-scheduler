import { IScheduler } from "./index.js";
import { v4 as uuidv4 } from "uuid";

export function addJob(
  this: IScheduler,
  { template, repeat, data }: { template: string; repeat?: number; data?: any }
) {
  const jobId = uuidv4();
  this._jobs.push({
    id: jobId,
    template: template,
    data: data,
    repeat: repeat,
    lastRunAt: null,
    lockedAt: null,
  });
}
