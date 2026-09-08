// 回到底部与播报 | 往上翻一段，右下角那颗钮自己冒出来，按下去归位并重新粘附；输出跑完在播报区念一句结论
import type { ReactNode } from "react";
import {
  XhLogContent,
  XhLogLine,
  XhLogLiveRegion,
  XhLogRoot,
  XhLogScrollToEndTrigger,
  XhLogViewport,
} from "@xihan-ui/react";
import { useEffect, useState } from "react";

export default function Demo(): ReactNode {
  const [lines, setLines] = useState(
    Array.from(
      { length: 10 },
      (_, i) => `12:00:0${i}  build  编译 packages/module-${i + 1} · 往上翻一段试试`,
    ),
  );
  const [announcement, setAnnouncement] = useState("");

  // 挂载后才起：效应只在浏览器里跑，服务端渲染那一遍没有 window
  useEffect(() => {
    let timer = 0;
    function tick(): void {
      setLines((prev) => {
        const seq = prev.length + 1;
        if (seq < 24) {
          timer = window.setTimeout(tick, 700);
        }
        else {
          // 一段输出收尾时才念一句，逐行播报会把读屏淹掉
          setAnnouncement(`构建完成，共 ${seq} 行输出，0 个错误`);
        }
        return [...prev, `12:0${Math.floor(seq / 60)}:${String(seq % 60).padStart(2, "0")}  build  编译 packages/module-${seq}`];
      });
    }
    timer = window.setTimeout(tick, 700);
    // 离开页面时把定时器收掉
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <XhLogRoot rows={8} style={{ inlineSize: "100%" }}>
      <XhLogViewport>
        <XhLogContent>
          {lines.map((line, i) => <XhLogLine key={i}>{line}</XhLogLine>)}
        </XhLogContent>
      </XhLogViewport>

      {/* 留空就由皮肤画一枚向下的字形，往里塞节点即换成自己的图形 */}
      <XhLogScrollToEndTrigger />

      {/* 视觉隐藏的播报区：念哪一句、什么时候念都归宿主定 */}
      <XhLogLiveRegion>{announcement}</XhLogLiveRegion>
    </XhLogRoot>
  );
}
