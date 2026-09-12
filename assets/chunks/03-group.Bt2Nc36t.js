const e=`// 排成一组 | 多个独立的 toggle 各管各的按下态；要互斥或单一 Tab 位请改用切换按钮组
import type { ReactNode } from "react";
import { XhToggle } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [marks, setMarks] = useState({ bold: false, italic: false, underline: true });

  return (
    <>
      <XhToggle
        pressed={marks.bold}
        onPressedChange={details => setMarks({ ...marks, bold: details.pressed })}
      >
        B
      </XhToggle>
      <XhToggle
        pressed={marks.italic}
        onPressedChange={details => setMarks({ ...marks, italic: details.pressed })}
      >
        I
      </XhToggle>
      <XhToggle
        pressed={marks.underline}
        onPressedChange={details => setMarks({ ...marks, underline: details.pressed })}
      >
        U
      </XhToggle>
      <span>{Object.entries(marks).filter(([, on]) => on).map(([k]) => k).join(" ") || "无"}</span>
    </>
  );
}
`;export{e as default};
