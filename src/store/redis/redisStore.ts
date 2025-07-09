import { IStore } from "../store.js";
import { Logger } from "../../utils/logger.js";
import { IJob } from "../../job/job.js";
import { Redis } from "ioredis";

type RedisStoreOptions = {
  uri: string;
};

const JOB_KEY = "job";
const JOB_SET_KEY = "jobs";

export class RedisStore implements IStore {
  private uri: string;
  private logger: Logger;
  private redis: Redis | null;
  private isConnected: boolean = false;
  private templates = new Map<string, (data?: any) => void | Promise<void>>();

  constructor(options: RedisStoreOptions, logger: Logger) {
    this.uri = options.uri;
    this.logger = logger;
    this.redis = null;
  }

  async init(maxWaitTime: number = 2000): Promise<boolean> {
    try {
      this.redis = new Redis(this.uri);
      this.redis.on("error", (error) => {
        this.logger.error("Redis error", { error });
      });

      this.redis.on("disconnect", () => {
        this.logger.info("Redis disconnected");
        this.isConnected = false;
      });

      this.redis.on("connect", () => {
        this.logger.info("Redis connected");
        this.isConnected = true;
      });

      const checkInterval = 100;
      let waitedTime = 0;

      while (!this.isConnected && waitedTime < maxWaitTime) {
        await new Promise((resolve) => setTimeout(resolve, checkInterval));
        waitedTime += checkInterval;
      }

      if (!this.isConnected) {
        throw new Error("Failed to connect to Redis");
      }

      return true;
    } catch (error) {
      this.logger.error("Failed to connect to Redis", { error });
      return false;
    }
  }

  async addJob(job: IJob): Promise<boolean> {
    if (!this.redis || !this.isConnected) {
      this.logger.error("Redis not connected");
      return false;
    }

    try {
      const jobKey = `${JOB_KEY}:${job.id}`;
      await this.redis.set(jobKey, JSON.stringify(job));
      await this.redis.sadd(JOB_SET_KEY, jobKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getJob(id: string | number): Promise<IJob | null> {
    if (!this.redis || !this.isConnected) {
      return null;
    }
    try {
      const jobKey = `${JOB_KEY}:${id}`;
      const job = await this.redis.get(jobKey);
      if (!job) {
        throw new Error("Job not found");
      }
      return JSON.parse(job);
    } catch (error) {
      return null;
    }
  }

  async removeJob(id: string | number): Promise<boolean> {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      const jobKey = `${JOB_KEY}:${id}`;
      const deleted = await this.redis.del(jobKey);
      await this.redis.srem(JOB_SET_KEY, jobKey);
      if (deleted <= 0) {
        throw new Error("Job not found");
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  async updateJob(id: string, updates: Partial<IJob>): Promise<boolean> {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      const jobKey = `${JOB_KEY}:${id}`;
      const existingJobData = await this.redis.get(jobKey);
      if (!existingJobData) {
        throw new Error("Job not found");
      }
      const existingJob = JSON.parse(existingJobData) as IJob;
      const updatedJob = { ...existingJob, ...updates };
      await this.redis.set(jobKey, JSON.stringify(updatedJob));
      return true;
    } catch (error) {
      return false;
    }
  }

  async getJobs(): Promise<IJob[]> {
    if (!this.redis || !this.isConnected) {
      return [];
    }
    try {
      const jobKeys = await this.redis.smembers(JOB_SET_KEY);
      if (jobKeys.length === 0) {
        throw new Error("No jobs found");
      }

      const jobDataArray = await this.redis.mget(jobKeys);
      const jobs = jobDataArray
        .filter((data) => data !== null)
        .map((data) => JSON.parse(data!) as IJob);

      return jobs;
    } catch (error) {
      return [];
    }
  }

  async flushJobs(): Promise<boolean> {
    if (!this.redis || !this.isConnected) {
      return false;
    }
    try {
      const jobKeys = await this.redis.smembers(JOB_SET_KEY);
      if (jobKeys.length === 0) {
        throw new Error("No jobs to flush");
      }
      await this.redis.del(...jobKeys);
      await this.redis.del(JOB_SET_KEY);
      return true;
    } catch (error) {
      return false;
    }
  }

  async addTemplate(
    name: string,
    template: (data?: any) => void | Promise<void>
  ): Promise<boolean> {
    this.templates.set(name, template);
    return true;
  }

  async getTemplate(
    name: string
  ): Promise<((data?: any) => void | Promise<void>) | null> {
    return this.templates.get(name) ?? null;
  }
}
