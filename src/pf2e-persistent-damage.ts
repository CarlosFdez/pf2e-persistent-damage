import { getSettings } from "./settings.js";

const types = {
    "Bleeding": "systems/pf2e/icons/spells/blade-barrier.jpg",
    'Fire': "systems/pf2e/icons/spells/flaming-sphere.jpg",
    'Acid': "systems/pf2e/icons/spells/blister.jpg",
    'Cold': "systems/pf2e/icons/spells/chilling-spray.jpg",
    'Electricity': "systems/pf2e/icons/spells/chain-lightning.jpg",
    'Mental': "systems/pf2e/icons/spells/modify-memory.jpg",
    'Poison': "systems/pf2e/icons/spells/acidic-burst.jpg",
    "Piercing": "systems/pf2e/icons/spells/savor-the-sting.jpg"
};

export class PF2EPersistentDamage {
    async showDialog() {
        const typeList = Object.entries(types).map(([type, img]) => {
            return { type, img };
        });

        new Dialog({
            title: "Add Persistent Damage",
            content: await renderTemplate("modules/pf2e-persistent-damage/templates/persistent-damage-dialog.html", {
                types: typeList
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
                html.find("label").on("click", () => {
                    // Doesn't work without the delay, might be a radio button thing
                    setTimeout(() => html.find('input').focus(), 0);
                });

                // Replace the apply button
                html.find(".dialog-button.yes").off().on("click", () => {
                    const type = html.find('[name="Type"]:checked').val() as keyof typeof types;
                    const value = html.find('[name="Damage"]').val() as string;

                    // test for errors
                    const errors = [];
                    if (!type) errors.push("Missing damage type");
                    if (!value) errors.push("Missing damage value");
                    if (errors.length > 0) {
                        ui.notifications.error("Persistent Damage Errors: " + errors.join("; "));
                    }

                    try {
                        // Test if the roll is valid
                        new Roll(value).roll();
                        this.addPersistentDamage(canvas.tokens.controlled, type, value);
                    } catch (err) {
                        ui.notifications.error(err);
                    }
                });
            },
        } as DialogData, {
            id: 'pf2-template-creator'
        }).render(true);
    }

    /**
     * Adds persistent damage effects to one or more tokens
     * @param token
     * @param type
     * @param value
     * @returns
     */
    addPersistentDamage(token: Token | Token[], type: keyof typeof types, value: string): void {
        //console.log(`Apply condition ${type} ${value}`);

        const tokens = Array.isArray(token) ? token : [token];
        if (tokens.length == 0) {
            ui.notifications.warn("No token currently active.");
            return;
        }

        const effect = createEffect(type, value);
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
        //this isn't quite working yet
            var typeImage=types[type]
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
    processPersistentDamage(token: Token | Token[]): void {
        const { autoResolve, autoDamage } = getSettings();

        const tokens = Array.isArray(token) ? token : [token];
        for (const token of tokens) {
            const actor = token.actor;
            const persistentDamageElements = [...actor.items.values()].filter((i: Item) => i.data.flags.persistent);
            if (!persistentDamageElements) {
                continue;
            }

            for (const entry of persistentDamageElements) {
                const { type, value } = entry.data.flags.persistent;
                const roll = new Roll(value).roll();

                const inlineCheck = TextEditor.enrichHTML("[[1d20]]");
                const resultNum = Number($(inlineCheck).text());
                const flatCheck = resultNum < 15
                    ? `<span class="flat-check-failure">Failure</span>`
                    : `<span class="flat-check-success">Success</span>`;

                ChatMessage.create({
                    speaker: {
                        actor: actor?._id,
                        token,
                        alias: token?.name || actor?.name
                    },
                    flavor: `
                        <div class="pf2e-pd-card">
                            <header class="card-header flexrow">
                                <img src="${token.data.img}" width="36" height="36"/>
                                <h3 class="item-name token-link" data-token-id="${token.id}"'>
                                    ${token.name}
                                </h3>
                            </header>
                            <div class="card-content">
                                <p>Persistent ${value} - Damage (${type})</p>
                                <p>D20 Check ${inlineCheck} - ${flatCheck}</p>
                            </div>
                        </div>`
                    ,
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
                if (autoResolve && resultNum >= 15) {
                    this.removePersistentDamage(token, entry._id, type);
                }
            }
        }
    }
}

function createEffect(type: keyof typeof types, value: string) {
    return {
        name: `Persistent ${type} [${value}]`,
        type: "effect",
        data: {
            description: {
                value: `<p>[[/r ${value}]]</p> persistent ${type} damage</p><p>Roll DC 15 Flat Check, [[/r 1d20]]</p>`
            },
            duration: {
                expiry: "turn-end",
                unit: "unlimited",
                value: -1,
            },
            rules: [
                { key: "PF2E.RuleElement.TokenEffectIcon" }
            ]
        },
        flags: {
            persistent: { type, value }
        },
        img: types[type]
    };
}
