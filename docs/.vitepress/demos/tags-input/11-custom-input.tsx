// 外部触发的输入会话 | 输入部件平时收起，按「添加」才露面并聚焦；打字时给候选，选中即落标签，失焦按 blur-behavior 收尾
import type { ReactNode } from "react";
import {
  XhButton,
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/react";
import { useEffect, useRef, useState } from "react";

const domains = ["@qq.com", "@163.com", "@gmail.com"];

// 候选：拿已经打出来的前缀拼几个完整地址
function options(text: string): string[] {
  const prefix = text.split("@")[0] ?? "";
  return prefix ? domains.map(domain => prefix + domain) : [];
}

export default function Demo(): ReactNode {
  const [mails, setMails] = useState<string[]>(["hi@xihan.dev"]);
  const [typing, setTyping] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  // 输入框由外部按钮开合，露面后焦点要自己送进去
  useEffect(() => {
    if (typing) {
      input.current?.focus();
    }
  }, [typing]);

  return (
    <XhTagsInputRoot
      value={mails}
      onValueChange={details => setMails(details.value)}
      max={4}
      blurBehavior="add"
      placeholder="打前缀选后缀"
      style={{ maxInlineSize: "420px" }}
    >
      {({ value, inputValue, addValue, setInputValue, atMax }) => (
        <>
          <XhTagsInputLabel>通知邮箱（最多 4 个）</XhTagsInputLabel>
          <XhTagsInputControl>
            {value.map(t => (
              <XhTagsInputItem key={t} value={t}>
                <XhTagsInputItemPreview>
                  <XhTagsInputItemText>{t}</XhTagsInputItemText>
                  <XhTagsInputItemDeleteTrigger />
                </XhTagsInputItemPreview>
              </XhTagsInputItem>
            ))}
            {typing
              ? <XhTagsInputInput ref={input} onBlur={() => setTyping(false)} />
              : (
                  <XhButton
                    size="sm"
                    variant="outline"
                    disabled={atMax}
                    onClick={() => setTyping(true)}
                  >
                    ＋ 添加
                  </XhButton>
                )}
          </XhTagsInputControl>

          {/* 候选面板是作者自己的节点：按下不放焦点，点完把框里的半截文本清掉 */}
          {typing && options(inputValue).length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBlockStart: "4px",
                border: "1px solid var(--xh-border-subtle)",
                borderRadius: "var(--xh-radius-md)",
                overflow: "hidden",
              }}
            >
              {options(inputValue).map(opt => (
                <button
                  key={opt}
                  type="button"
                  style={{
                    padding: "6px 10px",
                    border: 0,
                    background: "none",
                    color: "var(--xh-fg-default)",
                    font: "inherit",
                    textAlign: "start",
                    cursor: "pointer",
                  }}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => {
                    addValue(opt);
                    setInputValue("");
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </XhTagsInputRoot>
  );
}
