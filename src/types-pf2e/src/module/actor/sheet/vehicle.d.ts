/// <reference types="jquery" />
/// <reference types="tooltipster" />
import { ActorSheetPF2e } from './base';
import { VehiclePF2e } from '@actor/vehicle';
/**
 * @category Actor
 */
export declare class VehicleSheetPF2e extends ActorSheetPF2e<VehiclePF2e> {
    /** @override */
    static get defaultOptions(): ActorSheetOptions & {
        classes: string[];
        submitOnClose: boolean;
        scrollY: string[];
    } & {
        classes: string[];
        width: number;
        height: number;
        tabs: {
            navSelector: string;
            contentSelector: string;
            initial: string;
        }[];
    };
    get template(): string;
    /** @override */
    getData(): any;
    protected prepareItems(sheetData: any): void;
    /** @override */
    activateListeners(html: JQuery): void;
}
