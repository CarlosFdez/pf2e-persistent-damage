import { HealingRuleElement } from "./elements/healing.js";
import { PersistentDamageElement } from "./elements/persistent-damage.js";

export function setupCustomRules() {
    const custom = game.pf2e.RuleElements.custom;
    custom["PF2E.RuleElement.Healing"] = (ruleData, item) => new HealingRuleElement(ruleData, item);
    custom["PF2E.RuleElement.PersistentDamage"] = (ruleData, item) =>
        new PersistentDamageElement(ruleData, item);
}
