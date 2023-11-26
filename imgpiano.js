function getUrlParams(href) {
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
}

function getUrlParam(href, paramName) {
    return this.getUrlParams(href)[paramName];
}

function loadJs(src) {
    return new Promise(function(resolve, reject){
        var s = document.createElement( 'script' );
        s.setAttribute('src', src);
        s.setAttribute('id', 'the-animation');
        s.addEventListener('load', resolve);
        document.head.appendChild(s);
    });
}

function buildSprite(imgDir, imgName, width, height, scale) {
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
}

function buildSprites(imageSequence, imgDir, width, height, scale) {
    var spriteParent = document.getElementById('frame-parent');
    return imageSequence.reduce(function(notesToImage, imgConfig, i){
        let fileName = (imgConfig && imgConfig.file) || imgConfig,
            sprite = buildSprite(imgDir, fileName,
                                 width, height, scale);
        if(sprite){
            let index = isNaN(imgConfig.note) ? i : imgConfig.note;
            spriteParent.appendChild(sprite);
            notesToImage[index] = sprite;
        }
        return notesToImage;
    },{length: imageSequence.length});
}

function showSprite(sprite, height, show) {
    var offset = show ? height : 0;
    sprite.style.backgroundPositionY = -offset+'px';
}

function showSpriteForNote(message, note, sprites, height) {
    var noteOn = message === 144 || message === 159,
        noteOff = message === 128 || message === 143,
        imgNb = (note - 36) % sprites.length ;
    if(sprites[imgNb] && (noteOn || noteOff)){
        showSprite(sprites[imgNb], height, noteOn);;
    }
}

function makeKeyboard() {
    var keyToNote = {},
        keys = ['CapsLock']
        .concat('QAWSDRFTGYHJIKOL'.split('')
                                  .map(function(l){return 'Key'+l;}))
        .concat(['Semicolon','BracketLeft','Quote','BracketRight',
                 'Backslash','Enter','ShiftRight','ControlRight']);
    keys.forEach(function(k, i){
        keyToNote[k] = 36 + i;
    });
    return keyToNote;
}

const synth = new WebAudioTinySynth();

function playNote(message,note,velocity, imgs, height) {
    if(!note){return;}
    // console.log('play',message,note,velocity);
    if(message==144){
        //console.log(note, note - 35);
    }
    synth.send([message, note, velocity]);
    showSpriteForNote(message, note, imgs, height);
}

function play(animation) {
    const { composition, scale, imgs } = animation;
    return new Promise((resolve, reject) => {
        if(!composition.partition){ return; }
        var v = 100,// velocity
            //stops the flickering at the start (why?)
            //leaves time for loading the images on the web
            loadingDelay = 600,
            start = Date.now() + 200 + loadingDelay,
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
                if(!currentAnimation) {
                    // interruption
                    reject();
                } else if(partition.length > 0){
                    requestAnimationFrame(doPlay);
                }else{
                    resolve();
                }
            };
        //doPlay();
        setTimeout(doPlay, loadingDelay); // time to load the images
    });
}

function midiMessageReceived(ev, velocity, imgs, height) {
    var message = ev.data[0],
        note = ev.data[1],
        vel = ev.data[2];
    velocity = isNaN(vel)? velocity : vel;
    // console.log('data', message, note, velocity);
    playNote(message, note, velocity, imgs, height);
}

function onMIDIInit(midiAccess, velocity, imgs, height) {
    for (var input of midiAccess.inputs.values()){
        console.log('midi input', input);
        input.onmidimessage = ev => {
            const { imgs, scaledHeight } = currentAnimation;
            midiMessageReceived(ev, velocity, imgs, scaledHeight);
        };
    }
}

function initWebMidi(velocity, imgs, height) {
    if(navigator.requestMIDIAccess){
        navigator.requestMIDIAccess().then(
            m => onMIDIInit(m, velocity, imgs, height),
            e => console.error(e));
    }
}

function connectWebSocket() {
    var midiSocket = new WebSocket("ws://localhost:8080");
    midiSocket.onmessage = function (event) {
        var msgArray = JSON.parse(event.data)[1],
            message = msgArray[0],
            note = msgArray[1];
        const { imgs, scaledHeight } = currentAnimation;
        showSpriteForNote(message, note, imgs, scaledHeight);
    };
}

function buildBackground(animation){
    const { imgDir, composition, scale, imgs } = animation;
    if(composition.background){
        var s = composition.imageSize,
            bg = buildSprite(imgDir, composition.background,
                             s.width, s.height, scale),
            bgParent = document.getElementById('background-parent');
        bgParent.append(bg);
        showSprite(bg, s.height * scale, true);
    }
}

function createAnimation(imgDir, composition) {
    if(!composition.imageSize){
        composition.imageSize = {width: 1280, height: 720};
    }
    var s = composition.imageSize,
        scale = Math.min(window.innerWidth/s.width,
                         window.innerHeight/s.height),
        scaledHeight = composition.imageSize.height * scale,
        imgs = buildSprites(composition.imageSequence, imgDir,
                            s.width, s.height, scale);
    return { imgDir, imgs, scale, scaledHeight, composition };
}

function setupListeners() {
    const keyboard = makeKeyboard();
    const velocity = 100;
    document.addEventListener('keydown', function(e){
        //TODO ESC => menu
        if(keyDown[e.code]){ return; }
        const { imgs, scaledHeight } = currentAnimation;
        var note = keyboard[e.code];
        keyDown[e.code] = true;
        playNote(144, note, velocity, imgs, scaledHeight);
    });
    document.addEventListener('keyup', function(e){
        keyDown[e.code] = false;
        const { imgs, scaledHeight } = currentAnimation;
        var note = keyboard[e.code];
        playNote(128, note, velocity, imgs, scaledHeight);
    });
    connectWebSocket();
    initWebMidi(velocity);
}

function setupAnimationHtml(animation) {
    document.getElementById('intro').style.display = 'none';
    document.querySelector('body').style.cursor = 'none';
    document.title = animation.imgDir;
    buildBackground(animation);
}

function clearAnimation() {
    document.getElementById('frame-parent').replaceChildren();
    document.getElementById('background-parent').replaceChildren();
    currentAnimation = undefined;
}

function showIntro() {
    clearAnimation();
    document.getElementById('intro').style.display = 'block';
    document.querySelector('body').style.cursor = 'auto';
}

function playAnimation(imgDir, doPlay) {
    loadJs(imgDir+'/img.js').then(async function(){
        currentAnimation = createAnimation(imgDir, composition);
        setupAnimationHtml(currentAnimation);
        if(doPlay){
            try {
                await play(currentAnimation);
                console.log('played');
            } catch(e) {
                console.log('interrupted');
            }
            const delayBeforeBackToIntro = 2000;
            setTimeout(showIntro, delayBeforeBackToIntro);
        }
    }).catch(function(e){
        console.error(e);
    });
};

const keyDown = {};
let currentAnimation = undefined;

document.addEventListener('DOMContentLoaded', function(){
    try{
        // synth.send([0xc0,0]); // Acoustic grand piano
        // synth.send([0xc0,1]); // Bright acoustic piano
        // synth.send([0xc0,2]); // Electric grand piano
        // synth.send([0xc0,3]); // Honky-tonk piano
        // synth.send([0xc0,4]); // Electric Piano 1
        // synth.send([0xc0,5]); // Electric Piano 2
        // synth.send([0xc0,14]); // tubular bells
        var imgDir = getUrlParam(location.href,'img');
        var play = getUrlParam(location.href,'play');
        setupListeners();
        if(imgDir){
            playAnimation(imgDir, false);
            // TODO if play, display a play button
        } else {
            document.getElementById('intro').style.display = 'block';
            document.querySelectorAll('[data-img]').forEach( link => {
                link.addEventListener('click', () => {
                    playAnimation(link.dataset.img, !!link.dataset.play);
                    return false;
                })
            } )
        }
    }catch(e){ console.error(e); }
});
