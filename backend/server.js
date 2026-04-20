const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('../database/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend')));


app.post('/api/signup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

    const insert = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.run(insert, [username, password], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'Username already exists' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'User created successfully', userId: this.lastID, username });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

    db.get('SELECT id, username FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: 'Invalid credentials' });
        
        res.json({ message: 'Login successful', user: row });
    });
});

app.get('/api/events', (req, res) => {
    db.all("SELECT * FROM events", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            data: rows
        });
    });
});

app.post('/api/bookings', (req, res) => {
    const { eventId, ticketType, quantity, totalAmount } = req.body;
    
    if (!eventId || !ticketType || !quantity || !totalAmount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const insert = 'INSERT INTO bookings (eventId, ticketType, quantity, totalAmount) VALUES (?, ?, ?, ?)';
    db.run(insert, [eventId, ticketType, quantity, totalAmount], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: "Booking created successfully",
            bookingId: this.lastID
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
