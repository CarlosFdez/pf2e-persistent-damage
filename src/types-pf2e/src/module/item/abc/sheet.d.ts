/// <reference types="jquery" />
/// <reference types="tooltipster" />
import { AbilityString } from '@actor/data';
import { AncestryPF2e, BackgroundPF2e, ClassPF2e } from '@item/index';
import { ItemSheetPF2e } from '../sheet/base';
import { ABCSheetData } from '../sheet/data-types';
/**
 * @category Other
 */
export declare abstract class ABCSheetPF2e<TItem extends AncestryPF2e | BackgroundPF2e | ClassPF2e> extends ItemSheetPF2e<TItem> {
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
        width?: string | number | undefined;
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
    getData(): ABCSheetData<TItem>;
    protected getLocalizedAbilities(traits: {
        value: AbilityString[];
    }): {
        [key: string]: string;
    };
    /** Is the dropped feat or feature valid for the given section? */
    private isValidDrop;
    /** @override */
    protected _onDrop(event: ElementDragEvent): Promise<void>;
    private removeItem;
    /** @override */
    activateListeners(html: JQuery): void;
}
