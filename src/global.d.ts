import { PF2EPersistentDamage } from "./pf2e-persistent-damage";

declare global {
    interface Window {
        PF2EPersistentDamage: PF2EPersistentDamage
    }
}
