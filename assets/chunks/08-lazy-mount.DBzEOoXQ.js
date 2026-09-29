const l=`// 内容懒挂载 | lazyMount 让内容第一次展开时才挂载，之后收起只隐藏；再加 unmountOnExit 即只在展开期间存在，收起动画播完就卸载，里面输入的内容再展开时已清空
import type { ReactNode } from "react";
import {
  XhCollapsibleContent,
  XhCollapsibleIndicator,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", maxWidth: "420px", display: "grid", gap: "12px" }}>
      <XhCollapsibleRoot lazyMount>
        <XhCollapsibleTrigger>
          第一次展开才挂载
          <XhCollapsibleIndicator />
        </XhCollapsibleTrigger>
        <XhCollapsibleContent>
          <XhTextFieldRoot placeholder="输入后收起再展开，内容还在">
            <XhTextFieldLabel>备注</XhTextFieldLabel>
            <XhTextFieldControl>
              <XhTextFieldInput />
            </XhTextFieldControl>
          </XhTextFieldRoot>
        </XhCollapsibleContent>
      </XhCollapsibleRoot>

      <XhCollapsibleRoot lazyMount unmountOnExit>
        <XhCollapsibleTrigger>
          只在展开期间存在
          <XhCollapsibleIndicator />
        </XhCollapsibleTrigger>
        <XhCollapsibleContent>
          <XhTextFieldRoot placeholder="输入后收起再展开，内容已清空">
            <XhTextFieldLabel>草稿</XhTextFieldLabel>
            <XhTextFieldControl>
              <XhTextFieldInput />
            </XhTextFieldControl>
          </XhTextFieldRoot>
        </XhCollapsibleContent>
      </XhCollapsibleRoot>
    </div>
  );
}
`;export{l as default};
