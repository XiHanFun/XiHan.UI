import { defineComponent } from "vue";
import { BaseIcon } from "./BaseIcon";

export const Retry = defineComponent({
  name: "XhIconRetry",
  props: BaseIcon.props,
  setup(props) {
    return () => (
      <BaseIcon {...props}>
        <path d="M1 4v6h6" />
        <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
      </BaseIcon>
    );
  },
});
