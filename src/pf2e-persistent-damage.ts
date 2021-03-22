import { createPersistentEffect, getPersistentData, types } from "./persistent-effect.js";
import { getSettings, RollHideMode } from "./settings.js";

export class PF2EPersistentDamage {
    async showDialog() {
        const typeList = Object.entries(types).map(([type, img]) => {
            return { type, img };
        });

        new Dialog({
            title: "Add Persistent Damage",
            content: await renderTemplate("modules/pf2e-persistent-damage/templates/persistent-damage-dialog.html", {
                types: typeList,
                damageTypes: CONFIG.PF2E.damageTypes
            }),
            buttons: {
                yes: {
                    icon: "<i class='fas fa-check'></i>",
                    label: "Apply"
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

                // Replace the apply button
                html.find(".dialog-button.yes").off().on("click", () => {
                    const type = html.find('[name="Type"]:checked').val() as keyof typeof types;
                    const value = html.find('[name="Damage"]').val() as string;
                    const dc = Number(html.find("[name=DC]").val()) || 15;
                    this.addPersistentDamage(canvas.tokens.controlled, type, value, isNaN(dc) ? 15 : dc);
                });
            },
        } as DialogData, {
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
    addPersistentDamage(token: Token | Token[], type: keyof typeof types, value: string, dc: number=15): void {
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
     * Removes persistent damage effects to one or more tokens
     * @param token
     * @param type
     * @param value
     * @returns
     */
    async removePersistentDamage(token, itemID, type: keyof typeof types) {
        //console.log(`Remove condition`);
        const tokens = Array.isArray(token) ? token : [token];
        if (tokens.length == 0) {
            ui.notifications.warn("No token provided.");
            return;
        }

        for (const token of tokens) {
            var typeImage = types[type];
            token.actor.deleteOwnedItem(itemID);
            token.toggleEffect(typeImage, {active: false})
        }
    }

    /**
     * Deals persistent damage effects to one or more tokens
     * @param token
     * @param type
     * @param value
     * @returns
     */
    async dealPersistentDamage(token, itemID, type: keyof typeof types) {
        //console.log(`Deal ${type} damage`);
        const tokens = Array.isArray(token) ? token : [token];
        if (tokens.length == 0) {
            ui.notifications.warn("No token provided.");
            return;
        }
        for (const token of tokens) {
            //do the calculateDamage stuff in here
            console.log("not yet implemented")
        }
    }

    /**
     * Checks for persistent damage effects on a token, and rolls damage and flat checks
     * for each one.
     * @param token one or more tokens to apply persistent damage to
     */
    async processPersistentDamage(token: Token | Token[]): Promise<ChatMessage[]> {
        const { autoResolve, autoDamage, rollHideMode } = getSettings();

        const messages = [];
        const tokens = Array.isArray(token) ? token : [token];
        for (const token of tokens) {
            const actor = token.actor;
            const persistentDamageElements = [...actor.items.values()].filter((i: Item) => i.data.flags.persistent);
            if (!persistentDamageElements) {
                continue;
            }

            for (const entry of persistentDamageElements) {
                const data = getPersistentData(entry.data);
                const { damageType, value } = data;
                const dc = data.dc ?? 15;
                const typeName = CONFIG.PF2E.damageTypes[damageType];
                const roll = new Roll(value).roll();

                const inlineCheck = TextEditor.enrichHTML("[[1d20]]");
                const success = Number($(inlineCheck).text()) >= dc;

                const templateName = "modules/pf2e-persistent-damage/templates/card-header.html";

                const message = await ChatMessage.create({
                    speaker: {
                        actor: actor?._id,
                        token,
                        alias: token?.name || actor?.name
                    },
                    flavor: await renderTemplate(templateName, {
                        token,
                        data,
                        inlineCheck,
                        typeName,
                        success
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
                if (autoResolve && success) {
                    this.removePersistentDamage(token, entry._id, damageType);
                }

                messages.push(message);
            }
        }

        return messages;
    }
}
