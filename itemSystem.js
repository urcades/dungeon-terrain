/**
 * Item Distribution and Pickup System for Dungeon Terrain
 */

// Store items that are placed on the map
let mapItems = [];

/**
 * Distributes items randomly across a map
 * @param {Array} map - The map array
 * @param {number} floorCount - Number of navigable floor tiles (optional)
 * @returns {Array} - Modified map with items
 */
function distributeItems(map) {
  // Clear previous items
  mapItems = [];
  console.log("Distributing items on map...");

  // Verify map is valid before proceeding
  if (!map || typeof map !== "object" || !map.length) {
    console.error(`ERROR: Invalid map passed to distributeItems: ${map}`);
    console.trace("Stack trace for invalid map");
    return []; // Return empty array to prevent further errors
  }

  // Count navigable floor tiles
  let navigableTiles = 0;
  for (let i = 0; i < map.length; i++) {
    if (map[i] === ".") {
      navigableTiles++;
    }
  }
  console.log(`Map has ${navigableTiles} navigable floor tiles.`);

  // Calculate how many items to place (between 10 and 40)
  // More items for larger navigable areas, with some randomness
  const minItems = 10;
  const maxItems = 40;
  const baseItemCount =
    minItems +
    Math.floor(
      (navigableTiles / (MAP_WIDTH * MAP_HEIGHT)) * (maxItems - minItems)
    );
  const itemCount = Math.min(
    maxItems,
    baseItemCount + Math.floor(Math.random() * 10) - 5
  );
  console.log(`Will attempt to place ${itemCount} items.`);

  // Distribute items
  let placedItems = 0;
  let maxAttempts = itemCount * 10; // Prevent infinite loops
  let attempts = 0;

  while (placedItems < itemCount && attempts < maxAttempts) {
    attempts++;

    // Pick a random position
    const x = Math.floor(Math.random() * MAP_WIDTH);
    const y = Math.floor(Math.random() * MAP_HEIGHT);
    const index = y * MAP_WIDTH + x;

    // Only place items on empty floor tiles
    if (map[index] === ".") {
      // Decide what type of item to place
      // 40% weapons, 30% armor, 30% rings/talismans
      const itemTypeRoll = Math.random();
      let itemType, itemSymbol;

      if (itemTypeRoll < 0.4) {
        itemType = "weapon";
        itemSymbol = "\\";
      } else if (itemTypeRoll < 0.7) {
        itemType = "armor";
        itemSymbol = "&";
      } else {
        itemType = Math.random() < 0.5 ? "ring" : "talisman";
        itemSymbol = "$";
      }

      // Select a random item from the appropriate category
      const items = getItemsByType(itemType);
      if (items.length > 0) {
        const selectedItem = items[Math.floor(Math.random() * items.length)];

        // Debug log the complete item
        console.log(
          `DEBUG: Selected ${itemType} item:`,
          JSON.stringify(selectedItem, null, 2)
        );

        // For armor, verify it has a slot property
        if (itemType === "armor") {
          console.log(`DEBUG: Armor slot: ${selectedItem.slot || "MISSING!"}`);
        }

        // Add item to mapItems array
        mapItems.push({
          x: x,
          y: y,
          item: selectedItem,
          symbol: itemSymbol,
        });

        placedItems++;

        if (placedItems % 5 === 0) {
          console.log(`Placed ${placedItems}/${itemCount} items so far...`);
        }
      }
    }
  }

  console.log(
    `Placed ${placedItems} items on the map after ${attempts} attempts.`
  );
  return mapItems;
}

/**
 * Updates the map with item symbols
 * @param {Array} map - The map array to update with item symbols
 */
function updateMapWithItems(map) {
  console.log(`Updating map with ${mapItems.length} items`);

  // Verify map is valid before proceeding
  if (!map || typeof map !== "object") {
    console.error(`ERROR: Invalid map passed to updateMapWithItems: ${map}`);
    console.trace("Stack trace for invalid map");
    return; // Exit early to prevent errors
  }

  // Place item symbols on the map
  for (const mapItem of mapItems) {
    const index = mapItem.y * MAP_WIDTH + mapItem.x;
    // Only place on floor tiles (in case the map has changed)
    if (map[index] === ".") {
      console.log(
        `Placing ${mapItem.item.name} (${mapItem.symbol}) at (${mapItem.x}, ${mapItem.y})`
      );
      map[index] = mapItem.symbol;
    } else {
      console.log(
        `Cannot place item at (${mapItem.x}, ${mapItem.y}) - tile is not a floor: '${map[index]}'`
      );
    }
  }

  // Verification scan - count items on map for debugging
  let weaponCount = 0;
  let armorCount = 0;
  let trinketCount = 0;

  for (let i = 0; i < map.length; i++) {
    if (map[i] === "\\") weaponCount++;
    if (map[i] === "&") armorCount++;
    if (map[i] === "$") trinketCount++;
  }

  console.log(
    `Map now contains ${weaponCount} weapons, ${armorCount} armor pieces, and ${trinketCount} trinkets`
  );
}

/**
 * Checks if there's an item at the given position
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Object|null} - The item object or null if no item found
 */
function getItemAtPosition(x, y) {
  console.log(
    `Searching for items at (${x}, ${y}). Total items on map: ${mapItems.length}`
  );

  // Debug log all items on the map
  if (mapItems.length > 0) {
    console.log("Current map items:");
    mapItems.forEach((item, index) => {
      console.log(
        `  Item ${index}: (${item.x}, ${item.y}) - ${item.item.name} (${item.symbol})`
      );
    });
  }

  const itemIndex = mapItems.findIndex((item) => item.x === x && item.y === y);
  if (itemIndex >= 0) {
    console.log(`Found item at index ${itemIndex}`);
    const item = mapItems[itemIndex];
    // Remove the item from the map
    mapItems.splice(itemIndex, 1);
    console.log(`Removed item from map. ${mapItems.length} items remaining.`);
    return item.item;
  }

  console.log("No item found at this position");
  return null;
}

/**
 * Attempts to pick up an item at the player's position
 * @param {Object} player - The player object
 * @param {Array} map - The current map
 * @returns {boolean} - Whether an item was picked up
 */
function pickupItem(player, map) {
  console.log(`Checking for item at position (${player.x}, ${player.y})`);

  // Verify map and player are valid before proceeding
  if (!map || typeof map !== "object" || !map.length) {
    console.error(`ERROR: Invalid map passed to pickupItem: ${map}`);
    console.trace("Stack trace for invalid map");
    return false; // Exit early to prevent errors
  }

  if (
    !player ||
    typeof player !== "object" ||
    typeof player.x !== "number" ||
    typeof player.y !== "number"
  ) {
    console.error(`ERROR: Invalid player passed to pickupItem: ${player}`);
    console.trace("Stack trace for invalid player");
    return false; // Exit early to prevent errors
  }

  // First, try to find the item in the mapItems array
  let item = getItemAtPosition(player.x, player.y);

  // If no item found in mapItems but there's an item symbol on the map, create a fallback item
  if (!item) {
    const cellIndex = player.y * MAP_WIDTH + player.x;
    const cellChar = map[cellIndex];
    console.log(
      `No item in mapItems array, checking map character: '${cellChar}'`
    );

    // If there's an item symbol on the map, create a fallback item
    if (cellChar === "\\" || cellChar === "&" || cellChar === "$") {
      console.log(
        `Found item symbol on map: '${cellChar}', creating fallback item`
      );

      let itemType;
      if (cellChar === "\\") itemType = "weapon";
      else if (cellChar === "&") itemType = "armor";
      else if (cellChar === "$")
        itemType = Math.random() < 0.5 ? "ring" : "talisman";

      // Get a random item of that type
      const items = getItemsByType(itemType);
      if (items.length > 0) {
        item = items[Math.floor(Math.random() * items.length)];
        console.log(`Created fallback item: ${item.name} (${item.type})`);

        // IMPORTANT DEBUG: Check if the item has all expected properties
        console.log(
          `DEBUG: Fallback item details:`,
          JSON.stringify(item, null, 2)
        );
        if (itemType === "armor" && !item.slot) {
          console.log(`DEBUG: WARNING - Armor item missing slot property!`);
        }
      }
    }
  }

  if (item) {
    console.log(`Item found: ${item.name} (${item.type})`);

    // Add the item to player's inventory
    player.addToInventory(item);
    console.log(
      `Added ${item.name} to inventory. Inventory now has ${player.inventory.length} items.`
    );

    // Reset the map tile to be a floor
    map[player.y * MAP_WIDTH + player.x] = ".";

    return true;
  } else {
    console.log(`No item found at position (${player.x}, ${player.y})`);
    return false;
  }
}

/**
 * Equips an item from inventory to the appropriate slot
 * @param {Object} player - The player object
 * @param {Object} item - The item to equip
 * @returns {boolean} - Whether the item was equipped successfully
 */
function autoEquipItem(player, item) {
  if (!item) return false;

  // Check item type and equip accordingly
  switch (item.type) {
    case "weapon":
      // Try to equip to right hand first, then left hand
      if (!player.equipment.rightHand.length) {
        player.equipment.rightHand.push(item);
        return true;
      } else if (!player.equipment.leftHand.length) {
        player.equipment.leftHand.push(item);
        return true;
      }
      break;

    case "armor":
      // Equip to the appropriate armor slot
      if (item.slot && !player.equipment[item.slot]) {
        player.equipment[item.slot] = item;
        return true;
      }
      break;

    case "ring":
      // Try to find an empty ring slot
      for (let i = 0; i < player.equipment.rings.length; i++) {
        if (!player.equipment.rings[i]) {
          player.equipment.rings[i] = item;
          return true;
        }
      }
      break;

    case "talisman":
      // Try to find an empty talisman slot
      for (let i = 0; i < player.equipment.talismans.length; i++) {
        if (!player.equipment.talismans[i]) {
          player.equipment.talismans[i] = item;
          return true;
        }
      }
      break;
  }

  return false;
}

/**
 * Renders the player's inventory as a string
 * @param {Object} player - The player object
 * @returns {string} - A formatted string showing inventory contents
 */
function renderInventory(player) {
  console.log(
    `DEBUG: renderInventory called - inventory has ${player.inventory.length} items`
  );

  // Sanity check for player inventory
  if (!player || !player.inventory) {
    console.error("ERROR: Invalid player or inventory in renderInventory");
    return "| INVENTORY: Error";
  }

  if (player.inventory.length === 0) {
    console.log("DEBUG: Inventory is empty");
    return "| INVENTORY: Empty";
  }

  console.log(
    "DEBUG: Raw inventory contents:",
    JSON.stringify(player.inventory, null, 2)
  );

  // Group items by type
  const inventoryByType = {};
  for (const item of player.inventory) {
    if (!item) {
      console.error("ERROR: Null item in inventory!");
      continue;
    }

    if (!item.type) {
      console.error("ERROR: Item missing type property:", item);
      continue;
    }

    if (!inventoryByType[item.type]) {
      inventoryByType[item.type] = [];
    }
    inventoryByType[item.type].push(item);
  }

  let inventoryText = "| INVENTORY: ";
  const items = [];

  // Create a unique ID for each item using its index in the inventory
  for (const type in inventoryByType) {
    const typeItems = inventoryByType[type].map((item) => {
      const itemIndex = player.inventory.findIndex(
        (i) => i.name === item.name && i.type === item.type
      );
      console.log(
        `DEBUG: Creating clickable span for ${item.name} (index ${itemIndex})`
      );

      // Format the item as a clickable span with data attributes
      return `<span class="inventory-item" 
                   data-item-index="${itemIndex}" 
                   data-item-type="${item.type}"
                   data-item-name="${item.name}"
                   style="text-decoration: underline; cursor: pointer; color: var(--item-color-${
                     item.type
                   })">${item.name}${
        item.quantity > 1 ? ` (${item.quantity})` : ""
      }</span>`;
    });
    items.push(...typeItems);
  }

  inventoryText += items.join(", ");
  console.log(`DEBUG: Final inventory text: ${inventoryText}`);
  return inventoryText;
}

/**
 * Resets and redistributes items on the current map
 * @param {Array} map - The map to reset items on
 * @param {boolean} force - Whether to force redistribution even if items exist
 */
function resetAndDistributeItems(map, force = false) {
  console.log(
    `Resetting and redistributing items on map. Force: ${force}. Current items: ${mapItems.length}`
  );

  // Verify map is valid before proceeding
  if (!map || typeof map !== "object" || !map.length) {
    console.error(
      `ERROR: Invalid map passed to resetAndDistributeItems: ${map}`
    );
    console.trace("Stack trace for invalid map");
    return; // Exit early to prevent errors
  }

  // Only reset and redistribute if we have no items or if forced
  if (mapItems.length === 0 || force) {
    // First, clear any item symbols from the map
    console.log("Clearing any existing item symbols from the map");
    for (let i = 0; i < map.length; i++) {
      if (map[i] === "\\" || map[i] === "&" || map[i] === "$") {
        // Reset to floor tile
        map[i] = ".";
      }
    }

    // Clear any existing items
    mapItems = [];

    // Distribute new items
    distributeItems(map);
    updateMapWithItems(map);
    console.log(`Items redistributed. New count: ${mapItems.length}`);
  } else {
    console.log(`Keeping existing ${mapItems.length} items.`);
  }
}

// Export functions
window.distributeItems = distributeItems;
window.updateMapWithItems = updateMapWithItems;
window.pickupItem = pickupItem;
window.autoEquipItem = autoEquipItem;
window.renderInventory = renderInventory;
window.resetAndDistributeItems = resetAndDistributeItems;
