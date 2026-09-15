const n=`// 基础用法 | 默认单开：展开一项即收起其余，defaultValue 只给初始值，之后由组件自己维护
import type { ReactNode } from "react";
import { XhAccordionRoot } from "@xihan-ui/react";

const items = [
  {
    value: "install",
    label: "怎么安装",
    content: "装 @xihan-ui/react 与 @xihan-ui/styles 两个包，皮肤单独引一次。",
  },
  {
    value: "theme",
    label: "怎么换皮肤",
    content: "皮肤只认 data-part 与 data-state，覆写同名令牌即可。",
  },
  {
    value: "a11y",
    label: "键盘怎么走",
    content: "方向键只在标题之间搬焦点，永不进内容区，首尾不回绕。",
  },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", maxWidth: "420px" }}>
      <XhAccordionRoot collection={items} defaultValue={["install"]} />
    </div>
  );
}
`;export{n as default};
