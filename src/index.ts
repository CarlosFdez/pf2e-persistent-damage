import { ConditionSource } from "@item/data";
import { ChatMessagePF2e } from "@module/chat-message";
import { DamageType } from "@module/system/damage";
import { PersistentDamagePF2e } from "./module/pf2e-persistent-damage";
import { registerSettings } from "./module/settings";

// will be extracted by webpack
import "./styles/styles.scss";

Hooks.on("init", () => {
    registerSettings();
    window.PF2EPersistentDamage = new PersistentDamagePF2e();
});

Hooks.on("renderChatMessage", async (message: ChatMessagePF2e, $html: JQuery<HTMLElement>) => {
    const roll: any = message.rolls[0];
    if (!roll) return;

    if ("evaluatePersistent" in roll.options) {
        const damageType = roll.instances[0].type as DamageType;
        const template = await renderTemplate(
            "modules/pf2e-persistent-damage/templates/chat/recover-persistent-button.html",
            {},
        );

        $html.find(".message-content").append(template);
        $html
            .find(".pf2e-pd-card button[data-action=check][data-check=flat]")
            .on("click", (evt) => {
                evt.preventDefault();

                // Get the Actor from a synthetic Token
                const actorOrToken = message.token ?? message.actor;
                if (actorOrToken) {
                    PF2EPersistentDamage.rollRecoveryCheck(actorOrToken, damageType);
                }
            });
    } else if ("instances" in roll && roll.instances.some((i) => i.persistent)) {
        const template = await renderTemplate("modules/pf2e-persistent-damage/templates/chat/apply-persistent-button.html");
        $html.find(".message-content").append(template);

        $html.find(".pf2e-pd-card button").on("click", (evt) => {
            evt.preventDefault();
            const tokens = canvas.tokens.controlled.filter((token) => token.actor);
            const instances = roll.instances.filter((i) => i.persistent);
            const conditions = instances.map((instance): DeepPartial<ConditionSource> => {
                const damageType = instance.type;
                const formula = instance.head.expression;
                const dc = 15; // from a message, the dc is always 15

                return {
                    type: "condition",
                    name: "Persistent Damage",
                    system: {
                        slug: "persistent-damage",
                        removable: true,
                        persistent: {
                            damageType, formula, dc
                        }
                    }
                }
            });

            for (const token of tokens) {
                token.actor?.createEmbeddedDocuments("Item", conditions);
            }
        })
    }
});
