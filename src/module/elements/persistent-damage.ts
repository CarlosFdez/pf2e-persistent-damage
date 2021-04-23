import { PersistentData } from "../persistent-effect.js";
import { PF2RuleElement } from "./rule-element.js";

/**
 * A potential rule element for applying persistent damage, but currently its disabled.
 * Re-enable if conditions will be implemented using rule elements later, otherwise remove.
 */
export class PersistentDamageElement extends PF2RuleElement {
    onBeforePrepareData(actorData: ActorDataWithHealing) {
        const { damageType, value, dc } = this.ruleData as PersistentData;
        this.item.flags.persistent = {
            damageType,
            value: String(this.resolveBracket(value, this.ruleData, this.item, actorData)),
            dc: this.resolveValue(dc, this.ruleData, actorData, this.item)
        };
    }

    onAfterPrepareData() {
        // Temp title to show the value in the effect bar
        this.item.name = this.createTitle();
    }

    private createTitle() {
        const { damageType, value, dc } = this.item.flags.persistent;
        const typeName = game.i18n.localize(CONFIG.PF2E.damageTypes[damageType]);
        const dcStr = dc === 15 ? "" : ` DC${String(dc)}`;
        return `${this.item.name} [${typeName} ${String(value)}${dcStr}]`;
    }
}
