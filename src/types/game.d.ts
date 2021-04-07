import { PF2RuleElement } from "../module/rule-element";
import { PF2RuleElementData } from "./item";

interface RuleElements {
    custom: Record<string, (ruleData: PF2RuleElementData, item: Item.Data) => PF2RuleElement>;
}

declare global {
    interface Game {
        pf2e: {
            RuleElements: RuleElements;
        };
    }
}
