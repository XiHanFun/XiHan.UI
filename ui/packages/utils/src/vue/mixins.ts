import type { ComponentOptionsMixin } from "vue";

/**
 * 主题混入
 */
export const themeMixin: ComponentOptionsMixin = {
  inject: {
    theme: {
      default: () => ({ mode: "light" }),
    },
  },
};

/**
 * 尺寸混入
 */
export const sizeMixin: ComponentOptionsMixin = {
  props: {
    size: {
      type: String,
      default: "medium",
      validator: (value: string) => ["small", "medium", "large"].includes(value),
    },
  },
};

/**
 * 禁用状态混入
 */
export const disabledMixin: ComponentOptionsMixin = {
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
};
