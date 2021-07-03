import type { ActorDataPF2e } from "@pf2e/module/actor/data";

/**
 * Extends built in rule elements with any new rule elements used by this module.
 */
export function setupCustomRules() {
    const custom = game.pf2e.RuleElements.custom;
    const HealingRuleElement = createHealingRuleElement();
    custom["PF2E.RuleElement.Healing"] = (ruleData, item, itemUUID) => new HealingRuleElement(ruleData, item, itemUUID);
}

interface HealingRuleData {
    key: "PF2E.RuleElement.Healing";
    selector: string;
    label: string;
    value: number | string;
    notes?: string;
    damageTypes?: string[];
}

function createHealingRuleElement() {
    const VALID_SELECTORS = ["fast-healing", "regeneration"] as const;
    return class HealingRuleElement extends game.pf2e.RuleElement {
        onBeforePrepareData(actorData: ExtendedData<ActorDataPF2e>) {
            const ruleData: HealingRuleData = this.ruleData;
            const selector = ruleData.selector as typeof VALID_SELECTORS[number];
            if (!VALID_SELECTORS.includes(selector)) {
                const valid = VALID_SELECTORS.join(", ");
                console.warn(`PF2E (Persistent Damage) | Healing selector can only be one of ${valid}`);
                return;
            }

            const value = super.resolveValue(ruleData.value, ruleData, this.item, actorData);
            const attributes = actorData.data.attributes;
            if (!attributes.healing) {
                attributes.healing = {};
            }

            if (value > (attributes.healing[selector] ?? 0)) {
                const notes = ruleData.notes && String(ruleData.notes);
                const suppressedBy =
                    selector === "regeneration" ? ruleData.damageTypes : undefined;
                attributes.healing[selector] = { value, notes, suppressedBy };
            }
        }

        onAfterPrepareData(actorData: ExtendedData<ActorDataPF2e>) {
            const ruleData: HealingRuleData = this.ruleData;
            if (ruleData.damageTypes && ruleData.selector === "regeneration") {
                const regeneration = actorData.data.attributes.healing?.regeneration;
                if (regeneration) {
                    regeneration.suppressed = true;
                }
            }
        }
    }
}

// import { ActorDataPF2e } from "@pf2e/module/actor/data/index.js";
// import { PersistentData } from "../persistent-effect.js";

// /**
//  * A potential rule element for applying persistent damage, but currently its disabled.
//  * Re-enable if conditions will be implemented using rule elements later, otherwise remove.
//  */
// export class PersistentDamageElement extends game.pf2e.RuleElement {
//     onBeforePrepareData(actorData: ActorDataPF2e) {
//         const { damageType, value, dc } = this.ruleData as PersistentData;
//         this.item.flags.persistent = {
//             damageType,
//             value: String(this.resolveBracket(value, this.ruleData, this.item, actorData)),
//             dc: this.resolveValue(dc, this.ruleData, actorData, this.item)
//         };
//     }

//     onAfterPrepareData() {
//         // Temp title to show the value in the effect bar
//         this.item.name = this.createTitle();
//     }

//     private createTitle() {
//         const { damageType, value, dc } = this.item.flags.persistent;
//         const typeName = game.i18n.localize(CONFIG.PF2E.damageTypes[damageType]);
//         const dcStr = dc === 15 ? "" : ` DC${String(dc)}`;
//         return `${this.item.name} [${typeName} ${String(value)}${dcStr}]`;
//     }
// }


// export interface Bracket {
//     start?: number;
//     end?: number;
//     value: number;
// }
// export interface BracketedValue {
//     field?: string;
//     brackets: Bracket[];
// }
//     resolveBracket(valueData: RuleValue, ruleData: any, item: any, actorData: any, defaultValue = undefined): string | number {
//         if (typeof valueData === "object") {
//             let bracket = getProperty(actorData, "data.details.level.value");
//             if (valueData.field) {
//                 const field = String(valueData.field);
//                 const separator = field.indexOf("|");
//                 const source = field.substring(0, separator);
//                 switch (source) {
//                     case "actor": {
//                         bracket = getProperty(actorData, field.substring(separator + 1));
//                         break;
//                     }
//                     case "item": {
//                         bracket = getProperty(item, field.substring(separator + 1));
//                         break;
//                     }
//                     case "rule": {
//                         bracket = getProperty(ruleData, field.substring(separator + 1));
//                         break;
//                     }
//                     default:
//                         bracket = getProperty(actorData, field.substring(0));
//                 }
//             }
//             return (valueData.brackets ?? []).find(
//                 (b) => (b.start ?? 0) <= bracket && (b.end ? b.end >= bracket : true),
//             )?.value ?? defaultValue;
//         }

//         return valueData;
//     }

//     /**
//      * Parses the value attribute on a rule.
//      *
//      * @param valueData can be one of 3 different formats:
//      * * {value: 5}: returns 5
//      * * {value: "4 + @details.level.value"}: uses foundry's built in roll syntax to evaluate it
//      * * {
//      *      field: "item|data.level.value",
//      *      brackets: [
//      *          {start: 1, end: 4, value: 5}],
//      *          {start: 5, end: 9, value: 10}],
//      *   }: compares the value from field to >= start and <= end of a bracket and uses that value
//      * @param ruleData current rule data
//      * @param item current item data
//      * @param actorData current actor data
//      * @param defaultValue if no value is found, use that one
//      * @return the evaluated value
//      */
//     resolveValue(valueData: RuleValue, ruleData: any, item: any, actorData: any, defaultValue = 0) {
//         let value = this.resolveBracket(valueData, ruleData, item, actorData, defaultValue);

//         if (typeof value === "string") {
//             const roll = new Roll(value, { ...actorData.data, item: item.data });
//             roll.roll();
//             value = roll.total!;
//         }

//         if (Number.isInteger(Number(valueData))) {
//             value = Number(valueData);
//         }

//         return value;
//     }
// }
