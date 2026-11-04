(function(){
'use strict';
const byId = id => document.getElementById(id);
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const boardAlias = {home:'featured', featured:'featured', antiques:'antiques', health:'health', goods:'goods'};
const boardName = {featured:'精选', antiques:'古玩雅集', health:'健康生活家', goods:'好物研究所'};
const filterChannel = {all:'全部', fresh:'圈内新鲜事', craft:'懂点门道', talk:'一起聊'};
const posts = [
  {id:'bowl', board:'antiques', channel:'一起聊', picked:true, pick:1, author:'听雨', avatar:'is-gold', topic:'瓷器 · 一起聊', title:'这只青花碗，底足怎么看？', body:'圈足和釉面各拍了一张，想听听大家怎么看。', images:['assets/forum/bowl.jpg','assets/forum/bowl.jpg','assets/forum/bowl.jpg'], ratio:'tall', likes:28, liked:false, saved:false, at:40, rank:1, poll:{template:'verdict', question:'网友判断', ended:false, myVote:null, options:[
    {id:'real', label:'真', preview:'真', votes:18},
    {id:'fake', label:'假', preview:'假', votes:4},
    {id:'unsure', label:'看不准', preview:'看不准', votes:6}
  ]}, comments:[
    {id:'bowl-1', author:'老周', avatar:'is-cyan', text:'先看圈足是否沾砂，再对一下修足的刀痕是否顺。', time:'今天 11:20', likes:6, liked:false, replies:[]},
    {id:'bowl-2', author:'阿宁', avatar:'is-gold', text:'青花发色偏灰，建议补一张足墙内侧。', time:'今天 11:42', likes:3, liked:false, replies:[]},
    {id:'bowl-3', author:'小满', avatar:'is-violet', text:'我倾向再看釉面缩釉，单看底足还不够。', time:'今天 12:05', likes:2, liked:false, replies:[]}
  ]},
  {id:'coin', board:'antiques', channel:'懂点门道', picked:true, pick:4, author:'老周', avatar:'is-cyan', topic:'钱币 · 懂点门道', title:'包浆怎么看？先看这三个细节', images:['assets/forum/coin.svg','assets/forum/coin-detail.svg'], ratio:'short', likes:16, liked:false, saved:false, at:30, rank:2, comments:[
    {id:'coin-1', author:'听雨', avatar:'is-gold', text:'高点亮、低点暗，才像长期盘玩出来的。', time:'昨天', likes:4, liked:false, replies:[]},
    {id:'coin-2', author:'陈叔', avatar:'is-cyan', text:'方孔内壁如果发贼光，要小心后做。', time:'昨天', likes:5, liked:false, replies:[]}
  ]},
  {id:'expo', board:'antiques', channel:'圈内新鲜事', author:'圈内新鲜事', avatar:'is-violet', topic:'', title:'周末收藏展，有哪些值得看？', source:'展会公告', images:[], likes:9, liked:false, saved:false, at:20, rank:3, comments:[
    {id:'expo-1', author:'老周', avatar:'is-cyan', text:'周六上午瓷器专场人少一些。', time:'昨天', likes:1, liked:false, replies:[]}
  ]},
  {id:'photo', board:'antiques', channel:'一起聊', author:'小林', avatar:'is-cyan', topic:'一起聊', title:'第一次上手，底足这样拍清楚吗？', images:['assets/forum/bowl-foot.svg'], ratio:'mid', likes:4, liked:false, saved:false, at:50, rank:4, comments:[]},
  {id:'plan', board:'health', channel:'一起聊', picked:true, pick:3, author:'南风', avatar:'is-cyan', topic:'饮食 · 一起聊', title:'这盘减脂晚餐，留还是不留？', body:'蛋白质够，酱汁有点咸。', images:['assets/forum/meal.jpg'], ratio:'mid', likes:19, liked:false, saved:false, at:24, rank:1, poll:{template:'keep', question:'这盘留不留？', ended:false, myVote:null, options:[
    {id:'keep', label:'留', preview:'留', votes:36},
    {id:'drop', label:'不留', preview:'不留', votes:14}
  ]}, comments:[
    {id:'plan-1', author:'阿麦', avatar:'is-cyan', text:'酱汁减半，这盘可以留。', time:'今天 18:12', likes:4, liked:false, replies:[]}
  ]},
  {id:'pace', board:'health', channel:'一起聊', author:'阿麦', avatar:'is-cyan', topic:'方案 · 一起聊', title:'这个配速方案，现在就上吗？', body:'能说话的配速，适合现在打卡，还是再等等。', images:[], likes:8, liked:false, saved:false, at:15, rank:2, poll:{template:'buy', question:'现在怎么选？', ended:false, myVote:null, options:[
    {id:'buy', label:'买', preview:'买', votes:11},
    {id:'skip', label:'不买', preview:'不买', votes:6},
    {id:'wait', label:'再等等', preview:'再等等', votes:9}
  ]}, comments:[]},
  {id:'run', board:'health', channel:'一起聊', picked:true, pick:5, author:'阿麦', avatar:'is-cyan', topic:'打卡 · 一起聊', title:'晨跑 5 公里，配速怎么才不算硬撑？', images:[], likes:11, liked:false, saved:false, at:18, rank:3, comments:[
    {id:'run-1', author:'小林', avatar:'is-cyan', text:'能说话的配速，比盯着表更稳。', time:'今天 07:40', likes:2, liked:false, replies:[]}
  ]},
  {id:'meal', board:'health', channel:'懂点门道', author:'南风', avatar:'is-cyan', topic:'饮食', title:'减脂期晚餐，一盘怎么搭配？', images:[], likes:7, liked:false, saved:false, at:12, rank:4, comments:[]},
  {id:'bag', board:'goods', channel:'一起聊', picked:true, pick:2, author:'小满', avatar:'is-violet', topic:'包袋 · 一起聊', title:'通勤包，选黑色还是棕色？', body:'平时穿得比较简单，想选一只日常通勤用。你们更喜欢哪一只？', images:['assets/forum/bags.jpg'], ratio:'mid', likes:45, liked:false, saved:false, at:22, rank:1, poll:{template:'ab', question:'你会选哪只？', ended:false, myVote:null, options:[
    {id:'a', label:'A 黑色', preview:'A. 黑色通勤包', badge:'A', votes:80},
    {id:'b', label:'B 棕色', preview:'B. 焦糖通勤包', badge:'B', votes:48}
  ]}, comments:[
    {id:'bag-1', author:'阿宁', avatar:'is-gold', text:'黑色更好搭，通勤也省心。', time:'今天 13:02', likes:18, liked:false, helpful:true, replies:[]},
    {id:'bag-2', author:'木木', avatar:'is-cyan', text:'棕色配浅色衣服更有层次。', time:'今天 13:15', likes:9, liked:false, replies:[]}
  ]},
  {id:'cushion', board:'goods', channel:'一起聊', author:'米果', avatar:'is-violet', topic:'美妆 · 一起聊', title:'同价位气垫，哪款更抗造？', body:'拿下午三点的鼻翼做对照。', images:['assets/forum/cream.jpg'], ratio:'tall', likes:21, liked:false, saved:false, at:26, rank:2, poll:{template:'tier', question:'这支气垫，你怎么评？', ended:false, myVote:null, options:[
    {id:'top', label:'夯', votes:12},
    {id:'high', label:'顶级', votes:20},
    {id:'good', label:'人上人', votes:18},
    {id:'npc', label:'NPC', votes:7},
    {id:'done', label:'拉完了', votes:4}
  ]}, comments:[
    {id:'cushion-1', author:'阿麦', avatar:'is-cyan', text:'看持妆可以先比下午三点的鼻翼。', time:'今天 15:08', likes:3, liked:false, replies:[]}
  ]},
  {id:'hardware', board:'goods', channel:'懂点门道', author:'周周', avatar:'is-gold', topic:'包袋 · 懂点门道', title:'这只包的五金，怎么判断翻新？', images:['assets/forum/bags.jpg'], ratio:'short', likes:13, liked:false, saved:false, at:16, rank:3, comments:[]},
  {id:'toy', board:'goods', channel:'一起聊', picked:true, pick:6, author:'北岛', avatar:'is-cyan', topic:'潮玩 · 一起聊', title:'这只潮玩，开箱先看哪一处？', images:['assets/forum/toy.jpg'], ratio:'short', likes:18, liked:false, saved:false, at:28, rank:4, comments:[
    {id:'toy-1', author:'米果', avatar:'is-violet', text:'先看接缝和漆面，再对编号。', time:'今天 16:20', likes:2, liked:false, replies:[]}
  ]},
  {id:'watch', board:'goods', channel:'懂点门道', author:'阿宁', avatar:'is-gold', topic:'腕表 · 懂点门道', title:'表带接口，怎么判断后换？', images:['assets/forum/watch.jpg'], ratio:'tall', likes:15, liked:false, saved:false, at:14, rank:5, comments:[]}
];
const forumState = {board:'antiques', filter:'all', sort:'hot', query:'', postId:null, replyId:null, reportKind:null, reportId:null, reason:'', returnFocus:null};
function ensureScreen(){
  let view = byId('forumView');
  if (!view) {
    view = document.createElement('section');
    view.id = 'forumView';
    (byId('app') || document.body).append(view);
  }
  view.className = 'forum-view';
  view.setAttribute('aria-label', '论坛');
  if (view.querySelector('[data-sort]') && view.querySelector('#forumDetailSend')) return view;
  view.innerHTML = `<header class="forum-top"><button type="button" class="forum-icon-btn" id="forumBack" aria-label="返回首页"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.5 6 8.5 12l6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button><h1>论坛</h1><button type="button" class="forum-icon-btn" id="forumSearchBtn" aria-label="搜索帖子" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.2" stroke="currentColor" stroke-width="1.8"/><path d="M16 16.5 20 20.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button><button type="button" class="forum-icon-btn" id="forumInboxBtn" aria-label="消息"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 16.5 4 20l4.2-1.4A8.2 8.2 0 1 0 6 16.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg><i class="forum-dot" aria-hidden="true"></i></button></header><form id="forumSearch" class="forum-search" hidden role="search"><label for="forumQuery">搜索帖子</label><input id="forumQuery" type="search" maxlength="40" placeholder="标题或作者"></form><div class="forum-board-track" role="tablist" aria-label="论坛板块"><button type="button" role="tab" data-board="featured">精选</button><button type="button" role="tab" data-board="antiques" aria-selected="true">古玩雅集</button><button type="button" role="tab" data-board="health">健康生活家</button><button type="button" role="tab" data-board="goods">好物研究所</button></div><div class="forum-channel-row"><div class="forum-filters" role="tablist" aria-label="话题"><button type="button" role="tab" data-filter="all" aria-selected="true">全部</button><button type="button" role="tab" data-filter="fresh">圈内新鲜事</button><button type="button" role="tab" data-filter="craft">懂点门道</button><button type="button" role="tab" data-filter="talk">一起聊</button></div><div class="forum-sort" role="group" aria-label="排序"><button type="button" data-sort="hot" aria-pressed="true">推荐</button><button type="button" data-sort="new">最新</button></div></div><div class="forum-feed" id="forumFeed"></div><button type="button" class="forum-publish" id="forumPublish"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 19.5h4L19 9a2.1 2.1 0 0 0-3-3L5.5 16.5v3Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg><span>发布</span></button><section id="forumDetail" class="forum-detail" hidden><header class="forum-top"><button type="button" class="forum-icon-btn" id="forumDetailBack" aria-label="返回论坛"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.5 6 8.5 12l6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button><h2 id="forumDetailTitle">帖子详情</h2><button type="button" class="forum-icon-btn" id="forumDetailMore" aria-label="更多"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18" cy="12" r="1.4" fill="currentColor"/></svg></button></header><div class="forum-detail-scroll" id="forumDetailBody"></div><form id="forumDetailComposer" class="forum-detail-bar"><label class="forum-sr" for="forumDetailInput">评论</label><input id="forumDetailInput" maxlength="200" placeholder="说说你的看法"><button type="button" id="forumDetailSend" disabled>发送</button><button type="button" class="forum-comment" id="forumDetailDiscuss" aria-label="评论"></button><button type="button" class="forum-like" id="forumDetailLike" aria-label="点赞"></button><button type="button" id="forumDetailSave" aria-label="收藏" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 4 2.2 4.6 5 .7-3.6 3.5.9 5L12 15.8 7.5 17.8l.9-5L4.8 9.3l5-.7L12 4Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg></button></form></section><div id="forumMore" class="forum-sheet" hidden role="dialog" aria-modal="true" aria-labelledby="forumMoreTitle"><div class="forum-sheet-panel"><header class="forum-sheet-head"><h2 id="forumMoreTitle">更多</h2><button type="button" class="forum-icon-btn" id="forumMoreClose" aria-label="关闭更多">×</button></header><button type="button" class="forum-menu" id="forumReportPost">举报帖子</button><button type="button" class="forum-menu" id="forumShowSaved">我的收藏</button><button type="button" class="forum-menu" id="forumEndPoll" hidden>结束投票</button></div></div><div id="forumReport" class="forum-sheet" hidden role="dialog" aria-modal="true" aria-labelledby="forumReportTitle"><div class="forum-sheet-panel"><header class="forum-sheet-head"><h2 id="forumReportTitle">举报</h2><button type="button" class="forum-icon-btn" id="forumReportClose" aria-label="关闭举报">×</button></header><div class="forum-reasons"><button type="button" data-reason="不实内容">不实内容</button><button type="button" data-reason="广告引流">广告引流</button><button type="button" data-reason="人身攻击">人身攻击</button><button type="button" data-reason="其他">其他</button></div><p id="forumReportStatus" class="forum-note" role="status"></p><button type="button" class="forum-submit" id="forumReportSend" disabled>提交</button></div></div><div id="forumSaved" class="forum-sheet" hidden role="dialog" aria-modal="true" aria-labelledby="forumSavedTitle"><div class="forum-sheet-panel"><header class="forum-sheet-head"><h2 id="forumSavedTitle">我的收藏</h2><button type="button" class="forum-icon-btn" id="forumSavedClose" aria-label="关闭收藏">×</button></header><div class="forum-inbox" id="forumSavedList"></div></div></div><div id="forumInbox" class="forum-sheet" hidden role="dialog" aria-modal="true" aria-labelledby="forumInboxTitle"><div class="forum-sheet-panel"><header class="forum-sheet-head"><h2 id="forumInboxTitle">消息</h2><button type="button" class="forum-icon-btn" id="forumInboxClose" aria-label="关闭消息">×</button></header><div class="forum-inbox" id="forumInboxList"></div></div></div><section id="forumCompose" class="forum-compose" hidden><header class="forum-top"><button type="button" class="forum-icon-btn" id="forumComposeClose" aria-label="关闭发布">×</button><h2 id="forumComposeTitle">发布帖子</h2><button type="button" class="forum-text-btn" id="forumComposePreview">预览</button></header><form id="forumComposeForm" class="forum-compose-form"><div class="forum-compose-scroll" id="forumComposeScroll"></div><div class="forum-compose-bar" id="forumComposeBar"><p id="forumComposeError" class="forum-error" role="status"></p><button type="submit" class="forum-submit">发布</button><p class="forum-note">只保存在本次浏览，不会公开发布。</p></div></form></section>`;
  return view;
}
function postById(id){return posts.find(post => post.id === id);}
function visiblePosts(){
  const channel = filterChannel[forumState.filter];
  const query = forumState.query.trim();
  return posts.filter(post => {
    const onBoard = forumState.board === 'featured' ? post.picked : post.board === forumState.board;
    const onChannel = forumState.board === 'featured' || forumState.filter === 'all' || post.channel === channel;
    return onBoard && onChannel && (!query || `${post.title}${post.author}${post.topic}`.includes(query));
  }).sort((a, b) => forumState.board === 'featured' ? a.pick - b.pick : forumState.sort === 'new' ? b.at - a.at : a.rank - b.rank);
}
function thumb(on){return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 11v9H4v-9h3Zm2 9h7.2a2 2 0 0 0 2-1.6l1.2-6A2 2 0 0 0 17.4 10H14V6.4A2.4 2.4 0 0 0 11.6 4L9 10v10Z" fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`;}
function bubble(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16.5 4 20l4.2-1.6A8 8 0 1 0 6 16.5Z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';}
function star(on){return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 4 2.2 4.6 5 .7-3.6 3.5.9 5L12 15.8 7.5 17.8l.9-5L4.8 9.3l5-.7L12 4Z" fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`;}
function shots(post){
  if (post.images.length >= 3) {
    const crop = ['is-main','is-foot','is-glaze'];
    return `<div class="forum-mosaic">${post.images.slice(0, 3).map((src, index) => `<img class="${crop[index]}" src="${src}" alt="">`).join('')}</div>`;
  }
  if (post.images.length) return `<div class="forum-pair">${post.images.map(src => `<img src="${src}" alt="">`).join('')}</div>`;
  return '';
}
function usesWaterfall(){return forumState.board === 'featured' || forumState.board === 'goods';}
function actions(post){return `<div class="forum-actions"><button type="button" class="forum-like" data-like="${post.id}" aria-pressed="${post.liked}" aria-label="${post.liked ? '取消赞' : '点赞'}">${thumb(post.liked)}<span>${post.likes}</span></button><button type="button" class="forum-comment" data-comment="${post.id}" aria-label="评论">${bubble()}<span>${commentCount(post)}</span></button></div>`;}
function pollPreview(post){
  const poll = post.poll;
  if (!poll) return '';
  if (poll.template === 'tier') return `<button type="button" class="forum-poll-preview is-link" data-open="${post.id}">参与评价</button>`;
  const mark = poll.template === 'verdict' ? '<em>网友判断</em>' : '';
  const chips = poll.options.map(option => `<span>${esc(option.preview || option.label)}</span>`).join('');
  return `<button type="button" class="forum-poll-preview" data-open="${post.id}">${mark}${chips}</button>`;
}
function mediaButton(post, inner){
  if (!inner) return '';
  return `<button type="button" class="forum-media" data-open="${post.id}" aria-label="查看${esc(post.title)}">${inner}</button>`;
}
function stackCard(post){
  return `<article class="forum-post" data-post="${post.id}"><header class="forum-post-head"><i class="forum-avatar ${post.avatar}" aria-hidden="true"></i><div class="forum-post-id"><strong>${esc(post.author)}</strong>${post.topic ? `<span>${esc(post.topic)}</span>` : ''}</div></header><h3 class="forum-title"><button type="button" class="forum-title-btn" data-open="${post.id}">${esc(post.title)}</button></h3>${mediaButton(post, shots(post))}${post.source ? `<p class="forum-source">来源：${esc(post.source)}</p>` : ''}${pollPreview(post)}${actions(post)}</article>`;
}
function coverRatio(post){return post.ratio || (post.images.length >= 3 ? 'tall' : post.images.length > 1 ? 'mid' : post.images.length ? 'short' : '');}
function tileWeight(post){const ratio = coverRatio(post); const image = ratio === 'tall' ? 210 : ratio === 'mid' ? 168 : ratio === 'short' ? 132 : 0; return image + Math.ceil(post.title.length / 8) * 20 + (post.poll ? 46 : 0) + 48;}
function tileCard(post){
  const ratio = coverRatio(post);
  const cover = post.images[0] ? `<button type="button" class="forum-cover-btn" data-open="${post.id}" aria-label="查看${esc(post.title)}"><img class="forum-cover is-${ratio}" src="${post.images[0]}" alt=""></button>` : '';
  return `<article class="forum-tile" data-post="${post.id}">${cover}<h3 class="forum-title"><button type="button" class="forum-title-btn" data-open="${post.id}">${esc(post.title)}</button></h3>${post.topic ? `<p class="forum-tile-topic">${esc(post.topic)}</p>` : ''}${pollPreview(post)}<div class="forum-tile-foot"><span class="forum-tile-author"><i class="forum-avatar ${post.avatar}" aria-hidden="true"></i><em>${esc(post.author)}</em></span>${actions(post)}</div></article>`;
}
function masonry(list){
  const columns = [[], []];
  const heights = [0, 0];
  list.forEach(post => {
    const index = heights[0] <= heights[1] ? 0 : 1;
    columns[index].push(post);
    heights[index] += tileWeight(post);
  });
  return `<div class="forum-masonry">${columns.map(column => `<div class="forum-col">${column.map(tileCard).join('')}</div>`).join('')}</div>`;
}
function renderFeed(){
  const list = visiblePosts();
  const feed = byId('forumFeed');
  feed.classList.toggle('is-waterfall', usesWaterfall());
  feed.innerHTML = list.length ? (usesWaterfall() ? masonry(list) : list.map(stackCard).join('')) : '<p class="forum-empty">还没有相关帖子</p>';
}
function renderChrome(){
  document.querySelector('#forumView .forum-channel-row').hidden = forumState.board === 'featured';
  document.querySelectorAll('#forumView [data-board]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.board === forumState.board)));
  document.querySelectorAll('#forumView [data-filter]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.filter === forumState.filter)));
  document.querySelectorAll('#forumView [data-sort]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.sort === forumState.sort)));
}
function commentCount(post){return post.comments.reduce((sum, comment) => sum + 1 + (comment.replies || []).length, 0);}
function pollTotal(poll){return poll.options.reduce((sum, option) => sum + option.votes, 0);}
function percentLabel(votes, total){
  if (!total) return '0%';
  const value = Math.round(votes * 1000 / total) / 10;
  return `${value}%`;
}
function resultsOpen(poll){return poll.ended || Boolean(poll.myVote);}
function findComment(post, id){
  for (const comment of post.comments) {
    if (comment.id === id) return comment;
    const reply = (comment.replies || []).find(item => item.id === id);
    if (reply) return reply;
  }
  return null;
}
function commentBlock(post, comment, nested){
  const helpful = comment.helpful ? '<em class="forum-helpful">有帮助</em>' : '';
  const helpfulButton = post.mine && !nested ? `<button type="button" data-helpful="${comment.id}">${comment.helpful ? '撤销有帮助' : '有帮助'}</button>` : '';
  const remove = comment.mine ? `<button type="button" data-delete-comment="${comment.id}">删除</button>` : '';
  const replyBox = forumState.replyId === comment.id ? `<form class="forum-reply"><label for="forumReplyInput">回复 ${esc(comment.author)}</label><input id="forumReplyInput" maxlength="200"><button type="button" id="forumReplySend">发送</button></form>` : '';
  const replies = (comment.replies || []).map(reply => commentBlock(post, reply, true)).join('');
  return `<article class="forum-thread${nested ? ' is-reply' : ''}" data-comment-id="${comment.id}"><i class="forum-avatar ${comment.avatar || 'is-violet'}" aria-hidden="true"></i><div><strong>${esc(comment.author)}${helpful}</strong><p>${esc(comment.text)}</p><p class="forum-thread-meta">${comment.time ? `<time>${esc(comment.time)}</time>` : ''}<button type="button" data-reply="${comment.id}">回复</button>${helpfulButton}${remove}<button type="button" data-report-comment="${comment.id}">举报</button></p>${replyBox}${replies}</div><button type="button" class="forum-like" data-comment-like="${comment.id}" aria-pressed="${Boolean(comment.liked)}" aria-label="${comment.liked ? '取消赞' : '点赞'}">${thumb(comment.liked)}<span>${comment.likes || 0}</span></button></article>`;
}
function choiceButton(post, option){
  const poll = post.poll;
  const open = resultsOpen(poll);
  const total = pollTotal(poll);
  const selected = poll.myVote === option.id;
  const result = open ? `<strong>${option.votes}人 ${percentLabel(option.votes, total)}</strong>` : '';
  const width = open && total ? percentLabel(option.votes, total) : '0%';
  return `<button type="button" class="forum-choice" data-poll-option="${option.id}" aria-pressed="${selected}" style="--pct:${width}" ${poll.ended ? 'disabled' : ''}><b></b><span>${esc(option.label)}${selected ? ' ✓' : ''}</span>${result}</button>`;
}
function detailHtml(post){
  const poll = post.poll;
  const photo = post.images[0] ? `<div class="forum-hero"><img src="${post.images[0]}" alt="">${poll && poll.template === 'ab' ? poll.options.filter(option => option.badge).map(option => `<i class="forum-badge is-${option.id}">${esc(option.badge)}</i>`).join('') : ''}</div>` : shots(post);
  const notes = [];
  if (poll && poll.template === 'verdict') notes.push('网友判断，不是平台鉴定结论');
  if (poll && poll.ended) notes.push('投票已结束');
  else if (poll && poll.myVote) notes.push('已投票');
  const pollShots = poll && poll.options.some(option => option.image) ? `<div class="forum-poll-shots">${poll.options.filter(option => option.image).map(option => `<figure><img src="${esc(option.image)}" alt=""><figcaption>${esc(option.label)}</figcaption></figure>`).join('')}</div>` : '';
  const pollHtml = poll ? `<section class="forum-poll">${pollShots}<header class="forum-poll-head"><h3>${esc(poll.question)}</h3><span>${pollTotal(poll)} 人参与</span></header>${poll.options.map(option => choiceButton(post, option)).join('')}${notes.map(note => `<p class="forum-note">${esc(note)}</p>`).join('')}</section>` : '';
  const comments = post.comments.length ? post.comments.map(comment => commentBlock(post, comment, false)).join('') : '<p class="forum-empty">还没有评论，来留第一句</p>';
  return `<p class="forum-kicker">${esc(boardName[post.board])} · ${esc(post.topic || post.channel)}</p><header class="forum-post-head"><i class="forum-avatar ${post.avatar}" aria-hidden="true"></i><div class="forum-post-id"><strong>${esc(post.author)}</strong><span>${post.mine ? '刚刚' : '今天'}</span></div></header><h3 class="forum-detail-heading">${esc(post.title)}</h3>${post.body ? `<p class="forum-body">${esc(post.body)}</p>` : ''}${photo}${post.source ? `<p class="forum-source">来源：${esc(post.source)}</p>` : ''}${pollHtml}<h3 class="forum-comment-heading" id="forumCommentsHead">评论 ${commentCount(post)}</h3><div class="forum-threads">${comments}</div>`;
}
function renderDetail(){
  const post = postById(forumState.postId);
  if (!post || byId('forumDetail').hidden) return;
  byId('forumDetailBody').innerHTML = detailHtml(post);
  const like = byId('forumDetailLike');
  like.setAttribute('aria-pressed', String(post.liked));
  like.setAttribute('aria-label', post.liked ? '取消赞' : '点赞');
  like.innerHTML = `${thumb(post.liked)}<span>${post.likes}</span>`;
  byId('forumDetailDiscuss').innerHTML = `${bubble()}<span>${commentCount(post)}</span>`;
  const save = byId('forumDetailSave');
  save.setAttribute('aria-pressed', String(Boolean(post.saved)));
  save.innerHTML = star(post.saved);
  byId('forumEndPoll').hidden = !(post.mine && post.poll && !post.poll.ended);
}
function syncDetailSend(){byId('forumDetailSend').disabled = !byId('forumDetailInput').value.trim();}
function openDetail(id){
  const post = postById(id);
  if (!post) return;
  forumState.postId = id;
  forumState.replyId = null;
  byId('forumDetailInput').value = '';
  syncDetailSend();
  byId('forumDetail').hidden = false;
  byId('forumMore').hidden = true;
  byId('forumReport').hidden = true;
  byId('forumSaved').hidden = true;
  renderDetail();
  byId('forumDetailBack').focus();
}
function closeDetail(){
  byId('forumDetail').hidden = true;
  forumState.replyId = null;
  const back = document.querySelector(`#forumFeed [data-open="${forumState.postId}"]`);
  forumState.postId = null;
  back?.focus?.();
}
function castVote(post, optionId){
  const poll = post.poll;
  if (!poll || poll.ended || poll.myVote === optionId) return;
  if (poll.myVote) {
    const previous = poll.options.find(option => option.id === poll.myVote);
    if (previous) previous.votes -= 1;
  }
  const next = poll.options.find(option => option.id === optionId);
  if (!next) return;
  next.votes += 1;
  poll.myVote = optionId;
  poll.locked = true;
  renderDetail();
}
function addComment(text, parentId){
  const post = postById(forumState.postId);
  const value = text.trim();
  if (!post || !value) return;
  const item = {id:`mine-${Date.now()}`, author:'我', avatar:'is-violet', text:value, time:'刚刚', likes:0, liked:false, mine:true, replies:[]};
  if (parentId) {
    const parent = findComment(post, parentId);
    if (!parent) return;
    parent.replies = parent.replies || [];
    parent.replies.push(item);
    forumState.replyId = null;
  } else post.comments.push(item);
  byId('forumDetailInput').value = '';
  syncDetailSend();
  renderDetail();
  renderFeed();
}
function renderSaved(){
  const saved = posts.filter(post => post.saved);
  byId('forumSavedList').innerHTML = saved.length ? saved.map(post => `<button type="button" data-saved="${post.id}"><strong>${esc(post.author)} · ${esc(post.title)}</strong><span>${esc(boardName[post.board])}</span></button>`).join('') : '<p class="forum-empty">还没有收藏</p>';
}
function openReport(kind, id){
  forumState.reportKind = kind;
  forumState.reportId = id;
  forumState.reason = '';
  byId('forumReportStatus').textContent = '';
  byId('forumReportSend').disabled = true;
  byId('forumReport').querySelectorAll('[data-reason]').forEach(button => button.setAttribute('aria-pressed', 'false'));
  byId('forumMore').hidden = true;
  byId('forumReport').hidden = false;
}
function renderFeedAndDetail(){renderFeed(); renderDetail();}
const postTypes = [
  {id:'chat', label:'一起聊·大家评', channel:'一起聊', poll:true},
  {id:'craft', label:'分享经验·懂点门道', channel:'懂点门道', poll:false}
];
const pollTemplates = {
  keep:{name:'留 / 不留', options:[{id:'keep', label:'留', preview:'留'}, {id:'drop', label:'不留', preview:'不留'}]},
  buy:{name:'买 / 不买 / 再等等', options:[{id:'buy', label:'买', preview:'买'}, {id:'skip', label:'不买', preview:'不买'}, {id:'wait', label:'再等等', preview:'再等等'}]},
  ab:{name:'自己填两个选项', custom:true, options:[{id:'a', label:'', preview:''}, {id:'b', label:'', preview:''}]},
  verdict:{name:'真 / 假 / 看不准', question:'网友判断', note:'将标明「网友判断」，不是平台鉴定结论', options:[{id:'real', label:'真', preview:'真'}, {id:'fake', label:'假', preview:'假'}, {id:'unsure', label:'看不准', preview:'看不准'}]},
  tier:{name:'夯 / 顶级 / 人上人 / NPC / 拉完了', note:'五档评价，针对物品、方案和使用体验', options:[{id:'top', label:'夯', preview:'夯'}, {id:'high', label:'顶级', preview:'顶级'}, {id:'good', label:'人上人', preview:'人上人'}, {id:'npc', label:'NPC', preview:'NPC'}, {id:'done', label:'拉完了', preview:'拉完了'}]}
};
const compose = {board:'', type:'', title:'', body:'', images:[], poll:null, step:'form'};
function chip(pressed, attrs, label){return `<button type="button" class="forum-chip" ${attrs} aria-pressed="${pressed}">${esc(label)}</button>`;}
function readComposeFields(){
  const title = byId('forumComposeTitleInput');
  const body = byId('forumComposeBody');
  const question = byId('forumPollQuestion');
  const labelA = byId('forumPollLabelA');
  const labelB = byId('forumPollLabelB');
  if (title) compose.title = title.value;
  if (body) compose.body = body.value;
  if (question && compose.poll) compose.poll.question = question.value;
  if (labelA && compose.poll) compose.poll.options[0].label = labelA.value;
  if (labelB && compose.poll) compose.poll.options[1].label = labelB.value;
}
function composeType(){return postTypes.find(type => type.id === compose.type);}
function formHtml(){
  const boards = ['antiques','health','goods'].map(id => chip(compose.board === id, `data-compose-board="${id}"`, boardName[id])).join('');
  const types = postTypes.map(type => chip(compose.type === type.id, `data-compose-type="${type.id}"`, type.label)).join('');
  const photos = compose.images.map((src, index) => `<figure><img src="${src}" alt=""><button type="button" class="forum-photo-remove" data-compose-remove-image="${index}" aria-label="移除图片">×</button></figure>`).join('');
  const add = compose.images.length < 3 ? '<label class="forum-photo-add">添加图片<input id="forumComposeImages" type="file" accept="image/*"></label>' : '';
  const poll = composeType()?.poll ? `<button type="button" class="forum-poll-entry" id="forumAddPoll"><span>${compose.poll ? esc(pollTemplates[compose.poll.template].name) : '添加投票'}</span><span aria-hidden="true">›</span></button>${compose.poll ? '<button type="button" class="forum-text-btn" id="forumClearPoll">移除投票</button>' : ''}` : '';
  return `<p class="forum-field-label">板块</p><div class="forum-chip-row" role="group" aria-label="板块">${boards}</div><p class="forum-field-label">发帖类型</p><div class="forum-chip-row forum-type-row" role="group" aria-label="发帖类型">${types}</div>${poll}<label class="forum-field-label" for="forumComposeTitleInput">标题</label><input id="forumComposeTitleInput" maxlength="32" value="${esc(compose.title)}"><label class="forum-field-label" for="forumComposeBody">正文</label><textarea id="forumComposeBody" maxlength="180">${esc(compose.body)}</textarea><p class="forum-field-label">图片</p><div class="forum-photo-row">${photos}${add}</div>`;
}
function pollSetupHtml(){
  const templates = Object.entries(pollTemplates).map(([id, template]) => chip(compose.poll?.template === id, `data-compose-template="${id}"`, template.name)).join('');
  const current = compose.poll ? pollTemplates[compose.poll.template] : null;
  const question = current ? `<label class="forum-field-label" for="forumPollQuestion">题目</label><input id="forumPollQuestion" maxlength="32" value="${esc(compose.poll.question || '')}">` : '';
  const custom = current?.custom ? `<label class="forum-field-label" for="forumPollLabelA">第一个选项</label><input id="forumPollLabelA" maxlength="16" value="${esc(compose.poll.options[0].label)}"><label class="forum-photo-add">配图<input id="forumPollImageA" type="file" accept="image/*" aria-label="第一个选项配图"></label><label class="forum-field-label" for="forumPollLabelB">第二个选项</label><input id="forumPollLabelB" maxlength="16" value="${esc(compose.poll.options[1].label)}"><label class="forum-photo-add">配图<input id="forumPollImageB" type="file" accept="image/*" aria-label="第二个选项配图"></label>` : '';
  const fixed = current && !current.custom ? `<div class="forum-chip-row">${current.options.map(option => `<span class="forum-fixed-option">${esc(option.label)}</span>`).join('')}</div>` : '';
  const note = current?.note ? `<p class="forum-note">${esc(current.note)}</p>` : '';
  return `<p class="forum-field-label">投票模板</p><div class="forum-chip-row" role="group" aria-label="投票模板">${templates}</div>${question}${custom}${fixed}${note}<p class="forum-note">出现第一票后，题目、选项和配图不能再改。投票期间可以改选，你也可以结束投票。</p><p id="forumPollError" class="forum-error" role="status"></p><button type="button" class="forum-submit" id="forumPollDone">完成</button>`;
}
function previewHtml(){
  const type = composeType();
  const images = compose.images.length ? `<div class="forum-pair">${compose.images.map(src => `<img src="${src}" alt="">`).join('')}</div>` : '';
  const poll = composeType()?.poll && compose.poll ? `<p class="forum-source">${esc(compose.poll.question || pollTemplates[compose.poll.template].name)}</p><div class="forum-chip-row">${compose.poll.options.map(option => `<span class="forum-fixed-option">${esc(option.label || option.badge || '')}</span>`).join('')}</div>` : '';
  return `<article class="forum-post"><h3 class="forum-detail-heading">${esc(compose.title || '未写标题')}</h3><p class="forum-kicker">${esc(boardName[compose.board] || '未选板块')} · ${esc(type?.label || '未选类型')}</p>${compose.body ? `<p class="forum-body">${esc(compose.body)}</p>` : ''}${images}${poll}</article>`;
}
function renderCompose(){
  const close = byId('forumComposeClose');
  const preview = byId('forumComposePreview');
  const heading = byId('forumComposeTitle');
  const bar = byId('forumComposeBar');
  const substep = compose.step !== 'form';
  close.setAttribute('aria-label', substep ? '返回发帖' : '关闭发布');
  close.textContent = substep ? '‹' : '×';
  heading.textContent = compose.step === 'poll' ? '投票设置' : compose.step === 'preview' ? '预览' : '发布帖子';
  preview.hidden = substep;
  bar.hidden = substep;
  byId('forumComposeScroll').innerHTML = compose.step === 'poll' ? pollSetupHtml() : compose.step === 'preview' ? previewHtml() : formHtml();
}
function openCompose(){
  compose.board = forumState.board === 'featured' ? '' : forumState.board;
  compose.type = '';
  compose.title = '';
  compose.body = '';
  compose.images = [];
  compose.poll = null;
  compose.step = 'form';
  byId('forumComposeError').textContent = '';
  renderCompose();
  byId('forumCompose').hidden = false;
  byId('forumComposeClose').focus();
}
function closeCompose(){
  readComposeFields();
  if (compose.step !== 'form') { compose.step = 'form'; byId('forumComposeError').textContent = ''; renderCompose(); return; }
  byId('forumCompose').hidden = true;
  byId('forumPublish').focus();
}
function finishPoll(){
  readComposeFields();
  const error = byId('forumComposeError');
  const pollError = byId('forumPollError');
  const fail = message => { error.textContent = message; if (pollError) pollError.textContent = message; };
  if (!compose.poll) return fail('先选投票模板');
  if (!compose.poll.question.trim()) return fail('先写投票题目');
  if (pollTemplates[compose.poll.template].custom && compose.poll.options.some(option => !option.label.trim())) return fail('先写两个选项');
  error.textContent = '';
  compose.step = 'form';
  renderCompose();
}
function readImageFile(file, done){
  if (!file || !window.FileReader) return;
  const reader = new FileReader();
  reader.onload = () => done(String(reader.result || ''));
  reader.readAsDataURL(file);
}
function publishPost(){
  readComposeFields();
  if (compose.step === 'poll') return finishPoll();
  const error = byId('forumComposeError');
  const type = composeType();
  if (!compose.board) { error.textContent = '先选板块'; return; }
  if (!type) { error.textContent = '先选发帖类型'; return; }
  const title = compose.title.trim();
  if (!title) { error.textContent = '先写标题'; return; }
  const poll = type.poll && compose.poll ? {template:compose.poll.template, question:compose.poll.question.trim(), ended:false, myVote:null, locked:false, options:compose.poll.options.map(option => ({...option, label:option.label.trim(), preview:option.badge ? `${option.badge}. ${option.label.trim()}` : option.label.trim(), votes:0}))} : null;
  posts.unshift({id:`mine-${posts.length + 1}`, board:compose.board, channel:type.channel, author:'我', avatar:'is-violet', mine:true, picked:false, pick:99, topic:type.label, title, body:compose.body.trim(), images:compose.images.slice(), ratio:compose.images.length ? 'mid' : '', likes:0, liked:false, saved:false, at:Date.now(), rank:0, comments:[], ...(poll ? {poll} : {})});
  error.textContent = '';
  byId('forumCompose').hidden = true;
  forumState.board = compose.board;
  forumState.filter = 'all';
  forumState.sort = 'new';
  forumState.query = '';
  byId('forumQuery').value = '';
  renderChrome();
  renderFeed();
}
function onComposeClick(event){
  const board = event.target.closest('[data-compose-board]');
  const type = event.target.closest('[data-compose-type]');
  const template = event.target.closest('[data-compose-template]');
  const removeImage = event.target.closest('[data-compose-remove-image]');
  if (event.target.closest('#forumComposeClose')) return closeCompose();
  if (event.target.closest('#forumComposePreview')) {
    readComposeFields();
    if (!compose.title.trim()) { byId('forumComposeError').textContent = '先写标题'; return; }
    byId('forumComposeError').textContent = '';
    compose.step = 'preview';
    renderCompose();
    return;
  }
  if (event.target.closest('#forumAddPoll')) { readComposeFields(); compose.step = 'poll'; byId('forumComposeError').textContent = ''; renderCompose(); return; }
  if (event.target.closest('#forumClearPoll')) { compose.poll = null; renderCompose(); return; }
  if (event.target.closest('#forumPollDone')) return finishPoll();
  if (board) { readComposeFields(); compose.board = board.dataset.composeBoard; renderCompose(); return; }
  if (type) { readComposeFields(); compose.type = type.dataset.composeType; if (!composeType()?.poll) compose.poll = null; renderCompose(); return; }
  if (template) {
    readComposeFields();
    if (compose.poll?.template !== template.dataset.composeTemplate) {
      const next = pollTemplates[template.dataset.composeTemplate];
      compose.poll = {template:template.dataset.composeTemplate, question:next.question || compose.poll?.question || '', options:next.options.map(option => ({...option}))};
    }
    renderCompose();
    return;
  }
  if (removeImage) { compose.images.splice(Number(removeImage.dataset.composeRemoveImage), 1); renderCompose(); }
}
function openForum(board){
  ensureScreen();
  forumState.board = boardAlias[board] || 'antiques';
  forumState.filter = 'all';
  forumState.sort = 'hot';
  forumState.query = '';
  forumState.returnFocus = document.activeElement;
  byId('forumSearch').hidden = true;
  byId('forumQuery').value = '';
  byId('forumInbox').hidden = true;
  byId('forumCompose').hidden = true;
  byId('forumDetail').hidden = true;
  byId('forumMore').hidden = true;
  byId('forumReport').hidden = true;
  byId('forumSaved').hidden = true;
  byId('forumView').hidden = false;
  renderChrome();
  renderFeed();
  byId('forumBack').focus();
}
function closeForum(){
  byId('forumView').hidden = true;
  forumState.returnFocus?.focus?.();
}
const view = ensureScreen();
view.addEventListener('click', event => {
  if (event.target.closest('#forumCompose')) { onComposeClick(event); return; }
  const board = event.target.closest('[data-board]');
  const filter = event.target.closest('[data-filter]');
  const sort = event.target.closest('[data-sort]');
  const like = event.target.closest('[data-like]');
  const comment = event.target.closest('[data-comment]');
  const pollOption = event.target.closest('[data-poll-option]');
  const commentLike = event.target.closest('[data-comment-like]');
  const reply = event.target.closest('[data-reply]');
  const remove = event.target.closest('[data-delete-comment]');
  const helpful = event.target.closest('[data-helpful]');
  const reason = event.target.closest('[data-reason]');
  const saved = event.target.closest('[data-saved]');
  const reportComment = event.target.closest('[data-report-comment]');
  const inbox = event.target.closest('[data-inbox]');
  const open = event.target.closest('[data-open]');
  if (board) { forumState.board = board.dataset.board; byId('forumDetail').hidden = true; renderChrome(); renderFeed(); return; }
  if (filter) { forumState.filter = filter.dataset.filter; renderChrome(); renderFeed(); return; }
  if (sort) { forumState.sort = sort.dataset.sort; renderChrome(); renderFeed(); return; }
  if (like) {
    const post = postById(like.dataset.like);
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    renderFeedAndDetail();
    return;
  }
  if (comment) { openDetail(comment.dataset.comment); return; }
  if (pollOption) { castVote(postById(forumState.postId), pollOption.dataset.pollOption); return; }
  if (commentLike) {
    const post = postById(forumState.postId);
    const item = findComment(post, commentLike.dataset.commentLike);
    if (!item) return;
    item.liked = !item.liked;
    item.likes += item.liked ? 1 : -1;
    renderDetail();
    return;
  }
  if (reply) { forumState.replyId = forumState.replyId === reply.dataset.reply ? null : reply.dataset.reply; renderDetail(); byId('forumReplyInput')?.focus(); return; }
  if (remove) {
    const post = postById(forumState.postId);
    post.comments = post.comments.filter(comment => {
      if (comment.id === remove.dataset.deleteComment) return !comment.mine;
      comment.replies = (comment.replies || []).filter(item => item.id !== remove.dataset.deleteComment || !item.mine);
      return true;
    });
    renderFeedAndDetail();
    return;
  }
  if (helpful) {
    const post = postById(forumState.postId);
    const item = post.comments.find(comment => comment.id === helpful.dataset.helpful);
    if (item && post.mine) { item.helpful = !item.helpful; renderDetail(); }
    return;
  }
  if (reason) {
    forumState.reason = reason.dataset.reason;
    byId('forumReport').querySelectorAll('[data-reason]').forEach(button => button.setAttribute('aria-pressed', String(button === reason)));
    byId('forumReportSend').disabled = false;
    return;
  }
  if (reportComment) { openReport('comment', reportComment.dataset.reportComment); return; }
  if (saved) { byId('forumSaved').hidden = true; openDetail(saved.dataset.saved); return; }
  if (inbox) { byId('forumInbox').hidden = true; openDetail(inbox.dataset.inbox); return; }
  if (open) { openDetail(open.dataset.open); return; }
  const card = event.target.closest('#forumFeed [data-post]');
  if (card && !event.target.closest('button')) openDetail(card.dataset.post);
});
byId('forumBack').onclick = closeForum;
byId('forumDetailBack').onclick = closeDetail;
byId('forumDetailLike').onclick = () => {
  const post = postById(forumState.postId);
  if (!post) return;
  post.liked = !post.liked;
  post.likes += post.liked ? 1 : -1;
  renderFeedAndDetail();
};
byId('forumDetailSave').onclick = () => {
  const post = postById(forumState.postId);
  if (!post) return;
  post.saved = !post.saved;
  renderDetail();
};
byId('forumDetailDiscuss').onclick = () => byId('forumCommentsHead')?.scrollIntoView();
byId('forumDetailInput').addEventListener('input', syncDetailSend);
byId('forumDetailSend').onclick = () => addComment(byId('forumDetailInput').value);
byId('forumDetailComposer').addEventListener('submit', event => { event.preventDefault(); addComment(byId('forumDetailInput').value); });
view.addEventListener('click', event => {
  if (event.target.id !== 'forumReplySend') return;
  addComment(byId('forumReplyInput').value, forumState.replyId);
});
byId('forumDetailMore').onclick = () => { renderDetail(); byId('forumMore').hidden = false; };
byId('forumMoreClose').onclick = () => { byId('forumMore').hidden = true; };
byId('forumReportPost').onclick = () => openReport('post', forumState.postId);
byId('forumEndPoll').onclick = () => {
  const post = postById(forumState.postId);
  if (!post || !post.mine || !post.poll) return;
  post.poll.ended = true;
  byId('forumMore').hidden = true;
  renderDetail();
};
byId('forumShowSaved').onclick = () => { byId('forumMore').hidden = true; renderSaved(); byId('forumSaved').hidden = false; };
byId('forumSavedClose').onclick = () => { byId('forumSaved').hidden = true; };
byId('forumReportClose').onclick = () => { byId('forumReport').hidden = true; };
byId('forumReportSend').onclick = () => {
  if (!forumState.reason) return;
  byId('forumReportStatus').textContent = '已提交，交由运营处理';
  byId('forumReportSend').disabled = true;
};
byId('forumSearchBtn').onclick = () => { const box = byId('forumSearch'); box.hidden = !box.hidden; if (!box.hidden) byId('forumQuery').focus(); };
byId('forumQuery').addEventListener('input', event => { forumState.query = event.target.value; renderFeed(); });
byId('forumSearch').addEventListener('submit', event => event.preventDefault());
byId('forumInboxBtn').onclick = () => {
  byId('forumInboxList').innerHTML = posts.flatMap(post => post.comments.slice(-1).map(comment => `<button type="button" data-inbox="${post.id}"><strong>${esc(comment.author)} · ${esc(post.title)}</strong><span>${esc(comment.text)}</span></button>`)).join('');
  byId('forumInbox').hidden = false;
};
byId('forumInboxClose').onclick = () => { byId('forumInbox').hidden = true; };
byId('forumPublish').onclick = openCompose;
byId('forumComposeForm').addEventListener('submit', event => { event.preventDefault(); publishPost(); });
view.addEventListener('change', event => {
  const input = event.target;
  if (input.id === 'forumComposeImages') readImageFile(input.files?.[0], src => { if (compose.images.length < 3) compose.images.push(src); renderCompose(); });
  if (input.id === 'forumPollImageA' || input.id === 'forumPollImageB') {
    const index = input.id === 'forumPollImageA' ? 0 : 1;
    readImageFile(input.files?.[0], src => { if (compose.poll) compose.poll.options[index].image = src; renderCompose(); });
  }
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || byId('forumView').hidden) return;
  if (!byId('forumReport').hidden) { byId('forumReport').hidden = true; return; }
  if (!byId('forumSaved').hidden) { byId('forumSaved').hidden = true; return; }
  if (!byId('forumMore').hidden) { byId('forumMore').hidden = true; return; }
  if (!byId('forumDetail').hidden) return closeDetail();
  if (!byId('forumInbox').hidden) { byId('forumInbox').hidden = true; return; }
  if (!byId('forumCompose').hidden) return closeCompose();
  closeForum();
});
window.jianxOpenForum = openForum;
window.jianxForum = {open: openForum, close: closeForum, posts};
})();
