document.addEventListener("DOMContentLoaded", () => {
    const formAnadir = document.querySelector('#formulario-agregar');
    const inputNombre = document.querySelector('#nombre');
    const inputTipo = document.querySelector('#tipo');
    const inputDestino = document.querySelector('#destino');
    const inputBusqueda = document.querySelector('#busqueda');
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
    const carpetaPorRuta = (ruta) => {
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
    const crearNodo = (tipo, name, rutaPadre) => {
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

            const ver = document.createElement('input');
            ver.type = 'checkbox';
            ver.className = 'ver';
            ver.checked = true;

            label.appendChild(spanNombre);
            label.appendChild(spanTipo);
            label.appendChild(ver);

            const btnAnadir = document.createElement('button');
            btnAnadir.className = 'boton anadir icono';
            btnAnadir.title, btnAnadir.ariaLabel = 'Añadir';
            const imgAnadir = document.createElement('img');
            imgAnadir.src = 'anadir.png';
            imgAnadir.alt = 'Añadir';
            btnAnadir.appendChild(imgAnadir);

            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'boton eliminar icono';
            btnEliminar.title, btnEliminar.ariaLabel = 'Eliminar';
            const imgEliminar = document.createElement('img');
            imgEliminar.src = 'eliminar.png';
            imgEliminar.alt = 'Eliminar';
            btnEliminar.appendChild(imgEliminar);

            const hijos = document.createElement('ul');
            hijos.className = 'hijos';

            li.appendChild(label);
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
            btnEliminar.title, btnEliminar.ariaLabel = 'Eliminar';
            const imgEliminar = document.createElement('img');
            imgEliminar.src = 'eliminar.png';
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

        formAnadir.reset();
        inputDestino.value = destino;
        inputNombre.focus();
    });

    arbol.addEventListener('click', (e) => {
        const clicado = e.target;

        const btnVer = clicado.closest('.ver');
        if (btnVer) {
            const li = btnVer.closest('li.carpeta');
            const cont = li.lastElementChild;
            if (cont) cont.classList.toggle('oculto', !btnVer.checked);
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
            if (li.getAttribute('data-path') == '/') return;
            if (li.classList.contains('carpeta')) {
                const hijos = li.lastElementChild;
                const tieneHijos = hijos && hijos.children.length > 0;
                if (tieneHijos) {
                    mensaje('No puedes eliminar una carpeta que contiene elementos.');
                    return;
                }
            }
            li.remove();
            return;
        }
    });

    const todos = () => Array.from(arbol.querySelectorAll('li.nodo'));

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