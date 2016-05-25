module.exports = function() {
  var cpuCount = api.os.cpus().length;

  var workers = [];
  for (var i = 0; i < cpuCount; i++) {
    var worker = api.cluster.fork();
    workers.push(worker);
  }

  var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  var workersCount = api.os.cpus().length;
  var last_worker_id = 0;
  var finished_workers = 0;
  var worker_results = {};
  var workerSockets = [];

  var chunk_size = data.length / workersCount;

  for (var i = 0; i < cpuCount; ++i) {
    startWorker(workers[i], i + 1);
  }

  function startWorker(worker, workerID) {
    worker.send({
      task: data.slice((workerID - 1) * chunk_size, Math.max(workerID * chunk_size))
    });

    worker.on('exit', function (code) {
      console.log('exit ' + worker.process.pid + ' ' + code);
    });

    worker.on('message', function (message) {
      console.log(
        'message from worker ' + worker.process.pid + ': ' +
        JSON.stringify(message)
      );

      worker_results[workerID] = message.result;

      if (worker_results.length === cpuCount) {
        process.exit(1);
      }

      ++finished_workers;

      console.log(finished_workers);

      if (finished_workers == workersCount) {
        console.log(worker_results);
        process.exit(1);
      }
    });
  }

};
