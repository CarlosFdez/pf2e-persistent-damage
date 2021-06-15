import { PersistentDamagePF2e } from "./module/pf2e-persistent-damage.js";
import { MODULE_NAME, registerSettings } from "./module/settings.js";
import { setupCustomRules } from "./module/custom-rules.js";
import { overrideItemSheet } from "./module/item-sheet.js";
import type { CombatantPF2e } from "@pf2e/module/combatant.js";
import type { ActorPF2e } from "@pf2e/module/actor/index.js";
import type  { TokenDocumentPF2e } from "@pf2e/module/token-document/index.js";

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
                let actor: ActorPF2e | null = null;
                const tokenKey = card.attr("data-token-id");
                if (tokenKey) {
                    const [sceneId, tokenId] = tokenKey.split(".");
                    const scene = game.scenes.get(sceneId);
                    const token = scene?.data.tokens.get(tokenId);
                    if (!token) return;
                    actor = (token.actor as unknown) as ActorPF2e;
                } else actor = game.actors.get(card.attr("data-actor-id"));

                const effect = actor?.items.get(effectId);
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
Hooks.on("pf2e.startTurn", (combatant: CombatantPF2e, _combat, userId: string) => {
    if (game.settings.get(MODULE_NAME, "auto-roll") && game.user.isGM) {
        window.PF2EPersistentDamage.processHealing(combatant.actor);
    }
});

/**
 * End of turn event.
 * Use to handle apply damage on turn end
 */
Hooks.on("pf2e.endTurn", (combatant: CombatantPF2e, _combat, userId: string) => {
    if (game.settings.get(MODULE_NAME, "auto-roll") && game.user.id === userId) {
        window.PF2EPersistentDamage.processPersistentDamage(combatant.actor);
    }
});

/**
 * If persistent damage is clicked, use this module instead.
 */
Hooks.on("renderTokenHUD", (app, html: JQuery, tokenData: TokenDocumentPF2e) => {
    setTimeout(() => {
        html.find("div.status-effects img[data-effect=persistentDamage]")
            .off()
            .on("click", (evt) => {
                if (evt.button !== 0 || !canvas.ready) {
                    return;
                }

                evt.preventDefault();
                evt.stopPropagation();

                const token = canvas.tokens.get(tokenData.id);
                if (token) {
                    PF2EPersistentDamage.showDialog({ actor: token.actor });
                }
            });
    }, 0);
});
