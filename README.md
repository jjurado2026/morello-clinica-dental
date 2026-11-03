# Morelló Clínica Dental — Propuesta de nueva homepage

Prototipo de homepage para **Morelló Clínica Dental** ([morelloclinicadental.com](https://www.morelloclinicadental.com/)), clínica dental familiar fundada en 1982 por el Dr. Joan Morelló Cubells en la calle Muntaner 571, 2ºC (Sant Gervasi, Barcelona).

**Prototipo:** https://jjurado2026.github.io/morello-clinica-dental/

**El problema que resuelve:** su web es un WordPress de 2017 con un slider pesado, textos centrados en Arial, un aviso de cookies que tapa media pantalla y tres tarjetas de tratamientos con fotos de banco. Tienen lo que más convence en una clínica (un fundador de 1982, una ortodoncista Diplomate del American Board of Orthodontics, cinco doctoras con másteres, fotos reales de la clínica en 4K y un 5,0 en Google) y casi nada de eso se ve en la home.

## Dirección estética: «Alineados»

Alinear es lo que hace el dentista, y la ortodoncia (Invisalign, Dra. Nart) es su especialidad estrella. La idea firma la home en tres sitios y nada más:

- **Hero «Doctores Morelló».** Su foto del fundador con la Dra. Carmen Morelló, entera y anclada a la izquierda, fundida en la pared de la propia foto. Su titular llega con las letras torcidas, como dientes sin tratar, y un **alineador transparente** lo recorre y las deja rectas; luego vuelve a pasar de vez en cuando como un brillo. Los logos bordados en sus batas son dos aros que presentan a cada doctor.
- **Somos Especialistas: un odontograma de verdad.** Las dos arcadas vistas desde arriba, con los 32 dientes y su numeración FDI, como en la ficha del dentista. Cada uno de sus 10 tratamientos tiene su escena sobre la boca: brackets y arco, el alineador que encaja, las carillas de los seis dientes de delante, el blanqueamiento que pasa del marfil al blanco, los 20 dientes de leche, el implante que sustituye al 46 (con su vista lateral), el puente del 24 al 26, los conductos del 36, las caries que se obturan y las encías. Al pasar por un diente se ve su nombre («36 · Primer molar inferior izquierdo») y al tocarlo, qué tratamientos lo cuidan.
- **La clínica, con un espejo dental.** Sus fotos en 4K se miran con un espejo de exploración que amplía lo que hay bajo el cursor.

- **Color:** los de su logo y su web: azul `#003B5C`, cian `#05C3DE` y su gris claro, más un azul noche derivado para las bandas. El fondo del hero sale de la pared de su foto.
- **Tipografía:** **Bespoke Slab** (titulares), una slab moderna con el mismo aire que el «morelló» de su logotipo y que su Roboto Slab, y **Hanken Grotesk** (texto).
- **Botones «esmalte»:** blancos con trazo en reposo; al pasar se llenan de azul, cruza un brillo de esmalte y el icono hace su gesto (el teléfono suena, la hoja del calendario salta).

## La home, de arriba abajo
1. **Barra superior y cabecera fija** con su teléfono, su dirección, «Abierto ahora / Cerrado, abrimos…» en vivo, su 5,0 en Google y sus redes; menú a sus páginas reales. En el móvil, barra fija con Llamar, Pedir cita y Cómo llegar.
2. **Hero** con su H1 y su descripción literales, «Excelencia odontológica con un trato cercano» en su banda cian y dos llamadas (cita online y teléfono).
3. **Franja de accesos:** Sobre nosotros, El equipo, Cita online (sus H3) y 5,0 con 46 opiniones en Google.
4. **Somos Especialistas:** el odontograma con sus 10 tratamientos; cada ficha con su foto, su texto, un dato suyo y «Pedir cita de…», que deja el tratamiento elegido en el formulario.
5. **¿Está listo para realizar una consulta?** con su marca de agua del diente.
6. **Nuestro Equipo:** su foto de grupo, el fundador y las cuatro doctoras con su especialidad y su formación completa a un clic, las higienistas y una cinta lenta con sus universidades y sociedades.
7. **Bienvenidos a Morelló Clínica Dental:** su texto de «La clínica» y cuatro fotos de la clínica con el espejo dental y visor.
8. **¿Dónde estamos?** Recepción, mapa, teléfono, correo, cómo llegar y el horario de la semana con el día de hoy marcado.
9. **Preguntas frecuentes** con las respuestas de sus propias páginas de tratamientos.
10. **Solicite Información:** formulario que conoce su horario (si se elige un jueves, solo deja la tarde) y abre el correo ya escrito a info@morelloclinicadental.com.

## Fotos
Todas suyas, sin recortar ni retocar: los Doctores Morelló, los retratos del equipo, la foto de grupo, la clínica (originales de 4104×2736), un caso real de ortodoncia «antes y después» y las fotos de cada tratamiento de su web. Logo y favicon, los suyos.

## Comprobado, no asumido
Con el kit del taller (Chrome headless por DevTools):
- **El hero cabe entero en los 17 tamaños**, de 320×568 a 2560×1440, también en móvil apaisado y descontando la barra fija.
- Sin desbordamiento horizontal y las 24 fotos del cliente a su proporción.
- **Los 10 tratamientos del odontograma con clics reales**, el nombre del diente al pasar y el globo al tocar.
- **23 botones con el cursor quieto 2,5 s**: ninguno se queda pillado.
- Cero errores de JavaScript; solo se animan `transform` y `opacity`; con «reducir movimiento», nada se mueve.

## Validar con el cliente
- Que la doctora de la foto del hero es la Dra. Carmen Morelló.
- Los nombres de las higienistas (Gemma y Eli, por los archivos de sus fotos).
- El horario del miércoles: su web dice 9:00 y Google, 9:30.
- «Más de 30 años» (su texto) frente a los 44 reales desde 1982.

## Stack
HTML, CSS y JavaScript puro. Cero dependencias, cero build. Fuentes autoalojadas. El odontograma es SVG generado a partir de medidas dentales reales (`_interno/herramientas/genera-odontograma.mjs`, no publicado).

Parámetros útiles: `?ss` (sin animaciones, para capturas) · `?ahora=3-10` (fija el día, de 0 domingo a 6 sábado, y la hora del estado «abierto») · `?caducada` (simula la caducidad).

## Caducidad
**Provisional, como si se enviara el 3-nov-2026:** la propuesta se ve hasta el **jueves 12 de noviembre de 2026 a las 23:59** (hora de Madrid). Desde el 13, `index.html` lleva a `caducada.html`. La fecha está en el primer `<script>` de `index.html` (`Date.UTC(2026, 10, 12, 23, 0)`) y se ajusta al día real de envío. En local no caduca.

## Ver en local
```bash
cd prototype && python -m http.server 8000
```

## Publicar
```bash
git subtree push --prefix=prototype origin gh-pages
```

---
Diseño y desarrollo: **Juan Jurado** · [jjuradogarciadelrio.com](https://jjuradogarciadelrio.com)
