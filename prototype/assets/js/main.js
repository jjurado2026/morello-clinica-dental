/* =====================================================================
   Morelló Clínica Dental · home «Alineados»
   ===================================================================== */
(function () {
  'use strict';
  window.MORELLO = true;

  var html = document.documentElement;
  var quieto = html.classList.contains('quieto');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var finoPuntero = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Observa la entrada en pantalla: añade .en-vista mientras se ve y .visto la primera vez
  function vigilar(el, alEntrar, margen) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { el.classList.add('en-vista', 'visto'); if (alEntrar) alEntrar(); return; }
    var primera = true;
    new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        el.classList.toggle('en-vista', e.isIntersecting);
        if (e.isIntersecting && primera) { primera = false; el.classList.add('visto'); if (alEntrar) alEntrar(); }
      });
    }, { rootMargin: margen || '0px 0px -12% 0px' }).observe(el);
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

  /* ---------- horario en vivo (hora de Madrid; ?ahora=d-h.mm para probar) ---------- */
  // 0 domingo … 6 sábado; tramos en minutos
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
  var hora = function (min) { var h = Math.floor(min / 60), m = min % 60; return h + (m ? ':' + String(m).padStart(2, '0') : ':00'); };
  function estado() {
    var a = ahoraMadrid();
    var hoy = HORARIO[a.d] || [];
    for (var i = 0; i < hoy.length; i++) if (a.min >= hoy[i][0] && a.min < hoy[i][1]) return { abierto: true, texto: 'Abierto ahora, hasta las ' + hora(hoy[i][1]), d: a.d };
    for (var j = 0; j < hoy.length; j++) if (a.min < hoy[j][0]) return { abierto: false, texto: 'Cerrado. Abrimos hoy a las ' + hora(hoy[j][0]), d: a.d };
    for (var k = 1; k <= 7; k++) {
      var dd = (a.d + k) % 7;
      if (HORARIO[dd]) return { abierto: false, texto: 'Cerrado. Abrimos ' + (k === 1 ? 'mañana' : 'el ' + DIAS[dd]) + ' a las ' + hora(HORARIO[dd][0][0]), d: a.d };
    }
  }
  function pintarEstado() {
    var e = estado(); if (!e) return;
    $$('[data-estado-texto], [data-horario-estado]').forEach(function (el) { el.textContent = e.texto; });
    $$('[data-estado], [data-horario-estado]').forEach(function (el) { el.setAttribute('data-abierto', e.abierto ? 'si' : 'no'); });
    $$('.horario__tabla [data-dia]').forEach(function (c) { c.classList.toggle('es-hoy', +c.getAttribute('data-dia') === e.d); });
  }
  pintarEstado(); setInterval(pintarEstado, 60000);

  /* ---------- hero: el titular que se alinea ---------- */
  var h1 = $('[data-alinear]');
  var hero = $('.hero');
  if (h1) {
    var palabras = h1.textContent.trim().split(/\s+/);
    h1.textContent = '';
    palabras.forEach(function (p, pi) {
      var w = document.createElement('span'); w.className = 'palabra';
      Array.prototype.forEach.call(p, function (ch) { var l = document.createElement('span'); l.className = 'letra'; l.textContent = ch; w.appendChild(l); });
      h1.appendChild(w);
      if (pi < palabras.length - 1) h1.appendChild(document.createTextNode(' '));
    });
    var al = document.createElement('span'); al.className = 'alineador'; al.setAttribute('aria-hidden', 'true');
    var br = document.createElement('span'); br.className = 'alineador-brillo'; br.setAttribute('aria-hidden', 'true');
    h1.appendChild(al); h1.appendChild(br);

    if (!quieto) {
      var azar = function (i, s) { var x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };
      var letras = $$('.letra', h1);
      var colocar = function () {
        var ancho = h1.offsetWidth || 1;
        var base = h1.getBoundingClientRect().left;
        h1.style.setProperty('--recorrido', (ancho + 140) + 'px');
        letras.forEach(function (l, i) {
          var x = l.getBoundingClientRect().left - base;
          l.style.setProperty('--lg', ((azar(i, 1) - .5) * 22).toFixed(1) + 'deg');
          l.style.setProperty('--ly', ((azar(i, 2) - .5) * .22).toFixed(3) + 'em');
          l.style.setProperty('--lx', ((azar(i, 3) - .5) * .08).toFixed(3) + 'em');
          // cada letra se endereza cuando el alineador pasa por encima
          l.style.setProperty('--ld', (.36 + (x / ancho) * 1.08).toFixed(2) + 's');
        });
      };
      h1.classList.add('torcido');
      colocar();
      requestAnimationFrame(function () {
        h1.classList.add('listo', 'alineando');
        requestAnimationFrame(function () { requestAnimationFrame(function () { h1.classList.remove('torcido'); }); });
        setTimeout(function () { h1.classList.add('brillando'); }, 1800);
      });
      var rs; window.addEventListener('resize', function () { clearTimeout(rs); rs = setTimeout(function () { h1.style.setProperty('--recorrido', (h1.offsetWidth + 140) + 'px'); }, 150); });
    } else h1.classList.add('listo');
  }
  if (hero && 'IntersectionObserver' in window) new IntersectionObserver(function (e) { hero.classList.toggle('fuera', !e[0].isIntersecting); }).observe(hero);

  /* ---------- puntos sobre las batas ---------- */
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
    var svg = $('.odo__svg', odo);
    var opciones = $$('.opcion', odo);
    var paneles = $$('.panel', odo);
    var globo = $('.odo__globo', odo);
    var lienzo = $('.odo__lienzo', odo);
    var actual = '';
    var temporizadores = [];
    var IMPLICA = {
      ortodoncia: function (n, p) { return p <= 7; }, invisalign: function (n, p) { return p <= 7; },
      estetica: function (n) { return /^[1-4][1-3]$/.test(n); }, blanqueamiento: function (n, p) { return p <= 5; },
      implantes: function (n) { return n === '45' || n === '46' || n === '47'; }, protesis: function (n) { return n === '24' || n === '25' || n === '26'; },
      endodoncia: function (n) { return n === '36'; }, conservadora: function (n) { return /^(16|26|36|46|17|47)$/.test(n); },
    };
    var NOMBRE = {}; opciones.forEach(function (o) { NOMBRE[o.getAttribute('data-t')] = o.textContent.trim(); });
    var limpiar = function () { temporizadores.forEach(clearTimeout); temporizadores = []; };
    var luego = function (fn, ms) { temporizadores.push(setTimeout(fn, ms)); };

    function elegir(t, desdeDiente) {
      limpiar();
      odo.classList.add('tocado');
      var mismo = t === actual;
      actual = t;
      opciones.forEach(function (o) { o.setAttribute('aria-pressed', String(o.getAttribute('data-t') === t)); });
      paneles.forEach(function (p) {
        var activo = p.getAttribute('data-panel') === (t || 'inicio');
        p.classList.toggle('is-activo', activo);
        if (activo) p.removeAttribute('inert'); else p.setAttribute('inert', '');
      });
      // foco: los dientes que no trata se apagan
      var f = IMPLICA[t];
      $$('.arcadas--adulto .diente', svg).forEach(function (d) {
        var n = d.getAttribute('data-n');
        d.classList.toggle('implicado', !!f && f(n, +n[1]));
      });
      svg.classList.toggle('con-foco', !!f);
      if (quieto) { svg.setAttribute('data-t', t); return; }
      // reinicia la escena para que se vea entera cada vez
      svg.classList.remove('torcidos', 'marfil');
      svg.setAttribute('data-t', '');
      void svg.getBoundingClientRect();
      if (t === 'ortodoncia' || t === 'invisalign') {
        svg.classList.add('sin-trans', 'torcidos');
        void svg.getBoundingClientRect();
        svg.classList.remove('sin-trans');
        svg.setAttribute('data-t', t);
        luego(function () { svg.classList.remove('torcidos'); }, t === 'invisalign' ? 900 : 700);
      } else if (t === 'blanqueamiento') {
        svg.classList.add('marfil');
        svg.setAttribute('data-t', t);
        luego(function () { svg.classList.remove('marfil'); }, 450);
      } else {
        luego(function () { svg.setAttribute('data-t', t); }, mismo ? 60 : 30);
      }
    }
    opciones.forEach(function (o) {
      // la opción se llena con el texto en un <span>, sin tocar el HTML a mano
      var txt = o.textContent; o.textContent = '';
      var fondo = document.createElement('span'); fondo.className = 'opcion__fondo'; fondo.setAttribute('aria-hidden', 'true');
      var s = document.createElement('span'); s.className = 'opcion__txt'; s.textContent = txt;
      o.appendChild(fondo); o.appendChild(s);
      o.addEventListener('click', function () { cerrarGlobo(); elegir(o.getAttribute('data-t')); });
    });

    // dientes: al pasar, su nombre; al tocar, qué tratamientos lo cuidan
    var RELACION = {
      inc: ['estetica', 'blanqueamiento', 'ortodoncia', 'invisalign'],
      can: ['estetica', 'ortodoncia', 'invisalign', 'blanqueamiento'],
      pre: ['conservadora', 'endodoncia', 'ortodoncia', 'protesis'],
      mol: ['conservadora', 'endodoncia', 'implantes', 'periodoncia'],
      cordal: ['conservadora', 'periodoncia'],
      leche: ['odontopediatria'],
    };
    var dienteElegido = null;
    function nombreDiente(d) {
      var n = d.getAttribute('data-n'), nom = d.getAttribute('data-nombre');
      return '<b>' + n + '</b>' + nom.charAt(0).toUpperCase() + nom.slice(1);
    }
    function situar(d) {
      var r = d.getBoundingClientRect(), base = lienzo.getBoundingClientRect();
      globo.hidden = false;
      var gw = globo.offsetWidth, gh = globo.offsetHeight;
      var x = r.left - base.left + r.width / 2 - gw / 2;
      x = Math.max(-8, Math.min(x, base.width - gw + 8));
      var arriba = r.top - base.top - gh - 10;
      var y = arriba < -20 ? r.bottom - base.top + 10 : arriba;
      globo.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
    }
    function mostrarNombre(d) {
      if (!globo.hidden && !globo.classList.contains('solo-nombre')) return;
      globo.classList.add('solo-nombre');
      $('.odo__globo-nombre', globo).innerHTML = nombreDiente(d);
      situar(d);
    }
    function cerrarGlobo() {
      globo.hidden = true; globo.classList.remove('solo-nombre');
      if (dienteElegido) { dienteElegido.classList.remove('es-elegido'); var nn = $('.num[data-n="' + dienteElegido.getAttribute('data-n') + '"]', svg); if (nn) nn.classList.remove('es-elegido'); dienteElegido = null; }
    }
    function abrirDiente(d) {
      cerrarGlobo();
      dienteElegido = d; d.classList.add('es-elegido');
      var nn = $('.num[data-n="' + d.getAttribute('data-n') + '"]', svg); if (nn) nn.classList.add('es-elegido');
      var n = d.getAttribute('data-n'), tipo = d.getAttribute('data-tipo');
      var clave = +n[0] >= 5 ? 'leche' : (n[1] === '8' ? 'cordal' : tipo);
      $('.odo__globo-nombre', globo).innerHTML = nombreDiente(d);
      var cont = $('.odo__globo-opciones', globo); cont.innerHTML = '';
      RELACION[clave].forEach(function (t) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'mini'; b.textContent = NOMBRE[t];
        b.addEventListener('click', function () { cerrarGlobo(); elegir(t, true); var op = $('.opcion[data-t="' + t + '"]', odo); if (op && window.innerWidth < 760) op.scrollIntoView({ block: 'nearest' }); });
        cont.appendChild(b);
      });
      situar(d);
      odo.classList.add('tocado');
    }
    svg.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var d = e.target.closest('.diente');
      if (d && globo.classList.contains('solo-nombre') || d && globo.hidden) mostrarNombre(d);
      else if (!d && globo.classList.contains('solo-nombre')) { globo.hidden = true; globo.classList.remove('solo-nombre'); }
    });
    svg.addEventListener('pointerleave', function () { if (globo.classList.contains('solo-nombre')) { globo.hidden = true; globo.classList.remove('solo-nombre'); } });
    svg.addEventListener('click', function (e) { var d = e.target.closest('.diente'); if (d) { e.stopPropagation(); abrirDiente(d); } });
    document.addEventListener('click', function (e) { if (!globo.hidden && !e.target.closest('.odo__globo') && !e.target.closest('.diente')) cerrarGlobo(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !globo.hidden) cerrarGlobo(); });

    // la primera vez que se ve: los dientes salen uno tras otro
    vigilar(odo, null, '0px 0px -18% 0px');
  }

  /* ---------- cualquier «Pedir cita» deja el tratamiento elegido en el formulario ---------- */
  var select = $('#f-trat');
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-tratamiento]');
    if (!a || !select) return;
    var t = a.getAttribute('data-tratamiento');
    if (t) {
      select.value = t;
      var campo = select.closest('.campo');
      campo.classList.remove('marcado'); void campo.offsetWidth; campo.classList.add('marcado');
    }
  });

  /* ---------- equipo: entrada y fichas de formación ---------- */
  var doctores = $('.doctores');
  if (doctores) { $$('.doctor', doctores).forEach(function (d, i) { d.style.setProperty('--n', i); }); vigilar(doctores); }
  var ficha = $('#ficha');
  $$('.doctor__mas').forEach(function (b) {
    b.addEventListener('click', function () {
      var datos = document.getElementById(b.getAttribute('data-ficha'));
      var nombre = b.closest('.doctor').querySelector('h3').textContent;
      $('#ficha-titulo').textContent = nombre;
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

  /* ---------- credenciales: cinta continua ---------- */
  var cred = $('.credenciales');
  if (cred) {
    var pista = $('.credenciales__pista', cred);
    $$('li', pista).forEach(function (li) { var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); pista.appendChild(c); });
    vigilar(cred, null, '0px');
  }
  vigilar($('.consulta'), null, '0px');

  /* ---------- la clínica: espejo dental y visor ---------- */
  var mosaico = $('[data-mosaico]');
  if (mosaico) {
    var fotos = $$('.foto-clinica', mosaico);
    var espejo = $('.espejo'), luna = $('.espejo__luna');
    var AUMENTO = 2.4;
    if (finoPuntero && !quieto && espejo) {
      mosaico.classList.add('con-espejo');
      var cargadas = {};
      fotos.forEach(function (f) {
        f.addEventListener('pointerenter', function (e) {
          if (e.pointerType !== 'mouse') return;
          var src = f.getAttribute('data-grande');
          if (!cargadas[src]) { var im = new Image(); im.src = src; cargadas[src] = im; }
          luna.style.backgroundImage = 'url("' + src + '")';
          espejo.classList.add('visible');
        });
        f.addEventListener('pointermove', function (e) {
          if (e.pointerType !== 'mouse') return;
          var r = f.getBoundingClientRect();
          var w = r.width * AUMENTO, h = r.height * AUMENTO;
          var px = (e.clientX - r.left) * AUMENTO, py = (e.clientY - r.top) * AUMENTO;
          luna.style.backgroundSize = w + 'px ' + h + 'px';
          luna.style.backgroundPosition = (95 - px) + 'px ' + (95 - py) + 'px';
          espejo.style.transform = 'translate(' + (e.clientX - 95) + 'px,' + (e.clientY - 95) + 'px)';
        });
        f.addEventListener('pointerleave', function () { espejo.classList.remove('visible'); });
      });
      window.addEventListener('scroll', function () { espejo.classList.remove('visible'); }, { passive: true });
    }
    var visor = $('#visor'), vImg = $('.visor__marco img', visor), vPie = $('.visor__marco figcaption', visor), vI = 0;
    function verFoto(i) {
      vI = (i + fotos.length) % fotos.length;
      var f = fotos[vI], src = f.getAttribute('data-grande'), alt = $('img', f).alt, pie = $('.foto-clinica__pie', f).textContent;
      var pre = new Image(); pre.src = src;
      vImg.classList.add('cambia');
      var poner = function () { vImg.src = src; vImg.alt = alt; vPie.textContent = pie; vImg.classList.remove('cambia'); };
      if (pre.complete) poner(); else { pre.onload = poner; pre.onerror = poner; }
      var sig = new Image(); sig.src = fotos[(vI + 1) % fotos.length].getAttribute('data-grande');
    }
    fotos.forEach(function (f, i) {
      f.addEventListener('click', function () { verFoto(i); if (visor.showModal) visor.showModal(); else visor.setAttribute('open', ''); visor._volver = f; espejo && espejo.classList.remove('visible'); });
    });
    $('.visor__btn--ant', visor).addEventListener('click', function () { verFoto(vI - 1); });
    $('.visor__btn--sig', visor).addEventListener('click', function () { verFoto(vI + 1); });
    $('.visor__btn--cerrar', visor).addEventListener('click', function () { visor.close(); });
    visor.addEventListener('click', function (e) { if (e.target === visor) visor.close(); });
    visor.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') verFoto(vI - 1); if (e.key === 'ArrowRight') verFoto(vI + 1); });
    visor.addEventListener('close', function () { if (visor._volver) visor._volver.focus(); });
  }

  /* ---------- formulario: turnos según el horario y correo ya escrito ---------- */
  var form = $('#formulario');
  if (form) {
    var fecha = $('#f-fecha', form), aviso = $('[data-turnos-aviso]', form);
    var manana = $('input[value="Por la mañana"]', form), tarde = $('input[value="Por la tarde"]', form);
    var hoyISO = (function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
    fecha.min = hoyISO;
    fecha.addEventListener('change', function () {
      manana.disabled = false; tarde.disabled = false; aviso.textContent = '';
      if (!fecha.value) return;
      var p = fecha.value.split('-'); var d = new Date(+p[0], +p[1] - 1, +p[2]).getDay();
      var tr = HORARIO[d];
      if (!tr) { aviso.textContent = 'La clínica no abre los ' + DIAS[d] + 's: elija otro día.'; manana.disabled = tarde.disabled = true; manana.checked = tarde.checked = false; return; }
      var hayM = tr.some(function (t) { return t[0] < 900; }), hayT = tr.some(function (t) { return t[0] >= 900; });
      manana.disabled = !hayM; tarde.disabled = !hayT;
      if (!hayM) manana.checked = false; if (!hayT) tarde.checked = false;
      aviso.textContent = 'Los ' + DIAS[d] + ' atendemos ' + tr.map(function (t) { return 'de ' + hora(t[0]) + ' a ' + hora(t[1]); }).join(' y ') + '.';
    });
    var nota = $('[data-form-nota]', form), notaBase = nota.textContent;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var falta = null;
      $$('input[required]', form).forEach(function (i) {
        var mal = i.type === 'checkbox' ? !i.checked : !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value));
        i.setAttribute('aria-invalid', String(mal));
        if (mal && !falta) falta = i;
      });
      if (falta) {
        nota.classList.add('es-error');
        nota.textContent = falta.type === 'checkbox' ? 'Para enviar la solicitud, acepte las políticas de privacidad.' : 'Revise el campo «' + (form.querySelector('label[for="' + falta.id + '"]') || {}).textContent.replace('*', '').trim() + '».';
        falta.focus(); return;
      }
      nota.classList.remove('es-error'); nota.textContent = notaBase;
      var v = function (n) { var el = form.elements[n]; return el ? (el.value || '').trim() : ''; };
      var turno = (form.querySelector('input[name="turno"]:checked') || {}).value || '';
      var trat = v('tratamiento') || 'Primera visita o revisión';
      var cuerpo = ['Tratamiento: ' + trat, 'Nombre: ' + v('nombre'), 'Teléfono: ' + v('telefono'), 'Correo: ' + v('correo')];
      if (v('fecha')) cuerpo.push('Fecha deseada: ' + v('fecha').split('-').reverse().join('/'));
      if (turno) cuerpo.push('Horario deseado: ' + turno.toLowerCase());
      if (v('mensaje')) cuerpo.push('', v('mensaje'));
      location.href = 'mailto:info@morelloclinicadental.com?subject=' + encodeURIComponent('Solicitud de cita: ' + trat) + '&body=' + encodeURIComponent(cuerpo.join('\n'));
    });
    $$('input[required]', form).forEach(function (i) { i.addEventListener('input', function () { i.removeAttribute('aria-invalid'); }); });
  }
})();
