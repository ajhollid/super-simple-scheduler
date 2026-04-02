import { IJob } from "../job/types.js";

export interface IStore {
  init(maxWaitTime?: number): Promise<boolean>;
  lockJob(id: string | number): Promise<boolean>;
  unlockJob(id: string | number): Promise<boolean>;
  addJob(job: IJob): Promise<boolean>;
  removeJob(id: string | number): Promise<boolean>;
  updateJob(id: string | number, updates: Partial<IJob>): Promise<boolean>;
  getJob(id: string | number): Promise<IJob | null>;
  getJobs(): Promise<IJob[]>;
  flushJobs(): Promise<boolean>;
  addTemplate(
    name: string,
    template: (data?: unknown) => void | Promise<void>,
  ): Promise<boolean>;

  getTemplate(
    name: string,
  ): Promise<((data?: unknown) => void | Promise<void>) | null>;

  getTemplates(): Promise<Array<(data?: unknown) => void | Promise<void>>>;

  removeTemplate(name: string): Promise<boolean>;

  close(): Promise<boolean>;
}
