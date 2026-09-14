// 可关闭 | closable 给出关闭钮；open 受控时去留由宿主决定，可访问名逐枚带上标签文字，摘掉一枚后焦点交给下一枚
import type { ReactNode } from "react";
import {
  XhButton,
  XhTagCloseTrigger,
  XhTagLabel,
  XhTagRoot,
} from "@xihan-ui/react";
import { useEffect, useRef, useState } from "react";

const all = ["设计", "前端", "无头内核", "可访问性"];

export default function Demo(): ReactNode {
  const [tags, setTags] = useState<string[]>([...all]);
  const listEl = useRef<HTMLDivElement | null>(null);
  // 摘掉的是第几枚：这一轮渲染完才补焦点，先记在这里
  const removedAt = useRef<number | null>(null);

  function remove(tag: string): void {
    removedAt.current = tags.indexOf(tag);
    setTags(list => list.filter(t => t !== tag));
  }

  useEffect(() => {
    const index = removedAt.current;
    if (index == null) {
      return;
    }
    removedAt.current = null;

    // 被摘掉的那一枚带着焦点一起消失，接不住就掉回页面开头：
    // 交给顶上来的那一枚的关闭钮，摘的是最后一枚就交给剩下的最后一枚，一枚不剩交给"还原"钮
    const closes = listEl.current
      ? [
          ...listEl.current.querySelectorAll<HTMLElement>(
            "[data-part=\"close-trigger\"]",
          ),
        ]
      : [];
    const next = closes[Math.min(index, closes.length - 1)];
    const reset = listEl.current?.querySelector<HTMLElement>(
      "[data-scope=\"button\"]",
    );
    (next ?? reset)?.focus();
  }, [tags]);

  return (
    <div
      ref={listEl}
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}
    >
      {tags.map(tag => (
        <XhTagRoot
          key={tag}
          variant="subtle"
          tone="brand"
          closable
          open
          translations={{ close: `移除 ${tag}` }}
          onOpenChange={() => remove(tag)}
        >
          <XhTagLabel>{tag}</XhTagLabel>
          <XhTagCloseTrigger />
        </XhTagRoot>
      ))}

      {!tags.length && <span style={{ fontSize: "13px" }}>已全部移除</span>}

      {tags.length < all.length && (
        <XhButton size="sm" variant="ghost" onClick={() => setTags([...all])}>
          还原
        </XhButton>
      )}
    </div>
  );
}
