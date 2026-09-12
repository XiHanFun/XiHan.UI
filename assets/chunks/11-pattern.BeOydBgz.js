const n=`// 自定义准入字符 | pattern 是一段正则源码，逐个字符整格匹配；写坏了退回 type 的准入表
import type { ReactNode } from "react";
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/react";

const six = Array.from({ length: 6 }, (_, i) => i);
const four = Array.from({ length: 4 }, (_, i) => i);

export default function Demo(): ReactNode {
  return (
    <>
      {/* 十六进制：准入放宽到 A-F，type 也一并改成 alphanumeric，
          否则移动端弹的还是数字键盘、那几个字母敲不进来 */}
      <XhPinInputRoot length={6} type="alphanumeric" pattern="[0-9A-Fa-f]" placeholder="·">
        <XhPinInputLabel>颜色值（十六进制）</XhPinInputLabel>
        <div style={{ display: "flex" }}>
          {six.map(i => <XhPinInputInput key={i} index={i} />)}
        </div>
      </XhPinInputRoot>

      {/* 只收这四个字，粘贴整串时同样按它过滤 */}
      <XhPinInputRoot length={4} type="alphanumeric" pattern="[上下左右]" placeholder="·">
        <XhPinInputLabel>方向口令</XhPinInputLabel>
        <div style={{ display: "flex" }}>
          {four.map(i => <XhPinInputInput key={i} index={i} />)}
        </div>
      </XhPinInputRoot>
    </>
  );
}
`;export{n as default};
