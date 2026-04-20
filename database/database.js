const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'events.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                category TEXT,
                date TEXT,
                location TEXT,
                price REAL,
                image TEXT
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                eventId INTEGER,
                ticketType TEXT,
                quantity INTEGER,
                totalAmount REAL,
                bookingDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (eventId) REFERENCES events(id)
            )`);

            db.get("SELECT COUNT(*) AS count FROM events", (err, row) => {
                if (row.count === 0) {
                    const insert = 'INSERT INTO events (title, category, date, location, price, image) VALUES (?, ?, ?, ?, ?, ?)';
                    
                    const initialEvents = [
                        ["Neon Nights Music Festival", "Music", "Aug 15, 2026 - 8:00 PM", "Central Park Arena, NY", 99, "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"],
                        ["Tech Innovators Summit", "Conference", "Sep 02, 2026 - 9:00 AM", "Moscone Center, SF", 149, "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80"],
                        ["Global E-Sports Championship", "Sports", "Oct 20, 2026 - 1:00 PM", "Staples Center, LA", 75, "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"],
                        ["Modern Art Exhibition", "Art", "Nov 10, 2026 - 10:00 AM", "Tate Modern, London", 45, "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80"],
                        ["Jazz & Blues Evening", "Music", "Dec 05, 2026 - 7:30 PM", "Blue Note, Chicago", 60, "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80"],
                        ["Culinary Masterclass", "Food", "Jan 12, 2027 - 11:00 AM", "Culinary Institute, Paris", 120, "https://images.unsplash.com/photo-1556910103-1c02745a872f?w=800&q=80"]
                    ];

                    initialEvents.forEach(event => {
                        db.run(insert, event);
                    });
                    
                    console.log('Database seeded with initial events.');
                }
            });
        });
    }
});

module.exports = db;
