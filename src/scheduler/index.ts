import { IScheduler } from "./scheduler.js";
import { IStore } from "../store/store.js";
import { IJob } from "../job/job.js";
import { Logger } from "../utils/logger.js";
import { start as startFn } from "./start.js";
import { stop as stopFn } from "./stop.js";
import { processJobs as processJobsFn } from "./process-jobs.js";
import { processNextJob as processNextJobFn } from "./process-next-job.js";
import { addJob as addJobFn } from "./add-job.js";
import { getJob as getJobFn } from "./get-job.js";
import { getJobs as getJobsFn } from "./get-jobs.js";
import { removeJob as removeJobFn } from "./remove-job.js";
import { updateJob as updateJobFn } from "./update-job.js";
import { addTemplate as addTemplateFn } from "./add-template.js";

export class Scheduler implements IScheduler {
  public processEvery: number;
  public intervalId: NodeJS.Timeout | null;
  public store: IStore;
  public logger: Logger;

  constructor(store: IStore, logLevel = "info", dev = false) {
    this.processEvery = 1000;
    this.intervalId = null;
    this.store = store;
    this.logger = new Logger(logLevel, dev);
  }

  get start(): () => boolean {
    return startFn;
  }

  get stop(): () => boolean {
    return stopFn;
  }

  get processJobs(): () => Promise<void> {
    return processJobsFn;
  }

  get processNextJob(): (
    job: IJob,
    jobFn: (data?: any) => void | Promise<void>
  ) => Promise<void> {
    return processNextJobFn;
  }

  get addJob(): ({
    id,
    template,
    repeat,
    data,
    active,
  }: {
    id?: string | number;
    template: string;
    repeat?: number;
    data?: any;
    active?: boolean;
  }) => Promise<boolean> {
    return addJobFn;
  }

  get getJob(): (id: string | number) => Promise<IJob | null> {
    return getJobFn;
  }

  get getJobs(): () => Promise<IJob[]> {
    return getJobsFn;
  }

  get removeJob(): (id: string | number) => Promise<boolean> {
    return removeJobFn;
  }

  get updateJob(): (
    id: string | number,
    updates: Partial<IJob>
  ) => Promise<boolean> {
    return updateJobFn;
  }

  get addTemplate(): (
    name: string,
    template: (data?: any) => void | Promise<void>
  ) => Promise<boolean> {
    return addTemplateFn;
  }
}
