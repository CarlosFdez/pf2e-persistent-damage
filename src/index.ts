import { PersistentDamagePF2e } from "./module/pf2e-persistent-damage.js";
import { MODULE_NAME, registerSettings } from "./module/settings.js";
import { setupCustomRules } from "./module/custom-rules.js";
import { overrideItemSheet } from "./module/item-sheet.js";
import { createPersistentTitle, typeImages } from "./module/persistent-effect.js";
import type { CombatantPF2e } from "@pf2e/module/combatant.js";
import type { ActorPF2e } from "@pf2e/module/actor/index.js";

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
        window.PF2EPersistentDamage.processHealing(combatant.token ?? combatant.actor);
    }
});

/**
 * End of turn event.
 * Use to handle apply damage on turn end
 */
Hooks.on("pf2e.endTurn", (combatant: CombatantPF2e, _combat, userId: string) => {
    if (game.settings.get(MODULE_NAME, "auto-roll") && game.user.id === userId) {
        window.PF2EPersistentDamage.processPersistentDamage(combatant.token ?? combatant.actor);
    }
});

/**
 * If persistent damage is clicked, use this module instead.
 */
Hooks.on("renderTokenHUD", (_app, html: JQuery, tokenData: foundry.data.TokenData) => {
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

// Override the enrichHTML method to create persistent effect links from inline rolls
const persistentConditionId = "lDVqvLKA6eF3Df60";
const originalEnrichHTML = TextEditor.enrichHTML;
TextEditor.enrichHTML = function (...args) {
    const content = originalEnrichHTML.call(this, ...args);

    const html = document.createElement("div");
    html.innerHTML = String(content);

    html.querySelectorAll<HTMLElement>(".inline-roll:not(.inline-result)").forEach(roll => {
        const flavor = roll.dataset.flavor;
        if (!flavor) return;
        const match = flavor.match(/^persistent ([A-Za-z]+)/i);
        if (!match) return;

        const damageType = match[1]?.toLowerCase();
        if (damageType in typeImages) {
            // Remove the persistent effect condition image first
            const compendiumLink = $(roll).next();
            if (compendiumLink.hasClass("entity-link") && compendiumLink.attr("data-id") === persistentConditionId) {
                compendiumLink.remove();
            }

            // Replace with a custom draggable link
            const formula = roll.dataset.formula;
            const newLink = document.createElement("a");
            newLink.classList.add("entity-link", "persistent-link");
            newLink.draggable = true;
            newLink.dataset.value = formula;
            newLink.dataset.damageType = damageType;
            newLink.innerText = createPersistentTitle({ damageType, value: formula, dc: 15 });
            newLink.setAttribute("ondragstart", "PF2EPersistentDamage._startDrag(event)");
            $(roll).replaceWith(newLink);
        }
    });

    return html.innerHTML;
}

// Rendered chat messages strip out javascript events...so we need to add it back in
Hooks.on("renderChatMessage", (_message, html) => {
    html.find(".persistent-link:not([ondragstart])")
        .attr("ondragstart", "PF2EPersistentDamage._startDrag(event)");
})
