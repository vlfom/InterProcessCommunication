var api = {};
global.api = api;
api.net = require('net');

function do_task(data) {
	for (i = 0; i < data.length; ++i)
		data[i] = data[i] * 2;
}

var socket = new api.net.Socket();
socket.connect({
  port: 1234,
  host: '127.0.0.1',
}, function() {
  socket.on('data', function(data) {
  	input_data = JSON.parse(data);
    array = input_data.input;
    do_task(array);
  	socket.write(JSON.stringify({
  		worker_id: input_data.worker_id,
  		output: array
  	}));
  });
});