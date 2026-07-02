// 板块 4：墨河奔流 · 数据成果可视化（D3 墨笔图表）
export function renderData(el, metrics) {
  el.innerHTML = `
    <div class="content-wrap">
      <div class="section-head">
        <div class="section-ji">墨 河 奔 流</div>
        <h2 class="section-title">数据成河</h2>
      </div>
      <div class="data-highlights">
        ${metrics.highlights.map((h) => `
          <div class="highlight-card ink-card">
            <div class="v num">${escapeHtml(h.value)}<span class="unit">${escapeHtml(h.unit)}</span></div>
            <div class="l">${escapeHtml(h.label)}</div>
          </div>
        `).join('')}
      </div>
      <div class="data-charts">
        <div class="chart-card ink-card" id="chart-dau"><h4>DAU 增长曲线</h4></div>
        <div class="chart-card ink-card" id="chart-source"><h4>用户来源构成</h4></div>
        <div class="chart-card ink-card" id="chart-roi"><h4>活动 ROI 对比</h4></div>
      </div>
    </div>
  `;
}

// 进入视口时绘制（墨笔动画）。重绘前清空旧 svg，避免重复堆叠。
export function drawCharts(el, metrics) {
  if (typeof d3 === 'undefined') return;
  clearChart(el, '#chart-dau');
  clearChart(el, '#chart-source');
  clearChart(el, '#chart-roi');
  drawDauCurve(el, metrics.dauCurve);
  drawUserSources(el, metrics.userSources);
  drawRoiBars(el, metrics.roiBars);
}

function clearChart(el, selector) {
  const host = el.querySelector(selector);
  if (!host) return;
  // 保留 h4 标题，移除 svg
  host.querySelectorAll('svg').forEach((s) => s.remove());
}

function inkColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#141414';
}
function goldColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--gold').trim() || '#D4AF37';
}
function accentColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#B5483A';
}

function drawDauCurve(el, data) {
  const host = el.querySelector('#chart-dau');
  if (!host || !data.length) return;
  const W = host.clientWidth, H = 220;
  const svg = d3.select(host).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', W).attr('height', H);
  const x = d3.scalePoint().domain(data.map((d) => d.month)).range([40, W - 20]);
  const y = d3.scaleLinear().domain([0, d3.max(data, (d) => d.dau) * 1.15]).range([H - 30, 20]);
  const line = d3.line().x((d) => x(d.month)).y((d) => y(d.dau)).curve(d3.curveCatmullRom);
  const path = svg.append('path').datum(data).attr('fill', 'none').attr('stroke', inkColor()).attr('stroke-width', 2.5).attr('d', line);
  const len = path.node().getTotalLength();
  path.attr('stroke-dasharray', len).attr('stroke-dashoffset', len)
    .transition().duration(1600).ease(d3.easeCubicInOut).attr('stroke-dashoffset', 0);
  // 端点
  svg.selectAll('circle.dot').data(data).enter().append('circle')
    .attr('cx', (d) => x(d.month)).attr('cy', (d) => y(d.dau)).attr('r', 0)
    .attr('fill', goldColor())
    .transition().delay((_, i) => 400 + i * 200).attr('r', 3.5);
  // x 轴标签
  svg.selectAll('text.x').data(data).enter().append('text')
    .attr('x', (d) => x(d.month)).attr('y', H - 10).attr('text-anchor', 'middle')
    .attr('font-size', 9).attr('fill', inkColor()).attr('opacity', 0.6)
    .text((d) => d.month.slice(5));
}

function drawUserSources(el, data) {
  const host = el.querySelector('#chart-source');
  if (!host || !data.length) return;
  const W = host.clientWidth, H = 220, r = 70;
  const svg = d3.select(host).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', W).attr('height', H);
  const g = svg.append('g').attr('transform', `translate(${Math.min(r * 2 + 40, W / 2)},${H / 2})`);
  const pie = d3.pie().value((d) => d.value).sort(null);
  const arc = d3.arc().innerRadius(r * 0.55).outerRadius(r);
  const colors = [inkColor(), goldColor(), accentColor(), '#888'];
  const arcs = g.selectAll('path').data(pie(data)).enter().append('path')
    .attr('fill', (_, i) => colors[i % colors.length]).attr('d', arc).each(function (d) { this._current = { startAngle: 0, endAngle: 0 }; });
  arcs.transition().duration(1200).ease(d3.easeCubicOut).attrTween('d', function (d) {
    const i = d3.interpolate(this._current, d);
    this._current = i(1);
    return (t) => arc(i(t));
  });
  // 图例
  const legend = svg.append('g').attr('transform', `translate(${W - 110},20)`);
  data.forEach((d, i) => {
    const row = legend.append('g').attr('transform', `translate(0,${i * 18})`);
    row.append('rect').attr('width', 10).attr('height', 10).attr('fill', colors[i % colors.length]);
    row.append('text').attr('x', 16).attr('y', 9).attr('font-size', 10).attr('fill', inkColor()).text(`${d.label} ${d.value}%`);
  });
}

function drawRoiBars(el, data) {
  const host = el.querySelector('#chart-roi');
  if (!host || !data.length) return;
  const W = host.clientWidth, H = 220;
  const svg = d3.select(host).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', W).attr('height', H);
  const x = d3.scaleBand().domain(data.map((d) => d.activity)).range([30, W - 20]).padding(0.3);
  const y = d3.scaleLinear().domain([0, d3.max(data, (d) => d.roi) * 1.2]).range([H - 30, 20]);
  svg.selectAll('rect.bar').data(data).enter().append('rect')
    .attr('class', 'bar').attr('x', (d) => x(d.activity)).attr('y', H - 30)
    .attr('width', x.bandwidth()).attr('height', 0).attr('fill', goldColor())
    .transition().duration(1200).ease(d3.easeCubicOut)
    .attr('y', (d) => y(d.roi)).attr('height', (d) => H - 30 - y(d.roi));
  svg.selectAll('text.v').data(data).enter().append('text')
    .attr('class', 'v').attr('x', (d) => x(d.activity) + x.bandwidth() / 2)
    .attr('y', (d) => y(d.roi) - 6).attr('text-anchor', 'middle')
    .attr('font-size', 11).attr('fill', inkColor()).attr('opacity', 0)
    .text((d) => d.roi).transition().delay(800).attr('opacity', 1);
  svg.selectAll('text.x').data(data).enter().append('text')
    .attr('class', 'x').attr('x', (d) => x(d.activity) + x.bandwidth() / 2).attr('y', H - 10)
    .attr('text-anchor', 'middle').attr('font-size', 9).attr('fill', inkColor()).attr('opacity', 0.6)
    .text((d) => d.activity);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
