import { PersistentDamagePF2e } from "../pf2e-persistent-damage";

declare global {
    const PF2EPersistentDamage: PersistentDamagePF2e;
    interface Window {
        PF2EPersistentDamage: PersistentDamagePF2e
    }
}
