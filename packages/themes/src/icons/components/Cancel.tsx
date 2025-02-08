import { defineComponent } from "vue";
import { BaseIcon } from "./BaseIcon";

export const Cancel = defineComponent({
  name: "XhIconCancel",
  props: BaseIcon.props,
  setup(props) {
    return () => (
      <BaseIcon {...props}>
        <path
          d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-4-10h8"
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
