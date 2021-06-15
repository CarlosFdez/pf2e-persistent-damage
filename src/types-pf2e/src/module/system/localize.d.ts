import * as translationsPF2e from 'static/lang/en.json';
declare type TranslationsPF2e = Record<string, TranslationDictionaryValue> & typeof translationsPF2e;
export declare class LocalizePF2e {
    static ready: boolean;
    private static _translations;
    static get translations(): Record<string, string>;
}
export {};
