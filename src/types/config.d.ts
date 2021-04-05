import { EffectData } from "./item";

declare global {
    interface CONFIG {
        PF2E: {
            damageTypes: Record<string, string>;
            Item: {
                entityClasses: {
                    effect: Item<EffectData>;
                };
            };
        };
    }
}
