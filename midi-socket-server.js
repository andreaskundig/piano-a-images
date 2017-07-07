var midi = require('midi');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });


var input = new midi.input(),
    output = new midi.output(),
    send = null;

var findMidiOutputPort = function(output, nameBeginning){
    var ports  = output.getPortCount();
    console.log('ports', ports);
    var port = 0;
    for(var i = 0; i<ports; i++){
        var name = output.getPortName(i);
        console.log(name);
        if(name.startsWith(nameBeginning)){
            port = i;
        }
    }
    console.log('chose port', port, 'for', nameBeginning);
    return port;
};
// var port = findMidiOutputPort(output, 'VirtualMIDI');
var port = findMidiOutputPort(output, 'loopMIDI');
output.openPort(port);
input.on('message', function(deltaTime, message) {
  // The message is an array of numbers corresponding to the MIDI bytes: 
  //   [status, data1, data2] 
  // https://www.cs.cf.ac.uk/Dave/Multimedia/node158.html has some helpful 
  // information interpreting the messages. 
    console.log('m:', message, ' d:', deltaTime);
    if(send){
        send(JSON.stringify([deltaTime,message]));
    }
    output.sendMessage(message);
});

//var ports  = (new midi.output()).getPortCount();
// Open the first available input port. 
input.openPort(0);

wss.on('connection', function connection(ws) {
    send = function(message){
        ws.send(message);
    };
});
