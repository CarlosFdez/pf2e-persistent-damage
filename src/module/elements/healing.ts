import { ActorDataPF2e } from "@pf2e/module/actor/data";

// {
//     "key": "PF2E.RuleElement.Healing",
//     "selector": "regeneration",
//     "label": "Troll Regeneration",
//     "value": 10,
//     "damageTypes": ["fire", "acid"]
// }


const VALID_SELECTORS = ["fast-healing", "regeneration"] as const;

export class HealingRuleElement extends game.pf2e.RuleElement {
    onBeforePrepareData(actorData: ExtendedData<ActorDataPF2e>) {
        const selector = this.ruleData.selector as typeof VALID_SELECTORS[number];
        if (!VALID_SELECTORS.includes(selector)) {
            const valid = VALID_SELECTORS.join(", ");
            console.warn(`PF2E (Persistent Damage) | Healing selector can only be one of ${valid}`);
            return;
        }

        const value = super.resolveValue(this.ruleData.value, this.ruleData, this.item, actorData);
        const attributes = actorData.data.attributes;
        if (!attributes.healing) {
            attributes.healing = {};
        }

        if (value > (attributes.healing[selector] ?? 0)) {
            const notes = this.ruleData.notes && String(this.ruleData.notes);
            const suppressedBy =
                selector === "regeneration" ? this.ruleData.suppressedBy : undefined;
            attributes.healing[selector] = { value, notes, suppressedBy };
        }
    }

    onAfterPrepareData(actorData: ExtendedData<ActorDataPF2e>) {
        if (this.ruleData.suppressed && this.ruleData.selector === "regeneration") {
            const regeneration = actorData.data.attributes.healing?.regeneration;
            if (regeneration) {
                regeneration.suppressed = true;
            }
        }
    }
}
