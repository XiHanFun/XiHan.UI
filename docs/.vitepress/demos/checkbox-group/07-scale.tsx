// 整组换档 | 方框边长、字号、间距与选中色都是组件令牌，写在组容器上整组一起生效
import type { CSSProperties, ReactNode } from "react";
import { XhCheckboxGroupRoot } from "@xihan-ui/react";

const items = [
  { value: "cheese", label: "芝士" },
  { value: "bacon", label: "培根" },
];

// 一档尺寸就是一组令牌：方框边长、勾的字号、条目字号、条目内间距与条目间距
const compact = {
  "--xh-checkbox-group-indicator-size": "13px",
  "--xh-checkbox-group-indicator-font-size": "10px",
  "--xh-checkbox-group-item-font-size": "13px",
  "--xh-checkbox-group-item-gap": "6px",
  "--xh-checkbox-group-gap": "8px",
} as CSSProperties;
const roomy = {
  "--xh-checkbox-group-indicator-size": "20px",
  "--xh-checkbox-group-indicator-font-size": "15px",
  "--xh-checkbox-group-item-font-size": "17px",
  "--xh-checkbox-group-item-gap": "10px",
  "--xh-checkbox-group-gap": "14px",
} as CSSProperties;
// 选中态的底与描边各是一个令牌，两个一起换才不会只填色不换边
const green = {
  "--xh-checkbox-group-indicator-bg-checked": "#16a34a",
  "--xh-checkbox-group-indicator-border-checked": "#16a34a",
} as CSSProperties;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", alignItems: "flex-start" }}>
      <XhCheckboxGroupRoot defaultValue={["cheese"]} collection={items} style={compact} label="紧凑" />

      <XhCheckboxGroupRoot defaultValue={["cheese"]} collection={items} label="缺省" />

      <XhCheckboxGroupRoot defaultValue={["cheese"]} collection={items} style={roomy} label="宽松" />

      <XhCheckboxGroupRoot defaultValue={["cheese"]} collection={items} style={green} label="换选中色" />
    </div>
  );
}
