var e=`// 限定种类 | kinds 只留数字与百分比；连同「不设格式」不超过三项时，种类改用分段切换
import type { ReactNode } from "react";
import { XhFormatInputRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhFormatInputRoot
      kinds={["number", "percent"]}
      defaultValue={{ kind: "percent", decimals: 1 }}
      aria-label="占比格式"
    />
  );
}
`;export{e as default};