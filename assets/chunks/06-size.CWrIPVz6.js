const e=`// 尺寸 | size 改变内边距、间距、字号与行框，不写即默认档；同一档有无关闭按钮高度相同，关闭按钮三档同一个尺寸
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
`;export{e as default};
