import { PF2RuleElement, PF2RuleElementSynthetics } from "../rule-element.js";

// {
//     "key": "PF2E.RuleElement.Healing",
//     "selector": "regeneration",
//     "label": "Troll Regeneration",
//     "value": 10
//     "damageTypes": ["fire", "acid"]
// }

interface ActorDataWithHealing extends Actor.Data {
    data: {
        attributes: {
            healing?: {
                'fast-healing'?: {
                    value: number;
                    notes?: string;
                },
                regeneration?: {
                    value: number;
                    notes?: string;
                    suppressedBy?: Array<string | string[]>;
                    suppressed?: boolean;
                }
            }
        }
    }
}

const VALID_SELECTORS = ['fast-healing', 'regeneration'] as const;

export class HealingRuleElement extends PF2RuleElement {
    onBeforePrepareData(actorData: ActorDataWithHealing, synthetics: PF2RuleElementSynthetics) {
        const selector = this.ruleData.selector as typeof VALID_SELECTORS[number];
        if (!VALID_SELECTORS.includes(selector)) {
            return;
        }

        const value = super.resolveValue(this.ruleData.value, this.ruleData, this.item, actorData);
        const attributes = actorData.data.attributes;
        if (!attributes.healing) {
            attributes.healing = { };
        }

        if (value > (attributes.healing[selector] ?? 0)) {
            const notes = this.ruleData.notes && String(this.ruleData.notes);
            const suppressedBy = selector === 'regeneration' ? this.ruleData.suppressedBy : undefined;
            attributes.healing[selector] = { value, notes, suppressedBy };
        }
    }
}
