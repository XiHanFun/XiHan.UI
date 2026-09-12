const n=`// 语气 | tone 换的是入口的高亮底与指示条、当前链接的文字色，静止态一样：悬停到入口上、或用方向键把焦点移过去才显现
import type { ReactNode } from "react";
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/react";

// 每档语气一个 root，root 里就一个入口，入口名即语气名
const tones = (["brand", "neutral", "success", "warning", "danger", "info"] as const).map(
  tone => ({ tone, entries: [{ value: tone, label: tone }] }),
);

export default function Demo(): ReactNode {
  return (
    // 面板是绝对定位的浮层，这里给下方留出它落位的空间
    <div
      style={{
        inlineSize: "100%",
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        paddingBlockEnd: "180px",
      }}
    >
      {tones.map(t => (
        <XhNavigationMenuRoot
          key={t.tone}
          collection={t.entries}
          tone={t.tone}
          renderPanel={() => (
            <>
              {/* 当前链接的文字色也吃这一档语气 */}
              <XhNavigationMenuLink href="#/docs/guide" current>
                上手指南
              </XhNavigationMenuLink>
              <XhNavigationMenuLink href="#/docs/anatomy">
                部件解剖
              </XhNavigationMenuLink>
            </>
          )}
        />
      ))}
    </div>
  );
}
`;export{n as default};
