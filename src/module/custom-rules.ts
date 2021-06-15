import { createHealingRuleElement } from "./elements/healing.js";

export function setupCustomRules() {
    const custom = game.pf2e.RuleElements.custom;
    const HealingRuleElement = createHealingRuleElement();
    custom["PF2E.RuleElement.Healing"] = (ruleData, item) => new HealingRuleElement(ruleData, item);
}
