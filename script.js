document.addEventListener("DOMContentLoaded", () => {
  const formAnadir = document.querySelector('#formulario-agregar');
  const inputNombre = document.querySelector('#nombre');
  const inputTipo = document.querySelector('#tipo');
  const inputDestino = document.querySelector('#destino');
  const inputBusqueda = document.querySelector('#busqueda');
  document.querySelector('#formulario-busqueda').addEventListener('submit', (e) => {
    e.preventDefault();
  });
  const arbol = document.querySelector('#arbol-directorios');

  // Mensajes de aviso
  let msj;
  function mensaje(texto) {
    const div = document.getElementById('form-mensaje');
    if (!div) return;
    div.textContent = texto;
    div.className = 'mensaje';
    clearTimeout(msj);
    msj = setTimeout(() => div.classList.add('oculto'), 2500);
    div.classList.remove('oculto');
  }

  // Buscar carpeta por ruta
  function carpetaPorRuta(ruta) {
    ruta = ruta.trim();
    if (ruta === '/') return arbol.querySelector('li[data-path="/"]');
    const partes = ruta.split('/');
    let actual = arbol.querySelector('li[data-path="/"]');
    for (const parte of partes) {
      if (!parte) continue;
      const ul = actual.lastElementChild;
      if (!ul) return null;
      const nombre = CSS.escape(parte);
      const siguiente = ul.querySelector(`:scope > li.carpeta[data-name="${nombre}"]`);
      if (!siguiente) return null;
      actual = siguiente;
    }
    return actual;
  };

  // Crear nodo (carpeta o archivo)
  function crearNodo(tipo, name, rutaPadre) {
    const li = document.createElement('li');
    li.className = `nodo ${tipo}`;
    li.setAttribute('data-name', name);
    let ruta;
    if (rutaPadre === '/') {
      ruta = '/' + name;
    } else {
      ruta = rutaPadre + '/' + name;
    }
    li.setAttribute('data-path', ruta);

    if (tipo === 'carpeta') {
      const label = document.createElement('label');
      label.className = 'titulo';

      const spanNombre = document.createElement('span');
      spanNombre.className = 'nombre-elemento';
      spanNombre.textContent = name;

      const spanTipo = document.createElement('span');
      spanTipo.className = 'etiqueta-carpeta';
      spanTipo.textContent = 'Carpeta';

      label.appendChild(spanNombre);
      label.appendChild(spanTipo);

      const btnVer = document.createElement('button');
      btnVer.className = 'boton ver icono activo';
      btnVer.title = 'Ocultar';
      btnVer.disabled = true;
      const imgVer = document.createElement('img');
      imgVer.src = 'imgs/ocultar.png';
      imgVer.alt = 'Ocultar';
      btnVer.appendChild(imgVer);

      const btnAnadir = document.createElement('button');
      btnAnadir.className = 'boton anadir icono';
      btnAnadir.title = 'Añadir';
      const imgAnadir = document.createElement('img');
      imgAnadir.src = 'imgs/anadir.png';
      imgAnadir.alt = 'Añadir';
      btnAnadir.appendChild(imgAnadir);

      const btnEliminar = document.createElement('button');
      btnEliminar.className = 'boton eliminar icono';
      btnEliminar.title = 'Eliminar';
      const imgEliminar = document.createElement('img');
      imgEliminar.src = 'imgs/eliminar.png';
      imgEliminar.alt = 'Eliminar';
      btnEliminar.appendChild(imgEliminar);

      const hijos = document.createElement('ul');
      hijos.className = 'hijos';

      li.appendChild(label);
      li.appendChild(btnVer);
      li.appendChild(btnAnadir);
      li.appendChild(btnEliminar);
      li.appendChild(hijos);
    } else {
      const spanNombre = document.createElement('span');
      spanNombre.className = 'nombre-elemento';
      spanNombre.textContent = name;

      const spanTipo = document.createElement('span');
      spanTipo.className = 'etiqueta-archivo';
      spanTipo.textContent = 'Archivo';

      const btnEliminar = document.createElement('button');
      btnEliminar.className = 'boton eliminar icono';
      btnEliminar.title = 'Eliminar';
      const imgEliminar = document.createElement('img');
      imgEliminar.src = 'imgs/eliminar.png';
      imgEliminar.alt = 'Eliminar';
      btnEliminar.appendChild(imgEliminar);

      li.appendChild(spanNombre);
      li.appendChild(spanTipo);
      li.appendChild(btnEliminar);
    }
    return li;
  };

  // Añadir elemento
  formAnadir.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = inputNombre.value.trim();
    const tipo = inputTipo.value;
    const destino = inputDestino.value.trim();

    if (nombre === '') {
      mensaje('Introduce un nombre.');
      inputNombre.focus();
      return;
    }

    const punto = nombre.lastIndexOf('.');
    if (tipo === 'archivo' && (punto <= 0 || punto >= nombre.length - 1)) {
      mensaje('El archivo debe tener extensión (ej. notas.txt).');
      inputNombre.focus();
      return;
    }

    const carpetaDestino = carpetaPorRuta(destino);
    if (!carpetaDestino) {
      mensaje('La ruta destino no existe.');
      inputDestino.focus();
      return;
    }

    const ul = carpetaDestino.lastElementChild;
    if (ul) {
      for (let i = 0; i < ul.children.length; i++) {
        const li = ul.children[i];
        if (li.getAttribute('data-name') === nombre) {
          mensaje('Ya existe un elemento con ese nombre en esa carpeta.');
          inputNombre.focus();
          return;
        }
      }
    }

    const li = crearNodo(tipo, nombre, carpetaDestino.getAttribute('data-path'));
    carpetaDestino.lastElementChild.appendChild(li);
    const btnVerDestino = carpetaDestino.querySelector('.boton.ver');
    if (btnVerDestino) btnVerDestino.disabled = false;

    formAnadir.reset();
    inputDestino.value = destino;
    inputNombre.focus();
  });

  arbol.addEventListener('click', (e) => {
    const clicado = e.target;

    const btnVer = clicado.closest('.boton.ver');
    if (btnVer) {
      const li = btnVer.closest('li.carpeta');
      const cont = li.lastElementChild;
      const img = btnVer.querySelector('img');
      const activo = btnVer.classList.contains('activo');
      btnVer.classList.toggle('activo', !activo);

      if (cont) cont.classList.toggle('oculto', activo);

      if (activo) {
        btnVer.title = 'Mostrar';
        if (img) {
          img.src = 'imgs/mostrar.png';
          img.alt = 'Mostrar';
        }
      } else {
        btnVer.title = 'Ocultar';
        if (img) {
          img.src = 'imgs/ocultar.png';
          img.alt = 'Ocultar';
        }
      }
      return;
    }

    const btnAdd = clicado.closest('.boton.anadir');
    if (btnAdd) {
      const parent = btnAdd.closest('li.carpeta');
      inputDestino.value = parent.getAttribute('data-path');
      inputNombre.focus();
      return;
    }

    const btnDel = clicado.closest('.boton.eliminar');
    if (btnDel) {
      const li = btnDel.closest('li.nodo');
      if (li.getAttribute('data-path') === '/') return;
      if (li.classList.contains('carpeta')) {
        const hijos = li.lastElementChild;
        const tieneHijos = hijos && hijos.children.length > 0;
        if (tieneHijos) {
          mensaje('No puedes eliminar una carpeta que contiene elementos.');
          return;
        }
      }
      const padre = li.parentElement.closest('li.carpeta');
      const ulHijos = padre.lastElementChild;
      const btnVerPadre = padre.querySelector('.boton.ver');
      
      li.remove();
      if (btnVerPadre && ulHijos) {
        btnVerPadre.disabled = ulHijos.children.length === 0;
      }
      return;
    }
  });

  function todos() {
    return Array.from(arbol.querySelectorAll('li.nodo'));
  }

  inputBusqueda.addEventListener('input', () => {
    const busqueda = inputBusqueda.value.trim().toLowerCase();
    const elementos = todos();

    if (busqueda === '') {
      elementos.forEach(li => li.classList.remove('oculto'));
      return;
    }

    elementos.forEach(li => {
      const nombre = li.getAttribute('data-name').toLowerCase();
      const coincide = nombre.includes(busqueda);

      li.classList.toggle('oculto', !coincide);

      if (coincide) {
        let padre = li.parentElement.closest('li.carpeta');
        while (padre) {
          padre.classList.remove('oculto');
          padre = padre.parentElement.closest('li.carpeta');
        }
      }
    });
  });

  inputBusqueda.addEventListener('keydown', (pulsada) => {
    if (pulsada.key === 'Tab') {
      const busqueda = inputBusqueda.value.trim().toLowerCase();
      if (busqueda === '') return;
      pulsada.preventDefault();
      const elementos = todos().filter(li =>
        li.getAttribute('data-name').toLowerCase().startsWith(busqueda)
      );
      if (elementos.length === 1) {
        inputBusqueda.value = elementos[0].getAttribute('data-name');
      }
    }
  });
});