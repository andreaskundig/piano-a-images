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
    run = function(imgDir, imageSequence){
        var midiSocket = new WebSocket("ws://localhost:8080"),
            imgParent = document.getElementById('img-parent'),
            nbImages = 4;
        imageSequence.forEach(function(imgName){
            var h = '<img src="'+imgDir+'/'+imgName+'"/>';
            imgParent.innerHTML +=h;
        });
        var imgs= imgParent.querySelectorAll('img');
        // for(var i = 0; i < imgs.length; i++){
        //     imgs[i].style.display = 'none';
        // }
        midiSocket.onmessage = function (event) {
            var message = JSON.parse(event.data),
                noteOn =  message[1][0] === 144,
                noteOff =  message[1][0] === 128,
                key = message[1][1],
                imgNb = (key - 36) % imageSequence.length ;
            if(noteOn || noteOff){
                imgs[imgNb].style.display = noteOn ? 'block':'none';
            }
        };
    };

document.addEventListener('DOMContentLoaded', function(){
    try{
        
        var imgDir = getUrlParam(location.href,'img') || 'img';
        loadJs(imgDir+'/img.js').then(function(){
            run(imgDir, imageSequence);
        });
    }catch(e){ console.error(e); }
});
