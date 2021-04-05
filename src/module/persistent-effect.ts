export const typeImages = {
    bleed: "systems/pf2e/icons/spells/blade-barrier.jpg",
    piercing: "systems/pf2e/icons/spells/savor-the-sting.jpg",
    bludgeoning: "systems/pf2e/icons/equipment/weapons/bola.jpg",
    slashing: "systems/pf2e/icons/equipment/weapons/cutlass.png",
    fire: "systems/pf2e/icons/spells/flaming-sphere.jpg",
    acid: "systems/pf2e/icons/spells/blister.jpg",
    cold: "systems/pf2e/icons/spells/chilling-spray.jpg",
    electricity: "systems/pf2e/icons/spells/chain-lightning.jpg",
    sonic: "systems/pf2e/icons/spells/cry-of-destruction.jpg",
    force: "systems/pf2e/icons/spells/magic-missile.jpg",
    mental: "systems/pf2e/icons/spells/modify-memory.jpg",
    poison: "systems/pf2e/icons/spells/acidic-burst.jpg",
    lawful: "systems/pf2e/icons/equipment/adventuring-gear/merchant-scale.jpg",
    chaotic: "systems/pf2e/icons/spells/dinosaur-form.jpg",
    good: "systems/pf2e/icons/spells/angelic-wings.jpg",
    evil: "systems/pf2e/icons/spells/daemonic-pact.jpg",
    positive: "systems/pf2e/icons/spells/moment-of-renewal.jpg",
    negative: "systems/pf2e/icons/spells/grim-tendrils.jpg",
};

export type DamageType = keyof typeof typeImages;

/**
 * Data involving persistent damage
 */
export interface PersistentData {
    damageType: DamageType;
    value: string;
    dc: number;
}

/**
 * All possible persistent data types that may exist due to old versions.
 * These properties are nudged into new ones.
 */
interface PersistentDataOld extends PersistentData {
    type?: Capitalize<DamageType> | "bleeding";
}

/**
 * Retrieves persistent data values from item data if exists.
 * Also handles "migrations" in a way.
 */
export function getPersistentData(itemData: {
    flags: { persistent?: PersistentDataOld };
}): PersistentData {
    const data = itemData.flags.persistent;
    if (data) {
        // Ensure damage type is suitable for the latest version
        let damageType = data.damageType ?? data.type?.toLowerCase();
        if (damageType === "bleeding") damageType = "bleed";

        return {
            damageType,
            dc: data.dc ?? 15,
            value: data.value,
        };
    }
}

/**
 * Update item name and description based on persistent flags
 */
Hooks.on("preUpdateOwnedItem", (actor: Actor, item: Item.Data, update) => {
    if (update?.flags?.persistent) {
        // Merge the persistent flags. This also "migrates" the flags.
        const previous = item.flags?.persistent as PersistentData;
        const persistent = getPersistentData({
            flags: {
                persistent: mergeObject(
                    { ...previous },
                    update.flags.persistent
                ),
            },
        });

        update.flags.persistent = persistent;
        update.name = createTitle(persistent);
        update.description = createDescription(persistent);
    }
});

/**
 * Overrides the item sheet so that all sheets for persistent damage effects
 * will have editable details.
 */
export function overrideItemSheet() {
    // unfortunately....pf2e does not override the item default sheet
    const baseSheet: new () => ItemSheet = Items.registeredSheets.find(
        (s) => s.name === "ItemSheetPF2e"
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

function createTitle(data: PersistentData) {
    const { damageType, value, dc } = data;
    const typeName = CONFIG.PF2E.damageTypes[damageType];
    const dcStr = dc === 15 ? "" : ` DC${dc}`;
    return `Persistent ${typeName} [${value}]${dcStr}`;
}

function createDescription(data: PersistentData) {
    const { damageType, value, dc } = data;
    const typeName = CONFIG.PF2E.damageTypes[damageType];
    return `<p>[[/r ${value}]] persistent ${typeName} damage</p><p>Roll DC ${dc} Flat Check, [[/r 1d20]]</p>`;
}

/**
 * Creates the persistent effect.
 * @param damageType
 * @param value
 * @returns
 */
export function createPersistentEffect(
    damageType: DamageType,
    value: string,
    dc = 15
) {
    const persistent: PersistentData = { damageType, value, dc };
    return {
        name: createTitle(persistent),
        type: "effect",
        data: {
            description: {
                value: createDescription(persistent),
            },
            duration: {
                expiry: "turn-end",
                unit: "unlimited",
                value: -1,
            },
            rules: [{ key: "PF2E.RuleElement.TokenEffectIcon" }],
        },
        flags: { persistent },
        img: typeImages[damageType],
    };
}
