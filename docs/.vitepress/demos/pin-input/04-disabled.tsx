// 禁用与校验失败 | disabled 让每格都带原生 disabled 且不参与提交，invalid 只做标注、照样能改
import type { ReactNode } from "react";
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/react";

const cells = Array.from({ length: 4 }, (_, i) => i);

export default function Demo(): ReactNode {
  return (
    <>
      <XhPinInputRoot length={4} defaultValue={["1", "2", "3", "4"]} disabled>
        <XhPinInputLabel>禁用</XhPinInputLabel>
        <div style={{ display: "flex" }}>
          {cells.map(i => <XhPinInputInput key={i} index={i} />)}
        </div>
      </XhPinInputRoot>

      <XhPinInputRoot length={4} defaultValue={["1", "2", "3", "4"]} invalid>
        <XhPinInputLabel>校验失败</XhPinInputLabel>
        <div style={{ display: "flex" }}>
          {cells.map(i => <XhPinInputInput key={i} index={i} />)}
        </div>
      </XhPinInputRoot>
    </>
  );
}
