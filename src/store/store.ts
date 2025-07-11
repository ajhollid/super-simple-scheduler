import { IJob } from "../job/job.js";

export interface IStore {
  init(maxWaitTime?: number): Promise<boolean>;
  addJob(job: IJob): Promise<boolean>;
  getJob(id: string | number): Promise<IJob | null>;
  removeJob(id: string | number): Promise<boolean>;
  updateJob(id: string | number, updates: Partial<IJob>): Promise<boolean>;
  getJob(id: string | number): Promise<IJob | null>;
  getJobs(): Promise<IJob[]>;
  flushJobs(): Promise<boolean>;
  addTemplate(
    name: string,
    template: (data?: any) => void | Promise<void>
  ): Promise<boolean>;

  getTemplate(
    name: string
  ): Promise<((data?: any) => void | Promise<void>) | null>;
  close(): Promise<boolean>;
}
