const t=`<!-- 受控与不可清空 | 传了 value 就由宿主说了算；单选组再点一次当前项会清空成 null，disallow-empty 把这一手关掉 -->
<span style="display: inline-flex; align-items: center; gap: 10px">
  <xh-toggle-group id="toggle-group-align" value="left">
    <div data-xh-part="root">
      <button data-xh-part="item" value="left">左对齐</button>
      <button data-xh-part="item" value="center">居中</button>
      <button data-xh-part="item" value="right">右对齐</button>
    </div>
  </xh-toggle-group>
  <span style="font-size: 13px">
    当前：<span id="toggle-group-align-value">left</span>
  </span>
</span>

<span style="display: inline-flex; align-items: center; gap: 10px">
  <xh-toggle-group id="toggle-group-density" value="comfortable" disallow-empty>
    <div data-xh-part="root">
      <button data-xh-part="item" value="compact">紧凑</button>
      <button data-xh-part="item" value="comfortable">宽松</button>
    </div>
  </xh-toggle-group>
  <span style="font-size: 13px">
    disallow-empty：<span id="toggle-group-density-value">comfortable</span>，点不成空
  </span>
</span>

<script type="module">
  // 值由宿主握着：变更经事件回来，写回去才生效
  function control(hostId, readoutId, blank) {
    const host = document.getElementById(hostId);
    const readout = document.getElementById(readoutId);
    host.addEventListener("value-change", (event) => {
      host.value = event.detail.value;
      readout.textContent = event.detail.value ?? blank;
    });
  }

  control("toggle-group-align", "toggle-group-align-value", "（无选中）");
  control("toggle-group-density", "toggle-group-density-value", "（无选中）");
<\/script>
`;export{t as default};
