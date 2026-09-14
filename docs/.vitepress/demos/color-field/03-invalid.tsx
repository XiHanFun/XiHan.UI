// 收不下的草稿 | 解析不出的字留在框里并标成无效，让人看见自己打的是什么；Escape 放弃草稿回到规范文本
import type { ReactNode } from "react";
import {
  XhColorFieldControl,
  XhColorFieldInput,
  XhColorFieldLabel,
  XhColorFieldRoot,
  XhColorFieldSwatch,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    // 试着打 tomato 再按回车：颜色关键字不在支持的写法里
    <XhColorFieldRoot defaultValue="#e11d48" placeholder="#rrggbb">
      {({ editing, invalid }) => (
        <>
          <XhColorFieldLabel>强调色</XhColorFieldLabel>
          <XhColorFieldControl style={{ inlineSize: "16rem" }}>
            <XhColorFieldSwatch />
            <XhColorFieldInput />
          </XhColorFieldControl>
          <span style={{ fontSize: "13px" }}>
            {invalid ? "这串字不是颜色：改一改，或按 Escape 放弃" : editing ? "回车或失焦收下" : "已收下"}
          </span>
        </>
      )}
    </XhColorFieldRoot>
  );
}
