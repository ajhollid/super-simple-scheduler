import { IJob } from "../job/job.js";
import { start as startFunction } from "./start.js";
import { stop as stopFunction } from "./stop.js";
import { processJobs as processJobsFunction } from "./process-jobs.js";
import { processNextJob as processNextJobFunction } from "./process-next-job.js";
import { addTemplate as addTemplateFunction } from "./add-template.js";
import { addJob as addJobFunction } from "./add-job.js";
import { pauseJob as pauseJobFunction } from "./pause-job.js";
import { resumeJob as resumeJobFunction } from "./resume-job.js";
import { removeJob as removeJobFunction } from "./remove-job.js";
import { getJobs as getJobsFunction } from "./get-jobs.js";
import { flushJobs as flushJobsFunction } from "./flush-jobs.js";
import { updateJob as updateJobFunction } from "./update-job.js";
import humanInterval from "human-interval";
import { Logger } from "../utils/logger.js";

export interface IScheduler {
  processEvery: number;
  _intervalId: NodeJS.Timeout | null;
  _jobs: Array<any>;
  _jobTemplates: Map<string, (data?: any) => void | Promise<void>>;
  _logger: Logger;
  start: () => boolean;
  stop: () => boolean;
  _processJobs: () => void;
  _processNextJob: (
    now: number,
    job: IJob,
    jobFn: (data?: any) => void | Promise<void>
  ) => Promise<void>;
  addTemplate: (
    name: string,
    template: (data?: any) => void | Promise<void>
  ) => boolean;
  addJob: ({
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
  }) => boolean;
  pauseJob: (id: string | number) => boolean;
  resumeJob: (id: string | number) => boolean;
  removeJob: (id: string | number) => boolean;
  getJobs: () => Array<IJob>;
  flushJobs: () => boolean;
  updateJob: (id: string | number, repeat: number) => boolean;
}

class Scheduler implements IScheduler {
  public processEvery: number;
  public _intervalId: NodeJS.Timeout | null;
  public _jobs: Array<any>;
  public _jobTemplates: Map<string, (data?: any) => void | Promise<void>>;
  public _logger: Logger;

  constructor({
    logLevel = "info",
    dev = false,
  }: {
    logLevel?: string;
    dev?: boolean;
  } = {}) {
    this.processEvery = humanInterval("1 seconds") ?? 10000;
    this._intervalId = null;
    this._jobs = [];
    this._jobTemplates = new Map();
    this._logger = new Logger(logLevel, dev);
  }

  get start(): () => boolean {
    return startFunction;
  }

  get stop(): () => boolean {
    return stopFunction;
  }

  get _processJobs(): () => void {
    return processJobsFunction;
  }

  get _processNextJob(): (
    now: number,
    job: IJob,
    jobFn: (data?: any) => void | Promise<void>
  ) => Promise<void> {
    return processNextJobFunction;
  }

  get addTemplate(): (
    name: string,
    template: (data?: any) => void | Promise<void>
  ) => boolean {
    return addTemplateFunction;
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
  }) => boolean {
    return addJobFunction;
  }

  get pauseJob(): (id: string | number) => boolean {
    return pauseJobFunction;
  }

  get resumeJob(): (id: string | number) => boolean {
    return resumeJobFunction;
  }

  get removeJob(): (id: string | number) => boolean {
    return removeJobFunction;
  }

  get getJobs(): () => Array<IJob> {
    return getJobsFunction;
  }

  get flushJobs(): () => boolean {
    return flushJobsFunction;
  }

  get updateJob(): (id: string | number, repeat: number) => boolean {
    return updateJobFunction;
  }
}

export default Scheduler;
