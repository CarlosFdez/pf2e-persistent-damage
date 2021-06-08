import { ActorPF2e } from '../../base';
interface PopupData extends FormApplicationData<ActorPF2e> {
    selection?: string[];
    actorInfo?: {
        id: string;
        name: string;
        checked: boolean;
    }[];
}
interface PopupFormData extends FormData {
    actorIds: string[];
    breakCoins: boolean;
}
/**
 * @category Other
 */
export declare class DistributeCoinsPopup extends FormApplication<ActorPF2e> {
    /** @override */
    static get defaultOptions(): FormApplicationOptions;
    /** @override */
    _updateObject(_event: Event, formData: PopupFormData): Promise<void>;
    /** Prevent Foundry from converting the actor IDs to boolean values
     * @override
     */
    protected _onSubmit(event: Event, options?: OnSubmitFormOptions): Promise<Record<string, unknown>>;
    /** @override */
    getData(): PopupData;
}
export {};
