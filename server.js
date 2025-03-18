const express = require('express');
const session = require('express-session'); // Importar express-session
const app = express();
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Middleware para permitir solicitudes JSON y servir archivos estáticos
app.use(express.json());
app.use(express.static('public'));

// Configura CORS para permitir cualquier origen temporalmente
app.use(cors());

// Configurar express-session
app.use(
    session({
        secret: 'tu_secreto_seguro', // Cambia esto por una cadena secreta segura
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Cambia a true si usas HTTPS
    })
);

// Endpoint para generar un CAPTCHA
app.get('/api/generar-captcha', (req, res) => {
    const captcha = Math.floor(Math.random() * 9000) + 1000; // Número aleatorio de 4 dígitos
    req.session.captcha = captcha; // Almacenar el CAPTCHA en la sesión del usuario
    res.json({ captcha }); // Enviar el CAPTCHA al cliente
});

// Endpoint para consultar el estado
app.post('/api/consultar', (req, res) => {
    const { dni, captchaInput } = req.body;
    console.log(captchaInput);
    console.log(req.session.captcha)
    // Validar CAPTCHA
    if (!req.session.captcha || captchaInput != req.session.captcha) {
        return res.status(400).json({ error: 'CAPTCHA incorrecto' });
    }

    // Eliminar el CAPTCHA usado para evitar reutilización
    delete req.session.captcha;

    // Cargar datos desde el archivo JSON
    try {
        const datos = JSON.parse(fs.readFileSync(path.join(__dirname, 'datos.json'), 'utf8'));
        const usuario = datos.find(user => user.nro_documento === dni);

        if (usuario) {
            res.json({
                nombre: usuario.Nombres_y_Apellidos,
                estado: usuario.Estado,
            });
        } else {
            res.status(404).json({ error: 'DNI no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al leer el archivo JSON' });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});