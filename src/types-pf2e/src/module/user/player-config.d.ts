interface PlayerSettings {
    uiTheme: 'blue' | 'red' | 'original' | 'ui';
    showEffectPanel: boolean;
    showRollDialogs: boolean;
}
/** Player-specific settings, stored as flags on each world User
 * @category Other
 */
export declare class PlayerConfigPF2e extends FormApplication {
    settings: PlayerSettings;
    /** @override */
    constructor();
    static init(): Promise<void>;
    static readonly defaultSettings: PlayerSettings;
    /** @override */
    static get defaultOptions(): FormApplicationOptions;
    /** @override */
    getData(): FormApplicationData & PlayerSettings;
    static activateColorScheme(): void;
    /**
     * Creates a div for the module and button for the Player Configuration
     * @param html the html element where the button will be created
     */
    static hookOnRenderSettings(): void;
    /** @override */
    _updateObject(_event: Event, formData: FormData & PlayerSettings): Promise<void>;
}
export {};
