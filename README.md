[![Netlify Status](https://api.netlify.com/api/v1/badges/476617df-8e54-446f-8e90-47c78bede10c/deploy-status)](https://app.netlify.com/sites/hungry-albattani-56f646/deploys)
# Overview
AmusementCreatorsの公式HPのソースです。

# Usage
詳しい利用法や運用方法(**下準備**、**記事の作成**、**自己紹介の追加** 等)は[wiki](https://github.com/AmusementCreators/WebSite/wiki)を御覧ください。

## Install Hugo
```bash
# Homebrew, Linuxbrew (macOS, Linux) を使う場合
brew install hugo

# Chocolately (Windows) を使う場合
choco install hugo -confirm 

# Scoop (Windows）を使う場合
scoop install hugo
```

## Quick Start

```bash
git clone {fork repo}
git submodule update --init --recursive
hugo server -D
```

## 変更履歴
- `layouts/index.html`
   - `contents`直下のすべてのセクションのRecently Postsを表示するように変更
