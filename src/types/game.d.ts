import { PF2RuleElement } from "../module/elements/rule-element";
import { ItemDataPF2e, PF2RuleElementData } from "./item";

interface RuleElements {
    readonly builtin: Record<string, (ruleData: PF2RuleElementData, item: ItemDataPF2e) => PF2RuleElement>;
    custom: Record<string, (ruleData: PF2RuleElementData, item: ItemDataPF2e) => PF2RuleElement>;
}

declare global {
    interface Game {
        pf2e: {
            RuleElements: RuleElements;
        };
    }
}
