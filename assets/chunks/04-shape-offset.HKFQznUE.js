const t=`<!-- 外形与贴边 | shape 换圆角档，offset 决定距那两条边多远；translations 换掉读屏念出的名字 -->
<div style="display: grid; gap: 12px; inline-size: 100%">
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <label style="display: flex; align-items: center; gap: 6px">
      外形
      <select id="float-button-shape">
        <option value="circle">circle</option>
        <option value="square">square</option>
      </select>
    </label>
    <label style="display: flex; align-items: center; gap: 8px">
      贴边
      <input id="float-button-offset" type="range" min="0" max="48" step="4" value="16" />
      <span id="float-button-offset-readout">16px</span>
    </label>
  </div>

  <div
    style="
      contain: layout;
      block-size: 260px;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <!-- 展开的每一条动作与触发器同一副身量，圆角跟着 shape 一起换 -->
    <xh-float-button id="float-button-shape-offset" shape="circle" offset="16" default-open>
      <div data-xh-part="root">
        <button data-xh-part="trigger"></button>
        <div data-xh-part="list">
          <button type="button" title="编辑">✎</button>
          <button type="button" title="分享">↗</button>
          <button type="button" title="删除">🗑</button>
        </div>
      </div>
    </xh-float-button>
  </div>
</div>

<script type="module">
  // 两个控件改写 shape 与 offset，读屏名字是对象只能作为 property 交进去
  const host = document.getElementById("float-button-shape-offset");
  const shape = document.getElementById("float-button-shape");
  const offset = document.getElementById("float-button-offset");
  const readout = document.getElementById("float-button-offset-readout");

  host.translations = { trigger: "更多操作" };
  shape.addEventListener("change", () => host.setAttribute("shape", shape.value));
  offset.addEventListener("input", () => {
    host.setAttribute("offset", offset.value);
    readout.textContent = \`\${offset.value}px\`;
  });
<\/script>
`;export{t as default};
