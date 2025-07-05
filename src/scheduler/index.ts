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
import { flushJobs as flushJobsFn } from "./flush-jobs.js";
import { pauseJob as pauseJobFn } from "./pause-job.js";
import { resumeJob as resumeJobFn } from "./resume-job.js";
import { InMemoryStore } from "../store/inMemory/inMemoryStore.js";
import { MongoStore } from "../store/mongo/mongoStore.js";

type SchedulerOptions = {
  storeType: "inMemory" | "mongo" | "redis";
  logLevel?: "info" | "debug" | "warn" | "error";
  dev?: boolean;
  processEvery?: number;
};

class Scheduler implements IScheduler {
  public processEvery: number;
  public intervalId: NodeJS.Timeout | null;
  public store: IStore;
  public logger: Logger;

  constructor(options: SchedulerOptions) {
    const {
      storeType = "inMemory",
      logLevel = "info",
      dev = false,
      processEvery = 1000,
    } = options;

    this.processEvery = processEvery;
    this.intervalId = null;
    this.logger = new Logger(logLevel, dev);
    this.store =
      storeType === "inMemory"
        ? new InMemoryStore()
        : storeType === "mongo"
        ? new MongoStore(
            { uri: "mongodb://localhost:27017/uptime_db" },
            this.logger
          )
        : new InMemoryStore(); // TODO switch
  }

  get start(): () => Promise<boolean> {
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

  get pauseJob(): (id: string | number) => Promise<boolean> {
    return pauseJobFn;
  }

  get resumeJob(): (id: string | number) => Promise<boolean> {
    return resumeJobFn;
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

  get flushJobs(): () => Promise<boolean> {
    return flushJobsFn;
  }

  get addTemplate(): (
    name: string,
    template: (data?: any) => void | Promise<void>
  ) => Promise<boolean> {
    return addTemplateFn;
  }
}

export default Scheduler;
