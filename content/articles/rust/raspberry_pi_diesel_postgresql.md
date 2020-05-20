+++
title =  "Raspberry_pi 4にPostgreSQLとdiesel_cliを導入した"
date = 2020-03-10T23:28:49+09:00
draft = false
tags = ["Raspberry Pi", "Rust", "diesel", "diesel_cli", "PostgreSQL"]
toc = true
featured_image = "https://user-images.githubusercontent.com/8509057/76323013-74a3fd00-6327-11ea-94b9-b95a243dafd6.jpg"
authors = ["Kaisei Yokoyama"]
description = ""
aliases = ["/post/articles/rust/raspberry_pi_diesel_postgresql"]
+++

## TL;DR
`PostgreSQL`をORM越しに使う時は、大体`libpq-dev`をインストールする必要があります。

macOSであれば`brew install postgresql`だけで`libpq-dev`もインストールされるようですが、`apt-get`コマンドでのインストールではそうもいかないようです。

## 事の始まり
まだ冬の気配の残る某日、NASを作ろうと思い立ったところ、突如として意識を失い、次の瞬間には`Raspberry Pi 4`が家に生えていました。

そしてクレジットカードの請求額に8000JPYが加算されていました。

![やせいのラズパイ](https://user-images.githubusercontent.com/8509057/76323013-74a3fd00-6327-11ea-94b9-b95a243dafd6.jpg)

`samba`を導入しNASとしての気ままな生を謳歌するラズパイでしたが、そんな彼[^1] にも転機が訪れます。所用でウェブサービスのデモ機として使われることになったのです。

これまで自宅でリモートワーク[^2]を続けてきた`Raspberry Pi 4`、ついに出勤の季節となりました。

## セットアップ
ウェブサービスではローカルの`PostgreSQL`を[`diesel`](https://github.com/diesel-rs/diesel)を介して利用していました。  
そのために必要な環境をラズパイに整える手順は以下の通りです。

### `PostgreSQL`利用環境の導入
#### `PostgreSQL`のインストール
```bash
sudo apt-get install postgresql
```

#### `libpq-dev`のインストール
```bash
sudo apt-get install libpq-dev
```

`libpq-dev`並びにそれに準じる環境がないと、`diesel_cli`のインストール時にエラーが出ます。`sudo apt-get install postgresql`で`PostgreSQL`のセットアップはおしまいだと思っていたので、悩みました。

元々の開発環境がmacだったので、`brew install postgresql`のコマンド一つで、知らないうちに`libpq-dev`もインストールできていたようです。  
`homebrew`は高機能なんですね……

### `Rust`開発環境の導入
```bash
curl https://sh.rustup.rs -sSf | sh
```

### `diesel_cli`開発環境の導入
```bash
cargo install diesel_cli --no-default-features --features "postgres"
```

`features`の指定におかしいところがあると、`MySQL`とか`sqlite`がないと怒られます。

これで`PostgreSQL`, `diesel_cli`の導入ができました。  
どなたのためになるかはわかりませんが、ご参考までにどうぞ。

## 参考文献
- https://superuser.com/questions/296873/install-libpq-dev-on-mac-os

[^1]: 便宜的な呼称。
[^2]: コロナウイルスの流行に伴う労働環境の見直しとは無関係と思われる。