import { PF2EPersistentDamage } from "./pf2e-persistent-damage.js";
import { getSettings, registerSettings } from "./settings.js";
import { overrideItemSheet } from "./persistent-effect.js";

Hooks.on("init", () => {
    registerSettings();
    loadTemplates(["modules/pf2e-persistent-damage/templates/persistent-details.html"]);

    window.PF2EPersistentDamage = new PF2EPersistentDamage();
});

Hooks.on("ready", () => {
    overrideItemSheet();
    console.log("PF2E Persistent | Registered Sheet");
})

Hooks.on("renderChatMessage", async (message: ChatMessage, html: JQuery<HTMLElement>) => {
    // Enable the bullseye button
    html.find(".token-link").on("click", (evt) => {
        const target = evt.target.closest(".token-link") as HTMLElement;
        const tokenId = target?.dataset.tokenId;
        if (!tokenId) return;

        const token = canvas.tokens.get(tokenId);
        token?.control({ multiSelect: false, releaseOthers: true });
    });
});

/**
 * Apply damage on turn end
 */
Hooks.on("preUpdateCombat", async (combat, update) => {
    const { autoRoll } = getSettings();
    if (autoRoll) {
        const lastCombatantToken = canvas.tokens.get(combat.current.tokenId);
        window.PF2EPersistentDamage.processPersistentDamage(lastCombatantToken)
    }
});

