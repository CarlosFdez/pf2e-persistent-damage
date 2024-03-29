import { CONDITION_SLUGS } from "@actor/values";
import { BaseItemDataPF2e, BaseItemSourcePF2e, ItemSystemData, ItemSystemSource } from "@item/data/base";
import { ConditionPF2e } from ".";
declare type ConditionSource = BaseItemSourcePF2e<"condition", ConditionSystemSource>;
declare type ConditionData = Omit<ConditionSource, "system" | "effects" | "flags"> & BaseItemDataPF2e<ConditionPF2e, "condition", ConditionSystemData, ConditionSource>;
interface ConditionSystemSource extends ItemSystemSource {
    slug: ConditionSlug;
    active: boolean;
    removable: boolean;
    references: {
        parent?: {
            id: string;
            type: "status" | "condition" | "feat" | "weapon" | "armor" | "consumable" | "equipment" | "spell";
        };
        children: {
            id: string;
            type: "condition";
        }[];
        overriddenBy: {
            id: string;
            type: "condition";
        }[];
        overrides: {
            id: string;
            type: "condition";
        }[];
        /**
         * This status is immune, and thereby inactive, from the following list.
         */
        immunityFrom: {
            id: string;
            type: "status" | "condition" | "feat" | "weapon" | "armor" | "consumable" | "equipment" | "spell";
        }[];
    };
    persistent?: PersistentSourceData;
    hud: {
        statusName: string;
        img: {
            useStatusName: boolean;
            value: ImagePath;
        };
        selectable: boolean;
    };
    duration: {
        perpetual: boolean;
        value: number;
        text: string;
    };
    modifiers: [
        {
            type: "ability" | "proficiency" | "status" | "circumstance" | "item" | "untyped";
            name: string;
            group: string;
            value?: number;
        }
    ];
    base: ConditionSlug;
    group: string;
    value: ConditionValueData;
    sources: {
        hud: boolean;
    };
    alsoApplies: {
        linked: [
            {
                condition: ConditionSlug;
                value?: number;
            }
        ];
        unlinked: [
            {
                condition: ConditionSlug;
                value?: number;
            }
        ];
    };
    overrides: string[];
    traits?: never;
}
declare type ConditionSystemData = ItemSystemData & ConditionSystemSource;
declare type ConditionValueData = {
    isValued: true;
    immutable: boolean;
    value: number;
    modifiers: [
        {
            value: number;
            source: string;
        }
    ];
} | {
    isValued: false;
    immutable: boolean;
    value: null;
    modifiers: [
        {
            value: number;
            source: string;
        }
    ];
};
declare type ConditionSlug = SetElement<typeof CONDITION_SLUGS>;
declare type Conditionkey = ConditionSlug | `persistent-damage-${string}`;
interface PersistentSourceData {
    formula: string;
    damageType: DamageType;
    dc: number;
}
export { ConditionData, ConditionKey, ConditionSource, ConditionSlug };
