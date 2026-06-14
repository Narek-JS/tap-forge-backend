export enum UpgradeType {
  TAP_POWER = 'tap_power',
  ENERGY_CAPACITY = 'energy_capacity',
  ENERGY_REGEN = 'energy_regen',
}

export interface UpgradeDefinition {
  type: UpgradeType;
  name: string;
  description: string;
  maxLevel: number;
  getCost: (currentLevel: number) => number;
  getEffect: (newLevel: number) => number;
}

export const UPGRADE_DEFINITIONS: UpgradeDefinition[] = [
  {
    type: UpgradeType.TAP_POWER,
    name: 'Tap Power',
    description: 'Increase coins earned per tap',
    maxLevel: 50,
    getCost: (level) => Math.floor(100 * Math.pow(1.5, level)),
    getEffect: (level) => level + 1,
  },
  {
    type: UpgradeType.ENERGY_CAPACITY,
    name: 'Energy Tank',
    description: 'Increase maximum energy capacity',
    maxLevel: 20,
    getCost: (level) => Math.floor(200 * Math.pow(2, level)),
    getEffect: (level) => 500 + level * 500,
  },
  {
    type: UpgradeType.ENERGY_REGEN,
    name: 'Energy Regen',
    description: 'Increase energy regeneration rate (per second)',
    maxLevel: 10,
    getCost: (level) => Math.floor(500 * Math.pow(3, level)),
    getEffect: (level) => level + 1,
  },
];
