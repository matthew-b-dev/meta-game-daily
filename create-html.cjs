const fs = require('fs');

const games = JSON.parse(fs.readFileSync('game-data.json', 'utf8'));

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game Screenshots Verification</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #1a1a1a;
            color: #ffffff;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            text-align: center;
            margin-bottom: 40px;
            color: #fbbf24;
        }
        .game-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 30px;
        }
        .game-card {
            background-color: #2a2a2a;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }
        .game-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            text-align: center;
            color: #fbbf24;
            min-height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .game-screenshot {
            width: 100%;
            height: auto;
            border-radius: 4px;
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Game Screenshots Verification (${games.length} Games)</h1>
        <div class="game-grid">
`;

let cards = '';
for (const game of games) {
    cards += `            <div class="game-card">
                <div class="game-title">${game.name}</div>
                <img class="game-screenshot" src="${game.screenshotUrl}" alt="${game.name}" loading="lazy">
            </div>
`;
}

const footer = `        </div>
    </div>
</body>
</html>`;

fs.writeFileSync('screenshots.html', html + cards + footer);
console.log(`Created screenshots.html with ${games.length} games`);
