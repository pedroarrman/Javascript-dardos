/**
 * =========================================================
 * FUNCIÓN AUXILIAR PARA INCLUIR ARCHIVOS HTML (CSS / JS)
 * =========================================================
 * Esta función permite incluir otros archivos HTML dentro
 * de index.html usando:
 *
 * <?!= include('styles'); ?>
 *
 * Es la forma correcta y profesional en Apps Script
 */
function include(file) {
  return HtmlService
    .createHtmlOutputFromFile(file)
    .getContent();
}


/**
 * =========================================================
 * CARGA INICIAL DE LA APP (doGet)
 * =========================================================
 * IMPORTANTE:
 * - Usamos createTemplateFromFile (NO createHtmlOutputFromFile)
 * - Esto permite que se interpreten:
 *   <?!= include('styles'); ?>
 *
 * Si usas el otro método, verás el código en pantalla (tu error)
 */
function doGet() {

  // Creamos plantilla HTML (modo dinámico)
  let template = HtmlService.createTemplateFromFile("index");

  // Evaluamos la plantilla (render real)
  return template
    .evaluate()

    // Permite que la app funcione correctamente en iframe
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}


/**
 * =========================================================
 * GUARDAR ESTADO DEL JUEGO
 * =========================================================
 * Guarda el estado en memoria del script (persistente)
 */
function guardarEstado(estado) {

  PropertiesService
    .getScriptProperties()
    .setProperty("estado", JSON.stringify(estado));
}


/**
 * =========================================================
 * CARGAR ESTADO DEL JUEGO
 * =========================================================
 * Recupera el estado guardado previamente
 */
function cargarEstado() {

  let data = PropertiesService
    .getScriptProperties()
    .getProperty("estado");

  return data ? JSON.parse(data) : null;
}


/**
 * =========================================================
 * INICIAR JUEGO
 * =========================================================
 * Crea el estado inicial según el modo (501 o cricket)
 */
function iniciarJuego(modo, jugadores) {

  let estado = {

    // Modo de juego seleccionado
    modo: modo,

    // Lista de jugadores
    jugadores: jugadores,

    // Turno actual (empieza en 0)
    turno: 0,

    // Puntuación global
    global: modo === "501"
      ? new Array(jugadores.length).fill(501)
      : new Array(jugadores.length).fill(0),

    // Dardos lanzados en el turno actual
    dardos: [],

    // Puntuación acumulada en el turno (501)
    temporal: 0,

    // Contador de rondas por jugador
    ronda: new Array(jugadores.length).fill(0),

    // Estado de bust (cuando te pasas en 501)
    bust: false
  };

  guardarEstado(estado);
  return estado;
}


/**
 * =========================================================
 * LÓGICA DEL JUEGO 501 (VERSIÓN SÓLIDA)
 * =========================================================
 * - Controla bust
 * - Controla turno
 * - Controla acumulación por ronda
 */
function tirar501(valor) {

  let estado = cargarEstado();
  let t = estado.turno;

  // Añadir dardo
  estado.dardos.push(valor);

  // Acumular puntos del turno
  estado.temporal += valor;

  // Si nos pasamos → bust
  if (estado.temporal > estado.global[t]) {
    estado.bust = true;
  }

  // Si termina turno (3 dardos o bust)
  if (estado.dardos.length === 3 || estado.bust) {

    // Solo restamos si NO hay bust
    if (!estado.bust) {
      estado.global[t] -= estado.temporal;
    }

    // Reset turno
    estado.temporal = 0;
    estado.dardos = [];
    estado.bust = false;

    // Aumentar ronda del jugador
    estado.ronda[t]++;

    // Cambiar turno
    estado.turno = (estado.turno + 1) % estado.jugadores.length;
  }

  guardarEstado(estado);
  return estado;
}


/**
 * =========================================================
 * LÓGICA DEL CRICKET (VERSIÓN BÁSICA)
 * =========================================================
 */
function tirarCricket(valor) {

  let estado = cargarEstado();
  let t = estado.turno;

  // Guardar dardo
  estado.dardos.push(valor);

  // Solo puntúan números válidos
  if ([15,16,17,18,19,20,25].includes(valor)) {
    estado.global[t] += valor;
  }

  // Fin de turno (3 dardos)
  if (estado.dardos.length === 3) {

    estado.ronda[t]++;
    estado.dardos = [];

    estado.turno = (estado.turno + 1) % estado.jugadores.length;
  }

  guardarEstado(estado);
  return estado;
}
