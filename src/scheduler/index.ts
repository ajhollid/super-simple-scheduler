import { start as startFunction } from "./start.js";
import { stop as stopFunction } from "./stop.js";
import { processJobs as processJobsFunction } from "./process-jobs.js";
import { addTemplate as addTemplateFunction } from "./add-template.js";
import { addJob as addJobFunction } from "./add-job.js";
import humanInterval from "human-interval";

export interface IScheduler {
  processEvery: number;
  _intervalId: NodeJS.Timeout | null;
  _jobs: Array<any>;
  _jobTemplates: Map<string, (data?: any) => void | Promise<void>>;
  start: () => boolean;
  stop: () => boolean;
  addTemplate: (
    name: string,
    template: (data?: any) => void | Promise<void>
  ) => void;
  addJob: ({
    template,
    repeat,
    data,
  }: {
    template: string;
    repeat?: number;
    data?: any;
  }) => void;
  processJobs: () => void;
}

class Scheduler implements IScheduler {
  public processEvery: number;
  public _intervalId: NodeJS.Timeout | null;
  public _jobs: Array<any>;
  public _jobTemplates: Map<string, (data?: any) => void | Promise<void>>;

  constructor() {
    this.processEvery = humanInterval("1 seconds") ?? 10000;
    this._intervalId = null;
    this._jobs = [];
    this._jobTemplates = new Map();
  }

  get start(): () => boolean {
    return startFunction;
  }

  get stop(): () => boolean {
    return stopFunction;
  }

  get processJobs(): () => void {
    return processJobsFunction;
  }

  get addTemplate(): (
    name: string,
    template: (data?: any) => void | Promise<void>
  ) => void {
    return addTemplateFunction;
  }

  get addJob(): ({
    template,
    repeat,
    data,
  }: {
    template: string;
    repeat?: number;
    data?: any;
  }) => void {
    return addJobFunction;
  }
}

export default Scheduler;
