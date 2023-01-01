import { AbstractEffectPF2e, EffectBadge } from "@item/abstract-effect";
import { ItemPF2e } from "@item";
import { RuleElementOptions, RuleElementPF2e } from "@module/rules";
import { UserPF2e } from "@module/user";
import { ConditionData, ConditionSlug } from "./data";
import { TokenDocumentPF2e } from "@module/scene";
declare class ConditionPF2e extends AbstractEffectPF2e {
    get badge(): EffectBadge | null;
    get appliedBy(): ItemPF2e | null;
    get value(): number | null;
    get duration(): number | null;
    /** Is the condition currently active? */
    get isActive(): boolean;
    /** Is this condition locked in place by another? */
    get isLocked(): boolean;
    /** Is the condition found in the token HUD menu? */
    get isInHUD(): boolean;
    get key(): string;
    increase(): Promise<void>;
    decrease(): Promise<void>;
    onEndTurn(options?: { token: TokenDocumentPF2e });
    /** Ensure value.isValued and value.value are in sync */
    prepareBaseData(): void;
    prepareSiblingData(): void;
    /** Log self in parent's conditions map */
    prepareActorData(): void;
    /** Withhold all rule elements if this condition is inactive */
    prepareRuleElements(options?: RuleElementOptions): RuleElementPF2e[];
    protected _preUpdate(changed: DeepPartial<this["_source"]>, options: ConditionModificationContext<this>, user: UserPF2e): Promise<void>;
    protected _onCreate(data: this["_source"], options: DocumentModificationContext<this>, userId: string): void;
    protected _onUpdate(changed: DeepPartial<this["_source"]>, options: ConditionModificationContext<this>, userId: string): void;
    protected _onDelete(options: DocumentModificationContext<this>, userId: string): void;
}
interface ConditionPF2e {
    readonly data: ConditionData;
    get slug(): ConditionSlug;
}
interface ConditionModificationContext<T extends ConditionPF2e> extends DocumentModificationContext<T> {
    conditionValue?: number | null;
}
export { ConditionPF2e, ConditionModificationContext };
