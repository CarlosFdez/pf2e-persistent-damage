/// <reference types="jquery" />
import type { ActorPF2e } from '@actor/base';
import { ModifierPF2e } from '../../modifiers';
declare type CheckType = 'skill-check' | 'perception-check' | 'saving-throw' | 'attack-roll';
export declare type ActionGlyph = 'A' | 'D' | 'T' | 'R' | 'F' | 'a' | 'd' | 't' | 'r' | 'f' | 1 | 2 | 3 | '1' | '2' | '3';
export interface ActionDefaultOptions {
    event: JQuery.Event;
    actors?: ActorPF2e | ActorPF2e[];
    glyph?: ActionGlyph;
    modifiers?: ModifierPF2e[];
}
export interface SkillActionOptions extends ActionDefaultOptions {
    skill?: string;
}
export declare class ActionsPF2e {
    static exposeActions(actions: {
        [key: string]: Function;
    }): void;
    static resolveStat(stat: string): {
        checkType: CheckType;
        property: string;
        stat: string;
        subtitle: string;
    };
    static simpleRollActionCheck(actors: ActorPF2e | ActorPF2e[] | undefined, statName: string, actionGlyph: ActionGlyph | undefined, title: string, subtitle: string, modifiers: ModifierPF2e[] | undefined, rollOptions: string[], extraOptions: string[], traits: string[], checkType: CheckType, event: JQuery.Event): void;
}
export {};
