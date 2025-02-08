import { defineComponent } from "vue";
import { BaseIcon } from "./BaseIcon";

export const To = defineComponent({
  name: "XhIconTo",
  props: BaseIcon.props,
  setup(props) {
    return () => (
      <BaseIcon {...props}>
        <path
          d="M5 12h14m-7-7l7 7-7 7"
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
