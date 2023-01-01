import { UserPF2e } from "@module/user";
import { RollDataPF2e } from "@system/rolls";
declare class CheckRoll extends Roll<RollDataPF2e> {
    roller: UserPF2e | null;
    isReroll: boolean;
    isRerollable: boolean;
    constructor(formula: string, data?: Partial<RollDataPF2e>, options?: Partial<RollDataPF2e>);
    toJSON(): CheckRollJSON;
}
interface CheckRollJSON extends RollJSON {
    data?: Partial<RollDataPF2e>;
}
export { CheckRoll, CheckRollJSON };
