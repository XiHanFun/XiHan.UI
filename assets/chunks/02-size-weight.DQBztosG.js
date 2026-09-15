const n=`// 尺寸与描边 | 设置图标大小和描边粗细
import type { ReactNode } from "react";
import { StarIcon } from "@xihan-ui/icons";
import { XhIcon } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <XhIcon icon={StarIcon} size="text" />
        <XhIcon icon={StarIcon} size="sm" />
        <XhIcon icon={StarIcon} size="md" />
        <XhIcon icon={StarIcon} size="lg" />
        <XhIcon icon={StarIcon} size="xl" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <XhIcon icon={StarIcon} size="lg" weight="light" />
        <XhIcon icon={StarIcon} size="lg" />
        <XhIcon icon={StarIcon} size="lg" weight="bold" />
      </div>
    </>
  );
}
`;export{n as default};
