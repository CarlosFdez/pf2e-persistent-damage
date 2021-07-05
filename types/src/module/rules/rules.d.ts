import { RuleElementData } from './rules-data-definitions';
import { RuleElementPF2e } from './rule-element';
import { ItemPF2e } from '../item';
export { RuleElementPF2e };
/**
 * @category RuleElement
 */
export declare class RuleElements {
    static readonly builtin: Record<string, (ruleData: RuleElementData, item: Embedded<ItemPF2e>) => RuleElementPF2e>;
    static custom: Record<string, (ruleData: RuleElementData, item: Embedded<ItemPF2e>) => RuleElementPF2e>;
    static fromOwnedItem(item: Embedded<ItemPF2e>): RuleElementPF2e[];
}
