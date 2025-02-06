import type { App } from "vue";
import Button from "./button/src/Button";
import ButtonGroup from "./button/src/ButtonGroup";

// 导出单个组件
export { Button, ButtonGroup };

// 导出组件类型
export type { ButtonProps } from "./button/src/Button";

// 批量注册组件
export default {
  install(app: App) {
    app.component(Button.name, Button);
    app.component(ButtonGroup.name, ButtonGroup);
  },
};
