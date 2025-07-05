import Scheduler from "./src/scheduler/index.js";
import { InMemoryStore } from "./src/store/inMemoryStore.js";
const scheduler = new Scheduler("inMemory");
scheduler.addTemplate("test", (data) => {
  const delay = Math.floor(Math.random() * 1000); // 0–4999 ms

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("running job");
      resolve();
      // reject(new Error("test error"));
    }, delay);
  });
});
scheduler.addTemplate("test2", (data) => {
  console.log("running job 2");
});

for (let i = 0; i < 1; i++) {
  scheduler.addJob({
    id: `test-${i}`,
    template: "test",
    repeat: 2000,
    data: `test ${i}`,
    active: i % 2 === 0,
  });
}

for (let i = 0; i < 1; i++) {
  scheduler.addJob({
    id: `test2-${i}`,
    template: "test2",
    data: `test ${i}`,
    active: i % 2 === 0,
  });
}
scheduler.start();

// setInterval(() => {
//   const mem = process.memoryUsage();
//   const rss = (mem.rss / 1024 / 1024).toFixed(1);
//   const heap = (mem.heapUsed / 1024 / 1024).toFixed(1);
//   console.log(`[Monitor] Memory: RSS ${rss}MB | Heap ${heap}MB`);
// }, 2000);

// const cpuStart = process.cpuUsage();
// setInterval(() => {
//   const cpu = process.cpuUsage(cpuStart);
//   console.log(
//     `[Monitor] CPU time: user=${(cpu.user / 1000).toFixed(2)}ms, system=${(
//       cpu.system / 1000
//     ).toFixed(2)}ms`
//   );
// }, 2000);
