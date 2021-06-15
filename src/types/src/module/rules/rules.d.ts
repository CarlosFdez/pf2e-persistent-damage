import { ItemDataPF2e } from '@item/data';
import { PF2RuleElementData } from './rules-data-definitions';
import { RuleElementPF2e } from './rule-element';
export { RuleElementPF2e };
/**
 * @category RuleElement
 */
export declare class RuleElements {
    static readonly builtin: Record<string, (ruleData: PF2RuleElementData, item: ItemDataPF2e) => RuleElementPF2e>;
    static custom: Record<string, (ruleData: PF2RuleElementData, item: ItemDataPF2e) => RuleElementPF2e>;
    static fromOwnedItem(item: ItemDataPF2e): RuleElementPF2e[];
    static fromRuleElementData(ruleData: PF2RuleElementData[], item: ItemDataPF2e): RuleElementPF2e[];
}
