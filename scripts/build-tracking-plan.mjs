import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = new URL('../', import.meta.url);
export const outputPath = new URL('docs/双11新增功能埋点方案.md', root);
const fields = ['name','label','module','owner','priority','trigger','dedup','properties','purpose'];

export function validateCatalog(catalog) {
  if (!Array.isArray(catalog) || !catalog.length) throw new Error('事件字典不能为空');
  const names = new Set();
  for (const event of catalog) {
    if (Object.keys(event).sort().join() !== [...fields].sort().join()) throw new Error(`字段不完整: ${event.name}`);
    for (const field of fields) if (typeof event[field] !== 'string' || !event[field].trim()) throw new Error(`缺少 ${field}: ${event.name}`);
    if (!/^[a-z][a-z0-9_]+$/.test(event.name) || names.has(event.name)) throw new Error(`事件名称错误或重复: ${event.name}`);
    if (!['前端','服务端'].includes(event.owner) || !['P0','P1'].includes(event.priority)) throw new Error(`归属或优先级错误: ${event.name}`);
    if (event.owner === '服务端' && !event.trigger.includes('【接入规划】')) throw new Error(`服务端事实需标记接入规划: ${event.name}`);
    names.add(event.name);
  }
  return names;
}

export function renderCatalog(catalog) {
  validateCatalog(catalog);
  const groups = new Map();
  for (const event of catalog) {
    if (!groups.has(event.module)) groups.set(event.module, []);
    groups.get(event.module).push(event);
  }
  const count = value => catalog.filter(e => e.priority === value).length;
  const text = [`共 ${catalog.length} 个事件：P0 ${count('P0')} 个、P1 ${count('P1')} 个。按功能板块查阅；前端负责行为，服务端负责业务事实。`];
  for (const [module, events] of groups) {
    text.push(`### ${module}`);
    for (const e of events) {
      text.push(`#### ${e.label} · ${e.priority} · ${e.owner}\n\n事件名：\`${e.name}\`\n\n- **触发：** ${e.trigger}\n- **去重：** ${e.dedup}\n- **记录字段：** ${e.properties}\n- **用于分析：** ${e.purpose}`);
    }
  }
  return text.join('\n\n');
}

export async function buildTrackingPlan() {
  const [template, metrics, raw] = await Promise.all([
    readFile(new URL('docs/analytics/plan-overview.md', root), 'utf8'),
    readFile(new URL('docs/analytics/metrics-and-acceptance.md', root), 'utf8'),
    readFile(new URL('docs/analytics/event-catalog.json', root), 'utf8')
  ]);
  for (const marker of ['<!-- EVENT_CATALOG -->','<!-- METRICS -->']) {
    if (template.split(marker).length !== 2) throw new Error(`模板应包含一个占位: ${marker}`);
  }
  // Keep the assembled document's heading hierarchy consistent.
  const metricBody = metrics.replace(/^# .*\n+/, '').replace(/^(#{2,5}) /gm, '$1# ');
  const output = template.replace('<!-- EVENT_CATALOG -->', renderCatalog(JSON.parse(raw)))
    .replace('<!-- METRICS -->', metricBody.trim());
  if (/<!-- (?:EVENT_CATALOG|METRICS) -->/.test(output)) throw new Error('文档仍有未生成章节');
  return output;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const output = await buildTrackingPlan();
  await writeFile(outputPath, output);
  console.log(`已生成 ${fileURLToPath(outputPath)}`);
}
