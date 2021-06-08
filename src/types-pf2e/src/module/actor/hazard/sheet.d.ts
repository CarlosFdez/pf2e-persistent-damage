/// <reference types="jquery" />
/// <reference types="tooltipster" />
import { ActorSheetPF2e } from '../sheet/base';
import { HazardPF2e } from '.';
export declare class HazardSheetPF2e extends ActorSheetPF2e<HazardPF2e> {
    static get defaultOptions(): ActorSheetOptions & {
        classes: string[];
        submitOnClose: boolean;
        scrollY: string[];
    };
    /**
     * Get the correct HTML template path to use for rendering this particular sheet
     */
    get template(): string;
    /** @override */
    getData(): any;
    /** @override */
    prepareItems(sheetData: any): void;
    /** @override */
    activateListeners(html: JQuery): void;
}
