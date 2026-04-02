import { IScheduler, type SchedulerOptions } from "./types.js";
import { IStore } from "../store/types..js";
import { IJob } from "../job/types.js";
import { Logger } from "../utils/logger.js";
import { start as startFn } from "./start.js";
import { stop as stopFn } from "./stop.js";
import { processJobs as processJobsFn } from "./process-jobs.js";
import { addJob as addJobFn } from "./add-job.js";
import { getJob as getJobFn } from "./get-job.js";
import { getJobs as getJobsFn } from "./get-jobs.js";
import { removeJob as removeJobFn } from "./remove-job.js";
import { updateJob as updateJobFn } from "./update-job.js";
import { addTemplate as addTemplateFn } from "./add-template.js";
import { flushJobs as flushJobsFn } from "./flush-jobs.js";
import { pauseJob as pauseJobFn } from "./pause-job.js";
import { resumeJob as resumeJobFn } from "./resume-job.js";
import { InMemoryStore } from "../store/inMemory/inMemoryStore.js";

export default class Scheduler implements IScheduler {
  public processEvery: number;
  public intervalId: NodeJS.Timeout | null;
  public store: IStore;
  public logger: Logger;

  constructor(options: SchedulerOptions) {
    const { logLevel = "info", dev = false, processEvery = 1000 } = options;

    this.processEvery = processEvery;
    this.intervalId = null;
    this.logger = new Logger(logLevel, dev);
    this.store = new InMemoryStore();
  }

  async start(): Promise<boolean> {
    return startFn.call(this);
  }
  async stop(): Promise<boolean> {
    return stopFn.call(this);
  }

  async processJobs(): Promise<void> {
    return processJobsFn.call(this);
  }

  async addJob({
    id,
    template,
    startAt,
    repeat,
    data,
    active,
  }: {
    id?: string | number;
    template: string;
    startAt?: number;
    repeat?: number;
    data?: any;
    active?: boolean;
  }): Promise<boolean> {
    return addJobFn.call(this, { id, template, startAt, repeat, data, active });
  }

  async pauseJob(id: string | number): Promise<boolean> {
    return pauseJobFn.call(this, id);
  }

  async resumeJob(id: string | number): Promise<boolean> {
    return resumeJobFn.call(this, id);
  }

  async getJob(id: string | number): Promise<IJob | null> {
    return getJobFn.call(this, id);
  }

  async getJobs(): Promise<IJob[]> {
    return getJobsFn.call(this);
  }

  async removeJob(id: string | number): Promise<boolean> {
    return removeJobFn.call(this, id);
  }

  async updateJob(
    id: string | number,
    updates: Partial<IJob>,
  ): Promise<boolean> {
    return updateJobFn.call(this, id, updates);
  }

  async flushJobs(): Promise<boolean> {
    return flushJobsFn.call(this);
  }

  async addTemplate(
    name: string,
    template: (data?: any) => void | Promise<void>,
  ): Promise<boolean> {
    return addTemplateFn.call(this, name, template);
  }
}
