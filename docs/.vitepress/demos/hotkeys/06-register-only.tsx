// 只注册不显示 | 全局快捷键用 useHotkeys；键帽要不要出是另一件事，组件本身就是它的消费者
import type { ReactNode } from "react";
import { useHotkeys } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [hits, setHits] = useState(0);

  useHotkeys({
    keys: ["Mod", "k"],
    preventDefault: true,
    onHotKey: () => {
      setHits(previous => previous + 1);
    },
  });

  return (
    <p>{`按 Mod+K（Mac 上是 ⌘K）：已命中 ${hits} 次。这一段没有渲染任何键帽。`}</p>
  );
}
