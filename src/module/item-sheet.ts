/**
 * Overrides the item sheet so that all sheets for persistent damage effects
 * will have editable details.
 */
 export function overrideItemSheet() {
    // unfortunately....pf2e does not override the item default sheet
    const baseSheet: typeof ItemSheet = Items.registeredSheets.find(
        (s) => s.name === "ItemSheetPF2e",
    );

    const original = baseSheet.prototype.getData;
    baseSheet.prototype.getData = function (...args) {
        const data = original.bind(this)(...args);
        const { item } = data;

        if (item.flags.persistent) {
            data.detailsTemplate = () =>
                "modules/pf2e-persistent-damage/templates/persistent-details.html";
            data.hasDetails = true;
        }

        return data;
    };
}
