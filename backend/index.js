const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let db;

(async () => {
    db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    // Tabla de Inventario con Categoría
    await db.exec(`
        CREATE TABLE IF NOT EXISTS inventario (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            equipo TEXT NOT NULL,
            marca TEXT NOT NULL,
            stock INTEGER DEFAULT 0,
            categoria TEXT DEFAULT 'General'
        )
    `);

    // Tabla de Historial
    await db.exec(`
        CREATE TABLE IF NOT EXISTS historial (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            equipo_nombre TEXT,
            tipo_movimiento TEXT,
            cantidad INTEGER,
            fecha DATETIME DEFAULT (DATETIME('now', 'localtime'))
        )
    `);
    console.log("✅ Base de datos conectada con Historial y Categorías");
})();

// OBTENER INVENTARIO
app.get('/inventario', async (req, res) => {
    const lista = await db.all('SELECT * FROM inventario ORDER BY id DESC');
    res.json(lista);
});

// AGREGAR EQUIPO Y REGISTRAR EN HISTORIAL
app.post('/agregar', async (req, res) => {
    const { equipo, marca, stock, categoria } = req.body;
    try {
        // Insertar en inventario
        await db.run(
            'INSERT INTO inventario (equipo, marca, stock, categoria) VALUES (?, ?, ?, ?)',
            [equipo, marca, stock, categoria]
        );
        // Insertar en historial
        await db.run(
            'INSERT INTO historial (equipo_nombre, tipo_movimiento, cantidad) VALUES (?, ?, ?)',
            [equipo, 'ENTRADA (Registro Inicial)', stock]
        );
        res.status(201).send('Guardado con éxito');
    } catch (error) {
        res.status(500).send('Error al guardar');
    }
});

// OBTENER HISTORIAL
app.get('/historial', async (req, res) => {
    const logs = await db.all('SELECT * FROM historial ORDER BY fecha DESC LIMIT 20');
    res.json(logs);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor en http://0.0.0.0:${PORT}`);
});