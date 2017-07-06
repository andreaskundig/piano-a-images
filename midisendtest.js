var midi = require('midi');

var findMidiPort = function(nameBeginning){
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
    return port;
};

// Set up a new output.
var output = new midi.output();

// Count the available output ports.
var ports  = output.getPortCount();
console.log('ports', ports);
var port = 0;
for(var i = 0; i<ports; i++){
    var name = output.getPortName(i);
    if(name.startsWith('Microsoft')){
    // if(name.startsWith('loopMIDI')){
        port = i;
    }
}
// Get the name of a specified output port.
console.log('send to', output.getPortName(port), 'port', port);

// Open the first available output port.
output.openPort(port);

// Send a MIDI message.
output.sendMessage([176,22,1]);
//output.sendMessage([144,22,1]);

// Close the port when done.
output.closePort();
