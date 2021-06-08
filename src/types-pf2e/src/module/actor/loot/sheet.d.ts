/// <reference types="jquery" />
/// <reference types="tooltipster" />
import { ActorSheetPF2e } from '../sheet/base';
import { LootPF2e } from '@actor/loot';
import { LootSheetDataPF2e } from '../sheet/data-types';
export declare class LootSheetPF2e extends ActorSheetPF2e<LootPF2e> {
    /** @override */
    static get defaultOptions(): ActorSheetOptions & {
        classes: string[];
        submitOnClose: boolean;
        scrollY: string[];
    } & {
        editable: boolean;
        classes: string[];
        width: number;
        height: number;
        tabs: {
            navSelector: string;
            contentSelector: string;
            initial: string;
        }[];
    };
    /** @override */
    get template(): string;
    /** @override */
    get isLootSheet(): boolean;
    /** @override */
    getData(): LootSheetDataPF2e;
    /** @override */
    activateListeners(html: JQuery<HTMLElement>): void;
    prepareItems(sheetData: any): void;
    private distributeCoins;
    private lootNPCs;
    /** @override */
    protected _onDropItem(event: ElementDragEvent, data: DropCanvasData): Promise<unknown>;
}
