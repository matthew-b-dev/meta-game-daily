import { useState, useMemo } from 'react';
import Select from 'react-select';
import { steamGameDetails } from '../../steam_game_detail';
import { dummyGames } from '../../dummy_games';

export interface GameOption {
  value: string;
  label: string;
}

interface GameInputProps {
  onGuess: (selected: GameOption | null) => void;
  disabled?: boolean;
  previousGuesses?: string[];
}

export const GameInput: React.FC<GameInputProps> = ({
  onGuess,
  disabled,
  previousGuesses = [],
}) => {
  const [guess, setGuess] = useState<GameOption | null>(null);
  const [inputValue, setInputValue] = useState('');

  // Create game options for react-select
  const gameOptions: GameOption[] = useMemo(() => {
    // Get all steam game names
    const steamGames = Object.values(steamGameDetails).map((game) => game.name);

    // Create a Set of steam game names for quick lookup
    const steamGameSet = new Set(steamGames);

    // Filter dummy games to exclude duplicates with steam games
    const filteredDummyGames = dummyGames.filter(
      (game) => !steamGameSet.has(game),
    );

    // Combine steam games with filtered dummy games
    const allGames = [...steamGames, ...filteredDummyGames];

    // Filter out previously guessed games
    const previousGuessesSet = new Set(previousGuesses);
    const availableGames = allGames.filter(
      (game) => !previousGuessesSet.has(game),
    );

    // Convert to options format
    return availableGames.map((name) => ({
      value: name,
      label: name,
    }));
  }, [previousGuesses]);

  // Filter options based on input
  const filteredOptions = useMemo(() => {
    if (!inputValue || inputValue.length < 3) return [];

    const searchLower = inputValue.toLowerCase();
    return gameOptions.filter((option) =>
      option.label.toLowerCase().includes(searchLower),
    );
  }, [inputValue, gameOptions]);

  const handleChange = (selected: GameOption | null) => {
    onGuess(selected);
    setGuess(null);
    setInputValue('');
  };

  return (
    <div className='mb-6'>
      <Select
        options={filteredOptions}
        value={guess}
        onChange={handleChange}
        placeholder='Guess the game...'
        isClearable
        inputValue={inputValue}
        onInputChange={setInputValue}
        menuIsOpen={inputValue.length >= 3}
        filterOption={() => true}
        isDisabled={disabled}
        components={{
          IndicatorSeparator: () => null,
          DropdownIndicator: () => null,
        }}
        styles={{
          control: (provided) => ({
            ...provided,
            backgroundColor: provided.backgroundColor,
          }),
          option: (provided, state) => ({
            ...provided,
            color: 'black',
            backgroundColor: state.isFocused ? '#e6e6e6' : 'white',
            textAlign: 'left',
          }),
          singleValue: (provided) => ({
            ...provided,
            color: 'black',
            textAlign: 'left',
          }),
          input: (provided) => ({
            ...provided,
            color: 'black',
            textAlign: 'left',
          }),
          menu: (provided) => ({
            ...provided,
            backgroundColor: 'white',
          }),
          placeholder: (provided) => ({
            ...provided,
            textAlign: 'left',
          }),
          valueContainer: (provided) => ({
            ...provided,
            textAlign: 'left',
          }),
        }}
      />
    </div>
  );
};
