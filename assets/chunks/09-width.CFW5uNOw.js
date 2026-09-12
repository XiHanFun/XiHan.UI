const e=`// 宽度 | 盒与浮层各有自己的宽度槽位，写在根部件上即可；装不下的文本在行内以省略号收口
import type { CSSProperties, ReactNode } from "react";
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/react";

const plans = [
  { value: "basic", label: "基础版" },
  { value: "pro", label: "专业版" },
  { value: "long", label: "旗舰版 · 含无限席位与专属客户成功经理的年度合约" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      <XhSelectRoot defaultValue={["long"]} placeholder="请选择">
        <XhSelectLabel>缺省宽度</XhSelectLabel>
        <XhSelectControl>
          <XhSelectTrigger>
            <XhSelectValueText />
            <XhSelectIndicator />
          </XhSelectTrigger>
        </XhSelectControl>
        <XhSelectPositioner>
          <XhSelectContent>
            <XhSelectList>
              {plans.map(p => (
                <XhSelectItem key={p.value} value={p.value}>
                  <XhSelectItemText>{p.label}</XhSelectItemText>
                  <XhSelectItemIndicator />
                </XhSelectItem>
              ))}
            </XhSelectList>
          </XhSelectContent>
        </XhSelectPositioner>
      </XhSelectRoot>

      <XhSelectRoot
        defaultValue={["long"]}
        placeholder="请选择"
        style={{
          "--xh-select-control-min-w": "15rem",
          "--xh-select-content-min-w": "22rem",
        } as CSSProperties}
      >
        <XhSelectLabel>加宽</XhSelectLabel>
        <XhSelectControl>
          <XhSelectTrigger>
            <XhSelectValueText />
            <XhSelectIndicator />
          </XhSelectTrigger>
        </XhSelectControl>
        <XhSelectPositioner>
          <XhSelectContent>
            <XhSelectList>
              {plans.map(p => (
                <XhSelectItem key={p.value} value={p.value}>
                  <XhSelectItemText>{p.label}</XhSelectItemText>
                  <XhSelectItemIndicator />
                </XhSelectItem>
              ))}
            </XhSelectList>
          </XhSelectContent>
        </XhSelectPositioner>
      </XhSelectRoot>
    </div>
  );
}
`;export{e as default};
