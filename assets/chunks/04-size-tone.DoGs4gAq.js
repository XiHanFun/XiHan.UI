const e=`<!-- 尺寸与语气 | 格子边长跟随控件行高分三档；tone 决定选中描边与选中徽标使用哪族颜色 -->
<!-- 九组结构相同，只有 size / tone 不同：由脚本铺出来，免得同一段标记抄九遍 -->
<div style="display: flex; flex-direction: column; gap: 16px">
  <div id="swatch-picker-sizes" style="display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start"></div>
  <div id="swatch-picker-tones" style="display: flex; flex-wrap: wrap; gap: 24px"></div>
</div>

<script type="module">
  const swatches = [
    { value: "#e11d48", label: "玫红" },
    { value: "#f59e0b", label: "琥珀" },
    { value: "#10b981", label: "翠绿" },
    { value: "#3b82f6", label: "天蓝" },
  ];
  function item(value) {
    const el = document.createElement("div");
    el.setAttribute("data-xh-part", "item");
    el.setAttribute("value", value);
    for (const [tag, part] of [["input", "hidden-input"], ["span", "swatch"], ["span", "indicator"]]) {
      const node = document.createElement(tag);
      node.setAttribute("data-xh-part", part);
      el.append(node);
    }
    return el;
  }
  function build(labelText, attrs, initial) {
    const picker = document.createElement("xh-color-swatch-picker");
    for (const [name, value] of Object.entries(attrs))
      picker.setAttribute(name, value);
    picker.setAttribute("default-value", initial);
    const root = document.createElement("div");
    root.setAttribute("data-xh-part", "root");
    const label = document.createElement("span");
    label.setAttribute("data-xh-part", "label");
    label.textContent = labelText;
    root.append(label, ...swatches.map(s => item(s.value)));
    picker.append(root);
    return picker;
  }
  // 读屏念的名字从数据里查，数据只走 property；升级后再交，免得落在升级前的实例上
  function mount(host, picker) {
    host.append(picker);
    picker.swatches = swatches;
  }
  const sizes = document.getElementById("swatch-picker-sizes");
  for (const size of ["sm", "md", "lg"])
    mount(sizes, build(size, { size }, "#3b82f6"));
  const tones = document.getElementById("swatch-picker-tones");
  for (const tone of ["brand", "neutral", "success", "warning", "danger", "info"])
    mount(tones, build(tone, { tone, size: "sm" }, "#f59e0b"));
<\/script>
`;export{e as default};
