/* =====================================================================
   Morelló Clínica Dental · home, ronda 2
   ===================================================================== */
(function () {
  'use strict';
  window.MORELLO = true;

  var html = document.documentElement;
  var quieto = html.classList.contains('quieto');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var finoPuntero = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  // Observa la entrada en pantalla: .en-vista mientras se ve y .visto la primera vez
  function vigilar(el, alEntrar, margen, umbral) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { el.classList.add('en-vista', 'visto'); if (alEntrar) alEntrar(); return; }
    var primera = true;
    new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        el.classList.toggle('en-vista', e.isIntersecting);
        if (e.isIntersecting && primera) { primera = false; el.classList.add('visto'); if (alEntrar) alEntrar(); }
      });
    }, { rootMargin: margen || '0px 0px -12% 0px', threshold: umbral || 0 }).observe(el);
  }
  // Parte un titular en palabras (.pal) sin cambiar su texto
  function enPalabras(el) {
    if (!el || el.querySelector('.pal')) return;
    var palabras = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    palabras.forEach(function (p, i) {
      var s = document.createElement('span'); s.className = 'pal'; s.style.setProperty('--i', i); s.textContent = p;
      el.appendChild(s);
      if (i < palabras.length - 1) el.appendChild(document.createTextNode(' '));
    });
  }

  /* ---------- cabecera: sombra al bajar y menú del móvil ---------- */
  var cab = $('.cabecera');
  var alBajar = function () { cab.classList.toggle('con-sombra', window.scrollY > 8); };
  window.addEventListener('scroll', alBajar, { passive: true }); alBajar();
  var menu = $('#menu-movil'), botonMenu = $('.cabecera__menu');
  function abrirMenu(abrir) {
    menu.hidden = !abrir;
    botonMenu.setAttribute('aria-expanded', String(abrir));
    document.body.style.overflow = abrir ? 'hidden' : '';
    if (abrir) { $$('nav li', menu).forEach(function (li, i) { li.style.setProperty('--n', i); }); $('.menu-movil__cerrar').focus(); }
    else botonMenu.focus();
  }
  botonMenu.addEventListener('click', function () { abrirMenu(true); });
  $('.menu-movil__cerrar').addEventListener('click', function () { abrirMenu(false); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) { menu.hidden = true; botonMenu.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) abrirMenu(false); });

  /* ---------- titulares de sección: suben palabra a palabra al entrar ---------- */
  function alinear(el) {
    var palabras = el.textContent.trim().split(/\s+/), n = 0;
    var envoltura = document.createElement('span'); envoltura.className = 'alinea__texto';
    palabras.forEach(function (p, pi) {
      var w = document.createElement('span'); w.className = 'alinea__palabra';
      Array.prototype.forEach.call(p, function (ch) {
        var l = document.createElement('span'); l.className = 'alinea__letra'; l.textContent = ch;
        var a = function (s) { var x = Math.sin((n + 1) * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };
        l.style.setProperty('--lg', ((a(1) - .5) * 26).toFixed(1) + 'deg');
        l.style.setProperty('--ly', ((a(2) - .5) * .3).toFixed(3) + 'em');
        l.style.setProperty('--lx', ((a(3) - .5) * .1).toFixed(3) + 'em');
        l.style.setProperty('--li', n);
        w.appendChild(l); n++;
      });
      envoltura.appendChild(w);
      if (pi < palabras.length - 1) envoltura.appendChild(document.createTextNode(' '));
    });
    var alambre = document.createElement('span'); alambre.className = 'alinea__alambre'; alambre.setAttribute('aria-hidden', 'true');
    envoltura.appendChild(alambre);
    el.textContent = ''; el.appendChild(envoltura);
    el.setAttribute('data-alinea', '');
    // cada letra se endereza cuando el alambre pasa por ella
    var total = Math.max(n - 1, 1);
    $$('.alinea__letra', el).forEach(function (l, k) { l.style.setProperty('--ld', (.12 + k / total * .75).toFixed(2) + 's'); });
    vigilar(el, null, '0px 0px -10% 0px');
  }
  $$('main h2').forEach(function (h) { if (h.closest('.panel')) return; alinear(h); });
  // bandas cian: se subrayan al entrar
  $$('.banda').forEach(function (b) {
    var t = document.createElement('span'); t.className = 'banda__txt';
    while (b.firstChild) t.appendChild(b.firstChild);
    b.appendChild(t);
    if (b.closest('.panel') || b.closest('.hero')) return;
    b.setAttribute('data-subraya', ''); vigilar(b, null, '0px 0px -8% 0px');
  });
  $$('.cab-sec__texto, .equipo__intro, .contacto, .preguntas__intro, .cita__texto, .tarjeta__campos').forEach(function (el) { el.setAttribute('data-entra', ''); vigilar(el, null, '0px 0px -8% 0px'); });

  /* ---------- horario en vivo (hora de Madrid; ?ahora=d-h.mm para probar) ---------- */
  var HORARIO = { 1: [[600, 840], [960, 1200]], 2: [[600, 840]], 3: [[540, 840], [960, 1200]], 4: [[960, 1200]], 5: [[600, 840]] };
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  function ahoraMadrid() {
    var m = location.search.match(/[?&]ahora=(\d)-(\d{1,2})(?:\.(\d{2}))?/);
    if (m) return { d: +m[1], min: +m[2] * 60 + (+m[3] || 0) };
    try {
      var p = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      var get = function (t) { var x = p.find(function (q) { return q.type === t; }); return x ? x.value : ''; };
      var dias = { dom: 0, lun: 1, mar: 2, mié: 3, mie: 3, jue: 4, vie: 5, sáb: 6, sab: 6 };
      return { d: dias[get('weekday').replace('.', '').toLowerCase()], min: +get('hour') * 60 + +get('minute') };
    } catch (e) { var n = new Date(); return { d: n.getDay(), min: n.getHours() * 60 + n.getMinutes() }; }
  }
  var hora = function (min) { var h = Math.floor(min / 60), m = min % 60; return h + ':' + String(m).padStart(2, '0'); };
  var falta = function (min) { var h = Math.floor(min / 60), m = min % 60; return (h ? h + ' h' + (m ? ' ' : '') : '') + (m ? m + ' min' : ''); };
  function estado() {
    var a = ahoraMadrid(), hoy = HORARIO[a.d] || [];
    for (var i = 0; i < hoy.length; i++) if (a.min >= hoy[i][0] && a.min < hoy[i][1]) return { a: a, abierto: true, corto: 'Abierto ahora, hasta las ' + hora(hoy[i][1]), largo: 'Abierto ahora · cierra en ' + falta(hoy[i][1] - a.min) };
    for (var j = 0; j < hoy.length; j++) if (a.min < hoy[j][0]) return { a: a, abierto: false, corto: 'Cerrado. Abrimos hoy a las ' + hora(hoy[j][0]), largo: 'Cerrado · abrimos en ' + falta(hoy[j][0] - a.min) };
    for (var k = 1; k <= 7; k++) {
      var dd = (a.d + k) % 7;
      if (HORARIO[dd]) { var t = 'Cerrado. Abrimos ' + (k === 1 ? 'mañana' : 'el ' + DIAS[dd]) + ' a las ' + hora(HORARIO[dd][0][0]); return { a: a, abierto: false, corto: t, largo: t.replace('. ', ' · ') }; }
    }
  }
  var agenda = $('[data-agenda]');
  function pintarEstado() {
    var e = estado(); if (!e) return;
    $$('[data-estado-texto]').forEach(function (el) { el.textContent = e.corto; });
    $$('[data-horario-estado]').forEach(function (el) { el.textContent = e.largo; });
    $$('[data-estado], [data-horario-estado]').forEach(function (el) { el.setAttribute('data-abierto', e.abierto ? 'si' : 'no'); });
    var wa = $('[data-wa-estado]'); if (wa && !wa.classList.contains('escribe')) wa.textContent = e.abierto ? 'en línea' : 'responde en horario de consulta';
    if (agenda) {
      $$('.agenda__fila[data-dia]', agenda).forEach(function (f) { f.classList.toggle('es-hoy', +f.getAttribute('data-dia') === e.a.d); });
      var dentro = HORARIO[e.a.d] && e.a.min >= 540 && e.a.min <= 1200;
      agenda.classList.toggle('con-ahora', !!dentro);
      if (dentro) {
        agenda.style.setProperty('--ahora', ((e.a.min / 60 - 9) / 11 * 100).toFixed(2));
        var linea = $('[data-ahora] span', agenda); if (linea) linea.textContent = 'Ahora · ' + hora(e.a.min);
      }
    }
  }
  pintarEstado(); setInterval(pintarEstado, 30000);
  if (agenda) vigilar(agenda, pintarEstado);

  /* ---------- hero: la lámpara del gabinete presenta a los doctores ---------- */
  var hero = $('.hero'), fig = $('[data-gabinete]'), h1 = $('.hero__titulo');
  enPalabras(h1);
  var puntos = $$('.punto', fig);
  (function lampara() {
    var svg = $('.lampara svg', fig), cabeza = $('.lampara__cabeza', fig);
    var palabrasH1 = $$('.pal', h1), bandaHero = $('.hero .banda');
    var titular = function () { palabrasH1.forEach(function (p) { p.classList.add('encendida'); }); h1.classList.add('visto'); hero.classList.add('titulado'); if (bandaHero) { bandaHero.setAttribute('data-subraya', ''); bandaHero.classList.add('visto'); } };
    if (!svg || !cabeza) { titular(); return; }
    if (quieto) { hero.classList.add('encendida'); titular(); return; }
    if (bandaHero) bandaHero.setAttribute('data-subraya', '');
    setTimeout(titular, 4000); // por si algo falla, el titular nunca se queda apagado
    var cur = null, dest = null, raf = 0, manual = false, ultimo = 0, gira = null, paso = 0, enVista = true, rapidez = .085;
    var apoyado = function () { return getComputedStyle($('.hero__texto')).position === 'absolute'; };
    function caraDe(p) { var c = p.getAttribute('data-cara').split(','), r = fig.getBoundingClientRect(); return { x: r.width * c[0] / 100, y: r.height * c[1] / 100 }; }
    function objetivo(nombre) {
      var r = fig.getBoundingClientRect();
      if (nombre === 'titulo') { var t = h1.getBoundingClientRect(); return { x: t.left - r.left + t.width * .42, y: t.top - r.top + t.height * .5 }; }
      return caraDe($('.punto[data-doctor="' + nombre + '"]', fig));
    }
    function pivote() {
      var p = svg.createSVGPoint(); p.x = 110; p.y = 100;
      var q = p.matrixTransform(svg.getScreenCTM()), r = fig.getBoundingClientRect();
      return { x: q.x - r.left, y: q.y - r.top };
    }
    function pintar() {
      var pv = pivote(), ang = Math.atan2(cur.y - pv.y, cur.x - pv.x) * 180 / Math.PI - 90;
      ang = Math.max(-32, Math.min(32, ang * .55));
      cabeza.style.transform = 'rotate(' + ang.toFixed(1) + 'deg)';
      var radio = fig.getBoundingClientRect().width * .085;
      puntos.forEach(function (p) { var c = caraDe(p); p.classList.toggle('iluminado', Math.hypot(c.x - cur.x, c.y - cur.y) < radio); });
    }
    function bucle() {
      raf = 0;
      if (!cur || !dest) return;
      cur.x += (dest.x - cur.x) * rapidez; cur.y += (dest.y - cur.y) * rapidez;
      pintar();
      if (Math.hypot(dest.x - cur.x, dest.y - cur.y) > .4) raf = requestAnimationFrame(bucle);
    }
    function ir(p) { dest = p; if (!cur) cur = { x: p.x, y: p.y - 40 }; if (!raf) raf = requestAnimationFrame(bucle); }
    var RECORRIDO = ['joan', 'carmen', 'titulo'];
    function recorrer() {
      clearTimeout(gira);
      if (manual || !enVista) return;
      var lista = apoyado() ? RECORRIDO : RECORRIDO.slice(0, 2);
      ir(objetivo(lista[paso % lista.length]));
      paso++;
      gira = setTimeout(recorrer, paso <= lista.length ? 2600 : 4200);
    }
    // se enciende: parpadeo del led y la luz escribe el titular palabra a palabra; luego recorre a los doctores
    function escribir(fin) {
      var i = 0, f = fig.getBoundingClientRect(), ap = apoyado();
      rapidez = .22;
      (function siguiente() {
        if (i >= palabrasH1.length) { rapidez = .085; titular(); setTimeout(fin, 700); return; }
        var w = palabrasH1[i];
        if (ap) { var r = w.getBoundingClientRect(); ir({ x: r.left - f.left + r.width / 2, y: r.top - f.top + r.height * .55 }); }
        setTimeout(function () { w.classList.add('encendida'); }, ap ? 140 : 0);
        i++; setTimeout(siguiente, ap ? 190 : 120);
      })();
    }
    setTimeout(function () {
      hero.classList.add('encendiendo', 'encendida');
      if (!apoyado()) ir(objetivo('joan'));
      setTimeout(function () { escribir(recorrer); }, 450);
    }, 350);
    // con el ratón, la lámpara sigue al cursor
    if (finoPuntero) {
      $('.hero__escena').addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = fig.getBoundingClientRect();
        manual = true; ultimo = Date.now(); clearTimeout(gira);
        ir({ x: e.clientX - r.left, y: e.clientY - r.top });
        setTimeout(function () { if (Date.now() - ultimo >= 3400) { manual = false; recorrer(); } }, 3500);
      });
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) {
      enVista = e[0].isIntersecting; hero.classList.toggle('fuera', !enVista);
      if (enVista && !manual) recorrer(); else clearTimeout(gira);
    }).observe(hero);
    window.addEventListener('resize', function () { if (dest) { cur = null; ir(objetivo(apoyado() ? 'titulo' : 'joan')); } });
    // el circulito lleva un brillo que le da la vuelta
    puntos.forEach(function (p) { var b = document.createElement('span'); b.className = 'punto__brillo'; b.setAttribute('aria-hidden', 'true'); $('.punto__boton', p).appendChild(b); });
  })();
  // tocar el aro de un doctor también lo presenta
  $$('.punto__boton').forEach(function (b) {
    b.addEventListener('click', function () {
      var abierto = b.getAttribute('aria-expanded') === 'true';
      $$('.punto__boton').forEach(function (o) { o.setAttribute('aria-expanded', 'false'); });
      b.setAttribute('aria-expanded', String(!abierto));
    });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.punto')) $$('.punto__boton').forEach(function (o) { o.setAttribute('aria-expanded', 'false'); }); });

  /* ---------- odontograma ---------- */
  var odo = $('[data-odo]');
  if (odo) {
    var svgO = $('.odo__svg', odo);
    var opciones = $$('.opcion', odo);
    var paneles = $$('.panel', odo);
    var globo = $('.odo__globo', odo);
    var lienzo = $('.odo__lienzo', odo);
    var actual = '';
    var temporizadores = [];
    $$('.panel__titulo', odo).forEach(enPalabras);
    enPalabras($('.panel__lema', odo));
    var IMPLICA = {
      ortodoncia: function (n, p) { return p <= 7; }, invisalign: function (n, p) { return p <= 7; },
      estetica: function (n) { return /^[1-4][1-3]$/.test(n); }, blanqueamiento: function (n, p) { return p <= 5; },
      implantes: function (n) { return n === '45' || n === '46' || n === '47'; }, protesis: function (n) { return n === '24' || n === '25' || n === '26'; },
      endodoncia: function (n) { return n === '36'; }, conservadora: function (n) { return /^(16|26|36|46|17|47)$/.test(n); },
    };
    var NOMBRE = {}; opciones.forEach(function (o) { NOMBRE[o.getAttribute('data-t')] = $('.opcion__nombre', o).textContent.trim(); });
    var limpiar = function () { temporizadores.forEach(clearTimeout); temporizadores = []; };
    var luego = function (fn, ms) { temporizadores.push(setTimeout(fn, ms)); };

    function elegir(t) {
      limpiar();
      odo.classList.add('tocado');
      var mismo = t === actual;
      actual = t;
      opciones.forEach(function (o) { o.setAttribute('aria-pressed', String(o.getAttribute('data-t') === t)); });
      paneles.forEach(function (p) {
        var activo = p.getAttribute('data-panel') === (t || 'inicio');
        if (activo && !quieto) { p.classList.remove('is-activo'); void p.offsetWidth; }
        p.classList.toggle('is-activo', activo);
        if (activo) p.removeAttribute('inert'); else p.setAttribute('inert', '');
      });
      var f = IMPLICA[t];
      $$('.arcadas--adulto .diente', svgO).forEach(function (d) { var n = d.getAttribute('data-n'); d.classList.toggle('implicado', !!f && f(n, +n[1])); });
      svgO.classList.toggle('con-foco', !!f);
      if (quieto) { svgO.setAttribute('data-t', t); return; }
      svgO.classList.remove('torcidos', 'marfil');
      svgO.setAttribute('data-t', '');
      void svgO.getBoundingClientRect();
      if (t === 'ortodoncia' || t === 'invisalign') {
        svgO.classList.add('sin-trans', 'torcidos');
        void svgO.getBoundingClientRect();
        svgO.classList.remove('sin-trans');
        svgO.setAttribute('data-t', t);
        luego(function () { svgO.classList.remove('torcidos'); }, t === 'invisalign' ? 900 : 700);
      } else if (t === 'blanqueamiento') {
        svgO.classList.add('marfil'); svgO.setAttribute('data-t', t);
        luego(function () { svgO.classList.remove('marfil'); }, 450);
      } else {
        luego(function () { svgO.setAttribute('data-t', t); }, mismo ? 60 : 30);
      }
    }
    opciones.forEach(function (o) {
      var fondo = document.createElement('span'); fondo.className = 'opcion__fondo'; fondo.setAttribute('aria-hidden', 'true');
      o.insertBefore(fondo, o.firstChild);
      o.addEventListener('click', function () { cerrarGlobo(); elegir(o.getAttribute('data-t')); });
    });
    var RELACION = {
      inc: ['estetica', 'blanqueamiento', 'ortodoncia', 'invisalign'], can: ['estetica', 'ortodoncia', 'invisalign', 'blanqueamiento'],
      pre: ['conservadora', 'endodoncia', 'ortodoncia', 'protesis'], mol: ['conservadora', 'endodoncia', 'implantes', 'periodoncia'],
      cordal: ['conservadora', 'periodoncia'], leche: ['odontopediatria'],
    };
    var dienteElegido = null;
    function nombreDiente(d) { var n = d.getAttribute('data-n'), nom = d.getAttribute('data-nombre'); return '<b>' + n + '</b>' + nom.charAt(0).toUpperCase() + nom.slice(1); }
    function situar(d) {
      var r = d.getBoundingClientRect(), base = lienzo.getBoundingClientRect();
      globo.hidden = false;
      var gw = globo.offsetWidth, gh = globo.offsetHeight;
      var x = r.left - base.left + r.width / 2 - gw / 2; x = Math.max(-8, Math.min(x, base.width - gw + 8));
      var arriba = r.top - base.top - gh - 10, y = arriba < -20 ? r.bottom - base.top + 10 : arriba;
      globo.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
    }
    function mostrarNombre(d) { if (!globo.hidden && !globo.classList.contains('solo-nombre')) return; globo.classList.add('solo-nombre'); $('.odo__globo-nombre', globo).innerHTML = nombreDiente(d); situar(d); }
    function cerrarGlobo() {
      globo.hidden = true; globo.classList.remove('solo-nombre');
      if (dienteElegido) { dienteElegido.classList.remove('es-elegido'); var nn = $('.num[data-n="' + dienteElegido.getAttribute('data-n') + '"]', svgO); if (nn) nn.classList.remove('es-elegido'); dienteElegido = null; }
    }
    function abrirDiente(d) {
      cerrarGlobo();
      dienteElegido = d; d.classList.add('es-elegido');
      var nn = $('.num[data-n="' + d.getAttribute('data-n') + '"]', svgO); if (nn) nn.classList.add('es-elegido');
      var n = d.getAttribute('data-n'), tipo = d.getAttribute('data-tipo');
      var clave = +n[0] >= 5 ? 'leche' : (n[1] === '8' ? 'cordal' : tipo);
      $('.odo__globo-nombre', globo).innerHTML = nombreDiente(d);
      var cont = $('.odo__globo-opciones', globo); cont.innerHTML = '';
      RELACION[clave].forEach(function (t) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'mini'; b.textContent = NOMBRE[t];
        b.addEventListener('click', function () { cerrarGlobo(); elegir(t); });
        cont.appendChild(b);
      });
      situar(d); odo.classList.add('tocado');
    }
    svgO.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var d = e.target.closest('.diente');
      if (d && (globo.classList.contains('solo-nombre') || globo.hidden)) mostrarNombre(d);
      else if (!d && globo.classList.contains('solo-nombre')) { globo.hidden = true; globo.classList.remove('solo-nombre'); }
    });
    svgO.addEventListener('pointerleave', function () { if (globo.classList.contains('solo-nombre')) { globo.hidden = true; globo.classList.remove('solo-nombre'); } });
    svgO.addEventListener('click', function (e) { var d = e.target.closest('.diente'); if (d) { e.stopPropagation(); abrirDiente(d); } });
    document.addEventListener('click', function (e) { if (!globo.hidden && !e.target.closest('.odo__globo') && !e.target.closest('.diente')) cerrarGlobo(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !globo.hidden) cerrarGlobo(); });
    vigilar(odo, null, '0px 0px -18% 0px');
    // ola: mientras nadie elige, cada tratamiento hace su gesto por turnos
    var lista = $('.odo__lista', odo), olaI = 0, sobreLista = false;
    lista.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { sobreLista = true; opciones.forEach(function (o) { o.classList.remove('saluda'); }); } });
    lista.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') sobreLista = false; });
    (function ola() {
      if (!quieto && !actual && !sobreLista && odo.classList.contains('en-vista')) {
        opciones.forEach(function (o) { o.classList.remove('saluda'); });
        var o = opciones[olaI++ % opciones.length]; void o.offsetWidth; o.classList.add('saluda');
      } else opciones.forEach(function (o) { o.classList.remove('saluda'); });
      setTimeout(ola, 1500);
    })();
    // el botón de ayuda enseña tres tratamientos seguidos; cualquier elección lo detiene
    var demo = null, ayuda = $('.panel__ayuda', odo);
    var flecha = function () { var ancho = window.innerWidth >= 1100; ayuda.style.setProperty('--hacia', ancho ? '180deg' : '-90deg'); ayuda.style.setProperty('--empuje-x', ancho ? '-5px' : '0px'); ayuda.style.setProperty('--empuje-y', ancho ? '0px' : '-5px'); };
    flecha(); window.addEventListener('resize', flecha);
    ayuda.addEventListener('click', function () {
      var pasos = ['ortodoncia', 'estetica', 'implantes'], k = 0;
      (function siguiente() { elegir(pasos[k]); k++; if (k < pasos.length) demo = setTimeout(siguiente, 3400); })();
    });
    opciones.forEach(function (o) { o.addEventListener('click', function () { clearTimeout(demo); }); });
    svgO.addEventListener('click', function () { clearTimeout(demo); });
  }

  /* ---------- cualquier «Pedir cita de…» deja el tratamiento escrito en la tarjeta ---------- */
  var msg = $('#f-msg');
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-tratamiento]');
    if (!a || !msg) return;
    var t = a.getAttribute('data-tratamiento');
    var resto = msg.value.replace(/^Me interesa: [^\n]*\n?/, '');
    msg.value = t ? 'Me interesa: ' + t + '.' + (resto ? '\n' + resto : '') : resto;
  });

  /* ---------- equipo: la red de dónde se formó cada doctor ---------- */
  var red = $('[data-red]');
  if (red) {
    var lineas = $('.red__lineas', red), nodos = $$('.nodo', red), retratos = $$('.retrato', red), filaRetratos = $('.retratos', red), listaNodos = $('.red__nodos', red);
    var tocadoRed = false, giroRed = null, iRed = 0, activos = [];
    function dibujar() {
      if (getComputedStyle(lineas).display === 'none') return;
      var b = lineas.getBoundingClientRect(), trazos = '', puntosFin = '';
      lineas.setAttribute('viewBox', '0 0 ' + Math.round(b.width) + ' ' + Math.round(b.height));
      nodos.forEach(function (n) {
        var rn = n.getBoundingClientRect(), x1 = rn.left + rn.width / 2 - b.left, y1 = rn.bottom - b.top;
        n.getAttribute('data-de').split(' ').forEach(function (id) {
          var rf = $('.retrato[data-doctor="' + id + '"] .retrato__foto', red).getBoundingClientRect();
          var x2 = rf.left + rf.width / 2 - b.left, y2 = rf.top - b.top, cy = y1 + (y2 - y1) * .55;
          trazos += '<path data-d="' + id + '" d="M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'C' + x1.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + (y1 + (y2 - y1) * .45).toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '"/>';
        });
      });
      retratos.forEach(function (r) { var rf = $('.retrato__foto', r).getBoundingClientRect(); puntosFin += '<circle data-d="' + r.getAttribute('data-doctor') + '" cx="' + (rf.left + rf.width / 2 - b.left).toFixed(1) + '" cy="' + (rf.top - b.top).toFixed(1) + '" r="4.5"/>'; });
      lineas.innerHTML = trazos + puntosFin;
      marcarLineas();
    }
    function marcarLineas() { $$('path, circle', lineas).forEach(function (p) { p.classList.toggle('activa', activos.indexOf(p.getAttribute('data-d')) >= 0); }); }
    function activar(ids) {
      activos = ids;
      red.classList.toggle('enfocada', !!ids.length); filaRetratos.classList.toggle('enfocada', !!ids.length);
      retratos.forEach(function (r) { r.classList.toggle('activo', ids.indexOf(r.getAttribute('data-doctor')) >= 0); });
      nodos.forEach(function (n) { var de = n.getAttribute('data-de').split(' '); n.classList.toggle('activo', ids.some(function (id) { return de.indexOf(id) >= 0; })); });
      marcarLineas();
    }
    function girar() {
      clearTimeout(giroRed);
      if (tocadoRed || quieto || !red.classList.contains('en-vista')) return;
      activar([retratos[iRed % retratos.length].getAttribute('data-doctor')]); iRed++;
      giroRed = setTimeout(girar, 2600);
    }
    retratos.forEach(function (r) {
      r.addEventListener('pointerover', function (e) { if (e.pointerType !== 'mouse') return; tocadoRed = true; clearTimeout(giroRed); activar([r.getAttribute('data-doctor')]); });
      $('.retrato__foto', r).addEventListener('focus', function () { tocadoRed = true; clearTimeout(giroRed); activar([r.getAttribute('data-doctor')]); });
    });
    nodos.forEach(function (n) { n.addEventListener('pointerover', function (e) { if (e.pointerType !== 'mouse') return; tocadoRed = true; clearTimeout(giroRed); activar(n.getAttribute('data-de').split(' ')); }); });
    red.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') activar([]); });
    // en el móvil, el doctor que queda en el centro de la fila enciende sus nodos
    filaRetratos.addEventListener('scroll', function () {
      if (getComputedStyle(lineas).display !== 'none') return;
      tocadoRed = true; clearTimeout(giroRed);
      var c = filaRetratos.getBoundingClientRect(), medio = c.left + c.width / 2, mejor = null, dist = 1e9;
      retratos.forEach(function (r) { var b = r.getBoundingClientRect(), d = Math.abs(b.left + b.width / 2 - medio); if (d < dist) { dist = d; mejor = r; } });
      if (mejor) activar([mejor.getAttribute('data-doctor')]);
    }, { passive: true });
    vigilar(red, function () { listaNodos.classList.add('visto'); filaRetratos.classList.add('visto'); setTimeout(dibujar, 50); setTimeout(dibujar, 1100); setTimeout(girar, 1200); }, '0px 0px -15% 0px');
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { if (e[0].isIntersecting) girar(); else clearTimeout(giroRed); }).observe(red);
    var rsRed; window.addEventListener('resize', function () { clearTimeout(rsRed); rsRed = setTimeout(dibujar, 150); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(dibujar);
  }
  var ficha = $('#ficha');
  $$('[data-ficha]').forEach(function (b) {
    b.addEventListener('click', function () {
      var datos = document.getElementById(b.getAttribute('data-ficha'));
      var cont = b.closest('.retrato') || b.closest('.doctor');
      $('#ficha-titulo').textContent = cont.querySelector('h3').textContent;
      $('.ficha__cuerpo', ficha).innerHTML = datos.innerHTML;
      if (ficha.showModal) ficha.showModal(); else ficha.setAttribute('open', '');
      ficha._volver = b;
    });
  });
  if (ficha) {
    $('.ficha__cerrar', ficha).addEventListener('click', function () { ficha.close(); });
    ficha.addEventListener('click', function (e) { if (e.target === ficha) ficha.close(); });
    ficha.addEventListener('close', function () { if (ficha._volver) ficha._volver.focus(); });
  }
  vigilar($('.consulta'), null, '0px');

  /* ---------- la clínica: se abre la puerta y se recorre ---------- */
  var visita = $('[data-visita]');
  if (visita) {
    var salas = $$('.sala', visita), paradas = $$('.parada', visita), iSala = 0, autoVisita = true, pasoVisita = null, ocupada = false;
    var PASO = 6500;
    visita.style.setProperty('--paso', PASO + 'ms');
    paradas.forEach(function (p) { var s = document.createElement('span'); s.className = 'parada__progreso'; s.setAttribute('aria-hidden', 'true'); p.appendChild(s); });
    function marcar(n) {
      salas.forEach(function (s, k) { s.classList.toggle('is-activa', k === n); });
      paradas.forEach(function (p, k) { p.setAttribute('aria-pressed', String(k === n)); });
    }
    function ir(n) {
      n = (n + salas.length) % salas.length;
      if (quieto) { iSala = n; marcar(n); return; }
      if (ocupada) return;
      ocupada = true;
      visita.classList.remove('abierta');
      setTimeout(function () { iSala = n; marcar(n); visita.classList.add('abierta'); ocupada = false; programar(); }, 900);
    }
    function programar() {
      clearTimeout(pasoVisita);
      visita.classList.remove('en-marcha'); void visita.offsetWidth;
      if (!autoVisita || quieto || encima || !visita.classList.contains('en-vista')) return;
      visita.classList.add('en-marcha');
      pasoVisita = setTimeout(function () { ir(iSala + 1); }, PASO);
    }
    var encima = false;
    visita.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'mouse') return; encima = true; clearTimeout(pasoVisita); visita.classList.remove('en-marcha'); });
    visita.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'mouse') return; encima = false; if (visita.classList.contains('abierta')) programar(); });
    paradas.forEach(function (p, k) { p.addEventListener('click', function () { autoVisita = false; clearTimeout(pasoVisita); visita.classList.remove('en-marcha'); if (k !== iSala) ir(k); }); });
    vigilar(visita, function () { if (quieto) return; setTimeout(function () { visita.classList.add('abierta'); setTimeout(programar, 1300); }, 450); }, '0px 0px -20% 0px');
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { if (e[0].isIntersecting) { if (visita.classList.contains('abierta')) programar(); } else { clearTimeout(pasoVisita); visita.classList.remove('en-marcha'); } }).observe(visita);
    // visor a pantalla completa
    var visor = $('#visor'), vImg = $('.visor__marco img', visor), vPie = $('.visor__marco figcaption', visor), vI = 0;
    function verFoto(i) {
      vI = (i + salas.length) % salas.length;
      var s = salas[vI], src = s.getAttribute('data-grande');
      var pre = new Image(); pre.src = src;
      vImg.classList.add('cambia');
      var poner = function () { vImg.src = src; vImg.alt = $('img', s).alt; vPie.textContent = $('.sala__pie', s).textContent; vImg.classList.remove('cambia'); };
      if (pre.complete) poner(); else { pre.onload = poner; pre.onerror = poner; }
      var sig = new Image(); sig.src = salas[(vI + 1) % salas.length].getAttribute('data-grande');
    }
    salas.forEach(function (s, i) { s.addEventListener('click', function () { autoVisita = false; clearTimeout(pasoVisita); visita.classList.remove('en-marcha'); verFoto(i); if (visor.showModal) visor.showModal(); else visor.setAttribute('open', ''); visor._volver = s; }); });
    $('.visor__btn--ant', visor).addEventListener('click', function () { verFoto(vI - 1); });
    $('.visor__btn--sig', visor).addEventListener('click', function () { verFoto(vI + 1); });
    $('.visor__btn--cerrar', visor).addEventListener('click', function () { visor.close(); });
    visor.addEventListener('click', function (e) { if (e.target === visor) visor.close(); });
    visor.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') verFoto(vI - 1); if (e.key === 'ArrowRight') verFoto(vI + 1); });
    visor.addEventListener('close', function () { if (visor._volver) visor._volver.focus(); });
  }

  /* ---------- preguntas: una conversación de WhatsApp ---------- */
  var chat = $('[data-chat]'), cajaPreguntas = $('[data-chat-preguntas]'), waEstado = $('[data-wa-estado]');
  if (chat && cajaPreguntas) {
    var burbujas = $$('.burbuja', chat), pares = [];
    for (var b = 0; b + 1 < burbujas.length; b += 2) pares.push({ p: burbujas[b].textContent.trim(), r: burbujas[b + 1].innerHTML });
    var ahoraTxt = function () { try { return new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()); } catch (e) { var n = new Date(); return n.getHours() + ':' + String(n.getMinutes()).padStart(2, '0'); } };
    var VISTOS = '<svg class="burbuja__vistos" viewBox="0 0 16 10" aria-hidden="true"><path d="m1 5.5 3 3L10 1.5M6.5 8.5l1 .5L14.5 1.5"/></svg>';
    chat.innerHTML = '<span class="wa__fecha">Hoy</span>';
    var ocupado = false, tocado = false;
    var alFinal = function () { chat.scrollTo({ top: chat.scrollHeight, behavior: quieto ? 'auto' : 'smooth' }); };
    var decir = function (quien, contenido) {
      var p = document.createElement('p');
      p.className = 'burbuja burbuja--' + quien + ' nueva';
      p.innerHTML = contenido + '<span class="burbuja__hora">' + ahoraTxt() + (quien === 'yo' ? VISTOS : '') + '</span>';
      chat.appendChild(p); alFinal(); return p;
    };
    var escribiendo = function () { var d = document.createElement('div'); d.className = 'escribiendo'; d.setAttribute('aria-hidden', 'true'); d.innerHTML = '<span></span><span></span><span></span>'; chat.appendChild(d); alFinal(); return d; };
    async function preguntar(i) {
      if (ocupado || !pares[i]) return;
      ocupado = true;
      var mia = decir('yo', pares[i].p);
      var boton = cajaPreguntas.querySelector('[data-i="' + i + '"]'); if (boton) boton.classList.add('hecha');
      if (!quieto) {
        await espera(550); var v = $('.burbuja__vistos', mia); if (v) v.classList.add('leido');
        waEstado.classList.add('escribe'); var antes = waEstado.textContent; waEstado.textContent = 'escribiendo…';
        var t = escribiendo(); await espera(1100); t.remove();
        waEstado.classList.remove('escribe'); waEstado.textContent = antes;
      }
      decir('clinica', pares[i].r);
      ocupado = false;
    }
    decir('clinica', 'Hola, somos Morelló Clínica Dental. Toque una pregunta y le respondemos aquí.');
    cajaPreguntas.innerHTML = pares.map(function (x, i) { return '<button type="button" class="respuesta" data-i="' + i + '" style="--i:' + i + '"><svg class="ico" aria-hidden="true"><use href="#i-flecha"/></svg>' + x.p + '</button>'; }).join('');
    cajaPreguntas.hidden = false;
    cajaPreguntas.addEventListener('click', function (e) { var bt = e.target.closest('.respuesta'); if (!bt) return; tocado = true; preguntar(+bt.getAttribute('data-i')); });
    if (quieto) preguntar(0);
    else if ('IntersectionObserver' in window) {
      var ioChat = new IntersectionObserver(function (e) { if (!e[0].isIntersecting) return; ioChat.disconnect(); setTimeout(function () { if (!tocado) preguntar(0); }, 800); }, { threshold: .5 });
      ioChat.observe(chat);
    }
  }

  /* ---------- la tarjeta de cita: turnos según el horario, sello y correo ya escrito ---------- */
  var form = $('#formulario');
  if (form) {
    var fecha = $('#f-fecha', form), aviso = $('[data-turnos-aviso]', form);
    var manana = $('input[value="Por la mañana"]', form), tarde = $('input[value="Por la tarde"]', form);
    var hoyISO = (function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
    fecha.min = hoyISO;
    fecha.addEventListener('change', function () {
      manana.disabled = false; tarde.disabled = false; aviso.textContent = '';
      if (!fecha.value) return;
      var p = fecha.value.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]).getDay(), tr = HORARIO[d];
      if (!tr) { aviso.textContent = 'La clínica no abre los ' + DIAS[d] + 's: elija otro día.'; manana.disabled = tarde.disabled = true; manana.checked = tarde.checked = false; return; }
      var hayM = tr.some(function (t) { return t[0] < 900; }), hayT = tr.some(function (t) { return t[0] >= 900; });
      manana.disabled = !hayM; tarde.disabled = !hayT;
      if (!hayM) manana.checked = false; if (!hayT) tarde.checked = false;
      aviso.textContent = 'Los ' + DIAS[d] + ' atendemos ' + tr.map(function (t) { return 'de ' + hora(t[0]) + ' a ' + hora(t[1]); }).join(' y ') + '.';
    });
    var nota = $('[data-form-nota]', form), notaBase = nota.textContent;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var mal1 = null;
      $$('input[required]', form).forEach(function (i) {
        var mal = i.type === 'checkbox' ? !i.checked : !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value));
        i.setAttribute('aria-invalid', String(mal));
        if (mal && !mal1) mal1 = i;
      });
      if (mal1) {
        nota.classList.add('es-error');
        nota.textContent = mal1.type === 'checkbox' ? 'Para enviar la solicitud, acepte las políticas de privacidad.' : 'Revise el campo «' + (form.querySelector('label[for="' + mal1.id + '"]') || {}).textContent.replace('*', '').trim() + '».';
        mal1.focus(); return;
      }
      nota.classList.remove('es-error'); nota.textContent = notaBase;
      var v = function (n) { var el = form.elements[n]; return el ? (el.value || '').trim() : ''; };
      var turno = (form.querySelector('input[name="turno"]:checked') || {}).value || '';
      var trat = (v('mensaje').match(/^Me interesa: ([^.\n]+)/) || [])[1];
      var cuerpo = ['Nombre: ' + v('nombre'), 'Teléfono: ' + v('telefono'), 'Correo: ' + v('correo')];
      if (v('fecha')) cuerpo.push('Fecha deseada: ' + v('fecha').split('-').reverse().join('/'));
      if (turno) cuerpo.push('Horario deseado: ' + turno.toLowerCase());
      if (v('mensaje')) cuerpo.push('', v('mensaje'));
      var url = 'mailto:info@morelloclinicadental.com?subject=' + encodeURIComponent('Cita Online' + (trat ? ': ' + trat : '')) + '&body=' + encodeURIComponent(cuerpo.join('\n'));
      form.classList.remove('sellada'); void form.offsetWidth; form.classList.add('sellada');
      setTimeout(function () { location.href = url; }, quieto ? 0 : 850);
    });
    $$('input[required]', form).forEach(function (i) { i.addEventListener('input', function () { i.removeAttribute('aria-invalid'); }); });
  }
})();
