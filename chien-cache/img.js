var composition = {
    imageSequence : [
        'A2_arbre_2.png', // 1 36
        'A_arbre.png',    // 2
        'B2_bolide_2.png',// 3
        'B_bolide.png',   // 4
        'C2_chien_2.png', // 5 40
        'C_chien.png',    // 6
        'D_dialogue.png', // 7
        'E2_effet_2.png', // 8
        'E_effet.png',    // 9
        'F2_fond_2.png',  //10 45
        'F_fond.png',     //11
        'G_golem.png'],   //12
    imageSize: {width: 509, height: 720},
    background: 'Z_background.png'},
    makePartition = function(){
        var _ = '_',
            __ = _,
            notes = [
                // arbre 36 37
                [ _, _, _, _,
                  _, _, 1, 1, 
                  1, _, _, _,
                  _, 2, 2, 1,
                  1, 1, _, _,
                  2, 2, 2, 2],
                // bolide 38 39
                [ _, _, 3, 3,
                  3, 3, _, _,
                  4, 4, 4, 3,
                  3, _, _, _,
                  _, 4, 4, 4,
                  _, _, _, _],
                // chien 40 41
                [ 6, 6, _, _,
                  5, 5, 5, 5,
                  _, _, _, _, 
                  _, _, 6, 6,
                  6, _, _, _,
                  _, 5, 5, 6],
                // dialogue effet 42 43 44
                [ 9, 8, 8, 8, 
                  _, _, _, 9, 
                  9, 9, 7, 7, 
                  7, 7, _, _,
                  8, 8, 8, 7,
                  7, _, 9, 9],
                // fond golem 45 46 47
                [12,12,12,10,
                 10,11,11, _, 
                 __,12,12,12,
                 11,11,11,11,
                 __, _,10,10,
                 10,10, _, _]
            ],
            partition = [],
            duration,
            nextT = 0;
        for(var i = 0; i< notes[0].length; i++){
            duration = 2;
            var start = nextT,
                end = nextT + duration;
            nextT = end;
            notes.forEach(function(ns){
                // next octave sounds better
                var note = ns[i] + 35 + 12; 
                if(!isNaN(note)){
                    partition.push({m:144, n: note, t:start});
                    partition.push({m:128, n: note, t:end});
                }
            });
        };
        return partition;
    };
composition.partition = makePartition();
