const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json());
// Esta línea sirve los archivos de la carpeta "public" (tu HTML, CSS, JS)
app.use(express.static('public'));

let db;

// Configuración de la Base de Datos
(async () => {
    try {
        db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        // Creamos la tabla de inventario si no existe
        await db.exec(`
            CREATE TABLE IF NOT EXISTS inventario (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                equipo TEXT NOT NULL,
                marca TEXT NOT NULL,
                stock INTEGER DEFAULT 0
            )
        `);
        console.log("✅ Base de datos SQLite conectada y lista.");
    } catch (error) {
        console.error("❌ Error al conectar la base de datos:", error);
    }
})();

// --- RUTAS DE LA API ---

// 1. Obtener todos los equipos (GET)
app.get('/inventario', async (req, res) => {
    try {
        const lista = await db.all('SELECT * FROM inventario ORDER BY id DESC');
        res.json(lista);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los datos" });
    }
});

// 2. Agregar un equipo nuevo (POST)
app.post('/agregar', async (req, res) => {
    const { equipo, marca, stock } = req.body;
    
    if (!equipo || !marca || stock === undefined) {
        return res.status(400).send('Faltan datos obligatorios');
    }

    try {
        await db.run(
            'INSERT INTO inventario (equipo, marca, stock) VALUES (?, ?, ?)',
            [equipo, marca, stock]
        );
        res.status(201).send('Equipo guardado con éxito');
    } catch (error) {
        res.status(500).send('Error al guardar el equipo');
    }
});

// 3. Eliminar un equipo (Opcional, para que tu sistema sea más completo)
app.delete('/eliminar/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.run('DELETE FROM inventario WHERE id = ?', id);
        res.send('Equipo eliminado');
    } catch (error) {
        res.status(500).send('Error al eliminar');
    }
});

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
});