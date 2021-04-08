import { PF2RuleElement, PF2RuleElementSynthetics } from "../rule-element.js";

/**
 * Apply to an effect so that any regeneration rules are suppressed. Does not suppress fast healing.
 */
export class SuppressRegenElement extends PF2RuleElement {
    onBeforePrepareData(actorData: ActorDataWithHealing, synthetics: PF2RuleElementSynthetics) {
        if (!actorData.data.attributes.healing) {
            actorData.data.attributes.healing = {};
        }

        if (actorData.data.attributes.healing.regeneration) {
            actorData.data.attributes.healing.regeneration.suppressed = true;
        } else {
            actorData.data.attributes.healing.regeneration = { value: 0, suppressed: true };
        }
    }
}
