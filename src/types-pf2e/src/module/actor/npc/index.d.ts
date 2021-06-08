import { RollNotePF2e } from '@module/notes';
import { CreaturePF2e } from '@actor/index';
import { MeleeData } from '@item/data';
import { Rarity } from '@module/data';
import { NPCData } from './data';
import { NPCSheetPF2e } from './sheet';
import { NPCLegacySheetPF2e } from './legacy-sheet';
export declare class NPCPF2e extends CreaturePF2e {
    /** @override */
    static get schema(): typeof NPCData;
    get rarity(): Rarity;
    /** Does this NPC have the Elite adjustment? */
    get isElite(): boolean;
    /** Does this NPC have the Weak adjustment? */
    get isWeak(): boolean;
    /**
     *  Users with limited permission can loot a dead NPC
     * @override
     */
    canUserModify(user: User, action: UserAction): boolean;
    /**
     * A user can see an NPC in the actor directory only if they have at least Observer permission
     * @override
     */
    get visible(): boolean;
    /**
     * Grant all users at least limited permission on dead NPCs
     * @override
     */
    get permission(): PermissionLevel;
    /**
     * Grant players limited permission on dead NPCs
     * @override
     */
    testUserPermission(user: User, permission: DocumentPermission | UserAction, options?: {
        exact?: boolean;
    }): boolean;
    /** Prepare Character type specific data. */
    prepareDerivedData(): void;
    private updateTokenAttitude;
    private static mapNPCAttitudeToTokenDisposition;
    private static mapTokenDispositionToNPCAttitude;
    protected getAttackEffects(item: MeleeData): Promise<RollNotePF2e[]>;
    protected getHpAdjustment(level: number): number;
    /** @override */
    protected _onUpdate(changed: DocumentUpdateData<this>, options: DocumentModificationContext, userId: string): void;
    /** Make the NPC elite, weak, or normal */
    applyAdjustment(adjustment: 'elite' | 'weak' | 'normal'): Promise<void>;
    updateAttitudeFromDisposition(disposition: number): void;
}
export interface NPCPF2e {
    readonly data: NPCData;
    _sheet: NPCSheetPF2e | NPCLegacySheetPF2e;
}
