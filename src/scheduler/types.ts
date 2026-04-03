import { EventEmitter } from "events";
import { IJob } from "../job/types.js";
import { IStore } from "../store/types.js";

export interface IScheduler extends EventEmitter {
  emit<K extends keyof SchedulerEvents>(
    event: K,
    ...args: Parameters<SchedulerEvents[K]>
  ): boolean;

  on<K extends keyof SchedulerEvents>(
    event: K,
    listener: SchedulerEvents[K],
  ): this;

  once<K extends keyof SchedulerEvents>(
    event: K,
    listener: SchedulerEvents[K],
  ): this;

  off<K extends keyof SchedulerEvents>(
    event: K,
    listener: SchedulerEvents[K],
  ): this;

  removeListener<K extends keyof SchedulerEvents>(
    event: K,
    listener: SchedulerEvents[K],
  ): this;

  processEvery: number;
  intervalId: NodeJS.Timeout | null;
  running: Set<Promise<void>>;
  concurrency: number;
  store: IStore;
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
    template: (data?: any) => void | Promise<void>,
  ): Promise<boolean>;

  getTemplates(): Promise<Array<(data?: any) => void | Promise<void>>>;

  removeTemplate(name: string): Promise<boolean>;
}

export type SchedulerOptions = {
  concurrency?: number;
  processEvery?: number;
};

export interface SchedulerEvents {
  // Scheduler lifecycle
  "scheduler:start": () => void;
  "scheduler:stop": () => void;
  "scheduler:drain": (count: number) => void;
  "scheduler:error": (error: Error) => void;

  // Job lifecycle
  "job:start": (job: IJob) => void;
  "job:attempt": (job: IJob, attempt: number) => void;
  "job:complete": (job: IJob) => void;
  "job:fail": (job: IJob, error: unknown, attempt: number) => void;
  "job:exhausted": (job: IJob, error: unknown) => void;
  "job:abort": (job: IJob, reason: string) => void;
}
