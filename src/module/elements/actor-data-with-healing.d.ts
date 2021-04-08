interface ActorDataWithHealing extends Actor.Data {
    data: {
        attributes: {
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
    };
}
