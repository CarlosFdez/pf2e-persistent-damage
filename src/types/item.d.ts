import { PersistentData } from "../persistent-effect";

declare global {
    namespace Item {
        interface Data {
            flags: {
                persistent?: PersistentData
            } & Record<string, unknown>
        }
    }
}
