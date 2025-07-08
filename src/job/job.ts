import mongoose, { Schema, Model } from "mongoose";

export interface IJob {
  id: string | number;
  template: string;
  data?: any;
  repeat?: number;
  maxRetries?: number;
  active: boolean;
  startAt?: number | null;
  lastRunAt?: number | null;
  lastFinishedAt?: number | null;
  lockedAt?: number | null;
  lastFailedAt?: number | null;
  lastFailReason?: string | null;
  failCount?: number;
  runCount?: number;
}

const JobSchema = new Schema<IJob>(
  {
    id: {
      type: Schema.Types.Mixed, // supports string or number
      required: true,
      unique: true,
    },
    template: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: null },
    repeat: { type: Number, default: null },
    maxRetries: { type: Number, default: 3 },
    active: { type: Boolean, required: true },
    startAt: { type: Number, default: null },
    lastRunAt: { type: Number, default: null },
    lastFinishedAt: { type: Number, default: null },
    lockedAt: { type: Number, default: null },
    lastFailedAt: { type: Number, default: null },
    lastFailReason: { type: String, default: null },
    failCount: { type: Number, default: 0 },
    runCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const JobModel: Model<IJob> = mongoose.model<IJob>(
  "SuperSimpleJob",
  JobSchema
);
