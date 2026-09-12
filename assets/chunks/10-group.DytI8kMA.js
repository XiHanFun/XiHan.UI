const n=`// 分组与标记位 | 组标题与组内条目用 role="group" 加 aria-labelledby 对上；中间包一层不影响方向键行程，条目里标记位与文字各占一段
import type { CSSProperties, ReactNode } from "react";
import { CheckIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhMenuContent,
  XhMenuGroup,
  XhMenuGroupLabel,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuTrigger,
} from "@xihan-ui/react";
import { Fragment, useState } from "react";

const groups = [
  {
    value: "density",
    label: "行高",
    items: [
      { value: "compact", label: "紧凑" },
      { value: "comfortable", label: "宽松" },
    ],
  },
  {
    value: "panel",
    label: "面板",
    items: [
      { value: "sidebar", label: "侧栏" },
      { value: "inspector", label: "属性面板" },
    ],
  },
];

// 标记位恒占一格，勾不勾都不推动后面的文字
const markStyle: CSSProperties = {
  flex: "none",
  inlineSize: "14px",
};

export default function Demo(): ReactNode {
  const [density, setDensity] = useState("comfortable");
  const [panels, setPanels] = useState<string[]>(["sidebar"]);

  function checked(group: string, value: string): boolean {
    return group === "density" ? density === value : panels.includes(value);
  }

  function onSelect(details: { value: string }): void {
    if (details.value === "compact" || details.value === "comfortable") {
      setDensity(details.value);
      return;
    }
    setPanels(prev => (prev.includes(details.value)
      ? prev.filter(v => v !== details.value)
      : [...prev, details.value]));
  }

  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "12px", justifyItems: "start" }}>
      <XhMenuRoot onSelect={onSelect}>
        <XhMenuTrigger>视图</XhMenuTrigger>
        <XhMenuPositioner>
          <XhMenuContent>
            {groups.map((g, index) => (
              <Fragment key={g.value}>
                {index > 0 ? <XhMenuSeparator /> : null}
                <XhMenuGroup value={g.value}>
                  <XhMenuGroupLabel>{g.label}</XhMenuGroupLabel>
                  {g.items.map(item => (
                    <XhMenuItem key={item.value} value={item.value}>
                      <span style={markStyle}>
                        {checked(g.value, item.value) ? <XhIcon icon={CheckIcon} /> : null}
                      </span>
                      <span>{item.label}</span>
                    </XhMenuItem>
                  ))}
                </XhMenuGroup>
              </Fragment>
            ))}
          </XhMenuContent>
        </XhMenuPositioner>
      </XhMenuRoot>

      <span>
        {\`行高：\${density === "compact" ? "紧凑" : "宽松"}；面板：\${panels.length ? \`\${panels.length} 个\` : "都收起了"}\`}
      </span>
    </div>
  );
}
`;export{n as default};
