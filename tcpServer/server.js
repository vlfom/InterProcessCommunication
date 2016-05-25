var api = {};
global.api = api;
api.os = require('os');
api.net = require('net');

var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

var workersCount = api.os.cpus().length;
var last_worker_id = 0;
var finished_workers = 0;
var worker_results = {};
var workerSockets = [];

var chunk_size = data.length / workersCount;


function get_worker_data_chunk(worker_id) {
	return data.slice((worker_id - 1) * chunk_size, Math.max(worker_id * chunk_size));
}

function process_worker_result(worker_id, result) {
  ++finished_workers;
  worker_results[worker_id] = result;
  if (finished_workers == workersCount) {
    console.log('Finished processing. Results:');
    console.log(worker_results);
    process.exit(1);
  }
}

var server = api.net.createServer(function(socket) {
  if (last_worker_id == workersCount)
    return;
  else {
    worker_id = ++last_worker_id;
    workerSockets.push(socket);

    console.log('Connected new client-worker with id ' + worker_id);
    socket.on('data', function(data) {
      result = JSON.parse(data);
      process_worker_result(result.worker_id, result.output);
    });

    if (last_worker_id == workersCount) {
      for (var i = 1; i <= workersCount; ++i) {
        workerSockets[i - 1].write(JSON.stringify({
        	worker_id: i,
        	input: get_worker_data_chunk(i)
        }));
      }
    }
  }
}).listen(1234);
