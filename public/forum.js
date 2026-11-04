(function(){
'use strict';
const byId = id => document.getElementById(id);
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const boardAlias = {home:'featured', featured:'featured', antiques:'antiques', health:'health', goods:'goods'};
const filterChannel = {all:'全部', fresh:'圈内新鲜事', craft:'懂点门道', review:'大家评', chat:'一起聊'};
const posts = [
  {id:'bowl', board:'antiques', channel:'大家评', author:'听雨', avatar:'is-gold', topic:'瓷器 · 大家评', title:'这只青花碗，底足怎么看？', images:['assets/forum/bowl.jpg','assets/forum/bowl.jpg','assets/forum/bowl.jpg'], verdict:null, likes:28, liked:false, at:40, rank:1, comments:[
    {author:'老周', text:'先看圈足是否沾砂，再对一下修足的刀痕是否顺。'},
    {author:'阿宁', text:'青花发色偏灰，建议补一张足墙内侧。'},
    {author:'小满', text:'我倾向再看釉面缩釉，单看底足还不够。'}
  ]},
  {id:'coin', board:'antiques', channel:'懂点门道', author:'老周', avatar:'is-cyan', topic:'钱币 · 懂点门道', title:'包浆怎么看？先看这三个细节', images:['assets/forum/coin.svg','assets/forum/coin-detail.svg'], likes:16, liked:false, at:30, rank:2, comments:[
    {author:'听雨', text:'高点亮、低点暗，才像长期盘玩出来的。'},
    {author:'陈叔', text:'方孔内壁如果发贼光，要小心后做。'}
  ]},
  {id:'expo', board:'antiques', channel:'圈内新鲜事', author:'圈内新鲜事', avatar:'is-violet', topic:'', title:'周末收藏展，有哪些值得看？', source:'展会公告', images:[], likes:9, liked:false, at:20, rank:3, comments:[
    {author:'老周', text:'周六上午瓷器专场人少一些。'}
  ]},
  {id:'photo', board:'antiques', channel:'一起聊', author:'小林', avatar:'is-cyan', topic:'一起聊', title:'第一次上手，底足这样拍清楚吗？', images:['assets/forum/bowl-foot.svg'], likes:4, liked:false, at:50, rank:4, comments:[]},
  {id:'run', board:'health', channel:'一起聊', author:'阿麦', avatar:'is-cyan', topic:'打卡', title:'晨跑 5 公里，配速怎么才不算硬撑？', images:[], likes:11, liked:false, at:18, rank:2, comments:[
    {author:'小林', text:'能说话的配速，比盯着表更稳。'}
  ]},
  {id:'meal', board:'health', channel:'懂点门道', author:'南风', avatar:'is-cyan', topic:'饮食', title:'减脂期晚餐，一盘怎么搭配？', images:[], likes:7, liked:false, at:12, rank:3, comments:[]},
  {id:'cushion', board:'goods', channel:'大家评', author:'米果', avatar:'is-violet', topic:'美妆 · 大家评', title:'同价位气垫，哪款更抗造？', images:[], likes:21, liked:false, at:22, rank:1, comments:[
    {author:'阿麦', text:'看持妆可以先比下午三点的鼻翼。'}
  ]},
  {id:'bag', board:'goods', channel:'懂点门道', author:'周周', avatar:'is-gold', topic:'包袋 · 懂点门道', title:'这只包的五金，怎么判断翻新？', images:[], likes:13, liked:false, at:16, rank:2, comments:[]}
];
const forumState = {board:'antiques', filter:'all', sort:'hot', query:'', postId:null, returnFocus:null};
function ensureScreen(){
  let view = byId('forumView');
  if (!view) {
    view = document.createElement('section');
    view.id = 'forumView';
    (byId('app') || document.body).append(view);
  }
  view.className = 'forum-view';
  view.setAttribute('aria-label', '论坛');
  if (view.querySelector('[data-sort]') && view.querySelector('#forumCommentSend')) return view;
  view.innerHTML = `<header class="forum-top"><button type="button" class="forum-icon-btn" id="forumBack" aria-label="返回首页"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.5 6 8.5 12l6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button><h1>论坛</h1><button type="button" class="forum-icon-btn" id="forumSearchBtn" aria-label="搜索帖子" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.2" stroke="currentColor" stroke-width="1.8"/><path d="M16 16.5 20 20.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button><button type="button" class="forum-icon-btn" id="forumInboxBtn" aria-label="消息"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 16.5 4 20l4.2-1.4A8.2 8.2 0 1 0 6 16.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg><i class="forum-dot" aria-hidden="true"></i></button></header><form id="forumSearch" class="forum-search" hidden role="search"><label for="forumQuery">搜索帖子</label><input id="forumQuery" type="search" maxlength="40" placeholder="标题或作者"></form><div class="forum-board-track" role="tablist" aria-label="论坛板块"><button type="button" role="tab" data-board="featured">精选</button><button type="button" role="tab" data-board="antiques" aria-selected="true">古玩雅集</button><button type="button" role="tab" data-board="health">健康生活家</button><button type="button" role="tab" data-board="goods">好物研究所</button></div><div class="forum-channel-row"><div class="forum-filters" role="tablist" aria-label="话题"><button type="button" role="tab" data-filter="all" aria-selected="true">全部</button><button type="button" role="tab" data-filter="fresh">圈内新鲜事</button><button type="button" role="tab" data-filter="craft">懂点门道</button><button type="button" role="tab" data-filter="review">大家评</button><button type="button" role="tab" data-filter="chat">一起聊</button></div><div class="forum-sort" aria-label="排序"><button type="button" data-sort="hot" aria-pressed="true">推荐</button><span aria-hidden="true">·</span><button type="button" data-sort="new">最新</button></div></div><div class="forum-feed" id="forumFeed"></div><button type="button" class="forum-publish" id="forumPublish"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 19.5h4L19 9a2.1 2.1 0 0 0-3-3L5.5 16.5v3Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg><span>发布</span></button><div id="forumComments" class="forum-sheet" hidden role="dialog" aria-modal="true" aria-labelledby="forumCommentsTitle"><div class="forum-sheet-panel"><header class="forum-sheet-head"><h2 id="forumCommentsTitle">评论</h2><button type="button" class="forum-icon-btn" id="forumCommentsClose" aria-label="关闭评论">×</button></header><div class="forum-comments" id="forumCommentList"></div><form id="forumComposer"><label for="forumCommentInput">评论</label><textarea id="forumCommentInput" maxlength="200" placeholder="写下你的看法"></textarea><p id="forumCommentStatus" class="forum-note" role="status"></p><button type="button" class="forum-submit" id="forumCommentSend" disabled>发送</button></form></div></div><div id="forumInbox" class="forum-sheet" hidden role="dialog" aria-modal="true" aria-labelledby="forumInboxTitle"><div class="forum-sheet-panel"><header class="forum-sheet-head"><h2 id="forumInboxTitle">消息</h2><button type="button" class="forum-icon-btn" id="forumInboxClose" aria-label="关闭消息">×</button></header><div class="forum-inbox" id="forumInboxList"></div></div></div><form id="forumCompose" class="forum-sheet" hidden role="dialog" aria-modal="true" aria-labelledby="forumComposeTitle"><div class="forum-sheet-panel"><header class="forum-sheet-head"><h2 id="forumComposeTitle">发布</h2><button type="button" class="forum-icon-btn" id="forumComposeClose" aria-label="关闭发布">×</button></header><label for="forumComposeTitleInput">标题</label><input id="forumComposeTitleInput" maxlength="32"><label for="forumComposeBody">正文</label><textarea id="forumComposeBody" maxlength="180"></textarea><p class="forum-note">只保存在本次浏览。</p><p id="forumComposeError" class="forum-error" role="status"></p><button type="submit" class="forum-submit">发布</button></div></form>`;
  return view;
}
function postById(id){return posts.find(post => post.id === id);}
function visiblePosts(){
  const channel = filterChannel[forumState.filter];
  const query = forumState.query.trim();
  return posts.filter(post => (forumState.board === 'featured' || post.board === forumState.board) && (forumState.filter === 'all' || post.channel === channel) && (!query || `${post.title}${post.author}${post.topic}`.includes(query))).sort((a, b) => forumState.sort === 'new' ? b.at - a.at : a.rank - b.rank);
}
function thumb(on){return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 11v9H4v-9h3Zm2 9h7.2a2 2 0 0 0 2-1.6l1.2-6A2 2 0 0 0 17.4 10H14V6.4A2.4 2.4 0 0 0 11.6 4L9 10v10Z" fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`;}
function bubble(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16.5 4 20l4.2-1.6A8 8 0 1 0 6 16.5Z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';}
function shots(post){
  if (post.images.length >= 3) {
    const crop = ['is-main','is-foot','is-glaze'];
    return `<div class="forum-mosaic">${post.images.slice(0, 3).map((src, index) => `<img class="${crop[index]}" src="${src}" alt="">`).join('')}</div>`;
  }
  if (post.images.length) return `<div class="forum-pair">${post.images.map(src => `<img src="${src}" alt="">`).join('')}</div>`;
  return '';
}
function verdict(post){
  if (!('verdict' in post)) return '';
  const button = (value, label) => `<button type="button" data-vote="${value}" aria-pressed="${post.verdict === value}">${label}</button>`;
  return `<div class="forum-verdict"><p>网友判断</p><div class="forum-verdict-row">${button('real','真')}${button('fake','假')}${button('unsure','看不准')}</div></div>`;
}
function renderFeed(){
  const list = visiblePosts();
  byId('forumFeed').innerHTML = list.length ? list.map(post => `<article class="forum-post" data-post="${post.id}"><header class="forum-post-head"><i class="forum-avatar ${post.avatar}" aria-hidden="true"></i><div class="forum-post-id"><strong>${esc(post.author)}</strong>${post.topic ? `<span>${esc(post.topic)}</span>` : ''}</div></header><h3 class="forum-title">${esc(post.title)}</h3>${shots(post)}${post.source ? `<p class="forum-source">来源：${esc(post.source)}</p>` : ''}${verdict(post)}<div class="forum-actions"><button type="button" class="forum-like" data-like="${post.id}" aria-pressed="${post.liked}" aria-label="${post.liked ? '取消赞' : '点赞'}">${thumb(post.liked)}<span>${post.likes}</span></button><button type="button" class="forum-comment" data-comment="${post.id}" aria-label="评论">${bubble()}<span>${post.comments.length}</span></button></div></article>`).join('') : '<p class="forum-empty">还没有相关帖子</p>';
}
function renderChrome(){
  document.querySelectorAll('#forumView [data-board]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.board === forumState.board)));
  document.querySelectorAll('#forumView [data-filter]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.filter === forumState.filter)));
  document.querySelectorAll('#forumView [data-sort]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.sort === forumState.sort)));
}
function renderComments(){
  const post = postById(forumState.postId);
  if (!post) return;
  byId('forumCommentsTitle').textContent = `评论 ${post.comments.length}`;
  byId('forumCommentList').innerHTML = post.comments.length ? post.comments.map(comment => `<article><strong>${esc(comment.author)}</strong><span>${esc(comment.text)}</span></article>`).join('') : '<p class="forum-empty">还没有评论，来留第一句</p>';
}
function syncCommentSend(){byId('forumCommentSend').disabled = !byId('forumCommentInput').value.trim();}
function openComments(id){
  forumState.postId = id;
  byId('forumCommentInput').value = '';
  byId('forumCommentStatus').textContent = '';
  syncCommentSend();
  renderComments();
  byId('forumComments').hidden = false;
  byId('forumCommentInput').focus();
}
function closeComments(){
  byId('forumComments').hidden = true;
  document.querySelector(`#forumView [data-comment="${forumState.postId}"]`)?.focus();
  forumState.postId = null;
}
function addComment(){
  const post = postById(forumState.postId);
  const text = byId('forumCommentInput').value.trim();
  if (!post || !text) return;
  post.comments.push({author:'我', text});
  byId('forumCommentInput').value = '';
  byId('forumCommentStatus').textContent = '已加入讨论';
  syncCommentSend();
  renderComments();
  renderFeed();
}
function publishPost(){
  const title = byId('forumComposeTitleInput').value.trim();
  if (!title) { byId('forumComposeError').textContent = '先写标题'; return; }
  const board = forumState.board === 'featured' ? 'antiques' : forumState.board;
  const body = byId('forumComposeBody').value.trim();
  posts.unshift({id:`mine-${posts.length + 1}`, board, channel: forumState.filter === 'all' ? '一起聊' : filterChannel[forumState.filter], author:'我', avatar:'is-violet', topic:'一起聊', title, images:[], likes:0, liked:false, at:Date.now(), rank:0, comments:body ? [{author:'我', text:body}] : []});
  byId('forumCompose').hidden = true;
  forumState.query = '';
  byId('forumQuery').value = '';
  renderFeed();
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
  byId('forumComments').hidden = true;
  byId('forumInbox').hidden = true;
  byId('forumCompose').hidden = true;
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
  const board = event.target.closest('[data-board]');
  const filter = event.target.closest('[data-filter]');
  const sort = event.target.closest('[data-sort]');
  const like = event.target.closest('[data-like]');
  const comment = event.target.closest('[data-comment]');
  const vote = event.target.closest('[data-vote]');
  const inbox = event.target.closest('[data-inbox]');
  if (board) { forumState.board = board.dataset.board; renderChrome(); renderFeed(); }
  if (filter) { forumState.filter = filter.dataset.filter; renderChrome(); renderFeed(); }
  if (sort) { forumState.sort = sort.dataset.sort; renderChrome(); renderFeed(); }
  if (like) {
    const post = postById(like.dataset.like);
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    renderFeed();
  }
  if (comment) openComments(comment.dataset.comment);
  if (vote) {
    const post = postById(vote.closest('[data-post]').dataset.post);
    post.verdict = post.verdict === vote.dataset.vote ? null : vote.dataset.vote;
    renderFeed();
  }
  if (inbox) { byId('forumInbox').hidden = true; openComments(inbox.dataset.inbox); }
});
byId('forumBack').onclick = closeForum;
byId('forumSearchBtn').onclick = () => { const box = byId('forumSearch'); box.hidden = !box.hidden; if (!box.hidden) byId('forumQuery').focus(); };
byId('forumQuery').addEventListener('input', event => { forumState.query = event.target.value; renderFeed(); });
byId('forumSearch').addEventListener('submit', event => event.preventDefault());
byId('forumInboxBtn').onclick = () => {
  byId('forumInboxList').innerHTML = posts.flatMap(post => post.comments.slice(-1).map(comment => `<button type="button" data-inbox="${post.id}"><strong>${esc(comment.author)} · ${esc(post.title)}</strong><span>${esc(comment.text)}</span></button>`)).join('');
  byId('forumInbox').hidden = false;
};
byId('forumInboxClose').onclick = () => { byId('forumInbox').hidden = true; };
byId('forumPublish').onclick = () => { byId('forumComposeError').textContent = ''; byId('forumCompose').hidden = false; byId('forumComposeTitleInput').focus(); };
byId('forumComposeClose').onclick = () => { byId('forumCompose').hidden = true; };
byId('forumCompose').addEventListener('submit', event => { event.preventDefault(); publishPost(); });
byId('forumCommentsClose').onclick = closeComments;
byId('forumCommentInput').addEventListener('input', syncCommentSend);
byId('forumCommentSend').onclick = addComment;
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || byId('forumView').hidden) return;
  if (!byId('forumComments').hidden) return closeComments();
  if (!byId('forumInbox').hidden) { byId('forumInbox').hidden = true; return; }
  if (!byId('forumCompose').hidden) { byId('forumCompose').hidden = true; return; }
  closeForum();
});
window.jianxOpenForum = openForum;
window.jianxForum = {open: openForum, close: closeForum, posts};
})();
