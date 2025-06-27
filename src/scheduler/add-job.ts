import { IScheduler } from "./index.js";
import { v4 as uuidv4 } from "uuid";

export function addJob(
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
  if (id && this._jobs.find((job) => job.id === id)) {
    this._logger.warn(`Job with id ${id} already exists`);
    return false;
  }

  this._jobs.push({
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
