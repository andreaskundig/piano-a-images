// 13
// 20
// 17
// 12

// 15
// 22
// 21
// 16

// 19
// 14
// 11
// 18

var composition ={ imageSequence : [
    null, //1 
    null, //2 
    null, //3 
    null, //4 
    null, //5 
    null, //6 
    null, //7 
    null, //8 
    null, //9 
    null, //10 
    '11.png', //11 presque poignee
    '04.png', //12 devant chateau noir
    '01.png', //13 paysage
    '10.png', //14 tend la main
    '05.png', //15 devant chateau blanc
    '08.png', //16 souleve le casque
    '03.png', //17 dessus chateau blanc
    '12.png', //18 chute
    '09.png', //19 enleve le casque
    '02.png', //20 dessus chateau noir 
    '07.png', //21 baisse la garde
    '06.png', //22 face a face
]},
//13 paysage
//20 dessus chateau noir 
//17 dessus chateau blanc
//12 devant chateau noir
//15 devant chateau blanc
//22 face a face
//21 baisse la garde
//16 souleve le casque
//19 enleve le casque
//14 tend la main
//11 presque poignee
//18 chute
    makePartition = function(){
        var notes = [13,20,17,12,15,22,21,16,19,14,11,18],
            duration = 2.5 ,
            partition = [],
            nextT = 0;
        
        notes.forEach(function(n){
            partition.push({m:144, n:35 + n, t:nextT});
            nextT += duration;
            partition.push({m:128, n:35 + n, t:nextT});
        });
        
// permutations au milieu:
// s'arranger pour montrer le même nombre de cases de chacune des catégories suivantes
// (la chute apparaitra donc 5 fois plus que n'importe laquelle des autres cases)
// tension: 20 17 12 15 (22)
// détente: 21 16 19 14 (11)
// chute: 18
        [20, 15, 18, 17, 12, 18,
         16, 19, 18, 21, 14, 18,
         22, 11].forEach(function(n){
        //[20, 17, 21, 16, 18,   12, 15, 18, 19, 14, 22, 11].forEach(function(n){
            partition.push({m:144, n:35 + n, t:nextT});
            nextT += duration / 7;
            partition.push({m:128, n:35 + n, t:nextT});
         });
        
        notes.slice().reverse().forEach(function(n){
            partition.push({m:144, n:35 + n, t:nextT});
            nextT += duration;
            partition.push({m:128, n:35 + n, t:nextT});
        });
        
        return partition;
    };
composition.partition = makePartition();

