const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const PORT = 3857
if (cluster.isMaster) {

  console.log(`Master process ID: ${process.pid}`)
  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle worker process exit and fork a new one  fork is to spawn new worker 
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);

  });
} else {
  const app = require('./server2');

  app.listen(PORT, () => {
    console.log(`Worker ${cluster.worker.process.pid} is running on port ${PORT}`);
  });
}
