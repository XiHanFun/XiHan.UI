// 禁用与程序化操作 | 禁用时三类把手全按不动；从外面加一条走同一条闸门，整份替换值则不受闸门约束
import type { ReactNode } from "react";
import {
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemContent,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [locked, setLocked] = useState(false);
  const [tasks, setTasks] = useState<string[]>(["写方案", "评审", "上线"]);

  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={locked}
          onChange={event => setLocked(event.target.checked)}
        />
        锁定这份清单
      </label>

      <XhFieldArrayRoot
        value={tasks}
        onValueChange={details => setTasks(details.value as string[])}
        disabled={locked}
        createItem={() => "新任务"}
        style={{ maxInlineSize: "420px" }}
      >
        {({ items, setValue, add }) => (
          <>
            {items.map(row => (
              <XhFieldArrayItem key={row.key} index={row.index}>
                <XhFieldArrayItemContent>{row.value as string}</XhFieldArrayItemContent>
                <XhFieldArrayItemAction>
                  <XhFieldArrayItemDeleteTrigger />
                </XhFieldArrayItemAction>
              </XhFieldArrayItem>
            ))}
            <XhFieldArrayAddTrigger>+ 添加任务</XhFieldArrayAddTrigger>

            {/* add 与把手走同一条闸门，锁定时同样按不动；setValue 是整份替换，不受闸门约束 */}
            <p>
              <button type="button" onClick={() => add()}>从外面加一条</button>
              <button type="button" onClick={() => setValue(["写方案", "评审", "上线"])}>恢复默认</button>
            </p>
          </>
        )}
      </XhFieldArrayRoot>
    </>
  );
}
