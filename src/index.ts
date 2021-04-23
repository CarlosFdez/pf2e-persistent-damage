import { PersistentDamagePF2e } from "./module/pf2e-persistent-damage.js";
import { MODULE_NAME, registerSettings } from "./module/settings.js";
import { setupCustomRules } from "./module/custom-rules.js";
import { overrideItemSheet } from "./module/item-sheet.js";

Hooks.on("init", () => {
    registerSettings();
    loadTemplates(["modules/pf2e-persistent-damage/templates/persistent-details.html"]);
    window.PF2EPersistentDamage = new PersistentDamagePF2e();
});

Hooks.on("setup", () => {
    setupCustomRules();
});

Hooks.on("ready", () => {
    overrideItemSheet();
    console.log("PF2E Persistent | Registered Item Sheet Modification");
});

Hooks.on("renderChatMessage", async (message: ChatMessage, html: JQuery<HTMLElement>) => {
    if (message.data.flags.persistent) {
        html.find("button[data-action=check][data-check=flat]")
            .off()
            .on("click", (evt) => {
                evt.preventDefault();

                const card = html.find(".chat-card");
                const effectId = card.attr("data-effect-id");

                // Get the Actor from a synthetic Token
                let actor: Actor | null;
                const tokenKey = card.attr("data-token-id");
                if (tokenKey && canvas.ready) {
                    const [sceneId, tokenId] = tokenKey.split(".");
                    let token: Token | undefined;
                    if (sceneId === canvas.scene?._id) token = canvas.tokens.get(tokenId);
                    else {
                        const scene = game.scenes.get(sceneId);
                        if (!scene) return;
                        const tokenData = scene.data.tokens.find((t) => t._id === tokenId);
                        if (tokenData) token = new Token(tokenData);
                    }
                    if (!token) return;
                    const ActorPF2e = CONFIG.Actor.entityClass as typeof Actor;
                    actor = ActorPF2e.fromToken(token);
                } else actor = game.actors.get(card.attr("data-actor-id"));

                const effect = actor?.getOwnedItem(effectId);
                PF2EPersistentDamage.rollRecoveryCheck(actor, effect);
            });
    }

    // Enable the bullseye button
    html.find(".token-link").on("click", (evt) => {
        const target = evt.target.closest(".token-link") as HTMLElement;
        const tokenId = target?.dataset.tokenId;
        if (!tokenId) return;

        if (canvas.ready) {
            const token = canvas.tokens.get(tokenId);
            token?.control({ releaseOthers: true });
        }
    });
});

/**
 * Start of turn event.
 * Use to handle fast-healing and regeneration
 */
Hooks.on("updateCombat", (combat) => {
    const autoRoll = game.settings.get(MODULE_NAME, "auto-roll");
    if (autoRoll && canvas.ready) {
        const combatantToken = canvas.tokens.get(combat.current.tokenId);
        window.PF2EPersistentDamage.processHealing(combatantToken);
    }
});

/**
 * End of turn event.
 * Use to handle
 * Apply damage on turn end
 */
Hooks.on("preUpdateCombat", async (combat, update) => {
    const autoRoll = game.settings.get(MODULE_NAME, "auto-roll");
    if (autoRoll && canvas.ready) {
        const lastCombatantToken = canvas.tokens.get(combat.current.tokenId);
        window.PF2EPersistentDamage.processPersistentDamage(lastCombatantToken);
    }
});

/**
 * If persistent damage is clicked, use this module instead.
 */
Hooks.on("renderTokenHUD", (app, html: JQuery, tokenData: Token.Data) => {
    setTimeout(() => {
        html.find("div.status-effects img[data-effect=persistentDamage]")
            .off()
            .on("click", (evt) => {
                if (evt.button !== 0 || !canvas.ready) {
                    return;
                }

                evt.preventDefault();
                evt.stopPropagation();

                const token = canvas.tokens.get(tokenData._id);
                if (token) {
                    PF2EPersistentDamage.showDialog({ actor: token.actor });
                }
            });
    }, 0);
});
