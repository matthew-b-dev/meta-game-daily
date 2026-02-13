import type { GameUpdateConfig } from '../lib/gameUpdateBanners';
import Feb2026BalancingBanner from '../components/Feb2026BalancingBanner';

export const gameUpdateBanners: GameUpdateConfig[] = [
  {
    id: 'feb-2026-balancing-update',
    startDate: '2026-02-13',
    endDate: '2026-02-15',
    displayDate: 'Feb 13, 2026',
    content: (onDismiss) => <Feb2026BalancingBanner onDismiss={onDismiss} />,
  },
];
