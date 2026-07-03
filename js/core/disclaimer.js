/** 页脚版权免责声明，邮箱从 contact 数据填充 */
export function initDisclaimer() {
  const footer = document.getElementById('site-disclaimer');
  if (!footer) return;

  fetch('data/themes/ink/contact.json')
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)
    .then((contact) => {
      const email = contact?.email || 'mo.xing@example.com';
      footer.innerHTML = `
        本站部分界面与素材致敬经典游戏作品，相关版权归原权利人所有。
        如有侵权，请联系 <a href="mailto:${email}">${email}</a> 删除。
      `;
    });
}
