import { IJob } from "../../job/job.js";
import { IStore } from "../store.js";
import mongoose from "mongoose";
import { Logger } from "../../utils/logger.js";
import { JobModel } from "../../job/job.js";

type MongoStoreOptions = {
  uri: string;
};

export class MongoStore implements IStore {
  private uri: string;
  private logger: Logger;
  private templates = new Map<string, (data?: any) => void | Promise<void>>();
  private isConnected: boolean = false;

  constructor(options: MongoStoreOptions, logger: Logger) {
    this.uri = options.uri;
    this.logger = logger;
  }

  async init(): Promise<boolean> {
    try {
      if (mongoose.connection.readyState === 1) {
        this.isConnected = true;
        return true;
      }
      await mongoose.connect(this.uri);
      this.isConnected = true;
      this.logger.info("Connected to MongoDB");
      return true;
    } catch (error) {
      this.logger.error("Failed to connect to MongoDB", { error });
      return false;
    }
  }

  async addJob(job: IJob): Promise<boolean> {
    try {
      const newJob = new JobModel(job);
      await newJob.save();
      return true;
    } catch (error) {
      this.logger.error("Failed to add job", { error });
      return false;
    }
  }

  async getJob(id: string | number): Promise<IJob | null> {
    try {
      const job = await JobModel.findOne({ id });
      return job ? job.toObject() : null;
    } catch (error) {
      this.logger.error("Failed to get job", { error });
      return null;
    }
  }

  async removeJob(id: string | number): Promise<boolean> {
    try {
      const result = await JobModel.findOneAndDelete({ id });
      return result ? true : false;
    } catch (error) {
      this.logger.error("Failed to remove job", { error });
      return false;
    }
  }

  async updateJob(id: string, updates: Partial<IJob>): Promise<boolean> {
    try {
      await JobModel.findOneAndUpdate({ id }, updates);
      return true;
    } catch (error) {
      this.logger.error("Failed to update job", { error });
      return false;
    }
  }

  async getJobs(): Promise<IJob[]> {
    try {
      const jobs = await JobModel.find();
      return jobs.map((job) => job.toObject());
    } catch (error) {
      this.logger.error("Failed to get jobs", { error });
      return [];
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

  async flushJobs(): Promise<boolean> {
    try {
      await JobModel.deleteMany({});
      return true;
    } catch (error) {
      this.logger.error("Failed to flush jobs", { error });
      return false;
    }
  }

  async close(): Promise<boolean> {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
      this.isConnected = false;
      this.templates.clear();
      return true;
    } catch (error) {
      this.logger.error("Failed to close MongoDB connection", { error });
      return false;
    }
  }
}
