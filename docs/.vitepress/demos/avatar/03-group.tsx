// 排成一列 | 头像本身不管布局，叠放与间距由外层容器决定
import type { ReactNode } from "react";
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/react";

const members = ["曦", "寒", "懿", "XH"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex" }}>
      {members.map((m, i) => (
        <XhAvatarRoot
          key={m}
          style={{ marginLeft: i ? "-8px" : "0", outline: "2px solid var(--vp-c-bg)", borderRadius: "999px" }}
        >
          <XhAvatarImage />
          <XhAvatarFallback>{m}</XhAvatarFallback>
        </XhAvatarRoot>
      ))}
    </div>
  );
}
