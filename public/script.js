document.addEventListener('DOMContentLoaded', function () {
    generarCaptcha(); // Generar el CAPTCHA al cargar la página
});

let captchaData = { captcha: null, captchaId: null }; // Almacenar el CAPTCHA y su ID

// Función para generar un CAPTCHA desde el servidor
function generarCaptcha() {
    fetch('/api/generar-captcha')
        .then(response => response.json())
        .then(data => {
            captchaData = data; // Guardar el CAPTCHA y su ID
            document.getElementById('captchaText').innerText = data.captcha; // Mostrar el CAPTCHA en el HTML
        })
        .catch(error => {
            console.error('Error al generar el CAPTCHA:', error);
        });
}

function consultarEstado() {
    const dni = document.getElementById('dni')?.value;
    const captchaInput = document.getElementById('captchaInput')?.value;
    const resultadoDiv = document.getElementById('resultado');

    if (!dni || !captchaInput) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    // Validar CAPTCHA en el frontend (opcional, para mejorar la experiencia del usuario)
    if (captchaInput != captchaData.captcha) {
        alert('CAPTCHA incorrecto. Intenta de nuevo.');
        generarCaptcha(); // Generar un nuevo CAPTCHA
        document.getElementById('captchaInput').value = ''; // Limpiar el campo de entrada
        return;
    }

    // Enviar solicitud al servidor
    fetch('/api/consultar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            dni: dni,
            captchaInput: captchaInput,
            captchaId: captchaData.captchaId, // Enviar el ID del CAPTCHA
        }),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; }); // Manejar errores del servidor
        }
        return response.json();
    })
    .then(data => {
        // Determinar la clase CSS para el estado (APTO o NO APTO)
        const estadoClass = data.estado === "Apto" ? "estado-apto" : "estado-no-apto";

        // Determinar el mensaje adicional según el estado
        const mensajeAdicional = data.estado === "Apto" ?
            "La asignación de carga horaria será paulatinamente mientras los estudiantes se vayan inscribiendo al nuevo ciclo marzo-julio 2025 del CEPREUNA. No todos los APTOS tendrán carga horaria, pero son elegibles para ello." :
            "Gracias por su participación.";

        // Mostrar los resultados con los estilos aplicados
        resultadoDiv.innerHTML = `
            <div class="resultado">
                <p class="nombre">Nombre: <strong>${data.nombre}</strong></p>
                <p class="${estadoClass}">Estado: ${data.estado}</p>
                <p class="texto-adicional">${mensajeAdicional}</p>
            </div>
        `;
    })
    .catch(error => {
        console.error('Error:', error);
        resultadoDiv.innerHTML = `<p>Error: ${error.error || 'No se pudo cargar la información.'}</p>`;
        generarCaptcha(); // Generar un nuevo CAPTCHA en caso de error
    });
}