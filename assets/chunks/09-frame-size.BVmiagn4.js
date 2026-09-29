const e=`// 底框尺寸 | sm、md、lg 三档底框与头像同档
import type { ReactNode } from "react";
import { FolderIcon } from "@xihan-ui/icons";
import { XhIcon } from "@xihan-ui/react";

const sizes = ["sm", "md", "lg"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {sizes.map(size => <XhIcon key={size} icon={FolderIcon} size={size} frame="subtle" tone="brand" />)}
    </div>
  );
}
`;export{e as default};
