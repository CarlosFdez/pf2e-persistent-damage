import type { ActorPF2e } from "@actor";
import { TokenPF2e } from "@module/canvas";
import { TokenDocumentPF2e } from "@module/scene";
import { DamageType } from "@module/system/damage";
import { MODULE_NAME } from "./settings";

type TokenOrActor = TokenDocumentPF2e | TokenPF2e | ActorPF2e;
type TokenOrActorInput = TokenOrActor | TokenOrActor[];
type ResolvedActor = { token?: TokenDocumentPF2e | null; actor: ActorPF2e };

function resolveActor(document: TokenOrActor): ResolvedActor | null {
    if (document instanceof Actor) {
        return { actor: document, token: document.token };
    } else if (!document.actor) {
        ui.notifications.warn("TOKEN.WarningNoActor", { localize: true });
        return null;
    } else {
        const token = "document" in document ? document.document : document;
        return token.actor ? { actor: token.actor, token } : null;
    }
}

/**
 * Converts a single token/actor or list of tokens and/or actors into a list of actors.
 * Necessary for backwards compatibility, the macros give tokens, but we need to process
 * on the actors instead.
 * @param documents
 * @returns
 */
function resolveActors(documents: TokenOrActorInput): ResolvedActor[] {
    const arr = Array.isArray(documents) ? documents : [documents];
    return arr
        .map((document): ResolvedActor | null => {
            return resolveActor(document);
        })
        .filter((arr: ResolvedActor | null): arr is ResolvedActor => !!arr);
}

/**
 * The main class that handles the entire module.
 * It handles more than persistent damage, but that's because the scope of the module increased.
 * This should probably be renamed.
 */
export class PersistentDamagePF2e {
    /**
     * Shows a dialog that can be used to add persistent damage effects to selected tokens.
     * If actor is given, the dialog will add a single effect to that actor.
     * If not given, it can be used to add effects to selected tokens.
     */
    async showDialog({ actor }: { actor?: ActorPF2e } = {}) {
        const actors = actor ? [actor] : canvas.tokens.controlled?.map((t) => t.actor);
        await game.pf2e.gm.editPersistent({ actors });
    }

    /**
     * Removes persistent damage effects of a certain type from an actor
     * @param actor
     * @param type
     * @param value
     * @returns
     */
    async removePersistentDamage(actor: ActorPF2e, type: DamageType) {
        const effects = actor.items.filter((i) => i.flags.persistent?.damageType === type);
        await actor?.deleteEmbeddedDocuments(
            "Item",
            effects.map((i) => i.id),
        );
    }

    getPersistentDamage(actor: ActorPF2e, type: DamageType) {
        return actor.items.find((i) => i.flags.persistent?.damageType === type);
    }

    /**
     * Creates a new message to perform a recover check for the given token
     * @param token
     * @param itemId
     * @returns
     */
    async rollRecoveryCheck(actorOrToken: ActorPF2e | TokenDocumentPF2e, damageType: DamageType) {
        const { actor, token } = resolveActor(actorOrToken) ?? { actor: null };
        if (!actor) return;

        const condition = actor.getCondition(`persistent-damage-${damageType}`);
        if (!condition?.system.persistent) {
            ui.notifications.warn(`No persistent ${damageType} damage exists on the actor`);
            return;
        }

        const roll = await new Roll("1d20").evaluate({ async: true });
        const success = roll.total >= condition.system.persistent.dc;
        const typeName = game.i18n.localize(CONFIG.PF2E.damageTypes[damageType]);
        const templatePath = "modules/pf2e-persistent-damage/templates/chat/recover-persistent-card.html";
        const message = await roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: <any>actor, token: <any>token }),
            flavor: await renderTemplate(templatePath, { data: condition.system.persistent, typeName, success }),
        });

        // Auto-remove the condition if enabled and it passes the DC
        if (success && game.settings.get(MODULE_NAME, "auto-resolve")) {
            await actor.decreaseCondition(condition);
        }

        return message;
    }

    /**
     * Checks for persistent damage effects on a token, and rolls damage and flat checks
     * for each one.
     * @param token one or more tokens to apply persistent damage to
     */
    async processPersistentDamage(tokensOrActors: TokenOrActorInput): Promise<ChatMessage[]> {
        const messages = [];
        for (const { actor, token } of resolveActors(tokensOrActors)) {
            const persistentDamageConditions = actor.itemTypes.condition.filter((c) => c.slug === "persistent-damage");
            if (!persistentDamageConditions) {
                continue;
            }

            for (const condition of persistentDamageConditions) {
                await condition.onEndTurn({ token });
            }
        }

        return messages;
    }
}
