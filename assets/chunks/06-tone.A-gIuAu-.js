const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 语气 | 六种语气
import type { ReactNode } from "react";
import { XhSelectRoot } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {tones.map(t => (
        <XhSelectRoot
          key={t}
          variant="outline"
          tone={t}
          collection={fruits}
          defaultValue={["apple"]}
          label={t}
          placeholder="请选择"
        />
      ))}
    </div>
  );
}
`;export{n as default};
