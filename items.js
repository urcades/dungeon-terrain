/**
 * Items System for Dungeon Terrain
 *
 * This file defines the items that can be equipped in a character's inventory.
 * - Weapons: Can be placed in either hand and affect damage output
 * - Clothing/Armor: Apply stat modifiers to all user stats
 * - Rings: Provide stat modifiers and special effects
 * - Talismans: Apply status effects and provide unique abilities
 */

// Status effect types
const STATUS_EFFECTS = {
  POISON: {
    name: "Poison",
    description: "Deals damage over time",
    effect: (target, power = 1) => {
      target.applyDebuff("health", -power, 5); // Damage per tick for 5 ticks
    },
  },
  FREEZE: {
    name: "Freeze",
    description: "Slows movement and attack speed",
    effect: (target, power = 1) => {
      target.applyDebuff("dexterity", -power * 3, 3); // Reduce dexterity for 3 ticks
    },
  },
  FLAME: {
    name: "Flame",
    description: "Burns the target, dealing damage over time",
    effect: (target, power = 1) => {
      target.applyDebuff("health", -power * 2, 3); // Damage per tick for 3 ticks
    },
  },
  DISMEMBERMENT: {
    name: "Dismemberment",
    description:
      "Chance to sever limbs, severely reducing combat effectiveness",
    effect: (target, power = 1) => {
      // 5% chance per point of power to cause dismemberment
      if (Math.random() < 0.05 * power) {
        target.applyDebuff("strength", -power * 5, 10);
        target.applyDebuff("dexterity", -power * 5, 10);
      }
    },
  },
  BLEED: {
    name: "Bleeding",
    description: "Causes blood loss and continuous damage",
    effect: (target, power = 1) => {
      target.applyDebuff("health", -power * 1.5, 4); // Damage per tick for 4 ticks
    },
  },
  STUN: {
    name: "Stun",
    description: "Temporarily prevents the target from acting",
    effect: (target, power = 1) => {
      // Implementation would depend on the combat system
      // For now, severely reduce dexterity
      target.applyDebuff("dexterity", -power * 8, 1); // Heavy but short debuff
    },
  },
  WEAKEN: {
    name: "Weaken",
    description: "Reduces the target's strength and stamina",
    effect: (target, power = 1) => {
      target.applyDebuff("strength", -power * 2, 4);
      target.applyDebuff("stamina", -power * 10, 4);
    },
  },
};

// Item base class
class Item {
  constructor(
    id,
    name,
    description,
    value,
    weight,
    rarity = "common",
    quantity = 1
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.value = value; // Gold value
    this.weight = weight;
    this.rarity = rarity; // common, uncommon, rare, epic, legendary
    this.quantity = quantity;
  }
}

// Weapon class
class Weapon extends Item {
  constructor(
    id,
    name,
    description,
    value,
    weight,
    rarity,
    damageType,
    baseDamage,
    statScaling,
    statusEffects = []
  ) {
    super(id, name, description, value, weight, rarity);
    this.type = "weapon";
    this.damageType = damageType; // slash, pierce, blunt, magic
    this.baseDamage = baseDamage;
    this.statScaling = statScaling; // { strength: 0.5, dexterity: 0.3 } - how weapon scales with stats
    this.statusEffects = statusEffects; // [{ type: STATUS_EFFECTS.POISON, chance: 0.2, power: 2 }]
    this.twoHanded = false; // Default to one-handed
  }

  // Calculate total damage based on wielder's stats
  calculateDamage(wielder) {
    let totalDamage = this.baseDamage;

    // Add stat scaling
    for (const [stat, scaling] of Object.entries(this.statScaling)) {
      if (wielder.stats[stat]) {
        totalDamage += wielder.stats[stat] * scaling;
      }
    }

    return totalDamage;
  }

  // Apply status effects based on chance
  applyStatusEffects(target) {
    for (const effect of this.statusEffects) {
      if (Math.random() < effect.chance) {
        effect.type.effect(target, effect.power);
      }
    }
  }
}

// Armor class
class Armor extends Item {
  constructor(
    id,
    name,
    description,
    value,
    weight,
    rarity,
    slot,
    defense,
    statModifiers = {}
  ) {
    super(id, name, description, value, weight, rarity);
    this.type = "armor";
    this.slot = slot; // head, chest, legs, arms
    this.defense = defense;
    this.statModifiers = statModifiers; // { strength: +2, dexterity: -1, etc. }
  }
}

// Ring class
class Ring extends Item {
  constructor(
    id,
    name,
    description,
    value,
    weight,
    rarity,
    statModifiers = {},
    specialEffect = null
  ) {
    super(id, name, description, value, weight, rarity);
    this.type = "ring";
    this.statModifiers = statModifiers;
    this.specialEffect = specialEffect; // Function or special effect description
  }
}

// Talisman class
class Talisman extends Item {
  constructor(
    id,
    name,
    description,
    value,
    weight,
    rarity,
    statModifiers = {},
    statusModifiers = []
  ) {
    super(id, name, description, value, weight, rarity);
    this.type = "talisman";
    this.statModifiers = statModifiers;
    this.statusModifiers = statusModifiers; // [{type: STATUS_EFFECTS.FLAME, resistance: 0.5}] or [{type: STATUS_EFFECTS.POISON, boost: 0.3}]
  }
}

// Item Instances
const WEAPONS = [
  // One-handed weapons
  new Weapon(
    "sword_short",
    "Short Sword",
    "A basic short sword. Fast but deals moderate damage.",
    50,
    3,
    "common",
    "slash",
    10,
    { strength: 0.3, dexterity: 0.5 }
  ),
  new Weapon(
    "axe_hand",
    "Hand Axe",
    "A small but powerful axe. Good for chopping.",
    45,
    4,
    "common",
    "slash",
    12,
    { strength: 0.6, dexterity: 0.2 }
  ),
  new Weapon(
    "mace_light",
    "Light Mace",
    "A lightweight mace that deals blunt damage.",
    40,
    4,
    "common",
    "blunt",
    11,
    { strength: 0.7, dexterity: 0.1 }
  ),
  new Weapon(
    "dagger_silver",
    "Silver Dagger",
    "A sharp dagger made of silver. Effective against certain creatures.",
    65,
    1,
    "uncommon",
    "pierce",
    8,
    { dexterity: 0.8 },
    [{ type: STATUS_EFFECTS.BLEED, chance: 0.3, power: 1 }]
  ),

  // Two-handed weapons
  new Weapon(
    "sword_great",
    "Greatsword",
    "A massive two-handed sword that deals heavy damage.",
    120,
    10,
    "uncommon",
    "slash",
    22,
    { strength: 0.9, dexterity: 0.2 }
  ),

  // Magic weapons
  new Weapon(
    "staff_flame",
    "Flame Staff",
    "A wooden staff topped with a red crystal that channels fire magic.",
    150,
    5,
    "rare",
    "magic",
    7,
    { intelligence: 0.9 },
    [{ type: STATUS_EFFECTS.FLAME, chance: 0.7, power: 3 }]
  ),

  // Special weapons
  new Weapon(
    "blade_frost",
    "Frostbite",
    "An enchanted blade that emanates cold. Chance to freeze enemies.",
    200,
    5,
    "rare",
    "slash",
    15,
    { strength: 0.4, dexterity: 0.4, intelligence: 0.3 },
    [{ type: STATUS_EFFECTS.FREEZE, chance: 0.4, power: 2 }]
  ),
  new Weapon(
    "sword_executioner",
    "Executioner's Blade",
    "A heavy blade designed for beheadings. High chance of dismemberment.",
    250,
    12,
    "epic",
    "slash",
    25,
    { strength: 1.1 },
    [{ type: STATUS_EFFECTS.DISMEMBERMENT, chance: 0.2, power: 3 }]
  ),
  new Weapon(
    "whip_poison",
    "Venom Whip",
    "A whip coated in deadly venom. Applies poison on hit.",
    180,
    3,
    "rare",
    "slash",
    12,
    { dexterity: 0.7 },
    [{ type: STATUS_EFFECTS.POISON, chance: 0.8, power: 2 }]
  ),
];

// Initialize two-handed property for appropriate weapons
WEAPONS.find((w) => w.id === "sword_great").twoHanded = true;
WEAPONS.find((w) => w.id === "staff_flame").twoHanded = true;

const ARMOR = [
  // Head armor
  new Armor(
    "helm_iron",
    "Iron Helmet",
    "Basic iron helmet that provides decent protection.",
    60,
    5,
    "common",
    "head",
    5,
    { vitality: 1 }
  ),
  new Armor(
    "hood_leather",
    "Leather Hood",
    "A lightweight hood that allows for better awareness.",
    40,
    2,
    "common",
    "head",
    3,
    { dexterity: 1, luck: 1 }
  ),
  new Armor(
    "crown_mage",
    "Mage's Crown",
    "A crown inscribed with arcane symbols.",
    120,
    3,
    "rare",
    "head",
    2,
    { intelligence: 3, faith: 1, magic: 2 }
  ),

  // Chest armor
  new Armor(
    "plate_steel",
    "Steel Plate Armor",
    "Heavy plate armor offering excellent protection at the cost of mobility.",
    150,
    20,
    "uncommon",
    "chest",
    15,
    { vitality: 3, endurance: 2, strength: 1, dexterity: -2 }
  ),
  new Armor(
    "robe_enchanted",
    "Enchanted Robes",
    "Robes imbued with magical protections.",
    140,
    5,
    "rare",
    "chest",
    6,
    { intelligence: 4, faith: 2, resistance: 3, strength: -1 }
  ),
  new Armor(
    "tunic_hunter",
    "Hunter's Tunic",
    "Light leather tunic favored by hunters for its flexibility.",
    80,
    8,
    "uncommon",
    "chest",
    8,
    { dexterity: 3, endurance: 2, luck: 1 }
  ),

  // Legs armor
  new Armor(
    "greaves_iron",
    "Iron Greaves",
    "Standard iron leg protection.",
    70,
    12,
    "common",
    "legs",
    8,
    { vitality: 2, endurance: 1 }
  ),
  new Armor(
    "pants_leather",
    "Leather Pants",
    "Lightweight and flexible pants made of treated leather.",
    45,
    5,
    "common",
    "legs",
    4,
    { dexterity: 2, luck: 1 }
  ),

  // Arms armor
  new Armor(
    "gauntlets_iron",
    "Iron Gauntlets",
    "Heavy gauntlets that protect the hands and forearms.",
    55,
    7,
    "common",
    "arms",
    6,
    { strength: 1 }
  ),
  new Armor(
    "bracers_leather",
    "Leather Bracers",
    "Light arm protection that doesn't hinder movement.",
    35,
    3,
    "common",
    "arms",
    3,
    { dexterity: 1 }
  ),
];

const RINGS = [
  new Ring(
    "ring_strength",
    "Ring of Might",
    "A heavy iron ring that bolsters physical strength.",
    100,
    0.2,
    "uncommon",
    { strength: 3 }
  ),
  new Ring(
    "ring_dexterity",
    "Ring of Precision",
    "A thin silver band that enhances reflexes and coordination.",
    110,
    0.1,
    "uncommon",
    { dexterity: 3 }
  ),
  new Ring(
    "ring_intelligence",
    "Ring of Wisdom",
    "A ring set with a blue crystal that enhances mental faculties.",
    120,
    0.2,
    "uncommon",
    { intelligence: 3 }
  ),
  new Ring(
    "ring_vitality",
    "Ring of Endurance",
    "A thick bronze ring that improves constitution.",
    100,
    0.3,
    "uncommon",
    { vitality: 2, endurance: 2 }
  ),
  new Ring(
    "ring_fire",
    "Ring of Fire Resistance",
    "A ring forged in volcanic fires that grants protection from heat.",
    150,
    0.2,
    "rare",
    { resistance: 2 },
    "Reduces fire damage taken by 25%"
  ),
  new Ring(
    "ring_poison",
    "Ring of Antivenom",
    "A ring set with a green stone that neutralizes toxins.",
    140,
    0.2,
    "rare",
    { resistance: 2 },
    "Provides immunity to poison effects"
  ),
  new Ring(
    "ring_vampire",
    "Vampiric Ring",
    "A dark metal ring with red engravings that drains life from enemies.",
    200,
    0.2,
    "epic",
    { strength: 1, vitality: 1 },
    "Heals 10% of damage dealt"
  ),
  new Ring(
    "ring_luck",
    "Fortune's Favor",
    "A gold ring with unpredictable magical properties.",
    180,
    0.1,
    "rare",
    { luck: 5 },
    "Increases critical hit chance by 10%"
  ),
];

const TALISMANS = [
  new Talisman(
    "talisman_fire",
    "Flame Emblem",
    "A metal emblem emblazoned with a flame symbol.",
    120,
    0.5,
    "uncommon",
    { intelligence: 2 },
    [{ type: STATUS_EFFECTS.FLAME, boost: 0.5 }]
  ),
  new Talisman(
    "talisman_frost",
    "Frost Pendant",
    "A pendant containing a shard of never-melting ice.",
    125,
    0.5,
    "uncommon",
    { intelligence: 2 },
    [{ type: STATUS_EFFECTS.FREEZE, boost: 0.5 }]
  ),
  new Talisman(
    "talisman_bleeding",
    "Crimson Charm",
    "A charm made from a crimson stone that pulses like a heartbeat.",
    130,
    0.4,
    "uncommon",
    { strength: 1, dexterity: 1 },
    [{ type: STATUS_EFFECTS.BLEED, boost: 0.4 }]
  ),
  new Talisman(
    "talisman_protection",
    "Guardian's Seal",
    "An ancient seal said to ward off harm.",
    180,
    0.5,
    "rare",
    { vitality: 3, resistance: 2 },
    [
      { type: STATUS_EFFECTS.POISON, resistance: 0.5 },
      { type: STATUS_EFFECTS.FREEZE, resistance: 0.3 },
      { type: STATUS_EFFECTS.FLAME, resistance: 0.3 },
    ]
  ),
  new Talisman(
    "talisman_dragon",
    "Dragon's Heart",
    "A talisman containing the essence of a dragon.",
    250,
    0.6,
    "epic",
    { strength: 2, vitality: 2, resistance: 2 },
    [{ type: STATUS_EFFECTS.FLAME, boost: 0.7 }]
  ),
  new Talisman(
    "talisman_assassin",
    "Assassin's Mark",
    "A black medallion worn by elite assassins.",
    240,
    0.3,
    "epic",
    { dexterity: 3, luck: 2 },
    [
      { type: STATUS_EFFECTS.POISON, boost: 0.6 },
      { type: STATUS_EFFECTS.BLEED, boost: 0.6 },
    ]
  ),
  new Talisman(
    "talisman_berserker",
    "Berserker's Rage",
    "A talisman that channels primal fury.",
    220,
    0.5,
    "rare",
    { strength: 4, dexterity: -1, intelligence: -1 },
    [{ type: STATUS_EFFECTS.DISMEMBERMENT, boost: 0.4 }]
  ),
];

// Export all items as a combined collection
const ALL_ITEMS = {
  weapons: WEAPONS,
  armor: ARMOR,
  rings: RINGS,
  talismans: TALISMANS,
};

// Helper function to find an item by ID
function findItemById(id) {
  // Check each category
  for (const category in ALL_ITEMS) {
    const found = ALL_ITEMS[category].find((item) => item.id === id);
    if (found) return found;
  }
  return null;
}

// Helper function to get all items of a specific type
function getItemsByType(type) {
  console.log(`DEBUG: getItemsByType called with type: ${type}`);

  if (!type) {
    console.error("ERROR: getItemsByType called with null or undefined type");
    console.trace("Stack trace for invalid type");
    return [];
  }

  let result = [];
  switch (type.toLowerCase()) {
    case "weapon":
      result = ALL_ITEMS.weapons;
      break;
    case "armor":
      result = ALL_ITEMS.armor;
      break;
    case "ring":
      result = ALL_ITEMS.rings;
      break;
    case "talisman":
      result = ALL_ITEMS.talismans;
      break;
    default:
      console.error(`ERROR: Unknown item type: ${type}`);
      return [];
  }

  console.log(`DEBUG: Found ${result.length} items of type ${type}`);

  // Check if result is undefined or not an array
  if (!result || !Array.isArray(result)) {
    console.error(
      `ERROR: Invalid result from getItemsByType for ${type}: ${result}`
    );
    return [];
  }

  return result;
}
