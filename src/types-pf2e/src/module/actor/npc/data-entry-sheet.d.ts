/// <reference types="jquery" />
/// <reference types="tooltipster" />
import { NPCPF2e } from '@actor/index';
import { ActorSheetPF2e } from '@actor/sheet/base';
import { ActorDataPF2e } from '@actor/data';
export declare class ActorSheetPF2eDataEntryNPC extends ActorSheetPF2e<NPCPF2e> {
    private readonly CUSTOM_TRAIT_SEPARATOR;
    private readonly CREATURE_TRAITS;
    static get defaultOptions(): ActorSheetOptions & {
        classes: string[];
        submitOnClose: boolean;
        scrollY: string[];
    } & {
        classes: string[];
    };
    get template(): string;
    protected prepareItems(_sheetData: {
        actor: ActorDataPF2e;
    }): void;
    getData(): any;
    activateListeners(html: JQuery): void;
    protected _render(force?: boolean, options?: RenderOptions): Promise<void>;
}
