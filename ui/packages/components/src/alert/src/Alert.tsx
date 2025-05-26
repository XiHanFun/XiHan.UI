import { defineComponent } from "vue";
import { alertProps } from "./interface";
import type { AlertProps } from "./interface";

export default defineComponent({
  name: "Alert",
  props: alertProps,
  setup(props, { slots }) {
    return () => <div class="xh-alert">{slots.default?.()}</div>;
  },
});
