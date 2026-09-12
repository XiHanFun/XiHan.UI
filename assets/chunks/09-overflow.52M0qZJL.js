const e=`// 装不下就收进「更多」 | 宿主自己观测容器宽度，一次收起一个入口直到这排不再溢出；收起来的那几张菜单在「更多」里各占一组
import type { ReactNode } from "react";
import {
  XhButton,
  XhMenubarContent,
  XhMenubarGroup,
  XhMenubarGroupLabel,
  XhMenubarItem,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarTrigger,
} from "@xihan-ui/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const menus = [
  {
    value: "file",
    label: "文件",
    items: [
      { value: "new", label: "新建" },
      { value: "open", label: "打开" },
    ],
  },
  {
    value: "edit",
    label: "编辑",
    items: [
      { value: "undo", label: "撤销" },
      { value: "redo", label: "重做" },
    ],
  },
  {
    value: "view",
    label: "视图",
    items: [
      { value: "zoom-in", label: "放大" },
      { value: "zoom-out", label: "缩小" },
    ],
  },
  {
    value: "insert",
    label: "插入",
    items: [
      { value: "image", label: "图片" },
      { value: "table", label: "表格" },
    ],
  },
  {
    value: "format",
    label: "格式",
    items: [
      { value: "bold", label: "加粗" },
      { value: "italic", label: "倾斜" },
    ],
  },
  { value: "tools", label: "工具", items: [{ value: "spell", label: "拼写检查" }] },
  { value: "help", label: "帮助", items: [{ value: "about", label: "关于" }] },
];

const widths = [560, 380, 240];

export default function Demo(): ReactNode {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [boxWidth, setBoxWidth] = useState(560);
  const [visible, setVisible] = useState(menus.length);
  const [picked, setPicked] = useState("");

  const shown = menus.slice(0, visible);
  const folded = menus.slice(visible);

  // 每渲染一遍量一次：还溢出就再收一个，收到不溢出为止
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box)
      return;
    if (visible > 1 && box.scrollWidth > box.clientWidth + 1)
      setVisible(n => n - 1);
  });

  // 容器尺寸一变就先全铺开，交给上面那条重新收
  useEffect(() => {
    const box = boxRef.current;
    if (!box)
      return;
    const observer = new ResizeObserver(() => setVisible(menus.length));
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  function onSelect(details: { menu: string; value: string }): void {
    setPicked(\`\${details.menu} / \${details.value}\`);
  }

  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "12px", justifyItems: "start" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {widths.map(w => (
          <XhButton
            key={w}
            size="sm"
            variant={boxWidth === w ? "solid" : "outline"}
            onClick={() => setBoxWidth(w)}
          >
            {\`\${w} 像素\`}
          </XhButton>
        ))}
      </div>

      {/* 溢出裁在这一层，量的也是这一层 */}
      <div
        ref={boxRef}
        style={{ inlineSize: \`\${boxWidth}px\`, maxInlineSize: "100%", overflow: "hidden" }}
      >
        <XhMenubarRoot onSelect={onSelect}>
          {shown.map(m => (
            <XhMenubarTrigger key={m.value} value={m.value}>
              {m.label}
            </XhMenubarTrigger>
          ))}
          {folded.length ? <XhMenubarTrigger value="more">更多</XhMenubarTrigger> : null}

          {shown.map(m => (
            <XhMenubarPositioner key={m.value} value={m.value}>
              <XhMenubarContent>
                {m.items.map(item => (
                  <XhMenubarItem key={item.value} value={item.value}>
                    <XhMenubarItemText>{item.label}</XhMenubarItemText>
                  </XhMenubarItem>
                ))}
              </XhMenubarContent>
            </XhMenubarPositioner>
          ))}

          {folded.length
            ? (
                <XhMenubarPositioner value="more">
                  <XhMenubarContent>
                    {folded.map(m => (
                      <XhMenubarGroup key={m.value} value={m.value}>
                        <XhMenubarGroupLabel>{m.label}</XhMenubarGroupLabel>
                        {m.items.map(item => (
                          <XhMenubarItem key={item.value} value={\`\${m.value}:\${item.value}\`}>
                            <XhMenubarItemText>{item.label}</XhMenubarItemText>
                          </XhMenubarItem>
                        ))}
                      </XhMenubarGroup>
                    ))}
                  </XhMenubarContent>
                </XhMenubarPositioner>
              )
            : null}
        </XhMenubarRoot>
      </div>

      <span>
        {\`在场入口 \${shown.length} / \${menus.length}；最近选中：\${picked || "（无）"}\`}
      </span>
    </div>
  );
}
`;export{e as default};
