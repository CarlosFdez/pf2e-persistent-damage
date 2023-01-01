export const MODULE_NAME = "pf2e-persistent-damage";

function getVersion(): string | null {
    const module = game.modules.get(MODULE_NAME);
    if (module?.active) {
        return (module as any).version;
    }
    return null;
}

export enum AutoRecoverMode {
    Always = 1,
    NPCOnly = 2,
    Never = 3,
}

export enum RollHideMode {
    Never = 1,
    Normal = 2,
    Always = 3,
}

declare global {
    interface ClientSettings {
        get(name: typeof MODULE_NAME, key: "auto-roll"): boolean;
        get(name: typeof MODULE_NAME, key: "auto-recover"): AutoRecoverMode;
        get(name: typeof MODULE_NAME, key: "auto-resolve"): boolean;
        get(name: typeof MODULE_NAME, key: "hide-rolls"): RollHideMode;
    }
}

/**
 * Initializes settings. Must be called only once.
 */
export function registerSettings() {
    // Special non-config flag to handle migrations
    game.settings.register(MODULE_NAME, "migration", {
        name: "Migration Version",
        hint: "Used to perform migrations",
        config: false,
        default: { version: getVersion() },
        scope: "world",
        type: Object,
    });

    game.settings.register(MODULE_NAME, "auto-recover", {
        name: game.i18n.localize("PF2E-PD.SETTINGS.AutoRecover.name"),
        hint: game.i18n.localize("PF2E-PD.SETTINGS.AutoRecover.hint"),
        scope: "world",
        config: true,
        type: Number,
        choices: {
            [AutoRecoverMode.Always]: game.i18n.localize("PF2E-PD.SETTINGS.AutoRecover.option1"),
            [AutoRecoverMode.NPCOnly]: game.i18n.localize("PF2E-PD.SETTINGS.AutoRecover.option2"),
            [AutoRecoverMode.Never]: game.i18n.localize("PF2E-PD.SETTINGS.AutoRecover.option3"),
        },
        default: AutoRecoverMode.NPCOnly,
    });

    game.settings.register(MODULE_NAME, "auto-resolve", {
        name: game.i18n.localize("PF2E-PD.SETTINGS.AutoResolve.name"),
        hint: game.i18n.localize("PF2E-PD.SETTINGS.AutoResolve.hint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });
}
