const n=`<!-- 重置回默认值 | 复合控件的值攥在组件里，原生重置只还原原生控件——它们各自认这条事件，一起回到 defaultValue -->
<form id="form-reset" style="display: grid; gap: 12px">
  <label>
    套餐
    <xh-radio-group name="plan" default-value="standard">
      <div data-xh-part="root">
        <div data-xh-part="item" value="standard">
          <input data-xh-part="hidden-input" />
          <span data-xh-part="indicator"></span>
          <span data-xh-part="item-text">标准</span>
        </div>
        <div data-xh-part="item" value="pro">
          <input data-xh-part="hidden-input" />
          <span data-xh-part="indicator"></span>
          <span data-xh-part="item-text">专业</span>
        </div>
      </div>
    </xh-radio-group>
  </label>

  <label>
    评分
    <xh-rating name="score" default-value="3" count="5">
      <div data-xh-part="root">
        <div data-xh-part="control">
          <span data-xh-part="item" value="1">★</span>
          <span data-xh-part="item" value="2">★</span>
          <span data-xh-part="item" value="3">★</span>
          <span data-xh-part="item" value="4">★</span>
          <span data-xh-part="item" value="5">★</span>
        </div>
        <input data-xh-part="hidden-input" />
      </div>
    </xh-rating>
  </label>

  <!-- 原生输入框做对照：它靠 value 这个内容属性还原，组件靠自己的 defaultValue -->
  <label>备注 <input name="note" value="默认备注" /></label>

  <label>
    <xh-checkbox name="agree" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="indicator"></span>
        <input data-xh-part="hidden-input" />
      </button>
    </xh-checkbox>
    已阅读条款
  </label>

  <label>
    <xh-switch name="notify">
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
        <input data-xh-part="hidden-input" />
      </button>
    </xh-switch>
    接收通知
  </label>

  <div style="display: flex; gap: 8px">
    <xh-button type="submit" size="sm">
      <button data-xh-part="root">提交</button>
    </xh-button>
    <!-- 原生 reset：组件与旁边那个原生输入框会一起回到各自的默认值 -->
    <xh-button type="reset" size="sm" variant="outline">
      <button data-xh-part="root">重置</button>
    </xh-button>
  </div>

  <span id="form-reset-result"></span>
</form>

<script type="module">
  const form = document.getElementById("form-reset");
  const result = document.getElementById("form-reset-result");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = [...new FormData(form).entries()].map(([k, v]) => \`\${k}=\${v}\`);
    result.textContent = \`表单收到：\${fields.length ? fields.join("  ") : "（空）"}\`;
  });
<\/script>
`;export{n as default};
