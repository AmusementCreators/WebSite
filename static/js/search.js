const fuseOptions = {
    shouldSort: true,
    threshold: 0.6,
    useExtendedSearch: true,
    keys: [ 'title', 'summary', 'body', 'tags', 'authors' ]
};

const searchQueryElem = document.getElementById('search-query')
const searchMsgElem = document.getElementById('search-message');
const searchResultElem = document.getElementById('search-results');

var fuse = null;


function withCheck(x, f) {
    return x ? f() : '';
}

async function search(word) {

    if (word === '') {
        searchResultElem.innerHTML = '';
        searchMsgElem.textContent = "検索するキーワードを入力してください。";
        return;
    }
    
    if (fuse === null) {
        const data = await fetch('/index.json');
        const list = await data.json();
        fuse = new Fuse(list, fuseOptions);
    }
    
    const results = await fuse.search(word);
    
    if (results.length === 0) {
        searchResultElem.innerHTML = '';
        searchMsgElem.textContent = "見つかりませんでした。";
        return;
    }

    console.log(results);

    searchMsgElem.textContent = `${results.length}件見つかりました。`;
    const htmlString = results.map((x) => {
        const item = x.item;
            return `
<div style="display: flex; padding: 20px;" class="relative w-100 mb4 bg-white nested-copy-line-height">

<!--
    <div>
        <a href="${item.url}">
            <img alt="" itemprop="image" src="${item.image}" class="image">
        </a>
    </div>
-->

    <div class="description">
        <a href="${item.url}" style="font-weight: bold;">${item.title}</a>
        <div class="nested-links f5 lh-copy nested-copy-line-height">${item.summary}...</div>
        <div class="f6 mv4 dib tracked">${item.date}</div>

${withCheck(item.authors !== null,_ => `
        <div class="authors">
            By
            ${item.authors.map((author) =>
                `<strong class="author"><a href="/authors/${author.replaceAll(' ', '-').toLowerCase()}">${author}</a></strong>`
            ).join(', ')}
        </div>`)}

${withCheck(item.tags !== null, _ => `
        <div class="tags">
            ${item.tags.map((tag) =>
                `<span class="br-pill ba ph3 pv2 mb2 dib sans-serif">${tag}</span>`
            ).join('')}
        </div>`)}

    </div>
</div>`;}).join('\n');

    searchResultElem.innerHTML = htmlString;
}

// ハッシュフラグメントの値で検索を実行
function searchWithHash() {
    const hash = decodeURI(location.hash.substring(1));

    search(hash);

    // 必要があれば input 要素の値を更新
    if (searchQueryElem.value !== hash) {
        searchQueryElem.value = hash;
    }
}

function debounce(fn, interval) {
    var timer;
    return function() {
      clearTimeout(timer)
      timer = setTimeout(function() {
        fn()
      }, interval)
    }
}

searchQueryElem.addEventListener('input', (e) => {
    const f = debounce(() => {
        location.hash = encodeURI(searchQueryElem.value);
    }, 500);

    f();
});

// ハッシュフラグメント付きの URL でページを開いたときに検索
window.addEventListener('DOMContentLoaded', searchWithHash);

// ページ表示後にハッシュフラグメントが変化したら検索
window.addEventListener('hashchange', searchWithHash);
