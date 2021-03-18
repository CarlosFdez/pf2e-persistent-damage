import { PF2EPersistentDamage } from "./pf2e-persistent-damage.js";
import { getSettings, registerSettings } from "./settings.js";

Hooks.on("init", () => {
    registerSettings();
    window.PF2EPersistentDamage = new PF2EPersistentDamage();
});

Hooks.on("renderChatMessage", async (message, html: JQuery<HTMLElement>) => {
    html.find(".token-link").on("click", (evt) => {
        const tokenId = evt.target.dataset.tokenId;
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

