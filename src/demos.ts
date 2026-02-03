export const DATE_OVERRIDE: string | null = null; // '2026-02-01'

// Demo days configuration - hardcode specific games for specific dates
// Format: 'YYYY-MM-DD': ['Game Title 1', 'Game Title 2', ...]
export const DEMO_DAYS: { [date: string]: string[] } = {
  '2026-01-20': [
    'The Last of Us Part II',
    'Pentiment',
    'Valiant Hearts: The Great War',
    'Mighty No. 9',
    'Ace Combat 7: Skies Unknown',
  ],
  '2026-01-21': [
    'Rayman Legends',
    'Prince of Persia: The Lost Crown',
    'Yakuza: Like a Dragon',
    'Octopath Traveler II',
    'Moonlighter',
  ],
  '2026-01-22': [
    'Neon White',
    'Hollow Knight',
    'Suicide Squad: Kill The Justice League',
    "Luigi's Mansion 3",
    'Forza Horizon 3',
  ],
  '2026-01-23': [
    'Dota 2',
    'Owlboy',
    'A Hat in Time',
    'Visions of Mana',
    'Redfall',
  ],
  '2026-01-24': [
    'Star Wars Jedi: Survivor',
    "Teenage Mutant Ninja Turtles: Shredder's Revenge",
    'Donkey Kong Country: Tropical Freeze',
    'LEGO Jurassic World',
    'Silent Hill 2',
  ],
  '2026-01-25': [
    'The Legend of Zelda: Echoes of Wisdom',
    'SteamWorld Dig',
    'Skull and Bones',
    'Hot Wheels Unleashed',
    'Bayonetta 3',
  ],
  '2026-01-26': [
    'Ori and the Will of the Wisps',
    'Hyrule Warriors',
    'Splatoon 3',
    'Puyo Puyo Tetris',
    'Neverwinter',
  ],
  '2026-01-27': [
    "Assassin's Creed Valhalla",
    'Forza Horizon 4',
    'Mario Golf: Super Rush',
    'Tekken 8',
    'Sea of Stars',
  ],
  '2026-01-28': [
    'Monster Hunter Rise',
    'XCOM 2',
    'Dave the Diver',
    'Mortal Kombat X',
    'Dark Souls II',
  ],
  '2026-01-29': [
    'Super Mario 3D World',
    'Metaphor: ReFantazio',
    'A Plague Tale: Requiem',
    'Batman: Arkham Knight',
    'Dead or Alive 6',
  ],
  '2026-01-30': [
    'Hi-Fi Rush',
    'Animal Well',
    'Pokémon Sun and Moon',
    'Rocket League',
    "Tom Clancy's Ghost Recon: Wildlands",
  ],
  '2026-01-31': [
    'Deathloop',
    'Final Fantasy XV',
    'The Legend of Zelda: Tears of the Kingdom',
    'Call of Duty: Black Ops 6',
    'Tekken 7',
  ],
  '2026-02-02': [
    'Resident Evil 2',
    "Uncharted 4: A Thief's End",
    'Cyberpunk 2077',
    'Ghost of Tsushima',
    'Dishonored 2',
  ],
  '2026-02-03': [
    'Metal Gear Solid V: The Phantom Pain',
    'Remnant II',
    'Super Mario Bros. Wonder',
    'Bayonetta 2',
    'Peggle 2',
  ],
};

/**
 * Sunday Shuffle demo days - hardcoded specific games for specific dates
 * Format: 'YYYY-MM-DD': ['Game Title 1', 'Game Title 2', ...]
 */
export const SUNDAY_SHUFFLE_DEMO_DAYS: { [date: string]: string[] } = {
  // Start empty
};

/**
 * Steam Detective demo days - hardcode specific game for specific dates
 * Format: 'YYYY-MM-DD': 'Game Title'
 * Use the exact game name as it appears in steam_game_detail.ts
 */
/*
[Ideas]

Easy
XCOM 2
BioShock Infinite
Bastion
Hitman: Absolution

Great Easy:
Rust

Medium
Castle Crashers
Papers, Please
The Forest
Space Engineers

Great Medium:
Plague Inc: Evolved

Hard
Crusader Kings II
Slime Rancher 2
Magicka

Great Hard:


"blurredUserTags": ["Warhammer"],
"clueOrder": ["desc", "tags", "details"],

READY:


    Desc > tags > Details
    Desc > details > tags

TRULY DONE
Mount and Blade II: Bannerlord
Gang Beasts
The Witcher 3: Wild Hunt
Elite Dangerous
DARK SOULS II
Frostpunk
The Long Dark
Life is Strange - Episode 1
Far Cry 4
No Man's Sky

Up to bat:
ASTRONEER

*/

export const STEAM_DETECTIVE_DEMO_DAYS: { [date: string]: string } = {
  // Example:
  // '2026-02-01': 'Dota 2',
  '2026-02-02': 'Far Cry 4',
};

/* 

Ideas:

[Pokémon games]:

'Pokémon X and Y',
'Pokémon Omega Ruby and Alpha Sapphire',
'Pokémon Sword and Shield',
'Pokémon Scarlet and Violet',


[Call of Duty Games]
[Total War games]

[Random]
Valve 2020 Redacted Name : Half-Life Alyx
Derek Yu (Mossmouth) Redacted Name: Spelunky 2

*/
