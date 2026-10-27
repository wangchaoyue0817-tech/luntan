import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('product tracking brief keeps eleven distinct business observations and six funnels', async () => {
  const text = await readFile(new URL('../docs/双11活动核心埋点需求.md', import.meta.url), 'utf8');
  const section = text.split('## 核心统计点')[1].split('## 统一统计规则')[0];
  const observations = section.split('\n').filter(line => /^\| [^|]+ \|/.test(line)).slice(1);
  assert.equal(observations.length, 11);
  assert.equal(new Set(observations.map(line => line.split('|')[1].trim())).size, 11);
  const funnels = text.split('## 数据漏斗与指标')[1].split('## 核心统计点')[0];
  assert.equal(funnels.split('\n').filter(line => line.startsWith('### ')).length, 6);
  assert.match(text, /至少2单的用户数 ÷ 至少提交1单的用户数/);
  assert.match(text, /分母为0显示“—”/);
  assert.doesNotMatch(text, /event_id|SDK|request_id|毫秒|性能监控/);
});

test('conversion requirements preserve unique attribution and eligible denominator boundaries', async () => {
  const text = await readFile(new URL('../docs/双11活动核心埋点需求.md', import.meta.url), 'utf8');
  assert.match(text, /风控关闭弹窗的订单不计入应展示范围/);
  assert.match(text, /累计、发券和抽奖数据仍保留/);
  assert.match(text, /按首次参与日期拆分比较/);
  assert.match(text, /一个新订单只能有一个直接来源和一个触发引导/);
  assert.match(text, /一张原订单最多计1次转化/);
  assert.match(text, /不能用当天全部提交量除以当天曝光量/);
  assert.match(text, /本单是否应展示进度弹窗、不展示原因/);
});

test('ticket and lottery units distinguish first-guide, mature cohorts and five draws', async () => {
  const text = await readFile(new URL('../docs/双11活动核心埋点需求.md', import.meta.url), 'utf8');
  assert.match(text, /已到期券中未使用张数 ÷ 已到期券原始到账张数/);
  assert.match(text, /五连抽是1个批次、5次抽取、消耗5张券/);
  assert.match(text, /同一五连中其余4次仍保留在常规结果统计/);
  assert.match(text, /原券过期后，不把下一张券算成首次引导券/);
  assert.match(text, /普通池实物5%、高级池实物8%/);
});

test('fulfillment requirements do not equate clicks with fulfillment or source with causal lift', async () => {
  const text = await readFile(new URL('../docs/双11活动核心埋点需求.md', import.meta.url), 'utf8');
  assert.match(text, /实物提交收货信息不代表已发货/);
  assert.match(text, /点击鉴别券“去使用”不代表已核销/);
  assert.match(text, /中奖次数不能替代实际到账张数/);
  assert.match(text, /不等于活动净增量/);
  assert.match(text, /不表示线上已完成埋点/);
});
