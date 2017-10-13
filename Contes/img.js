var composition = {imageSequence : [{file: '03.png', note: 2},
                                    {file: '04.png', note: 3},
                                    {file: '05.png', note: 4},
                                    {file: '06.png', note: 5},
                                    {file: '07.png', note: 6},
                                    {file: '08.png', note: 7},
                                    {file: '09.png', note: 8},
                                    {file: '10.png', note: 9},
                                    {file: '11.png', note: 10},
                                    {file: '12.png', note: 11},
                                    {file: '01.png', note: 0},
                                    {file: '02.png', note: 1}],
                   imageSize: {width: 665, height: 720}
                  },
    shuffle = function(a) {
        //https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
        var j, x, i;
        for (i = a.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = a[i - 1];
            a[i - 1] = a[j];
            a[j] = x;
        }
        return a;
    },
    nextLines = function(previousLines, hideableIndexes){
        var lines = previousLines.map(function(l){return l.slice();}), //clone
            lineIndexes = lines.map(function(_,i){return i;}),
            changeableIndexes = lineIndexes.filter(function(i){
                return lines[i].length > 1;
            }),
            showableIndexes = changeableIndexes.filter(function(i){
                return !lines[i];
            }),
            indexToChange = shuffle(changeableIndexes)[0],
            show = !lines[indexToChange][0],
            hide = !show && showableIndexes.length > 0 && Math.random() > 0.5;
        if(show){
            var toHide = shuffle(hideableIndexes).find(function(i){
                return i != indexToChange;
            });
            lines[indexToChange].shift();
            lines[toHide][0] = false;
        }else if(hide){
            var toShow = shuffle(showableIndexes)[0];
            lines[indexToChange][0] = false;
            lines[toShow].shift();
        }else{
            lines[indexToChange].shift() ;
        }
        return lines;
    },
    makePartition = function(){
        var alwaysNote = 3, //38
            lines = [shuffle([4,5,6,7]),// 39 40 41 42
                     shuffle([8,9,10]), // 43 44 45
                     shuffle([1,2,11,12])], //36 37 46 47,
            hideableIndexes = shuffle([1,2]),
            nextT = 0,
            duration = 2,
            partition = [];
        lines[hideableIndexes[0]].unshift(false);
        console.log(JSON.stringify(lines));
        do{
            var start = nextT,
                end = nextT + duration,
                notes = [alwaysNote].concat(
                    lines.filter(function(l,i){
                            return l[0];
                        }).map(function(l,i){
                            return l[0];
                        }));
            notes.forEach(function(n){
                var note = n + 35 + 12;
                partition.push({m:144, n: note, t:start});
                partition.push({m:128, n: note, t:end});
            });
            lines = nextLines(lines, hideableIndexes); 
            console.log(JSON.stringify(lines));
            nextT = end;
        }while(lines.filter(function(l){return l.length > 1;}).length > 0)
        return partition;
    };
composition.partition = makePartition();
