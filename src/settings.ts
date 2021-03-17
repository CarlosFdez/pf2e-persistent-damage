const MODULE_NAME = "pf2e-persistent-damage";

function getVersion() {
    return game.modules.get(MODULE_NAME).data.version;
}

export function registerSettings() {
    // Special non-config flag to handle migrations
    game.settings.register(MODULE_NAME, "migration", {
        config: false,
        default: { status: false, version: getVersion() },
        scope: 'world',
        type: Object
    });
}
