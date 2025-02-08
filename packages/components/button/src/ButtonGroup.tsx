import { defineComponent, provide } from "vue";
import type { InjectionKey, PropType } from "vue";
import type { ButtonSize, ButtonType } from "./Button";

export interface ButtonGroupContext {
  size?: ButtonSize;
  type?: ButtonType;
  vertical?: boolean;
  round?: boolean;
  plain?: boolean;
}

export const buttonGroupContextKey: InjectionKey<ButtonGroupContext> = Symbol("buttonGroupContextKey");

export default defineComponent({
  name: "XhButtonGroup" as const,

  props: {
    // 统一设置按钮组内按钮的尺寸
    size: {
      type: String as PropType<ButtonSize>,
      default: "medium",
    },
    // 统一设置按钮组内按钮的类型
    type: {
      type: String as PropType<ButtonType>,
      default: "default",
    },
    // 是否为垂直按钮组
    vertical: Boolean,
    // 是否为圆角按钮组
    round: Boolean,
    // 是否为朴素按钮组
    plain: Boolean,
  },

  setup(props, { slots }) {
    // 通过 provide/inject 向子按钮提供信息
    provide(buttonGroupContextKey, {
      size: props.size,
      type: props.type,
      vertical: props.vertical,
      round: props.round,
      plain: props.plain,
    });

    return () => (
      <div
        class={[
          "xh-button-group",
          {
            "is-vertical": props.vertical,
            "is-round": props.round,
          },
        ]}
        role="group"
      >
        {slots.default?.()}
      </div>
    );
  },
});
