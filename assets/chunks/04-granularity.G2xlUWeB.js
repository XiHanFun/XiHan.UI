const e=`// 按周挑 | granularity=week：一行一个整周，格子直接铺进网格；值是两端那两周的周首日；月、季度与年同理
import type { ReactNode } from "react";
import {
  XhCalendarRangePickerCell,
  XhCalendarRangePickerCellTrigger,
  XhCalendarRangePickerGrid,
  XhCalendarRangePickerHeader,
  XhCalendarRangePickerHeading,
  XhCalendarRangePickerNextTrigger,
  XhCalendarRangePickerPrevTrigger,
  XhCalendarRangePickerRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);

  // 值只在两端都落定时更新；挑到一半的起点记在组件里
  const text = value.length === 2 ? \`\${value[0]} → \${value[1]}\` : "（未选）";

  return (
    <>
      <XhCalendarRangePickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        locale="zh-CN"
        granularity="week"
        style={{ maxInlineSize: "280px" }}
      >
        {({ periods }) => (
          <>
            <XhCalendarRangePickerHeader>
              <XhCalendarRangePickerPrevTrigger aria-label="上个月" />
              <XhCalendarRangePickerHeading />
              <XhCalendarRangePickerNextTrigger aria-label="下个月" />
            </XhCalendarRangePickerHeader>
            {/* 周期视图没有周行那一层：一格就是一整周，格子直接铺进网格 */}
            <XhCalendarRangePickerGrid>
              {periods.map(period => (
                <XhCalendarRangePickerCell key={period.key} value={period.start}>
                  <XhCalendarRangePickerCellTrigger>{period.label}</XhCalendarRangePickerCellTrigger>
                </XhCalendarRangePickerCell>
              ))}
            </XhCalendarRangePickerGrid>
          </>
        )}
      </XhCalendarRangePickerRoot>

      <span style={{ fontSize: "13px" }}>{\`周区间：\${text}\`}</span>
    </>
  );
}
`;export{e as default};
