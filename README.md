# Super Simple Scheduler

A lightweight and easy-to-use job scheduler for Node.js with support for repeated jobs and retries.

## Features

- Schedule jobs with optional repeat intervals
- Automatic retry on failure with configurable max retries
- Simple API to add job templates and jobs
- Written in TypeScript with type definitions
- Job pausing, resuming, and removal
- Comprehensive logging

## Installation

```bash
npm install super-simple-scheduler
```

## Quick Start

```typescript
import Scheduler from "super-simple-scheduler";

// Create a scheduler instance
const scheduler = new Scheduler({
  logLevel: "info",
  dev: false,
});

// Add a job template
scheduler.addTemplate("sendEmail", async (data) => {
  // Your job logic here
  console.log("Sending email to:", data.recipient);
});

// Add a job
scheduler.addJob({
  template: "sendEmail",
  repeat: 60000, // Run every minute
  data: { recipient: "user@example.com" },
});

// Start the scheduler
scheduler.start();
```

## API Reference

### Scheduler Class

The main scheduler class that manages job execution.

#### Constructor

```typescript
new Scheduler(options?: {
  logLevel?: string;
  dev?: boolean;
})
```

**Parameters:**

- `logLevel` (optional): Logging level ('debug', 'info', 'warn', 'error'). Default: 'info'
- `dev` (optional): Development mode flag. Default: false

**Example:**

```typescript
const scheduler = new Scheduler({
  logLevel: "debug",
  dev: true,
});
```

#### Methods

##### `start(): boolean`

Starts the scheduler and begins processing jobs at the configured interval.

**Returns:** `true` if started successfully

**Example:**

```typescript
const success = scheduler.start();
if (success) {
  console.log("Scheduler started");
}
```

##### `stop(): boolean`

Stops the scheduler and clears the processing interval.

**Returns:** `true` if stopped successfully

**Example:**

```typescript
const success = scheduler.stop();
if (success) {
  console.log("Scheduler stopped");
}
```

##### `addTemplate(name: string, template: Function): boolean`

Registers a job template function that can be referenced by jobs.

**Parameters:**

- `name`: Unique identifier for the template
- `template`: Function to execute when the job runs. Can be async or sync.

**Returns:** `true` if template was added successfully

**Example:**

```typescript
scheduler.addTemplate("processData", async (data) => {
  // Process the data
  await processUserData(data);
});

scheduler.addTemplate("sendNotification", (data) => {
  // Send notification
  sendPushNotification(data.userId, data.message);
});
```

##### `addJob(options): boolean`

Adds a new job to the scheduler.

**Parameters:**

- `options.id` (optional): Unique identifier for the job. If not provided, a UUID will be generated
- `options.template`: Name of the template to use for this job
- `options.repeat` (optional): Interval in milliseconds between job executions. If null, job runs once
- `options.data` (optional): Data to pass to the job template function
- `options.active` (optional): Whether the job should be active. Default: true

**Returns:** `true` if job was added successfully, `false` if job with same ID already exists

**Example:**

```typescript
// One-time job
scheduler.addJob({
  template: "sendWelcomeEmail",
  data: { userId: "123", email: "user@example.com" },
});

// Repeating job
scheduler.addJob({
  id: "daily-cleanup",
  template: "cleanupDatabase",
  repeat: 24 * 60 * 60 * 1000, // 24 hours
  data: { tables: ["logs", "temp_data"] },
});

// Inactive job (will be paused)
scheduler.addJob({
  template: "maintenance",
  repeat: 60 * 60 * 1000, // 1 hour
  active: false,
});
```

##### `pauseJob(id: string | number): boolean`

Pauses a job, preventing it from executing.

**Parameters:**

- `id`: Job identifier

**Returns:** `true` if job was paused successfully, `false` if job not found

**Example:**

```typescript
const success = scheduler.pauseJob("daily-cleanup");
if (success) {
  console.log("Job paused");
}
```

##### `resumeJob(id: string | number): boolean`

Resumes a paused job, allowing it to execute again.

**Parameters:**

- `id`: Job identifier

**Returns:** `true` if job was resumed successfully, `false` if job not found

**Example:**

```typescript
const success = scheduler.resumeJob("daily-cleanup");
if (success) {
  console.log("Job resumed");
}
```

##### `removeJob(id: string | number): boolean`

Removes a job from the scheduler.

**Parameters:**

- `id`: Job identifier

**Returns:** `true` if job was removed successfully, `false` if job not found

**Example:**

```typescript
const success = scheduler.removeJob("daily-cleanup");
if (success) {
  console.log("Job removed");
}
```

##### `getJobs(): IJob[]`

Returns an array of all jobs in the scheduler.

**Returns:** Array of job objects

**Example:**

```typescript
const jobs = scheduler.getJobs();
console.log(`Scheduler has ${jobs.length} jobs`);
jobs.forEach((job) => {
  console.log(
    `Job ${job.id}: ${job.template} (${job.active ? "active" : "paused"})`
  );
});
```

##### `flushJobs(): boolean`

Removes all jobs from the scheduler.

**Returns:** `true` if jobs were flushed successfully

**Example:**

```typescript
const success = scheduler.flushJobs();
if (success) {
  console.log("All jobs removed");
}
```

##### `updateJob(id: string | number, repeat: number): boolean`

Updates the repeat interval for a job.

**Parameters:**

- `id`: Job identifier
- `repeat`: New interval in milliseconds

**Returns:** `true` if job was updated successfully, `false` if job not found

**Example:**

```typescript
const success = scheduler.updateJob("daily-cleanup", 12 * 60 * 60 * 1000); // 12 hours
if (success) {
  console.log("Job interval updated");
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
  lastRunAt?: number | null; // Timestamp of last execution
  lastFinishedAt?: number | null; // Timestamp of last completion
  lockedAt?: number | null; // Timestamp when job is being processed
  lastFailedAt?: number | null; // Timestamp of last failure
  lastFailReason?: string | null; // Reason for last failure
  failCount?: number; // Number of failures
  runCount?: number; // Number of successful runs
}
```

## Configuration

### Processing Interval

The scheduler processes jobs at regular intervals. The default interval is 1 second, but you can modify it:

```typescript
const scheduler = new Scheduler();
scheduler.processEvery = 5000; // Process every 5 seconds
```

### Retry Behavior

Jobs automatically retry on failure with a configurable maximum number of attempts:

```typescript
scheduler.addJob({
  template: "unreliableTask",
  repeat: 60000,
  maxRetries: 5, // Will retry up to 5 times on failure
  data: { task: "important" },
});
```

## Error Handling

The scheduler includes comprehensive error handling:

- Failed jobs are automatically retried up to the configured `maxRetries`
- All errors are logged with detailed information
- Jobs that fail all retry attempts are logged as errors
- One-time jobs (`repeat: null`) are removed after execution regardless of success/failure

## Logging

The scheduler uses a built-in logger with configurable levels:

```typescript
const scheduler = new Scheduler({
  logLevel: "debug", // 'debug', 'info', 'warn', 'error'
  dev: true, // Enhanced logging for development
});
```

## Examples

### Email Scheduler

```typescript
import Scheduler from "super-simple-scheduler";

const scheduler = new Scheduler();

// Email template
scheduler.addTemplate("sendEmail", async (data) => {
  await sendEmail(data.to, data.subject, data.body);
});

// Daily digest
scheduler.addJob({
  id: "daily-digest",
  template: "sendEmail",
  repeat: 24 * 60 * 60 * 1000,
  data: {
    to: "users@company.com",
    subject: "Daily Digest",
    body: "Here is your daily summary...",
  },
});

scheduler.start();
```

### Data Processing Pipeline

```typescript
const scheduler = new Scheduler({ logLevel: "debug" });

// Data processing templates
scheduler.addTemplate("fetchData", async (data) => {
  const rawData = await fetchFromAPI(data.endpoint);
  await saveToDatabase(rawData);
});

scheduler.addTemplate("processData", async (data) => {
  const rawData = await getFromDatabase();
  const processed = await transformData(rawData);
  await saveProcessedData(processed);
});

// Schedule jobs
scheduler.addJob({
  id: "fetch-hourly",
  template: "fetchData",
  repeat: 60 * 60 * 1000,
  data: { endpoint: "/api/data" },
});

scheduler.addJob({
  id: "process-daily",
  template: "processData",
  repeat: 24 * 60 * 60 * 1000,
});

scheduler.start();
```

## License

MIT
