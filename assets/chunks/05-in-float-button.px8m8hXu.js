var e=`// 放进浮动按钮 | 作为浮动按钮展开列表里的一项，根按列表排布
import type { ReactNode } from "react";
import { MessageCircleIcon } from "@xihan-ui/icons";
import {
  XhBackTopRoot,
  XhBackTopTrigger,
  XhFloatButtonList,
  XhFloatButtonRoot,
  XhFloatButtonTrigger,
  XhIcon,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhFloatButtonRoot style={{ position: "static" }} defaultOpen>
      <XhFloatButtonTrigger />
      <XhFloatButtonList>
        <XhBackTopRoot style={{ position: "static" }}>
          <XhBackTopTrigger />
        </XhBackTopRoot>
        <button type="button" aria-label="消息"><XhIcon icon={MessageCircleIcon} /></button>
      </XhFloatButtonList>
    </XhFloatButtonRoot>
  );
}
`;export{e as default};