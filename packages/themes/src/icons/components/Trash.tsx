import { defineComponent } from "vue";
import { BaseIcon } from "./BaseIcon";

export const Trash = defineComponent({
  name: "XhIconTrash",
  props: BaseIcon.props,
  setup(props) {
    return () => (
      <BaseIcon {...props}>
        <path d="M3 6h18" />
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      </BaseIcon>
    );
  },
});
