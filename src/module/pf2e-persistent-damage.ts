import type { ActorPF2e } from "@pf2e/module/actor/index.js";
import type { TokenPF2e } from "@pf2e/module/canvas/token.js";
import type { ChatMessagePF2e } from "@pf2e/module/chat-message/index.js";
import type { ItemPF2e } from "@pf2e/module/item/index.js";
import {
    createPersistentEffect,
    DamageType,
    getPersistentData,
    PersistentData,
    typeImages,
} from "./persistent-effect.js";
import { AutoRecoverMode, MODULE_NAME, RollHideMode } from "./settings.js";
import { calculateRoll } from "./utils.js";

function getTypeData(damageType: DamageType) {
    return {
        damageType,
        name: CONFIG.PF2E.damageTypes[damageType],
        img: typeImages[damageType],
    };
}

type TokenOrActorInput = TokenPF2e | ExtendedActor<ActorPF2e> | Array<TokenPF2e | ExtendedActor<ActorPF2e>>;

/**
 * Converts a single token/actor or list of tokens and/or actors into a list of actors.
 * Necessary for backwards compatibility, the macros give tokens, but we need to process
 * on the actors instead.
 * @param documents
 * @returns
 */
function resolveActors(documents: TokenOrActorInput): { token?: TokenPF2e, actor: ExtendedActor<ActorPF2e> }[] {
    const arr = Array.isArray(documents) ? documents : [documents];
    return arr.map((document) => {
        if (document instanceof Actor) {
            return { actor: document, token: document.token?.object };
        } else if (document?.data?.actorId && !document.actor) {
            ui.notifications.warn("TOKEN.WarningNoActor", { localize: true });
            return null;
        } else {
            return { actor: document.actor, token: document };
        }
    }).filter(arr => arr);
}

/**
 * The main class that handles the entire module.
 * It handles more than persistent damage, but that's because the scope of the module increased.
 * This should probably be renamed.
 */
export class PersistentDamagePF2e {
    /**
     * Shows a dialog that can be used to add persistent damage effects to selected tokens.
     * If actor is given, the dialog will add a single effect to that actor.
     * If not given, it can be used to add effects to selected tokens.
     */
    async showDialog({ actor }: { actor?: ActorPF2e } = {}) {
        const applyDamage = (html: JQuery<HTMLElement>) => {
            const type = html.find("[name=Type]:checked").val() as DamageType;
            const value = html.find("[name=Damage]").val() as string;
            const dc = Number(html.find("[name=DC]").val()) || 15;
            if (canvas.ready) {
                const actors = actor ?? canvas.tokens.controlled?.map((t) => t.actor);
                this.addPersistentDamage(actors, type, value, isNaN(dc) ? 15 : dc);
            }

            return false;
        };

        const yesMessage = game.i18n.localize(
            actor ? "PF2E-PD.Dialog.Apply" : "PF2E-PD.Dialog.Add",
        );
        const types = Object.keys(typeImages).map(getTypeData);

        const dialog = new Dialog(
            {
                title: game.i18n.localize("PF2E-PD.Dialog.Title"),
                content: await renderTemplate(
                    "modules/pf2e-persistent-damage/templates/persistent-damage-dialog.html",
                    {
                        types,
                    },
                ),
                buttons: {
                    yes: {
                        icon: "<i class='fas fa-check'></i>",
                        label: yesMessage,
                        callback: applyDamage,
                    },
                    no: {
                        icon: "<i class='fas fa-times'></i>",
                        label: game.i18n.localize("PF2E-PD.Dialog.Close"),
                    },
                },
                default: "yes",
                render: (html: JQuery<HTMLElement>) => {
                    // Usability, select damage when type is selected
                    html.find(".types label").on("click", () => {
                        // Doesn't work without the delay, might be a radio button thing
                        setTimeout(() => html.find("input[name=Damage]").trigger("focus"), 0);
                    });

                    // Replace the apply button so that it doesn't close, but only if there's no actor
                    if (!actor) {
                        html.find(".dialog-button.yes")
                            .off()
                            .on("click", () => applyDamage(html));
                    }
                },
            },
            {
                id: "pf2e-persistent-dialog",
            },
        );

        dialog.render(true);
        return dialog;
    }

    /**
     * Adds persistent damage effects to one or more tokens
     * @param actor One or more actors to add the persistent damage to
     * @param damageType the damage type
     * @param formula The formula of the roll.
     * @param dc DC for the flat check to remove it
     * @returns
     */
    async addPersistentDamage(
        actor: ActorPF2e | ActorPF2e[],
        damageType: DamageType,
        formula: string,
        dc = 15,
    ) {
        // Test for invalid parameters
        const errors = [];
        if (!damageType) errors.push("Missing damage type");
        if (!formula) errors.push("Missing damage value");
        if (errors.length > 0) {
            ui.notifications.error("Persistent Damage Errors: " + errors.join("; "));
            return;
        }

        try {
            // Test if the roll is valid
            new Roll(formula).evaluate({ async: false });
        } catch (err) {
            ui.notifications.error(err);
            return;
        }

        const actors = Array.isArray(actor) ? actor : [actor];
        if (actors.length == 0) {
            ui.notifications.warn(game.i18n.localize("PF2E-PD.Notification.MissingActor"));
            return;
        }

        const effect = createPersistentEffect({ damageType, value: formula, dc });
        for (const actor of actors) {
            const existing = PF2EPersistentDamage.getPersistentDamage(actor, damageType);
            const { average: existingAverage } = calculateRoll(
                existing?.data.flags.persistent?.value,
            );
            const { average: newAverage } = calculateRoll(formula);
            if (!existing || newAverage >= existingAverage) {
                // Overwrite if greater or equal
                // If equal, it may have been a DC tweak, such as with certain monster abilities
                if (existing) await this.removePersistentDamage(actor, damageType);
                await actor.createEmbeddedDocuments("Item", [effect]);

                if (existing) {
                    ui.notifications.info(game.i18n.localize("PF2E-PD.Notification.Overwritten"));
                } else {
                    ui.notifications.info(game.i18n.format("PF2E-PD.Notification.Created", { damageType }));
                }
            } else if (existing) {
                ui.notifications.info(game.i18n.localize("PF2E-PD.Notification.NotOverwritten"));
            }
        }
    }

    /**
     * Removes persistent damage effects of a certain type from an actor
     * @param actor
     * @param type
     * @param value
     * @returns
     */
    async removePersistentDamage(actor: ActorPF2e, type: DamageType) {
        const effects = actor.items.filter((i) => i.data.flags.persistent?.damageType === type);
        await actor?.deleteEmbeddedDocuments("Item", effects.map((i) => i.id));
    }

    getPersistentDamage(actor: ActorPF2e, type: DamageType) {
        return actor.items.find((i) => i.data.flags.persistent?.damageType === type);
    }

    /**
     * Creates a new message to perform a recover check for the given token
     * @param token
     * @param itemId
     * @returns
     */
    async rollRecoveryCheck(actor: ActorPF2e, damageType: DamageType | Embedded<ItemPF2e>) {
        const effect =
            damageType instanceof Item
                ? damageType
                : PF2EPersistentDamage.getPersistentDamage(actor, damageType);
        const data = effect?.data.flags.persistent as PersistentData;
        if (!data) return;

        const roll = new Roll("1d20").evaluate();
        const success = roll.total >= data.dc;
        const typeName = game.i18n.localize(CONFIG.PF2E.damageTypes[data.damageType]);
        const templatePath = "modules/pf2e-persistent-damage/templates/chat/recover-persistent-card.html";
        const message = await roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor }),
            flavor: await renderTemplate(templatePath, { data, typeName, success }),
        });

        // Auto-remove the condition if enabled and it passes the DC
        if (success && game.settings.get(MODULE_NAME, "auto-resolve")) {
            await effect.delete();
        }

        return message;
    }

    /**
     * Checks for persistent damage effects on a token, and rolls damage and flat checks
     * for each one.
     * @param token one or more tokens to apply persistent damage to
     */
    async processPersistentDamage(tokensOrActors: TokenOrActorInput): Promise<ChatMessage[]> {
        const autoRecover = game.settings.get(MODULE_NAME, "auto-recover");
        const autoResolve = game.settings.get(MODULE_NAME, "auto-resolve");
        const rollHideMode = game.settings.get(MODULE_NAME, "hide-rolls");

        const messages = [];
        for (const { actor, token } of resolveActors(tokensOrActors)) {
            const persistentDamageElements = actor.itemTypes.effect.filter(
                (i) =>
                    i.data.data.rules.some((r) => r.key === "PF2E.RuleElement.PersistentDamage") ||
                    i.data.flags.persistent,
            );
            if (!persistentDamageElements) {
                continue;
            }

            const isPlayer = actor.hasPlayerOwner;
            const autoCheck =
                autoRecover === AutoRecoverMode.Always ||
                (autoRecover === AutoRecoverMode.NPCOnly && !isPlayer);

            for (const effect of persistentDamageElements) {
                const data = getPersistentData(effect.data);
                const { damageType, value, dc } = data;
                const typeName = game.i18n.localize(CONFIG.PF2E.damageTypes[damageType]);
                const roll = new Roll(value).evaluate({ async: false });

                const inlineCheck = autoCheck && TextEditor.enrichHTML("[[1d20]]");
                const success = autoCheck && Number($(inlineCheck).text()) >= dc;

                const templateName =
                    "modules/pf2e-persistent-damage/templates/chat/persistent-card.html";

                const ChatMessage = CONFIG.ChatMessage.documentClass as typeof ChatMessagePF2e;
                const speaker = ChatMessage.getSpeaker({ actor, token });
                const tokenId = token ? `${token.scene.id}.${token.id}` : undefined;
                const flavor = await renderTemplate(templateName, {
                    actor,
                    token,
                    effect,
                    data,
                    inlineCheck,
                    typeName,
                    autoCheck,
                    success,
                    tokenId,
                });

                const rollMode = rollHideMode === RollHideMode.Never
                    ? "roll"
                    : rollHideMode === RollHideMode.Always
                    ? "blindroll"
                    : game.settings.get('core', 'rollMode');

                const message = await ChatMessage.create({
                    speaker,
                    flavor,
                    flags: {
                        persistent: data,
                    },
                    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                    roll,
                    sound: CONFIG.sounds.dice,
                }, { rollMode });

                // Auto-remove the condition if enabled and it passes the DC
                if (autoCheck && autoResolve && success) {
                    actor.deleteEmbeddedDocuments("Item", [effect.id]);
                }

                messages.push(message);
            }
        }

        return messages;
    }

    async processHealing(tokensOrActors: TokenOrActorInput): Promise<ChatMessage[]> {
        const messages = [];
        for (const { actor, token } of resolveActors(tokensOrActors)) {
            const healing = actor.data.data.attributes.healing;
            if (!healing) {
                continue;
            }

            const sources = [];
            const formulas = [];

            // Handle fast healing
            if (healing['fast-healing']?.value) {
                sources.push("Fast Healing");
                formulas.push(healing["fast-healing"].value);
            }

            // Handle regeneration
            if (healing.regeneration?.value) {
                if (healing.regeneration.suppressed) {
                    // Create message of suppression
                } else {
                    sources.push("Regeneration");
                    formulas.push(healing.regeneration.value);
                }
            }

            if (formulas.length > 0) {
                const flavor = game.i18n.format("PF2E-PD.HealingProcess", { sources: sources.join(", ")});
                const roll = new Roll(formulas.join(" + ")).evaluate({ async: false });
                const ChatMessage = CONFIG.ChatMessage.documentClass as typeof ChatMessagePF2e;
                const message = await ChatMessage.create({
                    speaker: ChatMessage.getSpeaker({ actor, token }),
                    flavor,
                    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                    roll,
                    sound: CONFIG.sounds.dice,
                });

                messages.push(message);
            }
        }

        return messages;
    }

    async _startDrag(event: DragEvent) {
        event.stopPropagation();
        const dataTransfer = event.dataTransfer;
        if (!dataTransfer) return;

        const target = event.target as HTMLElement;
        const value = target.dataset.value;
        const damageType = target.dataset.damageType;
        const dc = Number(target.dataset.dc) || 15;
        const effect = createPersistentEffect({ value, damageType, dc });

        dataTransfer.setData('text/plain', JSON.stringify({
            type: "Item",
            data: effect
        }));
    }
}
