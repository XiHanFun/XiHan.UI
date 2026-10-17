// 放进表单字段 | 字段的标题与说明接到组上；日期模式可从预设里挑，也可以自由输入
import type { ReactNode } from "react";
import { XhFieldControl, XhFieldDescription, XhFieldLabel, XhFieldRoot, XhFormatInputRoot } from "@xihan-ui/react";

const patterns = ["yyyy-MM-dd", "yyyy年MM月dd日", "yyyy-MM-dd HH:mm"];
// 样例固定一个时刻，换模式时只看格式的差别
const sample = new Date(2026, 8, 18, 14, 30);

export default function Demo(): ReactNode {
  return (
    <XhFieldRoot>
      <XhFieldLabel>下单时间的显示格式</XhFieldLabel>
      <XhFieldControl>
        <XhFormatInputRoot
          kinds={["date"]}
          clearable={false}
          datePatterns={patterns}
          sample={sample}
          defaultValue={{ kind: "date", pattern: "yyyy-MM-dd" }}
        />
      </XhFieldControl>
      <XhFieldDescription>列表与详情页都按这里的格式显示</XhFieldDescription>
    </XhFieldRoot>
  );
}
