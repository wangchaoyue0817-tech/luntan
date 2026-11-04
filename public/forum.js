(function(){
'use strict';
const forumNames = {featured:'精选', antiques:'古玩雅集', health:'健康生活家', goods:'好物研究所'};
const forumKinds = {fresh:'圈内新鲜事', craft:'懂点门道', review:'大家评', chat:'一起聊'};
const forumEntry = {home:'featured', antiques:'antiques', health:'health', goods:'goods'};
const heart = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19s-6.2-3.8-6.2-8A3.4 3.4 0 0 1 12 8.6 3.4 3.4 0 0 1 18.2 11c0 4.2-6.2 8-6.2 8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const bubble = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 16.2 4.6 19l3.4-1.1A7.2 7.2 0 1 0 6 16.2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const posts = [
  {id:'bags', board:'goods', kind:'review', featured:true, ratio:'4/3', image:'assets/forum/bags.jpg', title:'通勤包，选黑色还是棕色？', author:'小满', tone:'cyan', likes:36, comments:[{author:'阿宁', text:'棕色耐脏，通勤更省心。'},{author:'林夏', text:'黑色更好搭大衣。'}], poll:['黑色','棕色'], body:'同价位两只，五金和肩带手感接近。想听实际背过的人怎么选。'},
  {id:'bowl', board:'antiques', kind:'review', featured:true, ratio:'3/4', image:'assets/forum/bowl.jpg', title:'这只青花碗，大家帮忙看看', author:'听雨', tone:'violet', likes:28, comments:[{author:'老周', text:'先看底足和釉面，照片再补一张圈足。'}], body:'釉面和碗底都拍了。想先听第一眼印象，再决定要不要送鉴。'},
  {id:'meal', board:'health', kind:'chat', featured:true, ratio:'1/1', image:'assets/forum/meal.jpg', title:'今天的午餐，简单又满足', author:'吃好每一天', tone:'gold', likes:41, comments:[{author:'南风', text:'青菜可以再多一碟。'}], body:'米饭、番茄炒蛋、青菜和一块鱼。想换着吃的可以照着备。'},
  {id:'cream', board:'goods', kind:'craft', featured:true, ratio:'4/5', image:'assets/forum/cream.jpg', title:'用了一个月，说说真实感受', author:'阿宁', tone:'violet', likes:32, comments:[{author:'小满', text:'秋冬厚涂刚好，夏天我会减量。'}], body:'质地偏厚。白天不搓泥，晚上厚涂也可以。'},
  {id:'toy', board:'goods', kind:'fresh', featured:true, ratio:'9/16', image:'assets/forum/toy.jpg', title:'这只兔子，是不是今年的隐藏款？', author:'阿禾', tone:'cyan', likes:19, comments:[{author:'林夏', text:'帽子配色和普通款不一样。'}], body:'帽子和配色跟普通款不一样。有同好的话帮忙认一认。'},
  {id:'watch', board:'goods', kind:'craft', featured:true, ratio:'16/9', image:'assets/forum/watch.jpg', title:'表盘发黄，正常氧化还是伤了？', author:'老周', tone:'gold', likes:17, comments:[{author:'听雨', text:'走时准的话，先别急着抛光。'}], body:'走时还准。主要想看盘面颜色算不算正常旧化。'},
  {id:'jade', board:'antiques', kind:'fresh', featured:false, ratio:'2/3', image:'assets/forum/jade.jpg', title:'这块玉牌的纹样，看着顺吗？', author:'林夏', tone:'cyan', likes:14, comments:[{author:'老周', text:'光线下颜色比较匀，纹样要看刻工深浅。'}], body:'光线下颜色比较均匀。想听听玩玉的朋友怎么看纹样。'},
  {id:'plate', board:'health', kind:'craft', featured:false, ratio:'5/4', image:'assets/forum/plate.jpg', title:'晚间这一盘，蛋白和蔬菜够不够？', author:'南风', tone:'gold', likes:22, comments:[{author:'吃好每一天', text:'主食再少一点，我晚上就这样吃。'}], body:'鸡胸、青菜和一点主食。减脂期晚上想吃饱又不撑。'}
];
const state = {board:'featured', filter:'all', query:'', votes:{}, likes:{}, returnFocus:null, seq:0};
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const view = () => document.getElementById('forumView');
function visible(){
  const query = state.query.trim();
  return posts.filter(post => {
    const onBoard = state.board === 'featured' ? post.featured : post.board === state.board;
    if (!onBoard || (state.filter !== 'all' && post.kind !== state.filter)) return false;
    return !query || `${post.title}${post.author}${post.body}`.includes(query);
  });
}
function estimate(post){
  const [w, h] = post.ratio.split('/').map(Number);
  return 168 * (h / w) + 92 + (post.poll ? 40 : 0) + (post.title.length > 12 ? 18 : 0);
}
function pack(list){
  const columns = [[], []];
  const height = [0, 0];
  list.forEach(post => {
    const index = height[0] <= height[1] ? 0 : 1;
    columns[index].push(post);
    height[index] += estimate(post);
  });
  return columns;
}
function card(post){
  const liked = Boolean(state.likes[post.id]);
  const likes = post.likes + (liked ? 1 : 0);
  const vote = state.votes[post.id];
  const badge = post.featured && state.board !== 'featured' ? '<span class="forum-badge">精选</span>' : '';
  const poll = post.poll ? `<div class="forum-poll" role="group" aria-label="${esc(post.title)}">${post.poll.map((option, index) => `<button type="button" class="forum-poll-opt${vote === index ? ' is-on' : ''}" data-vote="${esc(post.id)}:${index}" aria-pressed="${vote === index}">${esc(String.fromCharCode(65 + index))} ${esc(option)}</button>`).join('')}</div>` : '';
  return `<article class="forum-card" data-post="${esc(post.id)}" style="--ar:${post.ratio}"><button type="button" class="forum-open" data-open="${esc(post.id)}" aria-label="查看：${esc(post.title)}"><span class="forum-photo">${badge}<img src="${esc(post.image)}" alt=""></span></button><div class="forum-card-body"><h3><button type="button" class="forum-title" data-open="${esc(post.id)}">${esc(post.title)}</button></h3><p class="forum-source">${esc(forumNames[post.board])} · ${esc(forumKinds[post.kind])}</p>${poll}<div class="forum-foot"><span class="forum-author"><i class="is-${post.tone}" aria-hidden="true">${esc(post.author.slice(0, 1))}</i>${esc(post.author)}</span><span class="forum-actions"><button type="button" class="forum-like" data-like="${esc(post.id)}" aria-pressed="${liked}" aria-label="${liked ? '取消赞' : '赞'}，${likes}">${heart}<span>${likes}</span></button><button type="button" class="forum-comment" data-open="${esc(post.id)}" aria-label="查看评论，${post.comments.length}">${bubble}<span>${post.comments.length}</span></button></span></div></div></article>`;
}
function syncTabs(){
  document.querySelectorAll('#forumView [data-board]').forEach(button => {
    const selected = button.dataset.board === state.board;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  document.querySelectorAll('#forumView [data-filter]').forEach(button => {
    button.setAttribute('aria-selected', String(button.dataset.filter === state.filter));
  });
}
function render(focusSelector){
  const feed = document.getElementById('forumFeed');
  if (!feed) return;
  const list = visible();
  feed.innerHTML = list.length ? `<div class="forum-masonry">${pack(list).map(column => `<div class="forum-col">${column.map(card).join('')}</div>`).join('')}</div>` : '<p class="forum-empty">这里还没有相关帖子</p>';
  syncTabs();
  if (focusSelector) view()?.querySelector(focusSelector)?.focus();
}
function sheet(id, open){
  const node = document.getElementById(id);
  if (!node) return;
  node.hidden = !open;
  if (open) node.querySelector('button,input,select,textarea')?.focus();
}
function openDetail(id){
  const post = posts.find(item => item.id === id);
  const node = document.getElementById('forumDetail');
  if (!post || !node) return;
  const liked = Boolean(state.likes[post.id]);
  node.innerHTML = `<div class="forum-sheet-panel"><header class="forum-sheet-head"><h2 id="forumDetailTitle">${esc(post.title)}</h2><button type="button" class="forum-icon-btn" data-close="forumDetail" aria-label="关闭帖子">×</button></header><img class="forum-detail-photo" style="--ar:${post.ratio}" src="${esc(post.image)}" alt=""><p class="forum-source">${esc(forumNames[post.board])} · ${esc(forumKinds[post.kind])}</p><p class="forum-detail-copy">${esc(post.body)}</p><button type="button" class="forum-like" data-like="${esc(post.id)}" aria-pressed="${liked}" aria-label="${liked ? '取消赞' : '赞'}，${post.likes + (liked ? 1 : 0)}">${heart}<span>${post.likes + (liked ? 1 : 0)}</span></button><ul class="forum-comments">${post.comments.map(comment => `<li><strong>${esc(comment.author)}</strong><span>${esc(comment.text)}</span></li>`).join('')}</ul></div>`;
  sheet('forumDetail', true);
}
function closeForum(){
  const node = view();
  if (!node) return;
  ['forumDetail','forumInbox','forumCompose'].forEach(id => { const sheetNode = document.getElementById(id); if (sheetNode) sheetNode.hidden = true; });
  node.hidden = true;
  document.getElementById('app')?.classList.remove('is-forum');
  state.returnFocus?.focus?.();
}
window.jianxOpenForum = function jianxOpenForum(board){
  state.returnFocus = document.activeElement;
  state.board = forumEntry[board] || 'featured';
  state.filter = 'all';
  state.query = '';
  const query = document.getElementById('forumQuery');
  const search = document.getElementById('forumSearch');
  if (query) query.value = '';
  if (search) search.hidden = true;
  document.getElementById('forumSearchBtn')?.setAttribute('aria-expanded', 'false');
  const menu = document.getElementById('menuPanel');
  if (menu) menu.hidden = true;
  document.getElementById('app')?.classList.add('is-forum');
  const node = view();
  if (!node) return;
  node.hidden = false;
  render();
  node.querySelector(`[data-board="${state.board}"]`)?.focus();
};
function bind(){
  const node = view();
  if (!node || node.dataset.bound === 'waterfall') return;
  node.dataset.bound = 'waterfall';
  document.getElementById('forumBack')?.addEventListener('click', closeForum);
  document.getElementById('forumSearchBtn')?.addEventListener('click', () => {
    const search = document.getElementById('forumSearch');
    const open = search.hidden;
    search.hidden = !open;
    document.getElementById('forumSearchBtn').setAttribute('aria-expanded', String(open));
    if (open) document.getElementById('forumQuery').focus();
  });
  document.getElementById('forumQuery')?.addEventListener('input', event => { state.query = event.target.value; render(); });
  document.getElementById('forumInboxBtn')?.addEventListener('click', () => sheet('forumInbox', true));
  document.getElementById('forumPublish')?.addEventListener('click', () => {
    document.getElementById('forumComposeError').textContent = '';
    sheet('forumCompose', true);
  });
  document.getElementById('forumCompose')?.addEventListener('submit', event => {
    event.preventDefault();
    const title = document.getElementById('forumComposeTitleInput').value.trim();
    const error = document.getElementById('forumComposeError');
    if (!title) { error.textContent = '先写标题'; return; }
    error.textContent = '';
    state.seq += 1;
    const ratios = ['3/4','4/3','1/1','2/3','16/9'];
    posts.unshift({id:`local-${state.seq}`, board:document.getElementById('forumComposeBoard').value, kind:'chat', featured:false, ratio:ratios[state.seq % ratios.length], image:'assets/forum/cream.jpg', title, author:'我', tone:'violet', likes:0, comments:[], body:document.getElementById('forumComposeBody').value.trim() || title});
    state.board = document.getElementById('forumComposeBoard').value;
    state.filter = 'all';
    document.getElementById('forumComposeTitleInput').value = '';
    document.getElementById('forumComposeBody').value = '';
    sheet('forumCompose', false);
    render();
  });
  node.addEventListener('click', event => {
    const closer = event.target.closest('[data-close]');
    if (closer) { sheet(closer.dataset.close, false); render(); return; }
    if (event.target.classList?.contains('forum-sheet')) { event.target.hidden = true; return; }
    const vote = event.target.closest('[data-vote]');
    if (vote) {
      const [id, index] = vote.dataset.vote.split(':');
      state.votes[id] = state.votes[id] === Number(index) ? undefined : Number(index);
      render(`[data-vote="${id}:${index}"]`);
      return;
    }
    const like = event.target.closest('[data-like]');
    if (like) {
      state.likes[like.dataset.like] = !state.likes[like.dataset.like];
      const detailOpen = !document.getElementById('forumDetail').hidden;
      render(`[data-like="${like.dataset.like}"]`);
      if (detailOpen) openDetail(like.dataset.like);
      return;
    }
    const opener = event.target.closest('[data-open]');
    if (opener) { openDetail(opener.dataset.open); return; }
    const board = event.target.closest('[data-board]');
    if (board) { state.board = board.dataset.board; render(`[data-board="${state.board}"]`); return; }
    const filter = event.target.closest('[data-filter]');
    if (filter) { state.filter = filter.dataset.filter; render(`[data-filter="${state.filter}"]`); }
  });
  node.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const current = event.target.closest('[data-board]');
    if (!current) return;
    const tabs = [...node.querySelectorAll('[data-board]')];
    const next = tabs[(tabs.indexOf(current) + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    state.board = next.dataset.board;
    render(`[data-board="${state.board}"]`);
    event.preventDefault();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || view()?.hidden) return;
    const openSheet = ['forumDetail','forumCompose','forumInbox'].find(id => !document.getElementById(id).hidden);
    if (openSheet) sheet(openSheet, false);
    else closeForum();
  });
  render();
}
bind();
})();
