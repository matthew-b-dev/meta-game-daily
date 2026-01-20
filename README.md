# MetaGameDaily

A daily Video Games Industry puzzle where players identify games based on limited information.
Play the live game [here](https://matthew-b-dev.github.io/meta-game-daily/) via GitHub pages!

## How to Play

- **Objective**: Guess all 5 video games in the daily puzzle
- **Guesses**: You have 10 total guesses to identify all games
- **Starting Info**: Each game shows its release year and developer(s)
- **Reveal System**: Click the '+' button to expand a game and reveal additional information
  - Revealing information costs points from your total score
  - More valuable hints (like screenshots) cost more points
  - Strategic reveals can help you make educated guesses
- **Completion**: The game ends when all games are guessed or all 10 guesses are used

### Screenshot

<img width="851" height="879" alt="image" src="https://github.com/user-attachments/assets/a8fcc334-e0bf-4ae1-b0b0-2fd6b107afce" />

### Scoring

- Start with 1000 points
- Each piece of revealed information deducts points:
  - Publisher: -10 points
  - OpenCritic™ Score: -15 points
  - Genres: -20 points
  - Release Date: -25 points
  - Platforms: -30 points
  - Screenshot: -50 points
- Giving up (revealing game name): lose all points for that particular game

### Close Guesses

If you make a guess that's very similar to a correct answer, you'll see a special indicator:

- 🤏 Yellow background = Your guess was close! Try something similar.
- ❌ Red background = Not close to any answer

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Hot Toast** - Notifications
- **Heroicons** - Icons

## Credits

- Gameplay inspired by [boxofficega.me](https://boxofficega.me)
- Details and screenshots sourced from [IGDB](https://www.igdb.com/)
- Critic scores sourced from [OpenCritic](https://opencritic.com/)

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
