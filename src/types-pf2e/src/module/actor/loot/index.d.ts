import { ActorPF2e } from '@actor/base';
import { PhysicalItemPF2e } from '@item/physical';
import { ItemPF2e } from '@item/base';
import { UserPF2e } from '@module/user';
import { LootData } from './data';
export declare class LootPF2e extends ActorPF2e {
    /** @override */
    static get schema(): typeof LootData;
    get isLoot(): boolean;
    get isMerchant(): boolean;
    /** Anyone with Limited permission can update a loot actor
     * @override
     */
    canUserModify(user: UserPF2e, action: UserAction): boolean;
    /**
     * A user can see a loot actor in the actor directory only if they have at least Observer permission
     * @override
     */
    get visible(): boolean;
    /** @override */
    transferItemToActor(targetActor: ActorPF2e, item: Embedded<ItemPF2e>, quantity: number, containerId?: string): Promise<Embedded<PhysicalItemPF2e> | null>;
}
export interface LootPF2e extends ActorPF2e {
    readonly data: LootData;
    getFlag(scope: string, key: string): any;
    getFlag(scope: 'core', key: 'sourceId'): string | undefined;
    getFlag(scope: 'pf2e', key: 'editLoot.value'): boolean | undefined;
}
