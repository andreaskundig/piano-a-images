// skater1 = 1  3  8 13 18
// skater2 = _  _  _  _ 20
// skater3 = _  _  _ 15 21
// skater4 = _  _  9 16 23
// skater5 = _  6 11 17 25
// skater6 = 2  7 12 14 22
var composition = {
    imageSequence : [
    'skater0000.png', // 1
    'skater60000.png', // 2
    'skater0001.png', // 3
    null,                     
    null,                     
    'skater50001.png', // 6
    'skater60001.png', // 7
    'skater0002.png', // 8
    'skater40002.png', // 9 
    null,                     
    'skater50002.png', // 11
    'skater60002.png', // 12
    'skater0003.png', // 13
    'skater60003.png', // 14
    'skater30003.png', // 15
    'skater40003.png', // 16
    'skater50003.png', // 17
    'skater0004.png', // 18
    null,                     
    'skater20004.png', // 20
    'skater30004.png', // 21
    'skater60004.png', // 22
    'skater40004.png', // 23
    null,                     
    'skater50004.png' // 25
    ],
    background:'skater.png',
    imageSize: {width: 610, height: 720}},

    makePartition = function(){
        var notes =   [1,3,8,13,18,20,21,23,25],
            partition = [],
            duration,
            nextT = 0;
        notes.forEach(function(n, i){
            duration = 0.5;
            partition.push({m:144, n:35 + n, t:nextT});
            nextT += duration;
            partition.push({m:128, n:35 + n, t:nextT});
        });
        return partition;
    };
composition.partition = makePartition();
