// 异步加载选项 | 首次展开才去取数据：open-change 报出展开意图，数据到达前用一条禁用条目占位
import type { ReactNode } from "react";
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/react";
import { useRef, useState } from "react";

interface Song {
  value: string;
  label: string;
}

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const requested = useRef(false);

  // 展开一次即发起请求，拿到数据后不再重复取
  function onOpenChange(details: { open: boolean }): void {
    if (!details.open || requested.current)
      return;
    requested.current = true;
    setLoading(true);
    window.setTimeout(() => {
      setSongs([
        { value: "song1", label: "起风了" },
        { value: "song2", label: "夜空中最亮的星" },
        { value: "song3", label: "海阔天空" },
        { value: "song4", label: "晴天" },
      ]);
      setLoading(false);
    }, 800);
  }

  return (
    <>
      <XhSelectRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        placeholder="请选择"
        onOpenChange={onOpenChange}
      >
        <XhSelectLabel>曲目</XhSelectLabel>
        <XhSelectControl>
          <XhSelectTrigger>
            <XhSelectValueText />
            <XhSelectIndicator />
          </XhSelectTrigger>
        </XhSelectControl>
        <XhSelectPositioner>
          <XhSelectContent>
            <XhSelectList>
              {loading
                ? (
                    <XhSelectItem value="loading" disabled>
                      <XhSelectItemText>加载中…</XhSelectItemText>
                    </XhSelectItem>
                  )
                : null}
              {songs.map(s => (
                <XhSelectItem key={s.value} value={s.value}>
                  <XhSelectItemText>{s.label}</XhSelectItemText>
                  <XhSelectItemIndicator />
                </XhSelectItem>
              ))}
            </XhSelectList>
          </XhSelectContent>
        </XhSelectPositioner>
      </XhSelectRoot>
      <p>
        当前值：
        {value[0] ?? "（未选）"}
      </p>
    </>
  );
}
