import { ItemPF2e } from "..";
import { FeatData } from "./data";
export declare class FeatPF2e extends ItemPF2e {
    /** @override */
    static get schema(): typeof FeatData;
}
export interface FeatPF2e {
    readonly data: FeatData;
}
