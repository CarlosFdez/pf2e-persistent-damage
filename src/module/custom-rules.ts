import { HealingRuleElement } from "./elements/healing.js";
import { SuppressRegenElement } from "./elements/suppress-regen.js";

export function setupCustomRules() {
    const custom = game.pf2e.RuleElements.custom;
    custom["PF2E.RuleElement.Healing"] = (ruleData, item) => new HealingRuleElement(ruleData, item);
    custom["PF2E.RuleElement.SuppressRegen"] = (ruleData, item) => new SuppressRegenElement(ruleData, item);
}
