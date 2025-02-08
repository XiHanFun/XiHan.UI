import { defineComponent } from "vue";
import { BaseIcon } from "./BaseIcon";

export const Clear = defineComponent({
  name: "XhIconClear",
  props: BaseIcon.props,
  setup(props) {
    return () => (
      <BaseIcon {...props}>
        <path
          d="M18 6L6 18M6 6l12 12"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </BaseIcon>
    );
  },
});
