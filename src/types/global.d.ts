import { PersistentDamagePF2e } from "../pf2e-persistent-damage.js";

declare global {
    interface String {
        toLowerCase<T extends string>(this: T): Lowercase<T>;
    }

    const PF2EPersistentDamage: PersistentDamagePF2e;
    interface Window {
        PF2EPersistentDamage: PersistentDamagePF2e;
    }
}
