import { ActorPF2e } from '@actor/index';
import { TokenPF2e } from './canvas/token';
import { ScenePF2e } from './scene';
export declare class TokenDocumentPF2e extends TokenDocument<ActorPF2e> {
    /** This should be in Foundry core, but ... */
    get scene(): ScenePF2e | null;
}
export interface TokenDocumentPF2e {
    readonly _object: TokenPF2e | null;
    readonly parent: ScenePF2e | null;
}
