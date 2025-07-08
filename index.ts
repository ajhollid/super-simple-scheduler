import Scheduler from "./src/scheduler/index.js";

const doStuff = async () => {
  const scheduler = new Scheduler({
    storeType: "mongo",
    logLevel: "info",
    dev: true,
    processEvery: 1000,
    dbUri: "mongodb://localhost:27017/uptime_db",
  });
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
  await scheduler.start();

  for (let i = 0; i < 1; i++) {
    await scheduler.addJob({
      id: `test-${i}`,
      template: "test",
      repeat: 2000,
      data: `test ${i}`,
      active: i % 2 === 0,
    });
  }

  for (let i = 0; i < 1; i++) {
    await scheduler.addJob({
      id: `test2-${i}`,
      template: "test2",
      data: `test ${i}`,
      active: i % 2 === 0,
    });
  }
  // await scheduler.pauseJob("test-0");
  // let job = await scheduler.getJob("test-0");
  // console.log(job?.active);
  // await scheduler.resumeJob("test-0");
  // job = await scheduler.getJob("test-0");
  // let jobs = await scheduler.getJobs();
  // console.log(jobs);

  // await scheduler.flushJobs();
  // jobs = await scheduler.getJobs();
  // console.log(jobs);
};

doStuff();

// setInterval(() => {
//   const mem = process.memoryUsage();
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
