import { PF2RuleElement, PF2RuleElementSynthetics } from "./rule-element.js";

/**
 * Apply to an effect so that any regeneration rules are suppressed. Does not suppress fast healing.
 */
export class SuppressRegenElement extends PF2RuleElement {
    onAfterPrepareData(actorData: ActorDataWithHealing, synthetics: PF2RuleElementSynthetics) {
        if (actorData.data.attributes.healing.regeneration) {
            actorData.data.attributes.healing.regeneration.suppressed = true;
        }
    }
}
