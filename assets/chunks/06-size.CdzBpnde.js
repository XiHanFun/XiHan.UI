const e=`// 尺寸 | size 只改高度、内边距与字号，不写就是缺省档
import type { ReactNode } from "react";
import { XhToggle } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <XhToggle variant="outline" size="sm">小</XhToggle>
      <XhToggle variant="outline">缺省</XhToggle>
      <XhToggle variant="outline" size="lg">大</XhToggle>
    </div>
  );
}
`;export{e as default};
