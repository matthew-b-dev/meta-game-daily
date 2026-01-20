import React from 'react';
import Select from 'react-select';

interface GameOption {
  value: string;
  label: string;
}

interface GuessInputProps {
  filteredOptions: GameOption[];
  guess: GameOption | null;
  onGuess: (selected: GameOption | null) => void;
  inputValue: string;
  setInputValue: (val: string) => void;
  gameOver: boolean;
  nonSpecialCharCount: number;
}

const GuessInput: React.FC<GuessInputProps> = ({
  filteredOptions,
  guess,
  onGuess,
  inputValue,
  setInputValue,
  gameOver,
  nonSpecialCharCount,
}) => {
  return (
    <Select
      options={filteredOptions}
      value={guess}
      onChange={onGuess}
      placeholder="Guess a game..."
      isClearable
      inputValue={inputValue}
      onInputChange={setInputValue}
      menuIsOpen={!gameOver && nonSpecialCharCount >= 3}
      isDisabled={gameOver}
      components={{
        IndicatorSeparator: () => null,
        DropdownIndicator: () => null,
      }}
      styles={{
        control: (provided, state) => ({
          ...provided,
          backgroundColor: state.isDisabled
            ? '#4b5563'
            : provided.backgroundColor,
          borderColor: state.isDisabled ? '#6b7280' : provided.borderColor,
          cursor: state.isDisabled ? 'not-allowed' : 'default',
        }),
        option: (provided, state) => ({
          ...provided,
          color: 'black',
          backgroundColor: state.isFocused ? '#e6e6e6' : 'white',
          textAlign: 'left',
        }),
        singleValue: (provided, state) => ({
          ...provided,
          color: state.isDisabled ? '#9ca3af' : 'black',
          textAlign: 'left',
        }),
        input: (provided, state) => ({
          ...provided,
          color: state.isDisabled ? '#9ca3af' : 'black',
          textAlign: 'left',
        }),
        menu: (provided) => ({
          ...provided,
          backgroundColor: 'white',
        }),
        placeholder: (provided, state) => ({
          ...provided,
          color: state.isDisabled ? '#9ca3af' : provided.color,
          textAlign: 'left',
        }),
        valueContainer: (provided) => ({
          ...provided,
          textAlign: 'left',
        }),
      }}
    />
  );
};

export default GuessInput;
