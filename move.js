const fs = require('fs');
const path = require('path');

const dirs = ['frontend', 'backend', 'database'];
dirs.forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d);
});

const moves = [
    ['index.html', 'frontend/index.html'],
    ['style.css', 'frontend/style.css'],
    ['script.js', 'frontend/script.js'],
    ['server.js', 'backend/server.js'],
    ['package.json', 'backend/package.json'],
    ['package-lock.json', 'backend/package-lock.json'],
    ['database.js', 'database/database.js'],
    ['events.db', 'database/events.db']
];

moves.forEach(([src, dest]) => {
    if (fs.existsSync(src)) {
        fs.renameSync(src, dest);
        console.log(`Moved ${src} to ${dest}`);
    }
});

if (fs.existsSync('node_modules')) {
    fs.renameSync('node_modules', 'backend/node_modules');
    console.log('Moved node_modules to backend/node_modules');
}

if (fs.existsSync('test-api.js')) {
    fs.unlinkSync('test-api.js');
}

console.log("\nFolders separated successfully! 🎉");
console.log("To run the backend now, cd into backend/ and run node server.js");
