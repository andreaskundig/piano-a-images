var composition = {
    imageSequence : [
        null, // 1
        null, // 2
        '06.png', // 3 fond 1
        null, // 4
        null, // 5
        '07.png', // 6 fond 2
        null, // 7
        '08.png', //  8 fond 2
        null, // 9
        null, // 10
        '09.png', // 11 fond 2
        null, // 12
        '10.png', // 13 fond 2
        null, // 14
        '01.png', // 15 assis cuillere sur table
        null, // 16
        '05.png', // 17 debout cuillere sur la table
        null, // 18
        null, // 19
        '03.png', // 20 assis cuillere sur le nez
        null, // 21
        '02.png', // 22 assis cuillere à la main
        null, // 23
        null, // 24
        '04.png' // 25 debout cuillere sur le nez 
    ],
    imageSize: {width: 1280, height: 720}},
    // 15 assis cuillere sur table
    // 22 assis cuillere à la main
    // 20 assis cuillere sur le nez
    // 15 assis cuillere sur table
    // 22 assis cuillere à la main
    // 20 assis cuillere sur le nez
    // 15 assis cuillere sur table
    // 22 assis cuillere à la main
    // 20 assis cuillere sur le nez
    // 25 debout cuillere sur le nez
    // 17 debout cuillere sur la table
    // 15 assis cuillere sur table
    makePartition = function(){
        var notes =     [15, 22, 20, 15, 22, 20, 15, 22, 20, 25, 17, 15],
            durations = [ 1,  1,  1,  1,  1,  2,  1,  1,  2,  3,  2,  2],
            partition = [],
            duration,
            nextT = 0;
        notes.forEach(function(n, i){
            duration = durations[i];
            partition.push({m:144, n:35 + n, t:nextT});
            nextT += duration;
            partition.push({m:128, n:35 + n, t:nextT});
        });
        return partition;
    };
composition.partition = makePartition();
