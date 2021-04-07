import { HealingRuleElement } from "./rules/healing.js";

export function setupCustomRules() {
    const custom = game.pf2e.RuleElements.custom;
    custom["PF2E.RuleElement.Healing"] = (ruleData, item) => new HealingRuleElement(ruleData, item);
}
