import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('product tracking brief keeps ten essential observations and business review boundaries', async () => {
  const text = await readFile(new URL('../docs/双11活动核心埋点需求.md', import.meta.url), 'utf8');
  const section = text.split('## 核心统计点')[1].split('## 核心指标口径')[0];
  const observations = section.split('\n').filter(line => /^\| [^|]+ \|/.test(line)).slice(1);
  assert.equal(observations.length, 10);
  assert.equal(new Set(observations.map(line => line.split('|')[1].trim())).size, 10);
  assert.match(text, /至少2单的用户数 ÷ 至少提交1单的用户数/);
  assert.match(text, /风控关闭弹窗的订单不计入应展示范围/);
  assert.match(text, /累计、发券和抽奖数据仍保留/);
  assert.match(text, /按首次参与日期拆分比较/);
  assert.match(text, /实物提交收货信息不代表已发货/);
  assert.doesNotMatch(text, /event_id|SDK|request_id|毫秒|性能监控/);
});
