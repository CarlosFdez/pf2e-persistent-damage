import type { ActorPF2e } from '@actor/base';
import { TokenPF2e } from './canvas/token';
import { CombatPF2e } from './combat';
export declare class CombatantPF2e extends Combatant {
    /**
     * Hide the tracked resource if the combatant represents a non-player-owned actor
     * @todo Make this a configurable with a metagame-knowledge setting
     */
    updateResource(): {
        value: number;
    } | null;
    _getInitiativeFormula(): string;
}
export interface CombatantPF2e {
    readonly parent: CombatPF2e | null;
    _actor: ActorPF2e | null;
    _token: TokenPF2e | null;
}
