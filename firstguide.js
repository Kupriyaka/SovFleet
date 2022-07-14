'use strict' //строгий режим (просто написать и забыть)

let x = 0; // тип указывать не обязательно, переменные указывать через let
//number - Это любой числовой тип
const a = 50; // константу можно задать

if (x === 10) { // условие
  x++;
}

while (x === 0) {
  alert("УРААА");
  x++;
}

do {
  x++;
} while (x < 10);

//с параметром
for (let x = 0; x < 10; x++) {

  //массивы - нумерация элементов начинается с нуля как в с!!

}

let B = [1, 2, 5, 7]

alert(B[2]);

let foo = B.find(element => element = 5);
B.push();
B.pop();

// Объекты
let struct = {
  lul: 0,
  wow: -5,
}

struct.lul = 4;

switch (foo) {

  case 5: {

  } break;


  case 2: {

  } break;

}

alert(foo);

console.log('kek');

let A = B.map(element => element >3); //A = [5, 7, 4]

alert("Есть там кто?");
