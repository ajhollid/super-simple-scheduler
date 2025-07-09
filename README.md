![](https://img.shields.io/npm/v/super-simple-scheduler.svg?style=flat)
![](https://img.shields.io/github/license/ajhollid/super-simple-scheduler.svg?style=flat)
![](https://img.shields.io/github/repo-size/ajhollid/super-simple-scheduler.svg?style=flat)
![](https://img.shields.io/npm/d18m/super-simple-scheduler)
![](https://img.shields.io/github/last-commit/ajhollid/super-simple-scheduler.svg?style=flat)
![](https://img.shields.io/github/languages/top/ajhollid/super-simple-scheduler.svg?style=flat)

# Super Simple Scheduler

A lightweight and easy-to-use job scheduler for Node.js with support for repeated jobs, retries, and multiple storage backends.

**GitHub:** [https://github.com/ajhollid/super-simple-scheduler](https://github.com/ajhollid/super-simple-scheduler)

## Features

- Schedule jobs with optional repeat intervals
- Automatic retry on failure with configurable max retries
- Simple API to add job templates and jobs
- Written in TypeScript with type definitions
- Job pausing, resuming, and removal
- Comprehensive logging with Winston
- Multiple storage backends (In-Memory, MongoDB)
- Async/await API throughout
- ES Module support

## Installation

```bash
npm install super-simple-scheduler
```

## Quick Start

```typescript
import Scheduler from "super-simple-scheduler";

// Create a scheduler instance
const scheduler = new Scheduler({
  storeType: "inMemory", // or "mongo"
  logLevel: "info",
  dev: false,
  processEvery: 1000, // Process jobs every 1 second
});

// Add a job template
await scheduler.addTemplate("sendEmail", async (data) => {
  // Your job logic here
  console.log("Sending email to:", data.recipient);
});

// Add a job
await scheduler.addJob({
  template: "sendEmail",
  repeat: 60000, // Run every minute
  data: { recipient: "user@example.com" },
});

// Start the scheduler
await scheduler.start();
```

## API Reference

### Scheduler Class

The main scheduler class that manages job execution.

#### Constructor

```typescript
new Scheduler(options: {
  storeType: "inMemory" | "mongo" | "redis";
  logLevel?: "none" | "info" | "debug" | "warn" | "error";
  dev?: boolean;
  processEvery?: number;
  dbUri?: string;
})
```

**Parameters:**

- `storeType`: Storage backend to use ('inMemory', 'mongo', 'redis'). Default: 'inMemory'
- `logLevel` (optional): Logging level ('none', 'debug', 'info', 'warn', 'error'). Default: 'info'
- `dev` (optional): Development mode flag. Default: false
- `processEvery` (optional): Interval in milliseconds to process jobs. Default: 1000
- `dbUri` (optional): Database connection URI for MongoDB. Required when `storeType` is 'mongo'

**Example:**

```typescript
const scheduler = new Scheduler({
  storeType: "mongo",
  dbUri: "mongodb://localhost:27017/myapp",
  logLevel: "debug",
  dev: true,
  processEvery: 5000, // Process every 5 seconds
});
```

#### Methods

##### `start(): Promise<boolean>`

Starts the scheduler and begins processing jobs at the configured interval.

**Returns:** `Promise<boolean>` - `true` if started successfully

**Example:**

```typescript
const success = await scheduler.start();
if (success) {
  console.log("Scheduler started");
}
```

##### `stop(): Promise<boolean>`

Stops the scheduler and clears the processing interval.

**Returns:** `Promise<boolean>` - `true` if stopped successfully

**Example:**

```typescript
const success = scheduler.stop();
if (success) {
  console.log("Scheduler stopped");
}
```

##### `addTemplate(name: string, template: Function): Promise<boolean>`

Registers a job template function that can be referenced by jobs.

**Parameters:**

- `name`: Unique identifier for the template
- `template`: Function to execute when the job runs. Can be async or sync.

**Returns:** `Promise<boolean>` - `true` if template was added successfully

**Example:**

```typescript
await scheduler.addTemplate("processData", async (data) => {
  // Process the data
  await processUserData(data);
});

await scheduler.addTemplate("sendNotification", (data) => {
  // Send notification
  sendPushNotification(data.userId, data.message);
});
```

##### `addJob(options): Promise<boolean>`

Adds a new job to the scheduler.

**Parameters:**

- `options.id` (optional): Unique identifier for the job. If not provided, a UUID will be generated
- `options.template`: Name of the template to use for this job
- `options.repeat` (optional): Interval in milliseconds between job executions. If null, job runs once
- `options.data` (optional): Data to pass to the job template function
- `options.active` (optional): Whether the job should be active. Default: true
- `options.startAt` (optional): Timestamp when the job should start running. If not provided, job runs immediately

**Returns:** `Promise<boolean>` - `true` if job was added or updated successfully

**Note:** If a job with the same ID already exists, it will be updated with the new properties instead of failing.

**Example:**

```typescript
// One-time job
await scheduler.addJob({
  template: "sendWelcomeEmail",
  data: { userId: "123", email: "user@example.com" },
});

// Repeating job
await scheduler.addJob({
  id: "daily-cleanup",
  template: "cleanupDatabase",
  repeat: 24 * 60 * 60 * 1000, // 24 hours
  data: { tables: ["logs", "temp_data"] },
});

// Job with delayed start
await scheduler.addJob({
  template: "sendReminder",
  startAt: Date.now() + 60000, // Start in 1 minute
  repeat: 60 * 60 * 1000, // Then every hour
  data: { message: "Don't forget!" },
});

// Inactive job (will be paused)
await scheduler.addJob({
  template: "maintenance",
  repeat: 60 * 60 * 1000, // 1 hour
  active: false,
});
```

##### `pauseJob(id: string | number): Promise<boolean>`

Pauses a job, preventing it from executing.

**Parameters:**

- `id`: Job identifier

**Returns:** `Promise<boolean>` - `true` if job was paused successfully, `false` if job not found

**Example:**

```typescript
const success = await scheduler.pauseJob("daily-cleanup");
if (success) {
  console.log("Job paused");
}
```

##### `resumeJob(id: string | number): Promise<boolean>`

Resumes a paused job, allowing it to execute again.

**Parameters:**

- `id`: Job identifier

**Returns:** `Promise<boolean>` - `true` if job was resumed successfully, `false` if job not found

**Example:**

```typescript
const success = await scheduler.resumeJob("daily-cleanup");
if (success) {
  console.log("Job resumed");
}
```

##### `removeJob(id: string | number): Promise<boolean>`

Removes a job from the scheduler.

**Parameters:**

- `id`: Job identifier

**Returns:** `Promise<boolean>` - `true` if job was removed successfully, `false` if job not found

**Example:**

```typescript
const success = await scheduler.removeJob("daily-cleanup");
if (success) {
  console.log("Job removed");
}
```

##### `getJob(id: string | number): Promise<IJob | null>`

Returns a specific job by ID.

**Parameters:**

- `id`: Job identifier

**Returns:** `Promise<IJob | null>` - Job object or null if not found

**Example:**

```typescript
const job = await scheduler.getJob("daily-cleanup");
if (job) {
  console.log(
    `Job ${job.id}: ${job.template} (${job.active ? "active" : "paused"})`
  );
}
```

##### `getJobs(): Promise<IJob[]>`

Returns an array of all jobs in the scheduler.

**Returns:** `Promise<IJob[]>` - Array of job objects

**Example:**

```typescript
const jobs = await scheduler.getJobs();
console.log(`Scheduler has ${jobs.length} jobs`);
jobs.forEach((job) => {
  console.log(
    `Job ${job.id}: ${job.template} (${job.active ? "active" : "paused"})`
  );
});
```

##### `flushJobs(): Promise<boolean>`

Removes all jobs from the scheduler.

**Returns:** `Promise<boolean>` - `true` if jobs were flushed successfully

**Example:**

```typescript
const success = await scheduler.flushJobs();
if (success) {
  console.log("All jobs removed");
}
```

##### `updateJob(id: string | number, updates: Partial<IJob>): Promise<boolean>`

Updates a job with new properties.

**Parameters:**

- `id`: Job identifier
- `updates`: Partial job object with properties to update

**Returns:** `Promise<boolean>` - `true` if job was updated successfully, `false` if job not found

**Example:**

```typescript
const success = await scheduler.updateJob("daily-cleanup", {
  repeat: 12 * 60 * 60 * 1000, // 12 hours
  data: { newData: "updated" },
});
if (success) {
  console.log("Job updated");
}
```

### Job Interface

Jobs have the following structure:

```typescript
interface IJob {
  id: string | number; // Unique identifier
  template: string; // Template name
  data?: any; // Data passed to template function
  repeat?: number; // Interval in milliseconds (null for one-time)
  maxRetries?: number; // Maximum retry attempts (default: 3)
  active: boolean; // Whether job is active
  startAt?: number | null; // Timestamp when job should start running
  lastRunAt?: number | null; // Timestamp of last execution
  lastFinishedAt?: number | null; // Timestamp of last completion
  lockedAt?: number | null; // Timestamp when job is being processed
  lastFailedAt?: number | null; // Timestamp of last failure
  lastFailReason?: string | null; // Reason for last failure
  failCount?: number; // Number of failures
  runCount?: number; // Number of successful runs
}
```

## Storage Backends

The scheduler supports multiple storage backends:

### In-Memory Store (Default)

```typescript
const scheduler = new Scheduler({
  storeType: "inMemory",
});
```

**Pros:**

- Fast and lightweight
- No external dependencies
- Perfect for development and testing

**Cons:**

- Jobs are lost on process restart
- Not suitable for production with multiple instances

### MongoDB Store

```typescript
const scheduler = new Scheduler({
  storeType: "mongo",
  logLevel: "info",
});
```

**Pros:**

- Persistent storage
- Survives process restarts
- Suitable for production
- Supports multiple scheduler instances

**Cons:**

- Requires MongoDB instance
- Additional dependency (Mongoose)

**Note:** You must provide a `dbUri` when using the MongoDB store. The connection URI should point to your MongoDB instance and include the database name.

### Redis Store (Planned)

Redis support is planned for future releases.

## Job Execution Logic

The scheduler uses a sophisticated job execution system that determines when jobs should run based on multiple factors:

### Job Execution Conditions

A job will run when **all** of the following conditions are met:

1. **Active Status**: Job is active (`active: true`)
2. **Start Time**: If `startAt` is set, the current time must be >= `startAt`
3. **Execution History**:
   - If job has never run before (`lastRunAt: null`), it runs immediately
   - If job is one-time (`repeat: null`) and has already run, it doesn't run again
   - If job is repeating, enough time must have passed since the last run

### Timing Examples

```typescript
// Immediate execution (default)
await scheduler.addJob({
  template: "sendEmail",
  data: { to: "user@example.com" },
});
// Runs on next processing cycle (within 1 second)

// Delayed start
await scheduler.addJob({
  template: "sendEmail",
  startAt: Date.now() + 60000, // Start in 1 minute
  data: { to: "user@example.com" },
});
// Runs 1 minute from now

// One-time job
await scheduler.addJob({
  template: "sendEmail",
  // No repeat = one-time job
  data: { to: "user@example.com" },
});
// Runs once, then never again

// Repeating job
await scheduler.addJob({
  template: "sendEmail",
  repeat: 60000, // Every minute
  data: { to: "user@example.com" },
});
// Runs every minute

// Repeating job with delayed start
await scheduler.addJob({
  template: "sendEmail",
  startAt: Date.now() + 60000, // Start in 1 minute
  repeat: 60000, // Then every minute
  data: { to: "user@example.com" },
});
// Starts in 1 minute, then runs every minute
```

## Configuration

### Processing Interval

The scheduler processes jobs at regular intervals. The default interval is 1 second, but you can modify it:

```typescript
const scheduler = new Scheduler({
  processEvery: 5000, // Process every 5 seconds
});
```

### Retry Behavior

Jobs automatically retry on failure with a configurable maximum number of attempts:

```typescript
await scheduler.addJob({
  template: "unreliableTask",
  repeat: 60000,
  maxRetries: 5, // Will retry up to 5 times on failure
  data: { task: "important" },
});
```

## Error Handling

The scheduler includes comprehensive error handling:

- Failed jobs are automatically retried up to the configured `maxRetries`
- All errors are logged with detailed information using Winston
- Jobs that fail all retry attempts are logged as errors
- One-time jobs (`repeat: null`) are removed after execution regardless of success/failure

## Logging

The scheduler uses Winston for logging with configurable levels:

```typescript
const scheduler = new Scheduler({
  logLevel: "debug", // 'none', 'debug', 'info', 'warn', 'error'
  dev: true, // Enhanced logging for development
});
```

## Examples

### Email Scheduler with MongoDB

```typescript
import Scheduler from "super-simple-scheduler";

const scheduler = new Scheduler({
  storeType: "mongo",
  dbUri: "mongodb://localhost:27017/email_scheduler",
  logLevel: "info",
});

// Email template
await scheduler.addTemplate("sendEmail", async (data) => {
  await sendEmail(data.to, data.subject, data.body);
});

// Daily digest
await scheduler.addJob({
  id: "daily-digest",
  template: "sendEmail",
  repeat: 24 * 60 * 60 * 1000,
  data: {
    to: "users@company.com",
    subject: "Daily Digest",
    body: "Here is your daily summary...",
  },
});

await scheduler.start();
```

### Data Processing Pipeline

```typescript
const scheduler = new Scheduler({
  storeType: "inMemory",
  logLevel: "debug",
});

// Data processing templates
await scheduler.addTemplate("fetchData", async (data) => {
  const rawData = await fetchFromAPI(data.endpoint);
  await saveToDatabase(rawData);
});

await scheduler.addTemplate("processData", async (data) => {
  const rawData = await getFromDatabase();
  const processed = await transformData(rawData);
  await saveProcessedData(processed);
});

// Schedule jobs
await scheduler.addJob({
  id: "fetch-hourly",
  template: "fetchData",
  repeat: 60 * 60 * 1000,
  data: { endpoint: "/api/data" },
});

await scheduler.addJob({
  id: "process-daily",
  template: "processData",
  repeat: 24 * 60 * 60 * 1000,
});

await scheduler.start();
```

### Job Management Example

```typescript
const scheduler = new Scheduler({ storeType: "inMemory" });

// Add a job
await scheduler.addJob({
  id: "test-job",
  template: "testTemplate",
  repeat: 5000,
  data: { message: "Hello World" },
});

// Add a job with delayed start
await scheduler.addJob({
  id: "delayed-job",
  template: "testTemplate",
  startAt: Date.now() + 10000, // Start in 10 seconds
  repeat: 5000,
  data: { message: "Delayed Hello World" },
});

// Update the same job (will update existing job instead of failing)
await scheduler.addJob({
  id: "test-job",
  template: "testTemplate",
  repeat: 10000, // Changed from 5000 to 10000
  data: { message: "Updated message" },
});

// Pause the job
await scheduler.pauseJob("test-job");

// Check job status
const job = await scheduler.getJob("test-job");
console.log(job?.active); // false

// Resume the job
await scheduler.resumeJob("test-job");

// Get all jobs
const allJobs = await scheduler.getJobs();
console.log(`Total jobs: ${allJobs.length}`);

// Update job
await scheduler.updateJob("test-job", {
  repeat: 10000, // Change to 10 seconds
  data: { message: "Updated message" },
});

// Remove job
await scheduler.removeJob("test-job");
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test-coverage
```

### Development Mode

```bash
npm run dev
```

## License

MIT
