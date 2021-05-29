import { ItemType } from "./item";

type ItemTypeMap = {
    [K in ItemType]: Owned<InstanceType<ConfigPF2e['PF2E']['Item']['entityClasses'][K]>>[];
};

export class ActorPF2e extends Actor {
    itemTypes: ItemTypeMap;
    data: ActorDataPF2e;
}

export interface ActorDataPF2e extends ActorData {
    data: {
        attributes: {
            // used specifically by the persistent damage pf2e module
            healing?: {
                "fast-healing"?: {
                    value: number;
                    notes?: string;
                };
                regeneration?: {
                    value: number;
                    notes?: string;
                    suppressedBy?: Array<string | string[]>;
                    suppressed?: boolean;
                };
            };
        };
    }
}

export class ChatMessagePF2e extends ChatMessage<ActorPF2e> { }

export interface ChatMessagePF2e {
    readonly data: foundry.data.ChatMessageData<ChatMessagePF2e>;
}
