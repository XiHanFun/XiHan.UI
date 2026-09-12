const n=`// 条目增删 | 条目集合在运行期可增可删，增删后照常接线；删掉的正好是选中项时由宿主把值收拾干净
import type { ReactNode } from "react";
import { XhToggleGroupRoot } from "@xihan-ui/react";
import { useRef, useState } from "react";

interface ViewOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export default function Demo(): ReactNode {
  const [options, setOptions] = useState<ViewOption[]>([
    { value: "list", label: "列表" },
    { value: "board", label: "看板" },
    { value: "chart", label: "图表", disabled: true },
  ]);
  const [view, setView] = useState<string | null>("list");
  const seq = useRef(0);

  function addOption(): void {
    seq.current += 1;
    const next = seq.current;
    setOptions(previous => [...previous, { value: \`custom-\${next}\`, label: \`视图 \${next}\` }]);
  }

  function removeLast(): void {
    const removed = options[options.length - 1];
    setOptions(previous => previous.slice(0, -1));
    // 删掉的正是当前值，选中态就没了落点，受控值得跟着清掉
    if (removed && removed.value === view)
      setView(null);
  }

  return (
    <>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
        <XhToggleGroupRoot
          value={view}
          onValueChange={details => setView(details.value as string | null)}
          collection={options}
        />
        <span style={{ fontSize: "13px" }}>{\`当前：\${view ?? "（无选中）"}\`}</span>
      </span>

      <span style={{ display: "inline-flex", gap: "8px" }}>
        <button type="button" onClick={addOption}>加一段</button>
        <button type="button" onClick={removeLast}>删末段</button>
      </span>
    </>
  );
}
`;export{n as default};
