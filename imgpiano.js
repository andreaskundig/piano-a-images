var getUrlParams = function(href){
    if(!href.match(/:\/\//) || !href.match(/\?/)){
        return {};
    }
    var search = href.split('?')[1];
    if(!search){
        return {};
    }
    // http://stackoverflow.com/questions/8648892/
    return JSON.parse(
        '{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}',
        function(k, v) { return k === "" ? v : decodeURIComponent(v); });
},
    getUrlParam = function(href, paramName){
        return this.getUrlParams(href)[paramName];
    },
    loadJs = function(src){
        return new Promise(function(resolve, reject){
            var s = document.createElement( 'script' );
            s.setAttribute('src', src);
            s.setAttribute('id', 'the-animation');
            s.addEventListener('load', resolve);
            document.head.appendChild(s);
        });
    },
    buildImages = function(imageSequence, imgDir){
        var imgParent = document.getElementById('img-parent');
        imageSequence.forEach(function(imgName){
            var h = imgName ? '<img src="'+imgDir+'/'+imgName+'"/>': '<img/>';
            imgParent.innerHTML +=h;
        });
        return imgParent.querySelectorAll('img');
    },
    showImgForNote = function(imgs, imageSequence, message, note){
        var noteOn = message === 144 || message === 159,
            noteOff = message === 128 || message === 143,
            imgNb = (note - 36) % imageSequence.length ;
        if(noteOn || noteOff){
            imgs[imgNb].style.display = noteOn ? 'block':'none';
        }
    },
    synth,
    play = function(composition, imgs){
        var v = 100,// velocity
            start = Date.now(),
            partition = composition.partition.slice(),
            doPlay = function(){
                var time = (Date.now() - start) / 1000;
                while(partition.length > 0){
                    var mid = partition[0];
                    if(mid.t < time){
                        partition.shift();
                        synth.send([mid.m, mid.n, v]);
                        showImgForNote(imgs, composition.imageSequence,
                                       mid.m, mid.n);
                    }else{
                        break;
                    }
                }
                if(partition.length > 0){
                    requestAnimationFrame(doPlay);
                }
            };
        doPlay();
    },
    connectWebSocket = function(imgs, imgDir, composition){
        var midiSocket = new WebSocket("ws://localhost:8080");
        midiSocket.onmessage = function (event) {
            var msgArray = JSON.parse(event.data)[1],
                message = msgArray[0],
                note = msgArray[1];
            showImgForNote(imgs, composition.imageSequence, message, note);
        };
    },
    run = function(imgDir, doPlay,composition){
        var imgs= buildImages(composition.imageSequence, imgDir);
        connectWebSocket(imgs, imgDir, composition);
        
        if(doPlay){
            play(composition, imgs);
        }
        
    };

document.addEventListener('DOMContentLoaded', function(){
    try{
        
        var imgDir = getUrlParam(location.href,'img') || 'img',
            doPlay = getUrlParam(location.href,'play');
        synth = new WebAudioTinySynth();
//        synth.send([0xc0,14]); // tubular bells
        loadJs(imgDir+'/img.js').then(function(){
            run(imgDir, doPlay, composition);
        }).catch(function(e){
            console.error(e);
        });
    }catch(e){ console.error(e); }
});
