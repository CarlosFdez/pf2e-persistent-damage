
/**
 * Overrides the item sheet so that all sheets for persistent damage effects
 * will have editable details.
 */
 export function overrideItemSheet() {
    // unfortunately....pf2e does not override the item default sheet
    const baseSheet = Items.registeredSheets.find(
        (s: any) => s.name === "ItemSheetPF2e",
    ) as unknown as typeof ItemSheet;

    function setDetailsIfPersistent(data: any) {
        const { item } = data;

        if (item.flags.persistent) {
            data.detailsTemplate = () =>
                "modules/pf2e-persistent-damage/templates/persistent-details.html";
            data.hasDetails = true;
        }

        return data;
    }

    const original = baseSheet.prototype.getData;
    baseSheet.prototype.getData = function (...args) {
        // NOTE: As of this writing, getData() is becoming async. We need to be backwards compatible for a while though
        const data = original.bind(this)(...args);
        if (data instanceof Promise) {
            return data.then((data) => setDetailsIfPersistent(data));
        } else {
            return setDetailsIfPersistent(data);
        }
    };

    console.log("PF2E Persistent | Registered Item Sheet Modification");
}
