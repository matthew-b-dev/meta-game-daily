# MetaGameDaily

A daily Video Games Industry puzzle where players identify games based on limited information.

Play the live game [here](https://metagamedaily.com/).

## How to Play

- **Objective**: Guess all 5 video games in the daily puzzle
- **Guesses**: You have 10 total guesses to identify all games
- **Starting Info**: Each game shows its release year and developer(s)
- **Reveal System**: Click the '+' button to expand a game and reveal additional information
  - Revealing information costs points from your total score
  - More valuable hints (like screenshots) cost more points
  - Strategic reveals can help you make educated guesses
- **Completion**: The game ends when all games are guessed or all 10 guesses are used


Share text:

```
https://metagamedaily.com
Jan 23, 2026
🟥🟥🟥🟨🟨
🏆 250 points | 🏅 Rank #10 of 17
```

### Scoring

- Start with 1000 points
- Each piece of revealed information deducts points:
  - Genre(s): -5 points
  - Release Date: -5 points
  - Platform(s): -10 points
  - Publisher(s): -30 points
  - Screenshot: -50 points
- Giving up (revealing game name): lose all (200) points for that particular game

### Bonus Points

- If every game is eventually guessed, +20 points will be awarded for **every** unused guess
- Achieving the maximum total score of 1100 is called a **Perfection**.
  - 1000 base score for not revealing any information
  - +100 bonus points: 5 guesses remaining \* 20 points

### Close Guesses

If you make a guess that's very similar to a correct answer, you'll see a special indicator:

- 🤏 The guess was close and likely within the same franchise
- ❌ Totally incorrect

## Weekend Shuffle

The **Weekend Shuffle** is a special game mode available on **Saturdays and Sundays**.

### How to Play

- It's a sorting challenge with **3 rounds**
- Each round gives you **5 games** to sort by a different criterion
- **Drag and drop** the games to reorder them, then submit your guess
- Games in the correct position will **lock in place** (shown in green)
- Your goal is to **sort all three lists in as few guesses as possible**
- Your **total guess count** is tracked across all 3 rounds
- Try to score better than the global average!

### Round Details

- **Round 1**: Sort by time (shortest to longest)
- **Round 2**: Sort by release year (oldest to newest)


Share text:

```
https://metagamedaily.com/
2026-01-04
#WeekendShuffle
1️⃣ 🟨🟩
2️⃣ 🟨🟨🟩
3️⃣ 🟨🟩
```

---

## Technologies

- **React**
- **Vite**
- [framer-motion](https://motion.dev/) - animations
- [react-hot-toast](https://react-hot-toast.com/) - notifications
- [dnd-kit](https://dndkit.com/) - sortable items in WeekendShuffle game mode
- [react-apexcharts](https://apexcharts.com/docs/react-charts/) - line chart in global stats view

## Credits

- GuessingGame gameplay inspired by [boxofficega.me](https://boxofficega.me)
- WeekendShuffle gameplay inspired by [playdisorderly.com](https://playdisorderly.com/)
- Screenshots sourced from [IGDB](https://www.igdb.com/)

<!-- Add your screenshot here -->

## Developer notes

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd meta-game-daily

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Build for Production

```bash
npm run build
```
