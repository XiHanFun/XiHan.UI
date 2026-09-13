const e=`// 基础用法 | 输入日期
import type { ReactNode } from "react";
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhDateFieldRoot locale="zh-CN">
      <XhDateFieldLabel>截止日期</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment index={0} />
          <span>年</span>
          <XhDateFieldSegment index={1} />
          <span>月</span>
          <XhDateFieldSegment index={2} />
          <span>日</span>
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>
  );
}
`;export{e as default};
