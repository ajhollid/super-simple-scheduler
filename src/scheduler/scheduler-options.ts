export type SchedulerOptions = {
  storeType: "inMemory" | "mongo" | "redis";
  logLevel?: "none" | "info" | "debug" | "warn" | "error";
  dev?: boolean;
  processEvery?: number;
  dbUri?: string;
};
