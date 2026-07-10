/***********************************************************************
 *
 * DARTS SCOREBOARD
 * ---------------------------------------------------------------
 * Versión: 1.0
 * Autor: Pedro + ChatGPT
 *
 * Archivo:
 * script.js
 *
 * Este archivo sustituye completamente la versión de Apps Script.
 * Todo el estado del juego vive en memoria y posteriormente se
 * guardará automáticamente mediante LocalStorage.
 *
 ***********************************************************************/


/***********************************************************************
 *
 * VARIABLES GLOBALES
 *
 ***********************************************************************/

let modo = "501";

let multi = 1;

let jugadores = [];

/**
 * Estado completo de la partida.
 * Toda la aplicación trabaja sobre este objeto.
 */
let estado = {

    modo: "501",

    jugadores: [],

    turno: 0,

    global: [],

    ronda: [],

    temporal: 0,

    dardos: [],

    bust: false,

    terminado: false,

    ganador: null

};


/***********************************************************************
 *
 * SELECTOR DEL MODO DE JUEGO
 *
 ***********************************************************************/

function seleccionarModo(nuevoModo){

    modo = nuevoModo;

    estado.modo = nuevoModo;

    document.getElementById("btnCricket").className="btn secondary";
    document.getElementById("btn501").className="btn secondary";

    if(nuevoModo=="cricket"){

        document.getElementById("btnCricket").className="btn primary";

    }

    else{

        document.getElementById("btn501").className="btn primary";

    }

}


/***********************************************************************
 *
 * MULTIPLICADORES
 *
 ***********************************************************************/

function setMulti(m){

    multi=m;

    document.getElementById("b1").className="btn secondary";
    document.getElementById("b2").className="btn secondary";
    document.getElementById("b3").className="btn secondary";

    if(m==1)
        document.getElementById("b1").className="btn primary";

    if(m==2)
        document.getElementById("b2").className="btn primary";

    if(m==3)
        document.getElementById("b3").className="btn primary";

}


/***********************************************************************
 *
 * GESTIÓN DE JUGADORES
 *
 ***********************************************************************/

function addJugador(){

    if(jugadores.length>=4)
        return;

    const contenedor=document.getElementById("jugadores");

    const indice=jugadores.length;

    jugadores.push("");

    const fila=document.createElement("div");

    fila.className="playerInput";

    fila.id="filaJugador"+indice;

    const input=document.createElement("input");

    input.placeholder="Jugador "+(indice+1);

    input.oninput=function(){

        jugadores[indice]=this.value;

    };

    const borrar=document.createElement("button");

    borrar.innerHTML="✖";

    borrar.className="btn danger";

    borrar.onclick=function(){

        eliminarJugador(indice);

    };

    fila.appendChild(input);

    fila.appendChild(borrar);

    contenedor.appendChild(fila);

}


/***********************************************************************
 *
 * ELIMINAR JUGADOR
 *
 ***********************************************************************/

function eliminarJugador(indice){

    jugadores.splice(indice,1);

    reconstruirListaJugadores();

}


/***********************************************************************
 *
 * RECONSTRUIR CONTROLES DE JUGADORES
 *
 ***********************************************************************/

function reconstruirListaJugadores(){

    const contenedor=document.getElementById("jugadores");

    contenedor.innerHTML="";

    const copia=[...jugadores];

    jugadores=[];

    copia.forEach(nombre=>{

        addJugador();

        jugadores[jugadores.length-1]=nombre;

        contenedor.lastChild.querySelector("input").value=nombre;

    });

}


/***********************************************************************
 *
 * INICIAR PARTIDA
 *
 ***********************************************************************/

function iniciar(){

    const lista=jugadores.filter(j=>j.trim()!="");

    if(lista.length==0){

        alert("Debes introducir al menos un jugador.");

        return;

    }

    estado.modo=modo;

    estado.jugadores=[...lista];

    estado.turno=0;

    estado.temporal=0;

    estado.dardos=[];

    estado.bust=false;

    estado.terminado=false;

    estado.ganador=null;

    estado.ronda=new Array(lista.length).fill(0);

    if(modo=="501"){

        estado.global=new Array(lista.length).fill(501);

    }

    else{

        estado.global=new Array(lista.length).fill(0);

    }

    document.getElementById("inicio").style.display="none";

    document.getElementById("juego").style.display="block";

    crearBotones();

    actualizar();

}


/***********************************************************************
 *
 * CREAR BOTONES DE LA DIANA
 *
 ***********************************************************************/

function crearBotones(){

    const teclado=document.getElementById("botones");

    teclado.innerHTML="";

    for(let i=1;i<=20;i++){

        const b=document.createElement("button");

        b.className="btn dart";

        b.innerHTML=i;

        b.onclick=function(){

            tirarNumero(i);

        };

        teclado.appendChild(b);

    }

    const bull=document.createElement("button");

    bull.className="btn dart";

    bull.innerHTML="25";

    bull.onclick=tirarBull;

    teclado.appendChild(bull);

    const bull50=document.createElement("button");

    bull50.className="btn dart";

    bull50.innerHTML="50";

    bull50.onclick=tirarBullDoble;

    teclado.appendChild(bull50);

}

/***********************************************************************
 *
 * LANZAMIENTO DE UN NÚMERO
 *
 ***********************************************************************/
function tirarNumero(numero){

    let valor = numero;

    // Aplicar multiplicador únicamente a los números del 1 al 20
    if(multi==2)
        valor = numero * 2;

    if(multi==3)
        valor = numero * 3;

    registrarTirada(valor);

}


/***********************************************************************
 *
 * BULL SIMPLE
 *
 ***********************************************************************/
function tirarBull(){

    registrarTirada(25);

}


/***********************************************************************
 *
 * BULL DOBLE
 *
 ***********************************************************************/
function tirarBullDoble(){

    registrarTirada(50);

}


/***********************************************************************
 *
 * REGISTRO DE TIRADA
 *
 * Esta función decide automáticamente qué motor utilizar
 * dependiendo del juego seleccionado.
 *
 ***********************************************************************/
function registrarTirada(valor){

    if(estado.terminado)
        return;

    if(estado.modo=="501"){

        tirar501(valor);

    }
    else{

        tirarCricket(valor);

    }

    actualizar();

}


/***********************************************************************
 *
 * MOTOR DEL JUEGO 501
 *
 ***********************************************************************/
function tirar501(valor){

    const jugador = estado.turno;

    estado.dardos.push(valor);

    estado.temporal += valor;

    // Si nos pasamos -> Bust
    if(estado.temporal > estado.global[jugador]){

        estado.bust = true;

        siguienteTurno();

        return;

    }

    // Cierre exacto
    if(estado.temporal == estado.global[jugador]){

        estado.global[jugador] = 0;

        estado.terminado = true;

        estado.ganador = jugador;

        return;

    }

    // Tres dardos consumidos
    if(estado.dardos.length==3){

        estado.global[jugador] -= estado.temporal;

        siguienteTurno();

    }

}


/***********************************************************************
 *
 * CAMBIO DE TURNO
 *
 ***********************************************************************/
function siguienteTurno(){

    estado.temporal = 0;

    estado.dardos = [];

    estado.bust = false;

    estado.ronda[estado.turno]++;

    estado.turno++;

    if(estado.turno>=estado.jugadores.length){

        estado.turno=0;

    }

}


/***********************************************************************
 *
 * MOTOR DEL CRICKET (BASE)
 *
 * Esta primera versión reproduce el funcionamiento
 * del programa original que desarrolló Pedro.
 *
 ***********************************************************************/
function tirarCricket(valor){

    const jugador = estado.turno;

    estado.dardos.push(valor);

    if(

        valor==15 ||
        valor==16 ||
        valor==17 ||
        valor==18 ||
        valor==19 ||
        valor==20 ||
        valor==25

    ){

        estado.global[jugador]+=valor;

    }

    if(estado.dardos.length==3){

        siguienteTurno();

    }

}


/***********************************************************************
 *
 * ACTUALIZACIÓN DE LA INTERFAZ
 *
 ***********************************************************************/
function actualizar(){

    document.getElementById("turno").innerHTML =

        "Turno de <b>"+estado.jugadores[estado.turno]+"</b>";

    let html="";

    for(let i=0;i<estado.jugadores.length;i++){

        html+=`

        <div class="player ${i==estado.turno?"active":""}">

            <strong>${estado.jugadores[i]}</strong>

            <br>

            ${estado.modo=="501"
                ? estado.global[i]+" puntos"
                : estado.global[i]+" puntos"}

            <br>

            Ronda ${estado.ronda[i]+1}

        </div>

        `;

    }

    document.getElementById("score").innerHTML=html;

    document.getElementById("dardos").innerHTML=estado.dardos.length;

    if(estado.bust){

        document.getElementById("estadoTurno").innerHTML="BUST";

    }
    else{

        document.getElementById("estadoTurno").innerHTML="";

    }

    if(estado.terminado){

        document.getElementById("estadoTurno").innerHTML=

            "🏆 Ha ganado <b>"+estado.jugadores[estado.ganador]+"</b>";

    }

}


/***********************************************************************
 *
 * GUARDAR PARTIDA
 *
 ***********************************************************************/
function guardarPartida(){

    localStorage.setItem(

        "dartsScore",

        JSON.stringify(estado)

    );

}


/***********************************************************************
 *
 * CARGAR PARTIDA
 *
 ***********************************************************************/
function cargarPartida(){

    const datos = localStorage.getItem("dartsScore");

    if(datos==null)
        return;

    estado = JSON.parse(datos);

    actualizar();

}


/***********************************************************************
 *
 * REINICIAR PARTIDA
 *
 ***********************************************************************/
function reiniciar(){

    localStorage.removeItem("dartsScore");

    location.reload();

}


/***********************************************************************
 *
 * GUARDADO AUTOMÁTICO
 *
 ***********************************************************************/
setInterval(function(){

    if(estado.jugadores.length>0){

        guardarPartida();

    }

},1000);


/***********************************************************************
 *
 * INICIALIZACIÓN
 *
 ***********************************************************************/
window.onload=function(){

    addJugador();

    seleccionarModo("501");

    cargarPartida();

};

/***********************************************************************
 *
 * UTILIDADES
 *
 ***********************************************************************/

/**
 * Devuelve true si el jugador actual está en zona de cierre.
 * (180 o menos)
 */
function enZonaCierreTresDardos(){

    if(estado.modo!="501")
        return false;

    return estado.global[estado.turno] <= 180;

}


/**
 * Devuelve true si quedan exactamente dos dardos
 * y la puntuación restante es 100 o inferior.
 */
function enZonaCierreDosDardos(){

    if(estado.modo!="501")
        return false;

    if(estado.dardos.length!=1)
        return false;

    return estado.global[estado.turno]-estado.temporal <=100;

}


/***********************************************************************
 *
 * CONSULTA DE CIERRES
 *
 * Más adelante se sustituirá por la tabla completa que
 * me has pasado.
 *
 ***********************************************************************/

function consultarCierre(){

    if(estado.modo!="501")
        return;

    let restante = estado.global[estado.turno]-estado.temporal;

    if(restante<0)
        restante=0;

    alert("Restan "+restante+" puntos.\n\nLa tabla completa de cierres se implementará aquí.");

}


/***********************************************************************
 *
 * CAMBIO MANUAL DE TURNO
 *
 * Se utilizará en futuras versiones para corregir
 * puntuaciones manualmente.
 *
 ***********************************************************************/

function pasarTurno(){

    if(estado.terminado)
        return;

    siguienteTurno();

    actualizar();

}


/***********************************************************************
 *
 * DESHACER ÚLTIMO DARDO
 *
 * Funcionalidad muy habitual en los scoreboards.
 *
 * De momento únicamente elimina el último dardo
 * del turno actual.
 *
 ***********************************************************************/

function deshacerUltimoDardo(){

    if(estado.terminado)
        return;

    if(estado.dardos.length==0)
        return;

    let ultimo=estado.dardos.pop();

    if(estado.modo=="501"){

        estado.temporal-=ultimo;

        if(estado.temporal<0)
            estado.temporal=0;

    }

    actualizar();

}


/***********************************************************************
 *
 * CAMBIAR MULTIPLICADOR A NORMAL
 *
 * Después de un lanzamiento siempre volvemos
 * automáticamente al modo Normal.
 *
 ***********************************************************************/

function resetMultiplicador(){

    multi=1;

    document.getElementById("b1").className="btn primary";
    document.getElementById("b2").className="btn secondary";
    document.getElementById("b3").className="btn secondary";

}


/***********************************************************************
 *
 * MODIFICACIÓN DEL REGISTRO DE TIRADA
 *
 * Sustituirá posteriormente a la función anterior.
 *
 ***********************************************************************/

const registrarTiradaOriginal = registrarTirada;

registrarTirada = function(valor){

    registrarTiradaOriginal(valor);

    resetMultiplicador();

    guardarPartida();

};


/***********************************************************************
 *
 * ATAJOS DE TECLADO
 *
 * Muy útiles cuando se juegue desde un ordenador.
 *
 ***********************************************************************/

document.addEventListener("keydown",function(e){

    if(e.key==="Escape"){

        resetMultiplicador();

    }

});


/***********************************************************************
 *
 * INFORMACIÓN DE DEPURACIÓN
 *
 * Solo para desarrollo.
 *
 ***********************************************************************/

function debugEstado(){

    console.clear();

    console.log("========== ESTADO DEL JUEGO ==========");

    console.table({

        modo:estado.modo,

        turno:estado.turno,

        jugador:estado.jugadores[estado.turno],

        puntos:estado.global[estado.turno],

        ronda:estado.ronda[estado.turno],

        temporal:estado.temporal,

        dardos:estado.dardos.join(","),

        bust:estado.bust,

        terminado:estado.terminado

    });

}


/***********************************************************************
 *
 * BUCLE DE DEPURACIÓN
 *
 ***********************************************************************/

setInterval(function(){

    debugEstado();

},5000);


/***********************************************************************
 *
 * TODO (ROADMAP)
 *
 * [ ] Cricket profesional
 * [ ] Tabla de cierres 3 dardos
 * [ ] Tabla de cierres 2 dardos
 * [ ] Estadísticas por jugador
 * [ ] Historial de partidas
 * [ ] Media de 3 dardos
 * [ ] Mejor ronda
 * [ ] Máxima puntuación
 * [ ] Checkout %
 * [ ] Modo doble de salida
 * [ ] Modo doble de cierre
 * [ ] Bull 25 / 50 configurable
 * [ ] Niveles de dificultad
 * [ ] Sonidos
 * [ ] Vibración
 * [ ] Tema claro
 * [ ] PWA
 * [ ] Instalación Android
 * [ ] Exportar estadísticas
 * [ ] Importar partidas
 * [ ] Partidas guardadas
 * [ ] Animaciones
 *
 ***********************************************************************/

/***********************************************************************
 *
 * TABLA DE CIERRES A 3 DARDOS
 *
 * Esta estructura será utilizada por el botón
 * "CONSULTAR CIERRES".
 *
 * Clave   -> Puntos restantes
 * Valor   -> Combinación recomendada
 *
 ***********************************************************************/

const CIERRES_TRES_DARDOS = {

99:"T19 + 10 + D16",
101:"T20 + 9 + D16",
102:"T16 + 14 + D20",
103:"T19 + 6 + D20",
104:"T16 + 16 + D20",
105:"T20 + 13 + D16",
106:"T20 + 6 + D20",
107:"T19 + 10 + D20",
108:"T20 + 16 + D16",
109:"T20 + 17 + D16",
110:"T20 + 10 + D20",
111:"T19 + 14 + D20",
112:"T20 + 20 + D16",
113:"T19 + 16 + D20",
114:"T20 + 14 + D20",
115:"T20 + 15 + D20",
116:"T20 + 16 + D20",
117:"T20 + 17 + D20",
118:"T20 + 18 + D20",
119:"T19 + 12 + BULL",
120:"T20 + 20 + D20",
121:"T20 + 11 + BULL",
122:"T18 + 18 + BULL",
123:"T19 + 16 + BULL",
124:"T20 + 14 + BULL",
125:"25 + T20 + T20",
126:"T19 + 19 + BULL",
127:"T20 + 17 + BULL",
128:"18 + T20 + BULL",
129:"19 + T20 + BULL",
130:"T20 + 20 + BULL",
131:"T20 + T13 + D16",
132:"25 + T19 + BULL",
133:"T20 + T19 + D8",
134:"T20 + T14 + D16",
135:"25 + T20 + BULL",
136:"T20 + T20 + D8",
137:"T20 + T19 + D10",
138:"T20 + T18 + D12",
139:"T19 + T14 + D20",
140:"T20 + T20 + D10",
141:"T20 + T19 + D12",
142:"T20 + T14 + D20",
143:"T20 + T17 + D16",
144:"T20 + T20 + D12",
145:"T20 + T15 + D20",
146:"T20 + T18 + D16",
147:"T20 + T17 + D18",
148:"T20 + T20 + D14",
149:"T20 + T19 + D16",
150:"T20 + T18 + T18",
151:"T20 + T17 + D20",
152:"T20 + T20 + D16",
153:"T20 + T19 + D18",
154:"T20 + T18 + D20",
155:"T20 + T19 + D19",
156:"T20 + T20 + D18",
157:"T20 + T19 + D20",
158:"T20 + T20 + D19",
160:"T20 + T20 + D20",
161:"T20 + T17 + BULL",
164:"T20 + T18 + BULL",
167:"T20 + T19 + BULL",
170:"T20 + T20 + BULL",
171:"T20 + T20 + T17",
174:"T20 + T20 + T18",
177:"T20 + T20 + T19",
180:"T20 + T20 + T20"

};


/***********************************************************************
 *
 * TABLA DE CIERRES A 2 DARDOS
 *
 ***********************************************************************/

const CIERRES_DOS_DARDOS = {

41:"9 + D16",
42:"10 + D16",
43:"3 + D20",
44:"4 + D20",
45:"13 + D16",
46:"6 + D20",
47:"7 + D20",
48:"16 + D16",
49:"17 + D16",
50:"18 + D16",
51:"19 + D16",
52:"20 + D16",
53:"13 + D20",
54:"14 + D20",
55:"15 + D20",
56:"16 + D20",
57:"17 + D20",
58:"18 + D20",
59:"19 + D20",
60:"20 + D20",
61:"T15 + D8",
62:"T10 + D16",
63:"T13 + D12",
64:"T16 + D8",
65:"T19 + D4",
66:"T14 + D12",
67:"T17 + D8",
68:"T20 + D4",
69:"T19 + D6",
70:"T18 + D8",
71:"T13 + D16",
72:"T16 + D12",
73:"T19 + D8",
74:"T14 + D16",
75:"T17 + D12",
76:"T20 + D8",
77:"T19 + D10",
78:"T18 + D12",
79:"T19 + D11",
80:"T20 + D10",
81:"T19 + D12",
82:"BULL + D16",
83:"T17 + D16",
84:"T20 + D12",
85:"T15 + D20",
86:"T18 + D16",
87:"T17 + D18",
88:"T20 + D14",
89:"T19 + D16",
90:"T20 + D15",
91:"T17 + D20",
92:"T20 + D16",
93:"T19 + D18",
94:"T18 + D20",
95:"T19 + D19",
96:"T20 + D18",
97:"T19 + D20",
98:"T20 + D19",
100:"T20 + D20"

};


/***********************************************************************
 *
 * OBTENER CIERRE RECOMENDADO
 *
 ***********************************************************************/

function obtenerCierre(){

    if(estado.modo!="501")
        return "";

    let restante = estado.global[estado.turno] - estado.temporal;

    if(estado.dardos.length==0){

        return CIERRES_TRES_DARDOS[restante] || "";

    }

    if(estado.dardos.length==1){

        return CIERRES_DOS_DARDOS[restante] || "";

    }

    return "";

}


/***********************************************************************
 *
 * MOSTRAR CIERRE
 *
 * Esta función abrirá posteriormente un modal moderno.
 * De momento utiliza un alert().
 *
 ***********************************************************************/

function consultarCierre(){

    const cierre = obtenerCierre();

    if(cierre==""){

        alert("No existe un cierre recomendado para esa puntuación.");

        return;

    }

    alert(

        "Puntos restantes: "
        +(estado.global[estado.turno]-estado.temporal)
        +"\n\n"
        +"Cierre recomendado:\n\n"
        +cierre

    );

}

/***********************************************************************
 *
 * ESTADÍSTICAS DE PARTIDA
 *
 * Estas estadísticas serán utilizadas posteriormente para
 * mostrar medias, porcentaje de checkout y exportar resultados.
 *
 ***********************************************************************/

estado.estadisticas = {

    lanzamientos: [],

    puntuacionTotal: [],

    mejorRonda: [],

    cien180: [],

    checkoutIntentos: [],

    checkoutExitos: []

};


/***********************************************************************
 *
 * INICIALIZAR ESTADÍSTICAS
 *
 ***********************************************************************/

function inicializarEstadisticas(){

    const n = estado.jugadores.length;

    estado.estadisticas.lanzamientos =
        new Array(n).fill(0);

    estado.estadisticas.puntuacionTotal =
        new Array(n).fill(0);

    estado.estadisticas.mejorRonda =
        new Array(n).fill(0);

    estado.estadisticas.cien180 =
        new Array(n).fill(0);

    estado.estadisticas.checkoutIntentos =
        new Array(n).fill(0);

    estado.estadisticas.checkoutExitos =
        new Array(n).fill(0);

}


/***********************************************************************
 *
 * REGISTRAR ESTADÍSTICAS
 *
 ***********************************************************************/

function registrarEstadisticas(valor){

    const j = estado.turno;

    estado.estadisticas.lanzamientos[j]++;

    estado.estadisticas.puntuacionTotal[j]+=valor;

}


/***********************************************************************
 *
 * REGISTRAR FINAL DE RONDA
 *
 ***********************************************************************/

function registrarFinRonda(){

    const j = estado.turno;

    let total = 0;

    estado.dardos.forEach(function(v){

        total += v;

    });

    if(total > estado.estadisticas.mejorRonda[j]){

        estado.estadisticas.mejorRonda[j] = total;

    }

    if(total==180){

        estado.estadisticas.cien180[j]++;

    }

}


/***********************************************************************
 *
 * MEDIA POR DARDO
 *
 ***********************************************************************/

function mediaPorDardo(jugador){

    if(estado.estadisticas.lanzamientos[jugador]==0)
        return 0;

    return (

        estado.estadisticas.puntuacionTotal[jugador]

        /

        estado.estadisticas.lanzamientos[jugador]

    ).toFixed(2);

}


/***********************************************************************
 *
 * MEDIA POR TRES DARDOS
 *
 ***********************************************************************/

function mediaTresDardos(jugador){

    return (

        mediaPorDardo(jugador)*3

    ).toFixed(2);

}


/***********************************************************************
 *
 * CHECKOUT %
 *
 ***********************************************************************/

function porcentajeCheckout(jugador){

    let intentos =
        estado.estadisticas.checkoutIntentos[jugador];

    if(intentos==0)
        return 0;

    return (

        estado.estadisticas.checkoutExitos[jugador]

        *100

        /

        intentos

    ).toFixed(1);

}


/***********************************************************************
 *
 * PANEL DE ESTADÍSTICAS
 *
 * Esta función será llamada cuando exista
 * el botón "ESTADÍSTICAS".
 *
 ***********************************************************************/

function mostrarEstadisticas(){

    let texto="";

    estado.jugadores.forEach(function(nombre,i){

        texto+=

        "Jugador: "+nombre+"\n"

        +"Media 3 dardos: "

        +mediaTresDardos(i)

        +"\n"

        +"Mejor ronda: "

        +estado.estadisticas.mejorRonda[i]

        +"\n"

        +"180s: "

        +estado.estadisticas.cien180[i]

        +"\n"

        +"Checkout %: "

        +porcentajeCheckout(i)

        +" %"

        +"\n\n";

    });

    alert(texto);

}


/***********************************************************************
 *
 * EXPORTAR ESTADO
 *
 ***********************************************************************/

function exportarPartida(){

    const datos = JSON.stringify(

        estado,

        null,

        2

    );

    const blob = new Blob(

        [datos],

        {

            type:"application/json"

        }

    );

    const enlace = document.createElement("a");

    enlace.href = URL.createObjectURL(blob);

    enlace.download =

        "partida_dardos.json";

    enlace.click();

}


/***********************************************************************
 *
 * IMPORTAR PARTIDA
 *
 ***********************************************************************/

function importarPartida(texto){

    estado = JSON.parse(texto);

    actualizar();

}


/***********************************************************************
 *
 * LIMPIAR LOCALSTORAGE
 *
 ***********************************************************************/

function borrarGuardado(){

    localStorage.removeItem(

        "dartsScore"

    );

}


/***********************************************************************
 *
 * NUEVA PARTIDA
 *
 ***********************************************************************/

function nuevaPartida(){

    borrarGuardado();

    location.reload();

}
