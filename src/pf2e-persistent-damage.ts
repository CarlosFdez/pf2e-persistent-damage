import { createPersistentEffect, DamageType, getPersistentData, PersistentData, typeImages } from "./persistent-effect.js";
import { AutoRecoverMode, getSettings, RollHideMode } from "./settings.js";

interface PersistentDamageType {
    damageType: string;
    name: string;
    img: string;
}

function getTypeData(damageType: DamageType): PersistentDamageType {
    return {
        damageType,
        name: CONFIG.PF2E.damageTypes[damageType],
        img: typeImages[damageType]
    }
}

export class PersistentDamagePF2e {
    /**
     * Shows a dialog that can be used to add persistent damage effects to selected tokens.
     */
    async showDialog() {
        const applyDamage = (html: JQuery<HTMLElement>) => {
            const type = html.find("[name=Type]:checked").val() as DamageType;
            const value = html.find("[name=Damage]").val() as string;
            const dc = Number(html.find("[name=DC]").val()) || 15;
            if (canvas.ready) {
                this.addPersistentDamage(canvas.tokens.controlled, type, value, isNaN(dc) ? 15 : dc);
            }
        }

        const types = Object.keys(typeImages).map(getTypeData);

        return new Dialog({
            title: "Add Persistent Damage",
            content: await renderTemplate("modules/pf2e-persistent-damage/templates/persistent-damage-dialog.html", {
                types
            }),
            buttons: {
                yes: {
                    icon: "<i class='fas fa-check'></i>",
                    label: "Apply",
                    callback: applyDamage
                },
                no: {
                    icon: "<i class='fas fa-times'></i>",
                    label: "Close",
                },
            },
            default: "yes",
            render: (html: JQuery<HTMLElement>) => {
                // Usability, select damage when type is selected
                html.find(".types label").on("click", () => {
                    // Doesn't work without the delay, might be a radio button thing
                    setTimeout(() => html.find('input[name=Damage]').trigger("focus"), 0);
                });

                // Replace the apply button so that it doesn't
                html.find(".dialog-button.yes").off().on("click", () => applyDamage(html));
            }
        }, {
            id: 'pf2e-persistent-dialog'
        }).render(true);
    }

    /**
     * Adds persistent damage effects to one or more tokens
     * @param token
     * @param type
     * @param value
     * @returns
     */
    addPersistentDamage(token: Token | Token[], type: DamageType, value: string, dc: number=15): void {
        // test for errors
        const errors = [];
        if (!type) errors.push("Missing damage type");
        if (!value) errors.push("Missing damage value");

        if (errors.length > 0) {
            ui.notifications.error("Persistent Damage Errors: " + errors.join("; "));
            return;
        }

        try {
            // Test if the roll is valid
            new Roll(value).roll();
        } catch (err) {
            ui.notifications.error(err);
            return;
        }

        const tokens = Array.isArray(token) ? token : [token];
        if (tokens.length == 0) {
            ui.notifications.warn("No token currently active.");
            return;
        }

        const effect = createPersistentEffect(type, value, dc);
        for (const token of tokens) {
            token.actor.createOwnedItem(effect);
            token.refresh()
        }
    }

    /**
     * Removes persistent damage effects of a certain type from an actor
     * @param actor
     * @param type
     * @param value
     * @returns
     */
    async removePersistentDamage(actor: Actor, type: DamageType) {
        const effects = actor.items.filter(i => i.data.flags.persistent?.damageType === type);
        actor?.deleteOwnedItem(effects.map(i => i._id));
    }

    /**
     * Deals persistent damage effects to one or more tokens
     * @param token
     * @param type
     * @param value
     * @returns
     */
    async dealPersistentDamage(token, itemID, type: DamageType) {
        //console.log(`Deal ${type} damage`);
        const tokens = Array.isArray(token) ? token : [token];
        if (tokens.length == 0) {
            ui.notifications.warn("No token provided.");
            return;
        }
        for (const _token of tokens) {
            //do the calculateDamage stuff in here
            console.log("not yet implemented")
        }
    }

    /**
     * Creates a new message to perform a recover check for the given token
     * @param token
     * @param itemId
     * @returns
     */
    async rollRecoveryCheck(actor: Actor, itemId: string) {
        const effect = actor?.getOwnedItem(itemId);
        const data = effect?.data.flags.persistent as PersistentData;
        if (!data) return;

        const roll = new Roll("1d20").evaluate();
        const success = roll.total >= data.dc;
        const message = await roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor }),
            flavor: await renderTemplate("modules/pf2e-persistent-damage/templates/chat/recover-persistent-card.html", {
                data,
                typeName: CONFIG.PF2E.damageTypes[data.damageType],
                success
            })
        });

        // Auto-remove the condition if enabled and it passes the DC
        if (success && getSettings().autoResolve) {
            actor.deleteOwnedItem(itemId);;
        }

        return message;
    }

    /**
     * Checks for persistent damage effects on a token, and rolls damage and flat checks
     * for each one.
     * @param token one or more tokens to apply persistent damage to
     */
    async processPersistentDamage(token: Token | Token[]): Promise<ChatMessage[]> {
        const { autoResolve, autoRecoverMode: autoCheckMode, autoDamage, rollHideMode } = getSettings();

        const messages = [];
        const tokens = Array.isArray(token) ? token : [token];
        for (const token of tokens) {
            const actor = token.actor;
            const persistentDamageElements = [...actor.items.values()].filter((i: Item) => i.data.flags.persistent);
            if (!persistentDamageElements) {
                continue;
            }

            const isPlayer = actor.hasPlayerOwner;
            const autoCheck = (autoCheckMode === AutoRecoverMode.Always) || (autoCheckMode === AutoRecoverMode.NPCOnly && !isPlayer);

            for (const effect of persistentDamageElements) {
                const data = getPersistentData(effect.data);
                const { damageType, value, dc } = data;
                const typeName = CONFIG.PF2E.damageTypes[damageType];
                const roll = new Roll(value).roll();

                const inlineCheck = autoCheck && TextEditor.enrichHTML("[[1d20]]");
                const success = autoCheck && Number($(inlineCheck).text()) >= dc;

                const templateName = "modules/pf2e-persistent-damage/templates/chat/persistent-card.html";

                const message = await ChatMessage.create({
                    speaker: ChatMessage.getSpeaker({actor, token}),
                    flags: {
                        persistent: data
                    },
                    flavor: await renderTemplate(templateName, {
                        actor,
                        token,
                        effect,
                        data,
                        inlineCheck,
                        typeName,
                        autoCheck,
                        success,
                        tokenId: `${token.scene._id}.${token.id}`
                    }),
                    rollMode: (rollHideMode === RollHideMode.Never)
                        ? "roll"
                        : (rollHideMode === RollHideMode.Always)
                        ? "blindroll"
                        : undefined,
                    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                    roll
                });

                // Apply damage directly
                // TODO: Wait for apply damage to be part of the PF2E core system
                if (autoDamage) {
                    // add the code to damage the player here.
                    // we should check for resistence to this damage type before dealing the damage
                }

                // Auto-remove the condition if enabled and it passes the DC
                if (autoCheck && autoResolve && success) {
                    token.actor.deleteOwnedItem(effect._id);
                }

                messages.push(message);
            }
        }

        return messages;
    }
}
