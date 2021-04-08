import { PersistentData } from "../persistent-effect.js";
import { PF2RuleElement } from "./rule-element.js";

export class PersistentDamageElement extends PF2RuleElement {
    onBeforePrepareData() {
        // Temp title to show the value in the effect bar
        this.item.name = this.createTitle();
    }

    private createTitle() {
        const { damageType, value, dc } = this.ruleData as PersistentData;
        const typeName = CONFIG.PF2E.damageTypes[damageType];
        const dcStr = dc === 15 ? "" : ` DC${String(dc)}`;
        return `${this.item.name} [${typeName} ${String(value)}${dcStr}]`;
    }
}
