import { IStore } from "../types..js";
import { IJob } from "../../job/types.js";

export class InMemoryStore implements IStore {
  private jobs = new Map<string | number, IJob>();
  private templates = new Map<string, (data?: any) => void | Promise<void>>();

  async init(): Promise<boolean> {
    return true;
  }

  async lockJob(id: string | number): Promise<boolean> {
    const job = this.jobs.get(id);
    if (!job || job.lockedAt) {
      return false;
    }

    this.jobs.set(id, structuredClone({ ...job, lockedAt: Date.now() }));
    return true;
  }

  async unlockJob(id: string | number): Promise<boolean> {
    const job = this.jobs.get(id);
    if (!job || !job.lockedAt) {
      return false;
    }
    this.jobs.set(id, structuredClone({ ...job, lockedAt: null }));
    return true;
  }

  async addJob(job: IJob): Promise<boolean> {
    this.jobs.set(job.id, structuredClone(job));
    return true;
  }

  async getJob(id: string | number): Promise<IJob | null> {
    const job = this.jobs.get(id);
    return job ? structuredClone(job) : null;
  }

  async removeJob(id: string | number): Promise<boolean> {
    return this.jobs.delete(id);
  }

  async updateJob(
    id: string | number,
    updates: Partial<IJob>,
  ): Promise<boolean> {
    const existing = this.jobs.get(id);
    if (!existing) {
      return false;
    }

    const updatedJob: IJob = structuredClone({ ...existing, ...updates });
    this.jobs.set(id, updatedJob);
    return true;
  }

  async getJobs(): Promise<IJob[]> {
    return Array.from(this.jobs.values()).map((job) => structuredClone(job));
  }

  async addTemplate(
    name: string,
    template: (data?: any) => void | Promise<void>,
  ): Promise<boolean> {
    const result = this.templates.set(name, template);
    return result.has(name);
  }

  async getTemplate(
    name: string,
  ): Promise<((data?: any) => void | Promise<void>) | null> {
    return this.templates.get(name) ?? null;
  }

  async flushJobs(): Promise<boolean> {
    this.jobs.clear();
    return true;
  }

  async close(): Promise<boolean> {
    this.jobs.clear();
    this.templates.clear();
    return true;
  }
}
