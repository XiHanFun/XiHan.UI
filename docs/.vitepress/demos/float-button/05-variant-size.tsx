// 形态与尺寸 | variant 换触发器的用色方式，size 换直径；缺省档与 lg 同高，悬浮钮起步就比行内按钮大一号
import type { CSSProperties, ReactNode } from "react";
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/react";

const box: CSSProperties = {
  position: "relative",
  blockSize: "160px",
  inlineSize: "160px",
  border: "1px solid var(--xh-border-default)",
  borderRadius: "8px",
};

const variants = ["solid", "outline", "ghost"] as const;
const sizes = ["sm", "md"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {variants.map(v => (
        <div key={v} style={box}>
          <XhFloatButtonRoot style={{ position: "absolute" }} variant={v} offset={12}>
            <XhFloatButtonTrigger />
            <XhFloatButtonList>
              <button type="button" title="编辑">✎</button>
              <button type="button" title="分享">↗</button>
            </XhFloatButtonList>
          </XhFloatButtonRoot>
        </div>
      ))}

      {sizes.map(s => (
        <div key={s} style={box}>
          <XhFloatButtonRoot style={{ position: "absolute" }} size={s} offset={12}>
            <XhFloatButtonTrigger />
            <XhFloatButtonList>
              <button type="button" title="编辑">✎</button>
              <button type="button" title="分享">↗</button>
            </XhFloatButtonList>
          </XhFloatButtonRoot>
        </div>
      ))}
    </div>
  );
}
