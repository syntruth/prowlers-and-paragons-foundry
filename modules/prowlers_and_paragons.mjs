// Import document classes.
import { ProwlersAndParagonsActor } from "./documents/actor.mjs";
import { ProwlersAndParagonsItem }  from "./documents/item.mjs";

// Import sheet classes.
import { ProwlersAndParagonsActorSheet } from "./sheets/actor-sheet.mjs";
import { ProwlersAndParagonsItemSheet }  from "./sheets/item-sheet.mjs";

// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { PROWLERS_AND_PARAGONS }      from "./helpers/config.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {
  console.log('P&P init hook.')
  
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.prowlers_and_paragons = {
    ProwlersAndParagonsActor,
    ProwlersAndParagonsItem,
    rollItemMacro
  };

  // Add custom constants for configuration.
  CONFIG.PROWLERS_AND_PARAGONS = PROWLERS_AND_PARAGONS;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula:  "@edge",
    decimals: 0
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = ProwlersAndParagonsActor;
  CONFIG.Item.documentClass  = ProwlersAndParagonsItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);

  Actors.registerSheet("prowlers_and_paragons",
    ProwlersAndParagonsActorSheet,
    { makeDefault: true });
  
  Items.unregisterSheet("core", ItemSheet);
  
  Items.registerSheet("prowlers_and_paragons",
    ProwlersAndParagonsItemSheet,
    { makeDefault: true });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function() {
  var outStr = '';

  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register
  // earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  if (data.type !== "Item") return;

  if (!("data" in data)) {
    return ui.notifications
             .warn("You can only create macro buttons for owned Items");
  }
  
  const item = data.data;

  // Create the macro command
  const command = `game.prowlers_and_paragons.rollItemMacro("${item.name}");`;
  
  let macro = game.macros.find((m) => {
    (m.name === item.name) && (m.command === command)
  });
  
  if (!macro) {
    macro = await Macro.create({
      name:    item.name,
      type:    "script",
      img:     item.img,
      command: command,
      flags:   { "prowlers_and_paragons.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);

  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
  let actor;
  
  const speaker = ChatMessage.getSpeaker();
  
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  
  if (!actor) actor = game.actors.get(speaker.actor);
  
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  
  if (!item) {
    let str = `Your controlled Actor does not have an item named ${itemName}`

    return ui.notifications.warn(str)
  }

  // Trigger the item roll
  return item.roll();
}

