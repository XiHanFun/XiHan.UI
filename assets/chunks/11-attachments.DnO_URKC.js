var e=`// 附件 | 选中的文件以可关闭的标签排在输入行下方，发送时与正文一起交给宿主；文件选择器是宿主自己的原生 input，框里只放触发它的按钮
import type { ChangeEvent, ReactNode } from "react";
import {
  XhButton,
  XhPromptInputControl,
  XhPromptInputInput,
  XhPromptInputRoot,
  XhPromptInputSubmitTrigger,
  XhTagCloseTrigger,
  XhTagLabel,
  XhTagRoot,
} from "@xihan-ui/react";
import { useRef, useState } from "react";

interface Attachment {
  id: number;
  name: string;
}

export default function Demo(): ReactNode {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [log, setLog] = useState("（还没发过）");
  const picker = useRef<HTMLInputElement | null>(null);
  const seq = useRef(0);

  function pick(event: ChangeEvent<HTMLInputElement>): void {
    const picked = [...(event.target.files ?? [])].map(file => ({ id: ++seq.current, name: file.name }));
    setAttachments(list => [...list, ...picked]);
    // 清掉选择器的值：删掉的文件还能再选一次
    event.target.value = "";
  }

  function send(value: string): void {
    const names = attachments.map(item => item.name);
    setLog(names.length ? \`提交：\${value}（附件：\${names.join("、")}）\` : \`提交：\${value}\`);
    setAttachments([]);
  }

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <XhPromptInputRoot translations={{ input: "给助手写点什么" }} onSubmit={details => send(details.value)}>
        <XhPromptInputControl>
          <XhPromptInputInput rows={1} placeholder="写点什么，可以附上文件…" />
          <XhPromptInputSubmitTrigger />
        </XhPromptInputControl>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
          <input ref={picker} type="file" multiple hidden onChange={pick} />
          <XhButton variant="ghost" size="sm" onClick={() => picker.current?.click()}>
            添加附件
          </XhButton>
          {attachments.map(item => (
            <XhTagRoot
              key={item.id}
              variant="subtle"
              closable
              open
              translations={{ close: \`移除 \${item.name}\` }}
              onOpenChange={() => setAttachments(list => list.filter(other => other.id !== item.id))}
            >
              <XhTagLabel>{item.name}</XhTagLabel>
              <XhTagCloseTrigger />
            </XhTagRoot>
          ))}
        </div>
      </XhPromptInputRoot>
      <span>{log}</span>
    </div>
  );
}
`;export{e as default};