// 放置位 | placement 是首选位，位置不够时引擎自己避让，实际落点写在 data-placement 上
import type { ReactNode } from "react";
import {
  XhPopconfirmCancelTrigger,
  XhPopconfirmConfirmTrigger,
  XhPopconfirmContent,
  XhPopconfirmDescription,
  XhPopconfirmPositioner,
  XhPopconfirmRoot,
  XhPopconfirmTrigger,
} from "@xihan-ui/react";

const placements = ["top", "bottom", "left", "right"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {placements.map(placement => (
        <XhPopconfirmRoot key={placement} placement={placement}>
          <XhPopconfirmTrigger>{placement}</XhPopconfirmTrigger>
          <XhPopconfirmPositioner>
            <XhPopconfirmContent>
              <XhPopconfirmDescription>
                要把这条移出列表吗？
              </XhPopconfirmDescription>
              <XhPopconfirmCancelTrigger>再想想</XhPopconfirmCancelTrigger>
              <XhPopconfirmConfirmTrigger>移出</XhPopconfirmConfirmTrigger>
            </XhPopconfirmContent>
          </XhPopconfirmPositioner>
        </XhPopconfirmRoot>
      ))}
    </div>
  );
}
