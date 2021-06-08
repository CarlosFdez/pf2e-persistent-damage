import { ItemPF2e } from '@item/base';
import { Rarity } from '@module/data';
import { MeleeData } from './data';
export declare class MeleePF2e extends ItemPF2e {
    /** @override */
    static get schema(): typeof MeleeData;
    /** @override */
    get rarity(): Rarity;
    /** @override */
    get isEquipped(): true;
    /** @override */
    getChatData(this: Embedded<MeleePF2e>, htmlOptions?: EnrichHTMLOptions): {
        traits: import("../data").TraitChatData[];
        map2: string;
        map3: string;
        attack: {
            value: string;
        };
        damageRolls: Record<string, import("./data").MeleeDamageRoll>;
        bonus: {
            value: number;
        };
        attackEffects: {
            value: string[];
        };
        weaponType: {
            value: "melee" | "ranged";
        };
        description: {
            value: string;
            chat: string;
            unidentified: string;
        };
        source: {
            value: string;
        };
        options?: {
            value: string[];
        } | undefined;
        usage: {
            value: string;
        };
        rules: import("../../rules/rules-data-definitions").PF2RuleElementData[];
        slug: string | null;
    };
}
export interface MeleePF2e {
    readonly data: MeleeData;
}
