/// <reference types="jquery" />
/// <reference types="tooltipster" />
import { MenuTemplateData, SettingsMenuPF2e } from '../menu';
import { BaseWeaponType } from '@item/weapon/data';
import '@yaireo/tagify/src/tagify.scss';
export declare type ConfigPF2eListName = typeof HomebrewElements.SETTINGS[number];
export declare type HomebrewSettingsKey = `homebrew.${ConfigPF2eListName}`;
export interface HomebrewTag<T extends ConfigPF2eListName = ConfigPF2eListName> {
    id: T extends 'baseWeapons' ? BaseWeaponType : T extends Exclude<ConfigPF2eListName, 'baseWeapons'> ? keyof ConfigPF2e['PF2E'][T] : never;
    value: string;
}
export declare class HomebrewElements extends SettingsMenuPF2e {
    static readonly namespace = "homebrew";
    /** Whether this is the first time the homebrew tags will have been injected into CONFIG and actor derived data */
    private static initialRefresh;
    static readonly SETTINGS: readonly ["creatureTraits", "featTraits", "languages", "magicSchools", "spellTraits", "weaponCategories", "weaponGroups", "baseWeapons"];
    /** @override */
    static get defaultOptions(): FormApplicationOptions & {
        title: string;
        id: string;
        template: string;
        width: number;
        height: string;
        closeOnSubmit: boolean;
    };
    /** @override */
    protected static get settings(): Record<ConfigPF2eListName, ClientSettingsData>;
    /** @override */
    getData(): MenuTemplateData;
    /** @override */
    activateListeners($form: JQuery<HTMLFormElement>): void;
    /**
     * Tagify sets an empty input field to "" instead of "[]", which later causes the JSON parse to throw an error
     * @override
     */
    protected _onSubmit(event: Event, { updateData, preventClose, preventRender }?: OnSubmitFormOptions): Promise<Record<string, unknown>>;
    /** @override */
    protected _updateObject(_event: Event, data: Record<ConfigPF2eListName, HomebrewTag[]>): Promise<void>;
    /** Prepare and run a migration for each set of tag deletions from a tag map */
    private processDeletions;
    /** Assign the homebrew elements to their respective `CONFIG.PF2E` objects */
    static refreshTags(): void;
}
