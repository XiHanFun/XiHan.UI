// 尺寸 | size 换内边距、间距、字号与行框，不写就是缺省档；同一档有没有关闭钮都一样高，关闭钮三档同一个尺寸
import type { ReactNode } from "react";
import { XhTagCloseTrigger, XhTagLabel, XhTagRoot } from "@xihan-ui/react";
import { Fragment } from "react";

const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "缺省" },
  { size: "lg", label: "大" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
      {sizes.map(item => (
        <Fragment key={item.label}>
          <XhTagRoot variant="subtle" size={item.size}>
            <XhTagLabel>{item.label}</XhTagLabel>
          </XhTagRoot>
          <XhTagRoot variant="subtle" size={item.size} closable>
            <XhTagLabel>{item.label}</XhTagLabel>
            <XhTagCloseTrigger />
          </XhTagRoot>
        </Fragment>
      ))}
    </div>
  );
}
