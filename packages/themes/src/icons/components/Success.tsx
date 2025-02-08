import { defineComponent } from "vue";
import { BaseIcon } from "./BaseIcon";

export const Success = defineComponent({
  name: "XhIconSuccess",
  props: BaseIcon.props,
  setup(props) {
    return () => (
      <BaseIcon {...props}>
        <path
          d="M20 6L9 17L4 12"
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
