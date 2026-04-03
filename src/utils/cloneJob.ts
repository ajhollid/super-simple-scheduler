import { IJob } from "../job/types.js";

export function cloneJob(job: IJob): IJob {
  try {
    return structuredClone(job);
  } catch {
    const { data, ...rest } = job;
    let clonedData: unknown = data;
    try {
      clonedData = JSON.parse(JSON.stringify(data));
    } catch {
      // data contains circular refs or other non-serializable values -- pass by reference
    }
    return { ...structuredClone(rest), data: clonedData };
  }
}
