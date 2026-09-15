const n=`// 颜色 | 使用语义颜色
import type { ReactNode } from "react";
import { StarIcon } from "@xihan-ui/icons";
import { XhIcon } from "@xihan-ui/react";

const tones = ["brand", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <>
      {tones.map(tone => <XhIcon key={tone} icon={StarIcon} tone={tone} size="lg" />)}
    </>
  );
}
`;export{n as default};
