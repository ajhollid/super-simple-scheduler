import { IScheduler, SchedulerOptions } from "./scheduler.js";
import { IStore } from "../store/store.js";
import { IJob } from "../job/job.js";
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
import { MongoStore } from "../store/mongo/mongoStore.js";
import { RedisStore } from "../store/redis/redisStore.js";

export function createScheduler<T extends SchedulerOptions>(
  options: T
): Scheduler {
  return new Scheduler(options);
}

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
      dbUri = "",
    } = options;

    this.processEvery = processEvery;
    this.intervalId = null;
    this.logger = new Logger(logLevel, dev);

    switch (storeType) {
      case "inMemory":
        this.store = new InMemoryStore();
        break;
      case "mongo":
        this.store = new MongoStore({ uri: dbUri }, this.logger);
        break;
      case "redis":
        this.store = new RedisStore({ uri: dbUri }, this.logger);
        break;
      default:
        this.store = new InMemoryStore();
        break;
    }
  }

  get start(): () => Promise<boolean> {
    return startFn;
  }

  get stop(): () => Promise<boolean> {
    return stopFn;
  }

  get processJobs(): () => Promise<void> {
    return processJobsFn;
  }

  get addJob(): ({
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
