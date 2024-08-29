//Selectores 
const formulario = document.querySelector("#formulario");
const resultado = document.querySelector("#resultado");
const divAlertas = document.querySelector("#alertas");
const divPaginacion = document.querySelector("#paginacion");

//Variables para la paginacion 
const registrosPorPagina = 40;
let totalPaginas;
let iterador;
let paginaActual = 1;

//Funcion que carga todo el documento html 
document.addEventListener("DOMContentLoaded", ()=>{
    //Agregamos evento al formulario cuando se haga submit 
    formulario.addEventListener("submit", validarFormulario);
});

//Llamamos a la funcion que valida el formulario 
function validarFormulario(e){
    e.preventDefault();
    //Leemos el valor del inputText
    const inputTermino = document.querySelector("#termino").value;
    
    //Validamos que el contenido del input no sea una cadena vacia 
    if(inputTermino === ""){
        //Llamamos a la funcion de alertas 
        mostrarAlerta("Los campos son obligatorios", "error");
        return;
    }

    //Si pasamos la validacion del formulario vacio llamamos a la funcion que trabaja con la API 
    buscarImagenes();
}

//Funcion que muestra diversos tipos de alertas 
function mostrarAlerta(mensaje, tipo){
    //Limpiamos el div de alertas 
    divAlertas.textContent = "";
    //Creamos un parrafo de alerta 
    const parrafoAlerta = document.createElement("p");

    //Definimos el tipo de alerta 
    if(tipo === "error"){
        //Agregamos estilos y contenido al parrafo
        parrafoAlerta.classList.add("bg-red-100", "border-red-400", "text-red-700", "px-4", "py-3", "rouded", "max-w-lg", "mx-auto", "mt-6", "text-center");
        parrafoAlerta.innerHTML = `
            <strong class="font-bold">Error!</strong></br>
            <span class="block sm:inline">${mensaje}</span>
        `;
    }

    //Agregamos el parrafo de alerta al html y lo removemos despues de 3 segundos 
    divAlertas.appendChild(parrafoAlerta);
    setTimeout(() => {
        divAlertas.remove();
    }, 3000);
}

//Funcion que busca las imagenes en la API 
function buscarImagenes(){
    const termino = document.querySelector("#termino").value;

    //Variable de key de la API
    const key = "45647420-24ea7dc5ffc17542e9e6c85b6";
    //Variable del url que contiene la key y el parametro de busqueda o termino
    const url = `https://pixabay.com/api/?key=${key}&q=${termino}&per_page=${registrosPorPagina}&page=${paginaActual}`;

    //Disparamos la api 
    fetch(url).then((resultado) =>{
        //Regresamos la primera consulta
        return resultado.json();
    }).then((datos) =>{
        //Calculamos el total de paginas necesarias en la paginacion
        totalPaginas = calcularPaginas(datos.totalHits);
        
        //Llamamos la funcion que va a manejar los datos que nos de la API 
        const {hits} = datos;
        mostrarImagenes(hits);
    }).catch((error) =>{
        //Mandamos posibles mensajes de error
        console.log(error);
    })
}

//Funcion que controla o maneja lo que nos regresa la API 
function mostrarImagenes(hits){
    // //Limpiamos el div 
    // resultado.textContent = "";

    if(hits.length === 0){
        //Limpiamos el div 
        resultado.textContent = "";
        divPaginacion.textContent = "";
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        mostrarAlerta("Categoria no encontrada", "error");
    }else{
        //Limpiamos el div de resulado 
        resultado.textContent = "";

        //Iteramos el arreglo de hits y hacemos destructuring de cada objeto 
        hits.forEach((imagen)=>{
            const {likes, views, largeImageURL, previewURL} = imagen;

            //Agregamos contenido al div de resultado 
            resultado.innerHTML += `
                <div class="w-1/2 md:w-1/3 lg:w-1/4 p-3 mb-4">
                    <div class="bg-white">
                        <img class="w-full" src="${previewURL}">

                        <div class="p-4">
                            <p class="font-bold">
                                Likes: <span class="font-light">${likes}</span><br>
                                Visitas: <span class="font-light">${views}</span><br>
                                <a class="block w-full bg-blue-800 hover:bg-blue-500 text-white uppercase font-bold text-center rounded mt-5 p-1" href="${largeImageURL}" target="_blank">Ver Imagen</a>
                            </p>
                        </div>
                    </div>
                </div>    
                `;
        });

        //Llamamos a la funcion que realiza el paginador
        imprimirPaginador();
    }
}

//Funcion que realiza un generador que va a registrar la cantidad de elementos de acuerdo a las paginas
function *crearPaginador(total){
    for(let i=1; i<= total; i++){
        yield i;
    }
}

//Funcion que imprime el paginador 
function imprimirPaginador(){
    //Limpiamos el divPaginador
    divPaginacion.textContent = "";

    iterador = crearPaginador(totalPaginas);

    while(true){
        //Hacemos destruturing de iterador
        const {value, done} = iterador.next();

        //Si ya llego al final del iterador, ya no realiza nada 
        if(done){
            return;
        }
        //Si no ha llegado al final del iterador, genera un boton por cada elemento en el generador
        const boton = document.createElement("a");
        boton.href = "#";
        boton.dataset.pagina = value;
        boton.textContent = value;
        boton.classList.add("siguiente", "bg-yellow-400", "px-4", "py-1", "mr-2", "font-bold", "mb-10", "rounded")

        //Agregamos evento onclick a los botones para definir la pagina de la API de donde va a tarer los datos
        boton.onclick = () =>{
            paginaActual = value;
            //Llamamos a la funcion buscarImagenes 
            buscarImagenes()
        }

        //Agregamos los botones al divPaginas
        divPaginacion.appendChild(boton);
    }
}

//Funcion que calcula el numero de paginas necesarias para generar el paginador 
function calcularPaginas(total){
    return parseInt(Math.ceil(total/registrosPorPagina));
}
