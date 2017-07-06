var run = function(){
    var midiSocket = new WebSocket("ws://localhost:8080"),
        imgParent = document.getElementById('img-parent'),
        nbImages = 4;
    for(var i=0; i<nbImages; i++){
        imgParent.innerHTML += '<img src="img/'+(i+1)+'.png"/>';
    }
    var imgs= imgParent.querySelectorAll('img');
    midiSocket.onmessage = function (event) {
        var message = JSON.parse(event.data),
            noteOn =  message[1][0] === 144,
            noteOff =  message[1][0] === 128,
            key = message[1][1],
            imgNb = (key - 48) % 4 ;
        if(noteOn || noteOff){
            imgs[imgNb].style.display = noteOn ? 'block':'none';
        }
//        img.src='img/'+imgNb+'.png';
    };
};

document.addEventListener('DOMContentLoaded', function(){
    try{run();}catch(e){ console.error(e); }
});
