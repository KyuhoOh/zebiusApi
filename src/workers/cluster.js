import cluster from "cluster";
import os from "os";

export function setupCluster(startServer) {
  const workers = os.cpus().length;

  if (cluster.isPrimary) {
    for (let i = 0; i < workers; i++) {
      cluster.fork();
    }
    cluster.on("exit", (worker) => {
      console.log(`워커 프로세스 ${worker.process.pid} 종료됨`);
    });
  } else {
    startServer();
  }
}
