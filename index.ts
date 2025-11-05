import Scheduler from "./src/scheduler/index.js";

const googleSites = [
  "https://www.google.com",
  "https://news.google.com",
  "https://maps.google.com",
  "https://translate.google.com",
  "https://scholar.google.com",
  "https://drive.google.com",
  "https://photos.google.com",
  "https://calendar.google.com",
];

const doStuff = async () => {
  const scheduler = new Scheduler({
    logLevel: "info",
    dev: true,
    processEvery: 1000,
  });

  // await scheduler.addTemplate("test", (data) => {
  //   const delay = Math.floor(Math.random() * 1000); // 0–4999 ms

  //   return new Promise((resolve, reject) => {
  //     setTimeout(() => {
  //       console.log(data);
  //       resolve();
  //       // reject(new Error("test error"));
  //     }, delay);
  //   });
  // });

  // await scheduler.addTemplate("test2", (data) => {
  //   console.log("running job 2");
  // });
  // for (let i = 0; i < 1; i++) {
  //   const res = await scheduler.addJob({
  //     id: `test-${i}`,
  //     template: "test",
  //     repeat: 2000,
  //     data: `test ${i}`,
  //     active: i % 2 === 0,
  //   });
  // }
  await scheduler.start();

  await scheduler.addTemplate("randomGoogle", async (data) => {
    const googleSites = [
      "https://www.google.com",
      // "https://news.google.com",
      // "https://maps.google.com",
      // "https://translate.google.com",
      // "https://scholar.google.com",
      // "https://drive.google.com",
      // "https://photos.google.com",
      // "https://calendar.google.com",
    ];

    const url = googleSites[Math.floor(Math.random() * googleSites.length)];
    const start = Date.now();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      const duration = Date.now() - start;
      console.log(
        `[${new Date().toISOString()}] GET ${url} → ${
          res.status
        } (${duration} ms)`
      );

      return { url, status: res.status, duration };
    } catch (err) {
      const duration = Date.now() - start;
      console.error(
        `[${new Date().toISOString()}] Error fetching ${url} after ${duration} ms:`,
        err.name === "AbortError" ? "Timeout" : err.message
      );
      throw err;
    }
  });

  // for (let i = 0; i < 1; i++) {
  //   await scheduler.addJob({
  //     id: `test2-${i}`,
  //     startAt: Date.now() + 5000,
  //     template: "test2",
  //     data: `test ${i}`,
  //     active: i % 2 === 0,
  //   });
  // }
  for (let i = 0; i < 1000; i++) {
    await scheduler.addJob({
      id: `test2-${i}`,
      startAt: Date.now(),
      template: "randomGoogle",
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
  // await scheduler.stop();
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
