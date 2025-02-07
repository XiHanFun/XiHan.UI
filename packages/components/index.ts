import type { App } from "vue";
import Button from "./button/src/Button";
import ButtonGroup from "./button/src/ButtonGroup";

// 导出单个组件
export { Button, ButtonGroup };

// 导出组件类型
export type { ButtonProps } from "./button/src/Button";

// 批量注册组件
export const install = (app: App) => {
  app.component(Button.name as string, Button);
  app.component(ButtonGroup.name as string, ButtonGroup);
  // ... 其他组件
};
