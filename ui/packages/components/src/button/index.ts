import { App } from "vue";
import Button from "./src/Button";
import type { ButtonProps, ButtonInstance, ButtonEvents, ButtonSlots } from "./src/interface";

export { Button };
export type { ButtonProps, ButtonInstance, ButtonEvents, ButtonSlots };

export default {
  install(app: App) {
    app.component("XhButton", Button);
  },
};
