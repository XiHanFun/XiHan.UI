const t=`<!-- 随表单提交 | 在根里补一个隐藏输入承接选中值，值随原生表单一并提交；浮层收起时回车留给表单 -->
<form
  id="combobox-form"
  style="display: flex; flex-direction: column; gap: 12px; max-inline-size: 420px"
>
  <xh-combobox id="combobox-form-city" name="city" open-on-click placeholder="输入城市名">
    <div data-xh-part="root">
      <label data-xh-part="label">常驻城市</label>
      <div data-xh-part="control">
        <input data-xh-part="input" />
        <button data-xh-part="trigger"></button>
        <button data-xh-part="clear-trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="beijing">
            <span data-xh-part="item-text">Beijing 北京</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="chengdu">
            <span data-xh-part="item-text">Chengdu 成都</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="hangzhou">
            <span data-xh-part="item-text">Hangzhou 杭州</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
        <div data-xh-part="empty">无匹配城市</div>
      </div>
      <!-- 进表单的出口：多选时按逗号拼成一串 -->
      <input data-xh-part="hidden-input" />
    </div>
  </xh-combobox>

  <xh-button type="submit" variant="outline" style="align-self: start">
    <button data-xh-part="root">提交</button>
  </xh-button>
  <span>表单收到：<span id="combobox-form-result">（还没提交）</span></span>
</form>

<script type="module">
  const form = document.getElementById("combobox-form");
  const combobox = document.getElementById("combobox-form-city");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const result = document.getElementById("combobox-form-result");
  const all = [...content.children];
  const labelOf = (item) => item.querySelector('[data-xh-part="item-text"]').textContent.toLowerCase();

  combobox.addEventListener("input-value-change", (event) => {
    const q = event.detail.inputValue.trim().toLowerCase();
    content.replaceChildren(...all.filter((item) => labelOf(item).includes(q)));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    result.textContent = String(new FormData(form).get("city") ?? "");
  });
<\/script>
`;export{t as default};
