import { IJob } from "../job/job.js";
import { IStore } from "../store/store.js";
import { Logger } from "../utils/logger.js";

export interface IScheduler {
  processEvery: number;
  intervalId: NodeJS.Timeout | null;
  store: IStore;
  logger: Logger;
  start: () => boolean;
  stop: () => boolean;
  processJobs(): Promise<void>;
  processNextJob: (
    job: IJob,
    jobFn: (data?: any) => void | Promise<void>
  ) => Promise<void>;

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
  }) => Promise<boolean>;

  pauseJob(id: string | number): Promise<boolean>;

  resumeJob(id: string | number): Promise<boolean>;

  getJob(id: string | number): Promise<IJob | null>;

  getJobs(): Promise<IJob[]>;

  removeJob(id: string | number): Promise<boolean>;

  updateJob(id: string, updates: Partial<IJob>): Promise<boolean>;

  flushJobs(): Promise<boolean>;
  addTemplate(
    name: string,
    template: (data?: any) => void | Promise<void>
  ): Promise<boolean>;
}
