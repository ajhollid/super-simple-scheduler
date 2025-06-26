import { IScheduler } from "./index.js";

export function addTemplate(
  this: IScheduler,
  name: string,
  template: (data?: any) => void | Promise<void>
) {
  this._jobTemplates.set(name, template);
}
