import type { SteamGame } from './types';

export type SteamGameMap = {
  [appId: string]: SteamGame;
};

export const steamGameDetails: SteamGameMap = {};
