import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateCatalog, buildTrackingPlan, outputPath } from '../scripts/build-tracking-plan.mjs';

const catalog = JSON.parse(await readFile(new URL('../docs/analytics/event-catalog.json', import.meta.url), 'utf8'));

test('tracking event dictionary has unambiguous ownership, trigger, dedup and properties', () => {
  assert.equal(validateCatalog(catalog).size, catalog.length);
  assert.throws(() => validateCatalog([...catalog, catalog[0]]), /重复/);
  assert.throws(() => validateCatalog([{...catalog[0], dedup:''}]), /缺少 dedup/);
  assert.throws(() => validateCatalog([{...catalog[0], owner:'前后端'}]), /归属/);
});

test('all critical business and exposure denominators are covered', () => {
  const byName = new Map(catalog.map(e => [e.name, e]));
  const required = {
    expert_order_submit_success:'服务端', campaign_order_counted:'服务端',
    campaign_ticket_grant_success:'服务端', campaign_ticket_state_changed:'服务端',
    campaign_popup_decision:'服务端', ai_report_ready:'前端',
    draw_batch_success:'服务端', draw_item_result:'服务端', prize_credit_result:'服务端',
    leaderboard_settlement_result:'服务端', risk_status_changed:'服务端',
    campaign_progress_view:'前端', campaign_operation_feedback:'前端',
    campaign_expert_cta_click:'前端', ticket_inventory_view:'前端'
  };
  for (const [name, owner] of Object.entries(required)) assert.equal(byName.get(name)?.owner, owner, name);
  assert.match(byName.get('draw_item_result').properties, /probability_config_version/);
  assert.match(byName.get('draw_item_result').properties, /transfer_reason/);
  assert.match(byName.get('risk_detection_result').properties, /count_allowed=true/);
  assert.match(byName.get('risk_detection_result').properties, /ticket_grant_allowed=true/);
  assert.match(byName.get('risk_detection_result').properties, /draw_allowed=true/);
});

test('delivered plan stays synchronized with source documents and catalog', async () => {
  const expected = await buildTrackingPlan();
  assert.equal(await readFile(outputPath, 'utf8'), expected);
  assert.doesNotMatch(expected, /<!-- (?:EVENT_CATALOG|METRICS) -->/);
  for (const event of catalog) assert.equal(expected.split(`事件名：\`${event.name}\``).length - 1, 1, event.name);
  assert.match(expected, /普通奖池 \| 小样实物合计 5%，专家线上鉴别券 75%，再接再厉 20%/);
  assert.match(expected, /高级奖池 \|[^\n]*实物合计 8%，专家线上鉴别券 72%，再接再厉 20%/);
  assert.match(expected, /3C数码、3C无损 8 类/);
  assert.match(expected, /尚未接入生产 SDK 或数据平台/);
  assert.match(expected, /前端不展示份数不影响库存留痕/);
});
