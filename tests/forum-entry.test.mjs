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
  assert.equal(view.classList.contains('is-scrolled'),false);
  assert.equal(view.querySelector('.forum-sort').getAttribute('aria-hidden'),'true');
  const sortFeed=view.querySelector('#forumFeed');
  sortFeed.scrollTop=48;
  sortFeed.dispatchEvent({type:'scroll'});
  assert.equal(view.classList.contains('is-scrolled'),true);
  assert.equal(view.querySelector('.forum-sort').getAttribute('aria-hidden'),'false');
  sortFeed.scrollTop=0;
  sortFeed.dispatchEvent({type:'scroll'});
  assert.equal(view.classList.contains('is-scrolled'),false);
  assert.match(source('forum.css'),/\.forum-channel-row\{[^}]*flex-direction:column/);
  assert.match(source('forum.css'),/\.forum-filters\{[^}]*justify-content:center/);
  assert.match(source('forum.css'),/\.forum-board-track\{[^}]*justify-content:center/);
  assert.doesNotMatch(view.querySelector('.forum-board-track').textContent,/玉石文玩|邮票|杂项/);
  assert.equal(view.querySelector('#forumReport'),null);
  assert.doesNotMatch(view.textContent,/举报/);
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
  assert.equal(detail.querySelector('.forum-poll h3'),null);
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
  const cushion=view.querySelector('[data-post="cushion"] .forum-poll-preview');
  assert.match(cushion.textContent,/投票/);
  assert.match(cushion.textContent,/夯/);
  assert.match(cushion.textContent,/拉完了/);
  assert.equal(cushion.querySelectorAll('.forum-poll-options span').length,5);
  assert.equal(cushion.querySelector('.is-fade'),null);
  assert.doesNotMatch(cushion.textContent,/参与评价/);
  assert.match(source('forum.css'),/\.forum-tile \.forum-poll-preview\{[^}]*width:calc\(100% - 20px\)/);
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

test('feed photos crop inside one frame and likes stay below the pictures',()=>{
  const css=source('forum.css');
  assert.match(css,/\.forum-pair\{[^}]*height:148px[^}]*overflow:hidden/);
  assert.match(css,/\.forum-shot\{[^}]*overflow:hidden/);
  assert.match(css,/\.forum-shot img\{[^}]*object-fit:cover/);
  const f=fixture();
  f.document.querySelector('[data-forum="antiques"]').click();
  const bowl=f.document.querySelector('[data-post="bowl"]');
  assert.equal(bowl.querySelectorAll('.forum-shot').length,3);
  const order=bowl.querySelectorAll('.forum-media, .forum-actions');
  assert.equal(order[0].classList.contains('forum-media'),true);
  assert.equal(order[1].classList.contains('forum-actions'),true);
  f.document.querySelector('[data-board="health"]').click();
  const plan=f.document.querySelector('[data-post="plan"]');
  assert.ok(plan.querySelector('.forum-pair.is-single'));
  assert.equal(plan.querySelectorAll('.forum-shot img').length,1);
  const bagBoard=f.document.querySelector('[data-board="goods"]');
  bagBoard.click();
  const bag=f.document.querySelector('[data-post="bag"]');
  assert.ok(bag.querySelector('.forum-cover'));
  assert.equal(bag.querySelector('.forum-actions').closest('.forum-tile'),bag);
});

test('publishing from featured asks for a board, and chat posts can add one poll',()=>{
  const css=source('forum.css');
  assert.match(css,/\.forum-view button\.forum-publish\{[^}]*linear-gradient/);
  assert.match(css,/\.forum-view button\.forum-submit\{[^}]*linear-gradient/);
  const f=fixture();
  f.document.querySelector('[data-forum="home"]').click();
  const view=f.document.getElementById('forumView');
  view.querySelector('#forumPublish').click();
  const page=f.document.getElementById('forumCompose');
  assert.equal(page.hidden,false);
  assert.equal(page.querySelector('#forumComposeTitle').textContent,'发布帖子');
  assert.equal([...page.querySelectorAll('[data-compose-board]')].some(button=>button.getAttribute('aria-pressed')==='true'),false);
  f.document.getElementById('forumComposeForm').dispatchEvent({type:'submit'});
  assert.equal(f.document.getElementById('forumComposeError').textContent,'先选板块');
  f.document.querySelector('[data-forum="antiques"]').click();
  view.querySelector('#forumPublish').click();
  assert.equal(page.querySelector('[data-compose-board="antiques"]').getAttribute('aria-pressed'),'true');
  assert.deepEqual([...page.querySelectorAll('[data-compose-type]')].map(button=>button.textContent),['一起聊·大家评','分享经验·懂点门道']);
  assert.equal(page.querySelector('#forumAddPoll'),null);
  page.querySelector('[data-compose-type="craft"]').click();
  assert.equal(page.querySelector('#forumAddPoll'),null);
  page.querySelector('[data-compose-type="chat"]').click();
  const formHtml=page.querySelector('#forumComposeScroll').innerHTML;
  assert.ok(formHtml.indexOf('forumComposeBody')<formHtml.indexOf('forumAddPoll'));
  assert.ok(formHtml.indexOf('forumAddPoll')<formHtml.indexOf('forumComposeImages'));
  page.querySelector('#forumAddPoll').click();
  assert.equal(page.querySelector('#forumComposeTitle').textContent,'投票设置');
  assert.deepEqual([...page.querySelectorAll('[data-compose-template]')].map(button=>button.textContent).at(-1),'自由设置选项');
  assert.equal(page.querySelector('#forumPollImageA'),null);
  page.querySelector('[data-compose-template="free"]').click();
  assert.equal(page.querySelectorAll('[data-poll-label]').length,2);
  assert.equal(page.querySelector('#forumPollQuestion'),null);
  assert.doesNotMatch(page.querySelector('#forumComposeScroll').textContent,/先写投票题目/);
  page.querySelector('#forumPollAddOption').click();
  assert.equal(page.querySelectorAll('[data-poll-label]').length,3);
  [...page.querySelectorAll('[data-poll-label]')].forEach((input,index)=>{input.value=['黑色','棕色','都不选'][index];});
  page.querySelector('#forumPollDone').click();
  assert.equal(page.querySelector('#forumComposeTitle').textContent,'发布帖子');
  assert.doesNotMatch(page.querySelector('.forum-poll-draft').textContent,/题目/);
  assert.match(page.querySelector('.forum-poll-draft').textContent,/黑色/);
  assert.match(page.querySelector('.forum-poll-draft').textContent,/都不选/);
  page.querySelector('#forumComposeTitleInput').value='新帖问留不留';
  f.document.getElementById('forumComposeForm').dispatchEvent({type:'submit'});
  assert.equal(page.hidden,true);
  assert.equal(view.querySelector('[data-board="antiques"]').getAttribute('aria-selected'),'true');
  assert.match(view.querySelector('#forumFeed').textContent,/新帖问留不留/);
  assert.match(view.querySelector('#forumFeed').textContent,/黑色/);
  assert.match(view.querySelector('#forumFeed').textContent,/都不选/);
  view.querySelector('#forumFeed [data-open]').click();
  const detail=f.document.getElementById('forumDetail');
  assert.equal(detail.querySelector('.forum-poll h3'),null);
  assert.match(detail.querySelector('.forum-poll').textContent,/棕色/);
  assert.doesNotMatch(detail.querySelector('.forum-poll').textContent,/题目/);
  detail.querySelector('#forumDetailMore').click();
  f.document.getElementById('forumEndPoll').click();
  assert.match(detail.querySelector('.forum-poll').textContent,/投票已结束/);
  assert.equal(detail.querySelector('.forum-choice').disabled, true);
});

test('a feed vote with more than five options fades the tail instead of dropping it',()=>{
  const f=fixture();
  f.window.jianxForum.posts.push({
    id:'many',board:'goods',channel:'一起聊',author:'米果',avatar:'is-violet',topic:'一起聊',title:'六个选项怎么排',images:[],likes:1,liked:false,saved:false,at:99,rank:9,comments:[],
    poll:{template:'free',myVote:null,options:[
      {id:'1',label:'一',preview:'一',votes:1},
      {id:'2',label:'二',preview:'二',votes:1},
      {id:'3',label:'三',preview:'三',votes:1},
      {id:'4',label:'四',preview:'四',votes:1},
      {id:'5',label:'五',preview:'五',votes:1},
      {id:'6',label:'六',preview:'六',votes:1}
    ]}
  });
  f.document.querySelector('[data-forum="goods"]').click();
  const many=f.document.querySelector('[data-post="many"] .forum-poll-options');
  assert.equal(many.classList.contains('is-fade'),true);
  assert.equal(many.querySelectorAll('span').length,6);
  assert.match(many.textContent,/六/);
  assert.equal(many.querySelector('[data-poll-option]'),null);
});

test('an author avatar lists that person’s posts and a post still opens for voting',()=>{
  const f=fixture();
  f.document.querySelector('[data-forum="health"]').click();
  const view=f.document.getElementById('forumView');
  view.querySelector('[data-author="南风"]').click();
  const profile=f.document.getElementById('forumProfile');
  assert.equal(profile.hidden,false);
  assert.match(profile.textContent,/南风/);
  assert.match(profile.textContent,/这盘减脂晚餐，留还是不留？/);
  assert.match(profile.textContent,/减脂期晚餐，一盘怎么搭配？/);
  assert.doesNotMatch(profile.textContent,/晨跑/);
  profile.querySelector('[data-open="plan"]').click();
  const detail=f.document.getElementById('forumDetail');
  assert.equal(detail.hidden,false);
  detail.querySelector('[data-poll-option="keep"]').click();
  assert.match(detail.textContent,/已投票/);
  f.document.getElementById('forumDetailBack').click();
  assert.equal(detail.hidden,true);
  assert.equal(profile.hidden,false);
  f.document.getElementById('forumProfileBack').click();
  assert.equal(profile.hidden,true);
  view.querySelector('[data-board="antiques"]').click();
  view.querySelector('[data-open="coin"]').click();
  detail.querySelector('[data-author="陈叔"]').click();
  assert.equal(profile.hidden,false);
  assert.match(profile.textContent,/还没有发过帖子/);
  assert.doesNotMatch(profile.textContent,/包浆怎么看/);
});

test('every post can be saved, and messages and profile are full pages',()=>{
  const f=fixture();
  f.document.querySelector('[data-forum="antiques"]').click();
  const view=f.document.getElementById('forumView');
  const posts=view.querySelectorAll('#forumFeed [data-post]');
  assert.ok(posts.length > 0);
  posts.forEach(post=>{
    const save=post.querySelector('[data-save]');
    assert.ok(save);
    assert.match(save.querySelector('span').textContent,/^\d+$/);
  });
  const bowlSave=view.querySelector('[data-save="bowl"]');
  const before=Number(bowlSave.querySelector('span').textContent);
  bowlSave.click();
  assert.equal(view.querySelector('[data-save="bowl"]').getAttribute('aria-pressed'),'true');
  assert.equal(view.querySelector('[data-save="bowl"] span').textContent,String(before+1));
  view.querySelector('[data-save="bowl"]').click();
  assert.equal(view.querySelector('[data-save="bowl"]').getAttribute('aria-pressed'),'false');
  assert.equal(view.querySelector('#forumMeBtn').getAttribute('aria-label'),'个人');
  assert.equal(view.querySelector('#forumInboxBtn').getAttribute('aria-label'),'消息');
  assert.equal(view.querySelector('#forumInboxBtn .forum-dot').hidden,false);
  view.querySelector('#forumInboxBtn').click();
  const inbox=f.document.getElementById('forumInbox');
  assert.equal(inbox.hidden,false);
  assert.equal(inbox.classList.contains('forum-detail'),true);
  assert.match(inbox.textContent,/赞了你的帖子/);
  assert.match(inbox.textContent,/踩了你的帖子/);
  assert.match(inbox.textContent,/评论了/);
  assert.match(inbox.textContent,/收藏了你的帖子/);
  assert.match(inbox.textContent,/回复了你的评论/);
  inbox.querySelector('[data-inbox-tab="official"]').click();
  assert.match(inbox.textContent,/周末收藏展/);
  assert.match(inbox.textContent,/本周话题/);
  assert.doesNotMatch(inbox.textContent,/赞了你的帖子/);
  inbox.querySelector('[data-open="expo"]').click();
  assert.equal(f.document.getElementById('forumDetail').hidden,false);
  f.document.getElementById('forumDetailBack').click();
  assert.equal(inbox.hidden,false);
  f.document.getElementById('forumInboxBack').click();
  assert.equal(inbox.hidden,true);
  assert.equal(view.querySelector('#forumInboxBtn .forum-dot').hidden,true);
  view.querySelector('#forumMeBtn').click();
  const me=f.document.getElementById('forumMe');
  assert.equal(me.hidden,false);
  assert.match(me.textContent,/这只杯子的釉色，怎么对光？/);
  assert.match(me.textContent,/删除后从本次浏览移除/);
  me.querySelector('[data-me-tab="comments"]').click();
  assert.match(me.textContent,/高点发亮的话，我会再看低点。/);
  me.querySelector('[data-me-tab="saves"]').click();
  assert.match(me.textContent,/第一次上手，底足这样拍清楚吗？/);
  me.querySelector('[data-save="photo"]').click();
  assert.doesNotMatch(me.textContent,/第一次上手/);
  me.querySelector('[data-me-tab="likes"]').click();
  assert.match(me.textContent,/这盘减脂晚餐，留还是不留？/);
  me.querySelector('[data-like="plan"]').click();
  assert.doesNotMatch(me.textContent,/减脂晚餐/);
  me.querySelector('[data-me-tab="posts"]').click();
  me.querySelector('[data-delete-post="glaze"]').click();
  assert.doesNotMatch(me.textContent,/怎么对光/);
  f.document.getElementById('forumMeBack').click();
  assert.equal(me.hidden,true);
  view.querySelector('[data-open="bowl"]').click();
  const down=f.document.getElementById('forumDetailDown');
  down.click();
  assert.equal(down.getAttribute('aria-pressed'),'true');
  assert.equal(down.querySelector('span').textContent,'1');
  f.document.getElementById('forumDetailLike').click();
  assert.equal(down.getAttribute('aria-pressed'),'false');
  assert.equal(f.document.getElementById('forumDetailLike').getAttribute('aria-pressed'),'true');
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
