document.addEventListener("DOMContentLoaded", () => {
    const formAnadir = document.querySelector('#formulario-agregar');
    const inputNombre = document.querySelector('#nombre');
    const inputTipo = document.querySelector('#tipo');
    const inputDestino = document.querySelector('#destino');
    const inputBusqueda = document.querySelector('#busqueda');
    const arbol = document.querySelector('#arbol-directorios');

    [inputNombre, inputDestino].forEach((el) => {
        el.addEventListener('input', () => el.setCustomValidity(''));
        el.addEventListener('change', () => el.setCustomValidity(''));
    });

    inputTipo.addEventListener('change', () => {
        inputNombre.setCustomValidity('');
        inputDestino.setCustomValidity('');
    });

    const carpetaPorRuta = (ruta) => {
        ruta = ruta.trim();
        if (ruta === '/') return arbol.querySelector('li[data-path="/"]');
        const partes = ruta.split('/');
        let actual = arbol.querySelector('li[data-path="/"]');
        for (const parte of partes) {
            if (!parte) continue;
            const ul = actual.lastElementChild;
            if (!ul) return null;
            nombre = CSS.escape(parte);
            const siguiente = ul.querySelector(`:scope > li.carpeta[data-name="${nombre}"]`);
            if (!siguiente) return null
            actual = siguiente;
        }
        return actual;
    };

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

            const btonAnadir = document.createElement('button');
            btonAnadir.className = 'boton anadir';
            btonAnadir.title = 'Añadir';
            btonAnadir.textContent = '+';

            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'boton eliminar';
            btnEliminar.title = 'Eliminar';
            btnEliminar.textContent = 'X';

            const hijos = document.createElement('ul');
            hijos.className = 'hijos';

            li.appendChild(label);
            li.appendChild(btonAnadir);
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
            btnEliminar.className = 'boton eliminar';
            btnEliminar.title = 'Eliminar';
            btnEliminar.textContent = 'X';

            li.appendChild(spanNombre);
            li.appendChild(spanTipo);
            li.appendChild(btnEliminar);
        }
        return li;
    };

    formAnadir.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = inputNombre.value.trim();
        const tipo = inputTipo.value;
        const destino = inputDestino.value.trim();

        inputNombre.setCustomValidity('');
        inputDestino.setCustomValidity('');

        if (nombre === '') {
            inputNombre.setCustomValidity('Introduce un nombre.');
            inputNombre.reportValidity();
            return;
        }

        const i = nombre.lastIndexOf('.');
        if (tipo === 'archivo' && (i <= 0 || i >= nombre.length - 1)) {
            inputNombre.setCustomValidity('El archivo debe tener extensión (ej. notas.txt).');
            inputNombre.reportValidity();
            return;
        }

        const carpetaDestino = carpetaPorRuta(destino);
        if (!carpetaDestino) {
            inputDestino.setCustomValidity('La ruta destino no existe.');
            inputDestino.reportValidity();
            return;
        }

        const ul = carpetaDestino.lastElementChild;
        if (ul) {
            for (let i = 0; i < ul.children.length; i++) {
                const li = ul.children[i];
                if (li.getAttribute('data-name') === nombre) {
                    inputNombre.setCustomValidity('Ya existe un elemento con ese nombre en esa carpeta.');
                    inputNombre.reportValidity();
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

        if (clicado.matches('.ver')) {
            const li = clicado.closest('li.carpeta');
            const cont = li.lastElementChild;
            if (cont) cont.classList.toggle('oculto', !clicado.checked);
            return;
        }

        if (clicado.matches('.boton.anadir')) {
            const parent = clicado.closest('li.carpeta');
            inputDestino.value = parent.getAttribute('data-path');
            inputDestino.setCustomValidity('');
            inputNombre.focus();
            return;
        }

        if (clicado.matches('.boton.eliminar')) {
            const li = clicado.closest('li.nodo');
            if (li.getAttribute('data-path') == '/') return;
            if (li.classList.contains('carpeta')) {
                const hijos = li.lastElementChild;
                const tieneHijos = hijos && hijos.children.length > 0;
                if (tieneHijos) return;
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
            // Evitar que el 'TAB' haga la función que normalmente haría
            pulsada.preventDefault();
            // Filtrar solo los elementos cuyo nombre comienza con la búsqueda
            const elementos = todos().filter(li =>
                li.getAttribute('data-name').toLowerCase().startsWith(busqueda)
            );
            // Si solo hay una coincidencia, autocompletar
            if (elementos.length === 1) {
                inputBusqueda.value = elementos[0].getAttribute('data-name');
            }
        }
    });
});