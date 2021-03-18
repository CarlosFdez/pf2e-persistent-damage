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
    game.settings.register(MODULE_NAME, "auto-roll", {
        name : "Auto roll at end of turn?",
        hint : "This must be set to true to allow auto-resolve and/or auto apply damage (not yet implemented) at end of turn. Otherwise, you must run the macro 'Process Persistent Damage'.",
        scope : 'world',
        config : true,
        type: Boolean,
        default: true,
        onChange: value =>  location.reload()
    });        
    game.settings.register(MODULE_NAME, "auto-resolve", {
        name : "Auto resolve?",
        hint : "Automatically remove upon successful flat check?",
        scope : 'world',
        config : true,
        type: Boolean,
        default: true,
        onChange: value =>  location.reload()
    });
    /* NOT YET IMPLEMENTED
    game.settings.register(MODULE_NAME, "auto-damage", {
        name : "Auto apply damage?",
        hint : "Automatically apply persistent damage at end of turn?",
        scope : 'world',
        config : true,
        type: Boolean,
        default: true,
        onChange: value =>  location.reload()
    });  
    */

}
