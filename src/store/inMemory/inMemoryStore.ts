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

  async close(): Promise<boolean> {
    this.jobs.clear();
    this.templates.clear();
    return true;
  }

  async incrementJobCounters(
    id: string | number,
    increments: {
      runCount?: number;
      failCount?: number;
    }
  ): Promise<boolean> {
    const job = this.jobs.get(id);
    if (!job) return false;

    job.runCount = (job.runCount ?? 0) + (increments.runCount ?? 0);
    job.failCount = (job.failCount ?? 0) + (increments.failCount ?? 0);

    return true;
  }

  async setJobExecutionFields(
    id: string | number,
    fields: {
      lastRunAt?: number;
      lastFinishedAt?: number;
      lockedAt?: number | null;
      lastFailedAt?: number;
      lastFailReason?: string;
    }
  ): Promise<boolean> {
    const job = this.jobs.get(id);
    if (!job) return false;

    if (fields.lastRunAt !== undefined) job.lastRunAt = fields.lastRunAt;
    if (fields.lastFinishedAt !== undefined)
      job.lastFinishedAt = fields.lastFinishedAt;
    if (fields.lockedAt !== undefined) job.lockedAt = fields.lockedAt;
    if (fields.lastFailedAt !== undefined)
      job.lastFailedAt = fields.lastFailedAt;
    if (fields.lastFailReason !== undefined)
      job.lastFailReason = fields.lastFailReason;

    return true;
  }
}
