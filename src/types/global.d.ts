import { ActorPF2e, ChatMessagePF2e } from "./actor";
import { EffectPF2e, ItemPF2e } from "./item";

export {};

declare global {
    namespace globalThis {
        var game: Game<ActorPF2e, ChatMessagePF2e, Combat, Item, Macro>;
    }

    interface PF2ECONFIG {
        damageTypes: Record<string, string>;
        Item: {
            entityClasses: {
                effect: typeof EffectPF2e;
            };
        };
    }

    interface ConfigPF2e
        extends Config<ActiveEffect, ActorPF2e, ChatMessagePF2e, Combatant, Combat, ItemPF2e, Macro> {
        debug: Config['debug'] & {
            ruleElement: boolean;
        };

        PF2E: PF2ECONFIG;
        time: {
            roundTime: number;
        };
        ui: Config<
            ActiveEffect,
            ActorPF2e,
            ChatMessagePF2e,
            Combatant,
            Combat,
            ItemPF2e,
            Macro
        >['ui'] & {
            combat: typeof CombatTracker;
            compendium: typeof CompendiumDirectory;
        };
    }

    const CONFIG: ConfigPF2e;
    const canvas: Canvas<ActorPF2e>;
}
