export const MODULE_NAME = "pf2e-persistent-damage";

function getVersion() {
    return game.modules.get(MODULE_NAME).data.version;
}

export enum RollHideMode {
    Never = 1,
    Normal = 2,
    Always = 3
}

/**
 * Initializes settings. Must be called only once.
 */
export function registerSettings() {
    // Special non-config flag to handle migrations
    game.settings.register(MODULE_NAME, "migration", {
        config: false,
        default: { version: getVersion() },
        scope: 'world',
        type: Object
    });

    game.settings.register(MODULE_NAME, "auto-roll", {
        name: game.i18n.localize("PF2E-PD.SETTINGS.AutoRoll.name"),
        hint: game.i18n.localize("PF2E-PD.SETTINGS.AutoRoll.hint"),
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE_NAME, "auto-resolve", {
        name: game.i18n.localize("PF2E-PD.SETTINGS.AutoResolve.name"),
        hint: game.i18n.localize("PF2E-PD.SETTINGS.AutoResolve.hint"),
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE_NAME, "hide-rolls", {
        name: game.i18n.localize("PF2E-PD.SETTINGS.HideRolls.name"),
        hint: game.i18n.localize("PF2E-PD.SETTINGS.HideRolls.hint"),
        scope: "world",
        config: true,
        type: Number,
        choices: {
            1: game.i18n.localize("PF2E-PD.SETTINGS.HideRolls.option1"),
            2: game.i18n.localize("PF2E-PD.SETTINGS.HideRolls.option2"),
            3: game.i18n.localize("PF2E-PD.SETTINGS.HideRolls.option3")
        },
        default: 1
    });

    /* NOT YET IMPLEMENTED
    game.settings.register(MODULE_NAME, "auto-damage", {
        name: "Auto apply damage?",
        hint: "Automatically apply persistent damage at end of turn?",
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: value =>  location.reload()
    });
    */
}

export function getSettings() {
    return {
        get autoRoll(): boolean {
            return game.settings.get(MODULE_NAME, "auto-roll");
        },

        get autoResolve(): boolean {
            return game.settings.get(MODULE_NAME, "auto-resolve");
        },

        get autoDamage(): boolean {
            // Not yet implemented
            // return game.settings.get(MODULE_NAME, "auto-damage");
            return false;
        },

        get rollHideMode(): RollHideMode {
            return game.settings.get(MODULE_NAME, "hide-rolls");
        }
    }
}
