var e=`<!-- 常驻形态 | inline 让取色面直接铺在页面里，与浮层形态同一台机器、同一组部件，只是不写 control、trigger 与 positioner；取色面不抢焦点，也不因点外或 Esc 收起 -->
<xh-color-picker id="color-picker-inline" default-value="#3b82f6" inline>
  <div data-xh-part="root">
    <label data-xh-part="label">画笔颜色</label>
    <div data-xh-part="content">
      <div data-xh-part="saturation-area">
        <div data-xh-part="area-thumb"></div>
      </div>
      <div data-xh-part="hue-slider">
        <div data-xh-part="control">
          <div data-xh-part="track"></div>
          <div data-xh-part="thumb"></div>
        </div>
      </div>
      <input data-xh-part="channel-input" channel="hex" />
    </div>
  </div>
</xh-color-picker>
<p>当前：<code id="color-picker-inline-value">#3b82f6</code></p>

<script type="module">
  const picker = document.getElementById("color-picker-inline");
  const readout = document.getElementById("color-picker-inline-value");
  picker.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value[0];
  });
<\/script>
`;export{e as default};