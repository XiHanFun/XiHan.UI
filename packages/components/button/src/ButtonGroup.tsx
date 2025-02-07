import { defineComponent, provide } from "vue";
import type { InjectionKey } from "vue";

export const buttonGroupContextKey: InjectionKey<{ size?: string }> = Symbol("buttonGroupContextKey");

export default defineComponent({
  name: "XhButtonGroup" as const,

  props: {
    // 统一设置按钮组内按钮的尺寸
    size: {
      type: String,
      values: ["small", "medium", "large"],
    },
  },

  setup(props, { slots }) {
    // 通过 provide/inject 向子按钮提供尺寸信息
    provide(buttonGroupContextKey, {
      size: props.size,
    });

    return () => (
      <div class="xh-button-group" role="group">
        {slots.default?.()}
      </div>
    );
  },
});
