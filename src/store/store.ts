import { IJob } from "../job/job.js";

export interface IStore {
  addJob(job: IJob): Promise<boolean>;
  getJob(id: string | number): Promise<IJob | null>;
  removeJob(id: string | number): Promise<boolean>;
  updateJob(id: string | number, updates: Partial<IJob>): Promise<boolean>;
  getJob(id: string | number): Promise<IJob | null>;
  getJobs(): Promise<IJob[]>;
  addTemplate(
    name: string,
    template: (data?: any) => void | Promise<void>
  ): Promise<boolean>;

  getTemplate(
    name: string
  ): Promise<((data?: any) => void | Promise<void>) | null>;
}
