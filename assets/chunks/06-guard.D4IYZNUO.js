const e=`<!-- 拦下一次切换 | 受控时 value-change 是唯一出口：宿主不写回，值就原样不动，条件不满足的那一段永远切不过去 -->
<span style="display: inline-flex; align-items: center; gap: 10px">
  <xh-toggle-group id="toggle-group-guard" value="draft" disallow-empty>
    <div data-xh-part="root">
      <button data-xh-part="item" value="draft">草稿</button>
      <button data-xh-part="item" value="review">送审</button>
      <button data-xh-part="item" value="publish">发布</button>
    </div>
  </xh-toggle-group>
  <span style="font-size: 13px">
    当前：<span id="toggle-group-guard-value">draft</span>
  </span>
</span>

<span style="display: inline-flex; align-items: center; gap: 10px">
  <button type="button" id="toggle-group-guard-save">保存改动</button>
  <span id="toggle-group-guard-blocked" style="font-size: 13px"></span>
</span>

<script type="module">
  // 单选模式下裸值就是字符串或 null
  const host = document.getElementById("toggle-group-guard");
  const readout = document.getElementById("toggle-group-guard-value");
  const blocked = document.getElementById("toggle-group-guard-blocked");
  const save = document.getElementById("toggle-group-guard-save");
  let saved = false;

  host.addEventListener("value-change", (event) => {
    if (event.detail.value === "publish" && !saved) {
      blocked.textContent = "还有未保存的改动，先保存再发布";
      return;
    }
    blocked.textContent = "";
    host.value = event.detail.value;
    readout.textContent = event.detail.value;
  });

  save.addEventListener("click", () => {
    saved = true;
    save.disabled = true;
    save.textContent = "已保存";
  });
<\/script>
`;export{e as default};
