import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createDocument} from './dom-fixture.mjs';

const source=filename=>readFileSync(new URL(`../public/${filename}`,import.meta.url),'utf8');

function fixture(){
  const document=createDocument(source('home.html'));
  const navigations=[];
  const forumOpens=[];
  const window={
    addEventListener(){},
    dispatchEvent(event){
      if(event?.type==='jianx-forum-open'){
        const detail=event.detail||{};
        forumOpens.push({board:String(detail.board||''),name:String(detail.name||'')});
      }
      return true;
    },
    jianxRoute(){},
    jianxNavigate(route,options){navigations.push({route,...options});}
  };
  const location={href:'http://localhost/home.html',search:''};
  const context=vm.createContext({
    window,document,location,URL,URLSearchParams,
    CustomEvent:class CustomEvent{
      constructor(type,init={}){this.type=type;this.detail=init.detail;}
    },
    history:{replaceState(_state,_title,url){location.href=String(url);}},
    matchMedia:()=>({matches:true}),ResizeObserver:class{observe(){}},
    requestAnimationFrame(){},setInterval(){},clearInterval(){},setTimeout(){},clearTimeout(){}
  });
  for(const filename of ['data.js','assets/icon-map.js','app.js','forum.js'])vm.runInContext(source(filename),context,{filename});
  return{document,window,context,navigations,forumOpens};
}

test('homepage banner copy collapses to a single headline line before the CTA',()=>{
  const html=source('home.html');
  assert.match(html,/探索更多鉴定能力 · 从日常到珍藏/);
  assert.match(html,/资深专家线上鉴定 · 权威结论/);
  assert.match(html,/发现好物价值 · 一拍即估/);
  assert.ok(!html.includes('</strong><span>从日常好物'));
  assert.ok(!html.includes('</strong><span>出具权威'));
  assert.ok(!html.includes('</strong><span>一张照片'));
  const css=source('app.css');
  assert.match(css,/\.banner-copy strong\{[^}]*white-space:nowrap/);
  assert.ok(!/\.banner-copy>span\{/.test(css));
  assert.match(css,/\.forum-board\{[^}]*flex-direction:row/);
  assert.match(css,/\.forum-card-head\{[^}]*flex-direction:row/);
  assert.match(css,/\.forum-card-hook\{[^}]*text-overflow:ellipsis/);
  assert.match(source('spectral.css'),/#aiHome \.banner-copy\{[^}]*flex-direction:row/);
  assert.match(source('spectral.css'),/#aiHome \.feature-banner\{[^}]*height:107px/);
  assert.doesNotMatch(source('spectral.css'),/#aiHome \.banner-viewport:after/);
  assert.match(css,/\.forum-card:after\{[^}]*padding:1px[^}]*edgeFlow/);
  assert.doesNotMatch(source('spectral.css'),/#aiHome \.forum-card\{[^}]*height:/);
});

test('forum entry sits below the banner with three resident boards',()=>{
  const f=fixture();
  const section=f.document.querySelector('.forum-entry');
  const banner=f.document.querySelector('.banner-section');
  const ticker=f.document.querySelector('.suggestion-ticker');
  assert(section,'forum entry section must exist');
  assert.equal(banner.parentElement,section.parentElement);
  const siblings=banner.parentElement.children;
  const bannerIndex=siblings.indexOf(banner);
  assert.equal(siblings[bannerIndex-1],section);
  assert.equal(siblings[bannerIndex+1],ticker);
  assert.equal(section.getAttribute('aria-label'),'鉴X社区');
  assert.equal(f.document.querySelector('.forum-card-title').textContent,'鉴X社区');
  const boards=[...f.document.querySelectorAll('.forum-board')].map(el=>el.querySelector('strong').textContent);
  assert.deepEqual(boards,['古玩雅集','健康生活家','好物研究所']);
  assert.equal(f.document.querySelectorAll('[data-forum]').length,4);
});

test('forum tiles open the antiques feed without the category chip row',()=>{
  const f=fixture();
  assert.match(f.document.getElementById('forumHotTopic').textContent,/热议：/);
  f.document.querySelector('[data-forum="antiques"]').click();
  const view=f.document.getElementById('forumView');
  assert.equal(view.hidden,false);
  assert.equal(view.querySelector('h1').textContent,'论坛');
  assert.equal(view.querySelector('[data-board="antiques"]').getAttribute('aria-selected'),'true');
  assert.deepEqual([...view.querySelectorAll('.forum-filters button')].map(button=>button.textContent),['全部','圈内新鲜事','懂点门道','一起聊']);
  assert.equal(view.querySelector('.forum-sort').parentElement,view.querySelector('.forum-channel-row'));
  assert.equal(view.querySelector('.forum-sort span'),null);
  assert.match(source('forum.css'),/\.forum-channel-row\{[^}]*flex-direction:column/);
  assert.match(source('forum.css'),/\.forum-filters\{[^}]*justify-content:space-between/);
  assert.doesNotMatch(view.querySelector('.forum-board-track').textContent,/玉石文玩|邮票|杂项/);
  assert.equal(view.querySelector('.forum-masonry'),null);
  assert.match(view.textContent,/这只青花碗，底足怎么看？/);
  assert.ok(view.querySelector('.forum-mosaic'));
  assert.match(view.querySelector('.forum-poll-preview').textContent,/网友判断/);
  assert.equal(view.querySelector('#forumFeed [data-poll-option]'),null);
  f.document.getElementById('forumBack').click();
  assert.equal(view.hidden,true);
});

test('antiques likes, comments, votes and topic filters stay in sync',()=>{
  const f=fixture();
  f.document.querySelector('[data-forum="antiques"]').click();
  const view=f.document.getElementById('forumView');
  view.querySelector('[data-filter="talk"]').click();
  assert.match(view.querySelector('#forumFeed').textContent,/青花碗/);
  assert.match(view.querySelector('#forumFeed').textContent,/第一次上手/);
  assert.equal(view.querySelectorAll('.forum-post').length,2);
  assert.match(view.querySelector('.forum-poll-preview').textContent,/真/);
  view.querySelector('[data-open="bowl"]').click();
  const detail=f.document.getElementById('forumDetail');
  assert.equal(detail.hidden,false);
  assert.equal(detail.querySelector('[data-poll-option]'),detail.querySelector('[data-poll-option="real"]'));
  assert.doesNotMatch(detail.textContent,/已投票/);
  detail.querySelector('[data-poll-option="real"]').click();
  assert.equal(detail.querySelector('[data-poll-option="real"]').getAttribute('aria-pressed'),'true');
  assert.equal(detail.querySelector('[data-poll-option="fake"]').getAttribute('aria-pressed'),'false');
  assert.match(detail.textContent,/已投票/);
  assert.match(detail.textContent,/不是平台鉴定结论/);
  assert.match(detail.textContent,/%/);
  detail.querySelector('[data-poll-option="fake"]').click();
  assert.equal(detail.querySelector('[data-poll-option="fake"]').getAttribute('aria-pressed'),'true');
  assert.equal(detail.querySelector('[data-poll-option="real"]').getAttribute('aria-pressed'),'false');
  view.querySelector('[data-like="bowl"]').click();
  assert.equal(view.querySelector('[data-like="bowl"] span').textContent,'29');
  const input=f.document.getElementById('forumDetailInput');
  input.value='底足火石红比较自然';
  input.dispatchEvent({type:'input'});
  f.document.getElementById('forumDetailSend').click();
  assert.match(detail.textContent,/底足火石红比较自然/);
  assert.equal(view.querySelector('[data-comment="bowl"] span').textContent,'4');
  detail.querySelector('[data-delete-comment]').click();
  assert.doesNotMatch(detail.textContent,/底足火石红比较自然/);
});

test('featured and goods use a two-column waterfall while health stays a single column',()=>{
  const f=fixture();
  f.document.querySelector('[data-forum="goods"]').click();
  const view=f.document.getElementById('forumView');
  assert.equal(view.querySelector('[data-board="goods"]').getAttribute('aria-selected'),'true');
  assert.equal(view.querySelectorAll('.forum-masonry').length,1);
  assert.equal(view.querySelectorAll('.forum-col').length,2);
  assert.equal(view.querySelector('.forum-post'),null);
  assert.ok(view.querySelector('.forum-cover'));
  assert.doesNotMatch(view.querySelector('.forum-board-track').textContent,/玉石文玩|邮票|杂项/);
  assert.match(view.textContent,/A\. 黑色通勤包/);
  assert.match(view.textContent,/参与评价/);
  view.querySelector('[data-like="cushion"]').click();
  assert.equal(view.querySelector('[data-like="cushion"] span').textContent,'22');
  view.querySelector('[data-comment="cushion"]').click();
  const input=f.document.getElementById('forumDetailInput');
  input.value='下午三点的鼻翼更说明持妆';
  input.dispatchEvent({type:'input'});
  f.document.getElementById('forumDetailSend').click();
  assert.equal(view.querySelector('[data-comment="cushion"] span').textContent,'2');
  f.document.getElementById('forumDetailSave').click();
  assert.equal(f.document.getElementById('forumDetailSave').getAttribute('aria-pressed'),'true');
  view.querySelector('[data-board="featured"]').click();
  assert.equal(view.querySelector('[data-board="featured"]').getAttribute('aria-selected'),'true');
  assert.equal(view.querySelector('.forum-channel-row').hidden,true);
  assert.equal(view.querySelectorAll('.forum-col').length,2);
  const feed=view.querySelector('#forumFeed').textContent;
  assert.match(feed,/青花碗/);
  assert.match(feed,/通勤包/);
  assert.match(feed,/晨跑/);
  assert.doesNotMatch(feed,/周末收藏展/);
  view.querySelector('[data-board="health"]').click();
  assert.equal(view.querySelector('.forum-masonry'),null);
  assert.ok(view.querySelector('.forum-post'));
  assert.match(view.textContent,/晨跑 5 公里/);
  view.querySelector('[data-board="antiques"]').click();
  assert.equal(view.querySelector('.forum-masonry'),null);
  assert.ok(view.querySelector('.forum-mosaic'));
});

test('an empty forum filter explains that nothing matches',()=>{
  const f=fixture();
  f.document.querySelector('[data-forum="health"]').click();
  f.document.querySelector('[data-filter="fresh"]').click();
  assert.match(f.document.querySelector('.forum-empty').textContent,/还没有相关帖子/);
  f.document.querySelector('[data-filter="talk"]').click();
  const talk=f.document.querySelector('#forumFeed').textContent;
  assert.match(talk,/留/);
  assert.match(talk,/买/);
  assert.match(talk,/晨跑/);
});
