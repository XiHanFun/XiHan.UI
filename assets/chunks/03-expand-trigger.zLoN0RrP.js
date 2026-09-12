const t=`// 展开方式 | hover 指针进出整个壳就开合，click 点触发器；点这条恒在，触摸与键盘都靠它
import type { ReactNode } from "react";
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", inlineSize: "100%" }}>
      <div
        style={{
          position: "relative",
          blockSize: "240px",
          border: "1px solid var(--xh-border-default)",
          borderRadius: "8px",
        }}
      >
        <p style={{ margin: "12px", color: "var(--xh-fg-muted)" }}>hover：指针移上去就展开</p>
        <XhFloatButtonRoot style={{ position: "absolute" }} offset={16} expandTrigger="hover">
          <XhFloatButtonTrigger />
          <XhFloatButtonList>
            <button type="button" title="编辑">✎</button>
            <button type="button" title="分享">↗</button>
          </XhFloatButtonList>
        </XhFloatButtonRoot>
      </div>

      <div
        style={{
          position: "relative",
          blockSize: "240px",
          border: "1px solid var(--xh-border-default)",
          borderRadius: "8px",
        }}
      >
        <p style={{ margin: "12px", color: "var(--xh-fg-muted)" }}>click：点一下展开，Escape 收起</p>
        <XhFloatButtonRoot style={{ position: "absolute" }} offset={16} expandTrigger="click">
          <XhFloatButtonTrigger />
          <XhFloatButtonList>
            <button type="button" title="编辑">✎</button>
            <button type="button" title="分享">↗</button>
          </XhFloatButtonList>
        </XhFloatButtonRoot>
      </div>
    </div>
  );
}
`;export{t as default};
