// 尺寸 | size 三档只改变直径，回退文字的字号随之缩放；默认档不输出 data-size
import type { ReactNode } from "react";
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      {/* 有图的一行：图片铺满 root，跟着三档一起缩放 */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <XhAvatarRoot size="sm" src="/images/demo-avatar.svg" alt="曦寒">
          <XhAvatarImage />
          <XhAvatarFallback>曦</XhAvatarFallback>
        </XhAvatarRoot>
        <XhAvatarRoot src="/images/demo-avatar.svg" alt="曦寒">
          <XhAvatarImage />
          <XhAvatarFallback>曦</XhAvatarFallback>
        </XhAvatarRoot>
        <XhAvatarRoot size="lg" src="/images/demo-avatar.svg" alt="曦寒">
          <XhAvatarImage />
          <XhAvatarFallback>曦</XhAvatarFallback>
        </XhAvatarRoot>
        <span style={{ fontSize: "13px" }}>sm / 缺省 / lg</span>
      </div>

      {/* 落回退态的一行：小头像里的字不撑出去，大头像里的字也不显小 */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <XhAvatarRoot size="sm">
          <XhAvatarImage />
          <XhAvatarFallback>XH</XhAvatarFallback>
        </XhAvatarRoot>
        <XhAvatarRoot>
          <XhAvatarImage />
          <XhAvatarFallback>XH</XhAvatarFallback>
        </XhAvatarRoot>
        <XhAvatarRoot size="lg">
          <XhAvatarImage />
          <XhAvatarFallback>XH</XhAvatarFallback>
        </XhAvatarRoot>
        <span style={{ fontSize: "13px" }}>回退字随档位缩放</span>
      </div>
    </>
  );
}
