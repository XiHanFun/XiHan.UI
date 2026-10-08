async function e(){let e=[{value:`lilei`,label:`李雷`,role:`前端`,initials:`李`},{value:`hanmeimei`,label:`韩梅梅`,role:`设计`,initials:`韩`},{value:`poly`,label:`Poly`,role:`后端`,initials:`P`}],t=document.getElementById(`mention-custom-item`),n=t.querySelector(`[data-xh-part="content"]`),r=document.getElementById(`mention-custom-item-value`);t.translations={content:`提及谁`};function i(e){let t=document.createElement(`div`);return t.dataset.xhPart=`item`,t.setAttribute(`value`,e.value),t.innerHTML=`
      <xh-avatar size="sm">
        <span data-xh-part="root">
          <span data-xh-part="fallback">${e.initials}</span>
        </span>
      </xh-avatar>
      <span data-xh-part="item-text">${e.label}</span>
      <span style="color: var(--xh-fg-subtle); font-size: var(--xh-font-size-xs)">
        ${e.role}
      </span>
    `,t}function a(t){let r=(t??``).trim().toLowerCase(),a=r===``?e:e.filter(e=>e.value.includes(r)||e.label.toLowerCase().includes(r));n.replaceChildren(...a.map(i))}a(``),t.addEventListener(`query-change`,e=>a(e.detail.query)),t.addEventListener(`value-change`,e=>{r.textContent=e.detail.value||`（空）`})}export{e as default};