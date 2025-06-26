import Scheduler from "./src/scheduler/index.js";
const scheduler = new Scheduler();
scheduler.addTemplate("test", (data) => {
    const delay = Math.floor(Math.random() * 5000); // 0–4999 ms
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`[test job] ran with data:`, data, `(delay: ${delay}ms)`);
            resolve();
        }, delay);
    });
});
for (let i = 0; i < 10000; i++) {
    scheduler.addJob({ template: "test", repeat: 10000, data: `testaroo ${i}` });
}
scheduler.start();
//# sourceMappingURL=index.js.map