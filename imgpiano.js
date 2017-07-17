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
    buildSprite = function(imgDir, imgName, width, height, scale){
        if(!imgName){
            return null;
        }
        // https://stackoverflow.com/questions/9486961/animated-image-with-javascript#9487083
        var spriteParent = document.getElementById('sprite-parent'),
            sprite = document.createElement('div'),
            bgPosX =  Math.round((width - width * scale) / 2);
        sprite.style.backgroundImage = 'url("'+imgDir+'/'+imgName+'")';
        sprite.style.backgroundRepeat = 'no-repeat';
        sprite.style.backgroundSize = (scale * 100) + '%';
        sprite.style.width = width,
        sprite.style.backgroundPositionX = bgPosX + 'px',
        sprite.style.height = Math.floor((height-1) * scale) - 1;
        spriteParent.appendChild(sprite);
        return sprite;
    },
    buildSprites = function(imageSequence, imgDir, width, height, scale){
        return imageSequence.map(function(imgName,i){
            return buildSprite(imgDir, imgName, width, height, scale);});
    },
    showSpriteForNote = function(sprites, imageSequence, message, note,
                                 height) {
        var noteOn = message === 144 || message === 159,
            noteOff = message === 128 || message === 143,
            imgNb = (note - 36) % imageSequence.length ;
        if(sprites[imgNb] && (noteOn || noteOff)){
            var offset = noteOn ? height : 0;
            sprites[imgNb].style.backgroundPositionY = -offset+'px';
        }
    },
    synth,
    play = function(composition, imgs, scale){
        var v = 100,// velocity
            start = Date.now(),
            compare = function(a,b){ return a.t - b.t;},
            partition = composition.partition.slice().sort(compare),
            height = composition.imageSize.height * scale,
            doPlay = function(){
                var time = (Date.now() - start) / 1000;
                while(partition.length > 0){
                    var mid = partition[0],
                        diff = mid.t - time;
                    if(diff < 0){
                        partition.shift();
                        console.log(time, mid.t, diff);
                        synth.send([mid.m, mid.n, v]);
                        showSpriteForNote(imgs, composition.imageSequence,
                                       mid.m, mid.n, height);
                    }else{
                        break;
                    }
                }
                if(partition.length > 0){
                    requestAnimationFrame(doPlay);
                }
            };
        // doPlay();
        setTimeout(doPlay, 2000);
    },
    connectWebSocket = function(imgs, imgDir, composition){
        var midiSocket = new WebSocket("ws://localhost:8080"),
            height = composition.imageSize.height / 2;
        midiSocket.onmessage = function (event) {
            var msgArray = JSON.parse(event.data)[1],
                message = msgArray[0],
                note = msgArray[1];
            showSpriteForNote(imgs, composition.imageSequence, message, note,
                              height);
        };
    },
    run = function(imgDir, doPlay,composition){
        var s = composition.imageSize,
            scale = Math.min(window.innerWidth/s.width,
                             window.innerHeight/s.height),
            sprites = buildSprites(composition.imageSequence, imgDir, s.width, s.height, scale);
        connectWebSocket(sprites, imgDir, composition, scale);
        if(doPlay){
            play(composition, sprites, scale);
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
