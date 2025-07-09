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

  async init(): Promise<boolean> {
    try {
      this.redis = new Redis(this.uri);
      this.redis.on("error", (error) => {
        this.logger.error("Redis error", { error });
      });

      this.redis.on("disconnect", () => {
        this.logger.info("Redis disconnected");
        this.isConnected = false;
      });

      await new Promise<void>((resolve, reject) => {
        const onConnect = () => {
          this.logger.info("Redis connected");
          this.isConnected = true;
          cleanup();
          resolve();
        };

        const onError = (error: Error) => {
          this.logger.error("Redis error during connection", { error });
          cleanup();
          reject(error);
        };

        const cleanup = () => {
          this.redis?.off("connect", onConnect);
          this.redis?.off("error", onError);
        };

        this.redis?.once("connect", onConnect);
        this.redis?.once("error", onError);
      });

      return true;
    } catch (error) {
      this.logger.error("Failed to connect to Redis", { error });
      return false;
    }
  }

  async addJob(job: IJob): Promise<boolean> {
    if (!this.redis || !this.isConnected) {
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
      return job ? JSON.parse(job) : null;
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
      return deleted > 0;
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
        return false;
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
        return [];
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
        return true;
      }
      await this.redis.del(...jobKeys);
      await this.redis.del(JOB_SET_KEY);
      return true;
    } catch (error) {
      return true;
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
