import { TokenDocumentPF2e } from '@module/token-document';
export declare class TokenPF2e extends Token<TokenDocumentPF2e> {
    /** Token overrides from the actor */
    overrides: DeepPartial<foundry.data.TokenSource>;
    /** Used to track conditions and other token effects by game.pf2e.StatusEffects */
    statusEffectChanged: boolean;
    get hasOverrides(): boolean;
    /**
     * Apply a set of changes from the actor
     * @param overrides The property overrides to be applied
     * @param moving    Whether this token is moving: setting as true indicates the client will make the Canvas updates.
     */
    applyOverrides(overrides?: DeepPartial<foundry.data.TokenSource>, { moving }?: {
        moving?: boolean;
    }): void;
    /**
     * Persist token overrides during movement
     * @override
     */
    protected _onMovementFrame(dt: number, anim: TokenAnimationAttribute<this>[], config: TokenAnimationConfig): void;
}
