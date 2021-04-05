import { PersistentData } from "../module/persistent-effect.js";

interface EffectDataDetails {
    level: {
        value: number;
    };
    expired: boolean;
    remaining: string;
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
