import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('product tracking brief keeps twelve distinct business observations and six funnels', async () => {
  const text = await readFile(new URL('../docs/双11活动核心埋点需求.md', import.meta.url), 'utf8');
  const section = text.split('## 核心统计点')[1].split('## 统一统计规则')[0];
  const observations = section.split('\n').filter(line => /^\| [^|]+ \|/.test(line)).slice(1);
  assert.equal(observations.length, 12);
  assert.equal(new Set(observations.map(line => line.split('|')[1].trim())).size, 12);
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

test('page checklist maps distinct live draw and appraisal controls instead of generic labels', async () => {
  const [locations, home, ui, lottery, flow] = await Promise.all([
    '../docs/双11活动页面埋点位置清单.md',
    '../public/home.html',
    '../public/expert-event-ui.js',
    '../public/center-lottery.js',
    '../public/expert-event-home.js',
  ].map(path => readFile(new URL(path, import.meta.url), 'utf8')));
  for (const [label, source] of [
    ['立即鉴别', home],
    ['五次一起扭', ui],
    ['五连扭蛋', lottery],
    ['去专鉴赢抽奖券', ui],
    ['提交专家评估', flow],
  ]) {
    assert.ok(source.includes(label), `The current page no longer has ${label}`);
    assert.ok(locations.includes(label), `The location checklist omits ${label}`);
  }
  const popup = locations.split('## 专家页打开的“双11扭蛋”弹窗')[1].split('## AI结果')[0];
  const center = locations.split('## 抽奖中心')[1].split('## 抽奖结果弹窗')[0];
  assert.ok(popup.includes('五次一起扭') && !popup.includes('五连扭蛋'));
  assert.ok(center.includes('五连扭蛋') && !center.includes('五次一起扭'));
});

test('page checklist preserves business boundaries and excludes unintegrated marketing assets', async () => {
  const [locations, core, home] = await Promise.all([
    '../docs/双11活动页面埋点位置清单.md',
    '../docs/双11活动核心埋点需求.md',
    '../public/home.html',
  ].map(path => readFile(new URL(path, import.meta.url), 'utf8')));
  assert.match(locations, /“免费扭一次”的按钮文案不代表首次赠券/);
  assert.match(locations, /不在点击“去使用”时记核销/);
  assert.match(locations, /再次修改地址不新增一份已领奖品/);
  assert.match(locations, /最终成功、失败或处理中状态/);
  assert.match(core, /最终成功\/失败\/处理中状态/);
  assert.match(locations, /尚未接入的营销素材/);
  assert.doesNotMatch(home, /home-carousel-double11-v2/);
  assert.match(locations, /二维码弹窗曝光或长按不能代替“添加小图成功”/);
});
