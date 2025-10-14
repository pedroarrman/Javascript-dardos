/** programa para jugar al cricket */
let jugador = [,];
let puntuacion=[0,0];
let global=[0,0];
let ronda=[0,0];

/** Distribucion por turnos */
let contador = 1;
let turno=0;

jugador[0]= prompt(`introduce el nombre del jugador 1`);

jugador[1] = prompt(`introduce el nombre para el jugador 2`);

do{
    let numjugadores=2;
    
            if(contador%numjugadores){
                turno=0;
                jugada(jugador[turno],puntuacion[turno],global[turno],ronda[turno],contador);
            }
            else
            {
                turno=1;
                jugada(jugador[turno],puntuacion[turno],global[turno],ronda[turno],contador);
            }

contador++;
}while (ronda[turno]<26);


function jugada(){

/** inicio de la ronda */
    alert(`Ronda: ${ronda[turno]+1} adelante ${jugador[turno]}! introduce la puntuacion de esta ronda`);

/** bucle de dardos */
for (let dardo=0; dardo<=2; dardo++)
{
    puntuacion[turno] = Number(prompt(`Dardo: ${dardo+1}`));

/** switch donde se descartan los dardos que no puntúan, los dardos del 0 al 14 y del 21 al 24 */    
switch (puntuacion[turno]) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
    case 13:
    case 14:
        global[turno] += 0;
        break;
    case 15:
        global[turno] += 15;
        break;
    case 16:
        global[turno] += 16;
        break;
    case 17:
        global[turno] += 17;
        break;
    case 18:
        global[turno] += 18;
        break;
    case 19:
        global[turno] += 19;
        break;
    case 20:
        global[turno] += 20;
        break;
    case 21:
    case 22:
    case 23:
    case 24:
        global[turno] += 0;
        break;
    case 25:
        global[turno]+= 25;
        break;
}

/** bucle que controla el valor de cada dardo */
while (puntuacion[turno] < 0 || puntuacion[turno] > 25) {
    alert("Error, con un dardo no se puede lograr esa puntuación");

    puntuacion[turno] = Number(prompt(`Vuelva a introducir la puntuación para el dardo ${dardo+1}`));
}
}
alert(`llevas ${global[turno]} puntos`);    


return ronda[turno]++;
}