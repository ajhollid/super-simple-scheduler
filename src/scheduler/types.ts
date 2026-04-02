import { EventEmitter } from "events";
import { IJob } from "../job/types.js";
import { IStore } from "../store/types.js";
import { Logger } from "../utils/logger.js";

export interface IScheduler extends EventEmitter {
  processEvery: number;
  intervalId: NodeJS.Timeout | null;
  store: IStore;
  logger: Logger;
  start: () => Promise<boolean>;
  stop: () => Promise<boolean>;
  processJobs(): Promise<void>;

  addJob: ({
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
    data?: unknown;
    active?: boolean;
  }) => Promise<boolean>;

  pauseJob(id: string | number): Promise<boolean>;

  resumeJob(id: string | number): Promise<boolean>;

  getJob(id: string | number): Promise<IJob | null>;

  getJobs(): Promise<IJob[]>;

  removeJob(id: string | number): Promise<boolean>;

  updateJob(id: string | number, updates: Partial<IJob>): Promise<boolean>;

  flushJobs(): Promise<boolean>;

  addTemplate(
    name: string,
    template: (data?: unknown) => void | Promise<void>,
  ): Promise<boolean>;

  getTemplates(): Promise<Array<(data?: unknown) => void | Promise<void>>>;

  removeTemplate(name: string): Promise<boolean>;
}

export type SchedulerOptions = {
  logLevel?: "none" | "info" | "debug" | "warn" | "error";
  dev?: boolean;
  processEvery?: number;
};
