import { PersistentData } from "../module/persistent-effect.js";

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

interface EffectDataDetails extends ItemDescriptionData {
    level?: {
        value: number;
    };
    expired?: boolean;
    remaining?: string;
    duration: {
        value: 0;
        unit: string;
        sustained: boolean;
        expiry: "turn-start" | "turn-end";
    };
    start?: {
        value: number;
        initiative: number | null;
    };
}

export interface EffectData extends Item.Data<EffectDataDetails> {
    type: "effect";
}

declare global {
    namespace Item {
        interface Data {
            flags: {
                persistent?: PersistentData;
            } & Record<string, unknown>;
        }
    }
}
