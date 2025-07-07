import { IStore } from "../store.js";
import { IJob } from "../../job/job.js";

export class InMemoryStore implements IStore {
  private jobs = new Map<string | number, IJob>();
  private templates = new Map<string, (data?: any) => void | Promise<void>>();

  async init(): Promise<boolean> {
    return true;
  }

  async addJob(job: IJob): Promise<boolean> {
    this.jobs.set(job.id, job);
    return true;
  }

  async getJob(id: string | number): Promise<IJob | null> {
    return this.jobs.get(id) || null;
  }

  async removeJob(id: string | number): Promise<boolean> {
    return this.jobs.delete(id);
  }

  async updateJob(id: string, updates: Partial<IJob>): Promise<boolean> {
    if (!this.jobs.has(id)) {
      return false;
    }

    const updatedJob = { ...this.jobs.get(id), ...updates } as IJob;
    this.jobs.set(id, updatedJob);
    return true;
  }

  async getJobs(): Promise<IJob[]> {
    return Array.from(this.jobs.values());
  }

  async addTemplate(
    name: string,
    template: (data?: any) => void | Promise<void>
  ): Promise<boolean> {
    const result = this.templates.set(name, template);
    return result.has(name);
  }

  async getTemplate(
    name: string
  ): Promise<((data?: any) => void | Promise<void>) | null> {
    return this.templates.get(name) ?? null;
  }

  async flushJobs(): Promise<boolean> {
    this.jobs.clear();
    return true;
  }
}
