/// <reference types="jquery" />
/// <reference types="tooltipster" />
import { KitPF2e } from '@item/kit';
import { ItemSheetPF2e } from './base';
/**
 * @category Other
 */
export declare class KitSheetPF2e extends ItemSheetPF2e<KitPF2e> {
    /** @override */
    static get defaultOptions(): {
        scrollY: string[];
        dragDrop: {
            dropSelector: string;
        }[];
        classes: string[];
        template: string;
        viewPermission: number;
        editable?: boolean | undefined;
        closeOnSubmit?: boolean | undefined;
        submitOnClose?: boolean | undefined;
        submitOnChange?: boolean | undefined;
        baseApplication?: string | undefined;
        width?: string | number | undefined; /** @override */
        height?: string | number | undefined;
        top?: number | undefined;
        left?: number | undefined;
        popOut?: boolean | undefined;
        minimizable?: boolean | undefined;
        resizable?: boolean | undefined;
        id?: string | undefined;
        tabs?: TabsOptions[] | undefined;
        title?: string | undefined;
    };
    /** @override */
    getData(): any;
    protected _onDrop(event: ElementDragEvent): Promise<void>;
    removeItem(event: JQuery.ClickEvent): void;
    activateListeners(html: JQuery): void;
}
