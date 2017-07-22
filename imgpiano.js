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
        var sprite = document.createElement('div'),
            bgPosX =  Math.round((width - width * scale) / 2);
        sprite.style.backgroundImage = 'url("'+imgDir+'/'+imgName+'")';
        sprite.style.backgroundRepeat = 'no-repeat';
        sprite.style.backgroundSize = (scale * 100) + '%';
        sprite.style.width = width,
        sprite.style.backgroundPositionX = bgPosX + 'px',
        sprite.style.height = Math.floor((height-1) * scale) - 1;
        return sprite;
    },
    buildSprites = function(imageSequence, imgDir, width, height, scale){
        var spriteParent = document.getElementById('frame-parent');
        return imageSequence.map(function(imgName,i){
            var sprite = buildSprite(imgDir, imgName, width, height, scale);
            if(sprite){spriteParent.appendChild(sprite);}
            return sprite;
        });
    },
    showSprite = function(sprite, height, show){
        var offset = show ? height : 0;
        sprite.style.backgroundPositionY = -offset+'px';
    },
    showSpriteForNote = function(message, note, sprites, height) {
        var noteOn = message === 144 || message === 159,
            noteOff = message === 128 || message === 143,
            imgNb = (note - 36) % sprites.length ;
        if(sprites[imgNb] && (noteOn || noteOff)){
            showSprite(sprites[imgNb], height, noteOn);;
        }
    },
    makeKeyboard = function(french){
        var keysFr = [81, 90, 83, 69, 68, 70, 84, 71, 89, 72, 85, 74, 73, 75],
            keysCh = [65, 87, 83, 69, 68, 70, 84, 71, 90, 72, 85, 74, 73, 75],
            keys = french ? keysFr: keysCh,
            keyToNote = {};
        keys.forEach(function(k, i){
            keyToNote[k] = 36 + i;
        });
        return keyToNote;
    },
    synth,
    playNote = function(message,note,velocity, imgs, height){
        if(!note){return;}
        if(message==144){
            console.log(note);
        }
        synth.send([message, note, velocity]);
        showSpriteForNote(message, note, imgs, height);
    },
    play = function(composition, imgs, scale){
        var v = 100,// velocity
            start = Date.now() + 500,
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
                        playNote(mid.m, mid.n, v, imgs, height);
                    }else{
                        break;
                    }
                }
                if(partition.length > 0){
                    requestAnimationFrame(doPlay);
                }
            };
        //doPlay();
        setTimeout(doPlay, 300); //stops the flickering at start, but why?
    },
    connectWebSocket = function(imgs, imgDir, composition, scale){
        var midiSocket = new WebSocket("ws://localhost:8080"),
            height = composition.imageSize.height * scale;
        midiSocket.onmessage = function (event) {
            var msgArray = JSON.parse(event.data)[1],
                message = msgArray[0],
                note = msgArray[1];
            showSpriteForNote(message, note, imgs, height);
        };
    },
    buildBackground = function(imgDir, composition, scale){
        if(composition.background){
            var s = composition.imageSize,
                bg = buildSprite(imgDir, composition.background,
                                 s.width, s.height, scale),
                bgParent = document.getElementById('background-parent');
            bgParent.append(bg);
            showSprite(bg, s.height * scale, true);
        }
    },
    run = function(imgDir, doPlay,composition){
        if(!composition.imageSize){
            composition.imageSize = {width: 1280, height: 720};
        }
        var s = composition.imageSize,
            scale = Math.min(window.innerWidth/s.width,
                             window.innerHeight/s.height),
            sprites = buildSprites(composition.imageSequence, imgDir,
                                   s.width, s.height, scale),
            keyboard = makeKeyboard(),
            velocity = 100;
        buildBackground(imgDir, composition, scale);
        if(doPlay){
            play(composition, sprites, scale);
        }
        document.addEventListener('keydown', function(e){
            var note = keyboard[e.keyCode];
            playNote(144, note, velocity, sprites, s.height * scale);
        });
        document.addEventListener('keyup', function(e){
            var note = keyboard[e.keyCode];
            playNote(128, note, velocity, sprites, s.height * scale);
        });
        connectWebSocket(sprites, imgDir, composition, scale);
    };

document.addEventListener('DOMContentLoaded', function(){
    try{
        
        var imgDir = getUrlParam(location.href,'img') || 'img',
            doPlay = getUrlParam(location.href,'play');
        document.title = imgDir;
        synth = new WebAudioTinySynth();
//        synth.send([0xc0,14]); // tubular bells
        loadJs(imgDir+'/img.js').then(function(){
            run(imgDir, doPlay, composition);
        }).catch(function(e){
            console.error(e);
        });
    }catch(e){ console.error(e); }
});
