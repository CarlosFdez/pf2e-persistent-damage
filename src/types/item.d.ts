import { PersistentData } from "../module/persistent-effect.js";

export class ItemPF2e extends Item {
    readonly data: ItemData;
    readonly parent: Actor | null;

    getFlag(scope: string, key: string): any;
    getFlag(scope: 'core', key: 'sourceId'): string | undefined;
}

export interface PF2RuleElementData {
    key: string;
    data?: any;
    selector?: string;
    value?: unknown;
    scope?: string;
}

export interface ItemDescriptionData {
    description: {
        value: string;
    };
    source?: {
        value: string;
    };
    options?: {
        value: string[];
    };
    usage?: {
        value: string;
    };
    rules: PF2RuleElementData[];
    slug?: string | null;
}

export interface EffectDetailsData extends ItemDescriptionData {
    level: {
        value: number;
    };
    expired: boolean;
    remaining: string;
    duration: {
        value: number;
        unit: string;
        sustained: boolean;
        expiry: 'turn-start' | 'turn-end';
    };
    start: {
        value: number;
        initiative: number | null;
    };
    tokenIcon?: {
        show: boolean;
    };
}

export class EffectPF2e extends ItemPF2e {
    data: EffectData;
}

interface BaseItemDataPF2e<D extends ItemDescriptionData> extends ItemData {
    type: string;
    data: D;
    effects: foundry.abstract.EmbeddedCollection<ActiveEffect>;

    /** Prepared data */
    isPhysical: boolean;
}

interface BaseNonPhysicalItemData<D extends ItemDescriptionData> extends BaseItemDataPF2e<D> {
    /** Prepared data */
    isPhysical: false;
}

export interface EffectData extends BaseNonPhysicalItemData<EffectDetailsData> {
    type: 'effect';
}

// A union of all possible item data's...this module though only cares about effects
export type ItemDataPF2e = EffectData;

declare global {
    namespace Item {
        interface Data {
            flags: {
                persistent?: PersistentData;
            } & Record<string, unknown>;
        }
    }
}

export type ItemType = 'effect';
