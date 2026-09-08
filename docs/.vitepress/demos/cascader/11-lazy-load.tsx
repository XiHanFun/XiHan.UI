// 子节点按需加载 | 先给分支塞一个禁用的占位子节点让子列开得出来，展开到它时才去取真数据换掉占位
import type { ReactNode } from "react";
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderControl,
  XhCascaderIndicator,
  XhCascaderItem,
  XhCascaderItemIndicator,
  XhCascaderItemText,
  XhCascaderLabel,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
  XhCascaderValueText,
} from "@xihan-ui/react";
import { useState } from "react";

interface RegionNode {
  value: string;
  label: string;
  disabled?: boolean;
  children?: RegionNode[];
}

// 下一层的数据在后端，这里用定时器代替一次请求
const remote: Record<string, RegionNode[]> = {
  zhejiang: [
    { value: "hangzhou", label: "杭州" },
    { value: "ningbo", label: "宁波" },
    { value: "wenzhou", label: "温州" },
  ],
  jiangsu: [
    { value: "nanjing", label: "南京" },
    { value: "suzhou", label: "苏州" },
  ],
};

// 占位子节点：children 非空才算分支，子列才开得出来；禁用让方向键跳过它，也点不动
function pending(parent: string): RegionNode {
  return { value: `${parent}:pending`, label: "加载中…", disabled: true };
}

export default function Demo(): ReactNode {
  const [regions, setRegions] = useState<RegionNode[]>([
    { value: "zhejiang", label: "浙江", children: [pending("zhejiang")] },
    { value: "jiangsu", label: "江苏", children: [pending("jiangsu")] },
  ]);
  const [loading, setLoading] = useState<string[]>([]);
  const [loaded, setLoaded] = useState<string[]>([]);
  const [area, setArea] = useState<string[][]>([]);

  // 点开或键盘走到这一支时才取它的子节点，取回来把占位那一条整个换掉
  function load(value: string): void {
    const children = remote[value];
    if (!children || loading.includes(value) || loaded.includes(value)) {
      return;
    }
    setLoading(list => [...list, value]);
    setTimeout(() => {
      setRegions(list =>
        list.map(item => (item.value === value ? { ...item, children } : item)),
      );
      setLoading(list => list.filter(v => v !== value));
      setLoaded(list => [...list, value]);
    }, 800);
  }

  return (
    <>
      <XhCascaderRoot
        value={area}
        onValueChange={details => setArea(details.value)}
        collection={regions}
        placeholder="请选择地区"
      >
        {({ levels }) => (
          <>
            <XhCascaderLabel>收货地区</XhCascaderLabel>
            <XhCascaderControl>
              <XhCascaderTrigger>
                <XhCascaderValueText />
                <XhCascaderIndicator />
              </XhCascaderTrigger>
            </XhCascaderControl>
            <XhCascaderPositioner>
              <XhCascaderContent>
                {levels.map(lv => (
                  <XhCascaderColumn key={lv.level} level={lv.level}>
                    {lv.items.map(node => (
                      <XhCascaderItem
                        key={node.value}
                        value={node.value}
                        onClick={() => load(node.value)}
                        onFocus={() => load(node.value)}
                      >
                        <XhCascaderItemText>{node.label}</XhCascaderItemText>
                        {loading.includes(node.value) && (
                          <span style={{ flex: "none", color: "var(--xh-fg-subtle)", fontSize: "12px" }}>
                            取数中
                          </span>
                        )}
                        <XhCascaderItemIndicator />
                      </XhCascaderItem>
                    ))}
                  </XhCascaderColumn>
                ))}
              </XhCascaderContent>
            </XhCascaderPositioner>
          </>
        )}
      </XhCascaderRoot>
      <p>{`当前路径：${area[0]?.join(" / ") ?? "（未选）"}`}</p>
    </>
  );
}
