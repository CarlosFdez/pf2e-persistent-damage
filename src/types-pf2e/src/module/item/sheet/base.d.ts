/// <reference types="jquery" />
/// <reference types="tooltipster" />
import { AESheetData, SheetOptions, SheetSelections } from './data-types';
import { ItemPF2e } from '@item/index';
export interface ItemSheetDataPF2e<TItem extends ItemPF2e> extends ItemSheetData<TItem> {
    user: {
        isGM: boolean;
    };
    enabledRulesUI: boolean;
    activeEffects: AESheetData;
}
/** @override */
export declare class ItemSheetPF2e<TItem extends ItemPF2e> extends ItemSheet<TItem> {
    /** @override */
    static get defaultOptions(): DocumentSheetOptions;
    /** @override */
    getData(): any;
    /** An alternative to super.getData() for subclasses that don't need this class's `getData` */
    protected getBaseData(): ItemSheetDataPF2e<TItem>;
    protected getActiveEffectsData(): AESheetData;
    assignPropertySlots(data: Record<string, boolean>, number: number): void;
    protected prepareTraits(traits: any, choices: Record<string, string>): void;
    /** Prepare form options on the item sheet */
    protected prepareOptions(options: Record<string, string>, selections: SheetSelections, { selectedOnly }?: {
        selectedOnly?: boolean;
    }): SheetOptions;
    protected onTraitSelector(event: JQuery.TriggeredEvent): void;
    /**
     * Get the action image to use for a particular action type.
     */
    protected getActionImg(action: string): ImagePath;
    private addDamageRoll;
    private deleteDamageRoll;
    /** @override */
    protected _canDragDrop(_selector: string): boolean;
    /** @override */
    activateListeners(html: JQuery): void;
    /** @override */
    protected _getSubmitData(updateData?: Record<string, unknown>): Record<string, unknown>;
    /**
     * Hide the sheet-config button unless there is more than one sheet option.
     * @override */
    protected _getHeaderButtons(): ApplicationHeaderButton[];
    /**
     * Tagify sets an empty input field to "" instead of "[]", which later causes the JSON parse to throw an error
     * @override
     */
    protected _onSubmit(event: Event, { updateData, preventClose, preventRender }?: OnSubmitFormOptions): Promise<Record<string, unknown>>;
    /** @override */
    protected _updateObject(event: Event, formData: Record<string, unknown>): Promise<void>;
}
