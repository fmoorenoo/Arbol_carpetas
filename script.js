document.addEventListener("DOMContentLoaded", () => {
    const formAnadir = document.querySelector('#formulario-agregar');
    const inputNombre = document.querySelector('#nombre');
    const inputTipo = document.querySelector('#tipo');
    const inputDestino = document.querySelector('#destino');
    const inputBusqueda = document.querySelector('#busqueda');
    const arbol = document.querySelector('#arbol-directorios');

    function esCarpeta(li) {
        return li.classList.contains('carpeta');
    }

    function hijosElemento(li) {
        return li.querySelector(':scope > .hijos');
    }

    function nombreElemento(li) {
        return li.getAttribute('data-name');
    }

    function rutaElemento(li) {
        return li.getAttribute('data-path');
    }
});