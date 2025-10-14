let global = 0, teclado =0, puntuacion = 0, contador = 0, longitud=0, temporal=0, opcion=0, partida=0;         
        
        alert("Iniciando el programa D.A.R.D.E.R.O.");

        alert("Juego: 501");  

        teclado = Number(prompt("Introduzca el valor que quiera para el juego:"));

        //control de introducir un valor que haga que el juego sea muy corto o muy largo        
        while (teclado < 1 || teclado > 9){

            teclado = Number(prompt("Valor no admitido, Introduzca el valor que desee para el juego"));
        }       

        //El valor introducido se multiplica por 100 y se le suma 1
        global = (teclado*100)+1;

        //Usamos Switch Case para hacerle elegir al jugador si quiere jugar una partida larga o corta.
            opcion = Number(prompt("¿Cuantas rondas quieres jugar? (pulsa 1 si quieres jugar 15 rondas, pulsa 2 si quieres jugar 25 rondas)"));
           
           switch(opcion){

           case 1:
               partida = 15;   
               break;
                                
           case 2:
                partida = 25;  
                break;

                default:               
            while(opcion < 1 || opcion >2){
                opcion = Number(prompt("Error, introduzca una de las opciones válidas 1(partida corta) 2(partida larga)"));
        }            
            if (opcion==1){partida=15};
            if (opcion==2){partida=25};
            break;
        }    



        
        alert("Comenzando el juego con "+partida+" rondas y "+global+" puntos");
        
        //Arrays para controlar rondas y dardos        
        ronda = new Array();
        dardo = new Array();
 
	//bucle de rondas       
        while (global !=0 ){
        alert("Ronda: "+(contador+1)+" adelante! Introduzca la puntuación de esta ronda: ");  
 
        //bucle de dardos 
        for (longitud=0; longitud<3 && global != 0; longitud++){
        
        puntuacion = Number(prompt("Dardo: "+(longitud+1)));
        
        //bucle que controla el valor de cada dardo        
        while (puntuacion < 0 || puntuacion > 60){

            puntuacion = Number(prompt("Error, con un dardo no se puede lograr esa puntuación, Vuelva a introducir la puntuación para el dardo "+(longitud+1)+":"));
        }
        

        /*control de puntuacion en ronda de los tres dardos para no caer en numeros negativos
        Si el valor de los 3 dardos no supera el global, se acumulan en una variable que 
        luego se comprobará si supera o no el valor del global
        */  
        
        if (puntuacion <= global){
            temporal = temporal + puntuacion;
                if (global == 0)
                break; 
                
                /*control de que si hemos bajado la puntuación a 0
                con menos de 3 dardos, no nos aparezca el mensaje
                de introduzca el dardo 2 y el dardo 3*/
                    if (puntuacion==global)
                    break;
                        if (temporal==global)
                        break;
                
            } 
        else
            break;

        }

        if (temporal <= global){
            global = global - temporal;
        }

 
        alert("Te quedan: "+global+" puntos por hacer");
 
        
        contador++;
        temporal=0;
        //si el contador se iguala con las rondas, la partida se acaba
        if (contador == partida)
            break;
        }
        
        alert("Fin de la Partida");
        
        if (global == 0){
            alert("Has ganado!!! piribi piribi piribi");
        }
        
        if(contador == partida && global > 0){
            alert("Has perdido manco!!! Uuuuuuuu");
        }
    
