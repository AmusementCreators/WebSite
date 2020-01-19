+++
title =  "Pull Requestの送り方"
date = 2020-01-19T01:53:21+09:00
draft = false
tags = [ "git" ]
toc = true
featured_image = ""
authors = ["wraikny(れいにー)"]
description = ""
+++

# はじめに
ある程度gitを使っている初心者向け。Pull Requestを殆ど使ったことない人のための記事。

# Pull Requestって？
Pull Requestとは、**あるbranch(A)から別のbranch(B)へのMergeをお願いする機能**です。
なお、GitHubでは**Pull Request**、GitLabでは**Merge Request**と呼ばれます。

最初は勘違いする人もいますが、commit単位ではありません。

そのため、

1. 一度branch Aからbranch BへのPRを開いて
1. 新たなcommitをbranch Aへpushすれば
1. それはbranch BへのPull Requestに反映される

ということになります。

# Pull Requestを送ってみよう

[Git練習用のリポジトリ](https://github.com/AmusementCreators/GitPractice)を作ってみました。

今回はこちらの[Siritori-01.txt](https://github.com/AmusementCreators/GitPractice/blob/master/Siritori-01.txt)というファイルに新しい単語を追加することを目標としてみます。

```txt
しりとり
リス
```

## まずはforkする
[GitPractice](https://github.com/AmusementCreators/GitPractice)リポジトリ右上のforkボタンを押して、自分のリポジトリとして複製しましょう。

**{あなたのid}/GitPractice**というリポジトリが作成されるので、これをlocalにcloneしましょう。

ここでは[wraikny/GitPractice](https://github.com/wraikny/GitPractice)を使います。

また、元の **AmusementCreators/GitPractice**リポジトリもremote branchに追加しておくと楽です。

CUIなら

```
$ git clone git@github.com:{あなたのid}/GitPractice.git
$ git remote add upstream git@github.com:AmusementCreators/GitPractice.git
```

という感じですね。

GitKrakenを使っている場合は、左のREMOTEタブから追加できます。

![](/images/git/pull_request-01.png)

## 編集してcommitする

gitをある程度使ったことのある方はわかると思います。

1. ファイルを編集
2. 変更をStage
3. commit
4. Remoteへpush

Siritori-01.txt
```diff
しりとり
リス
+ スイカ
```

CUIなら

```bash
$ git add Siritori-01.txt
$ git commit -m "Add new word in しりとり"
$ git push
```

## GitHubのウェブサイトからPRを開く
forkしたリポジトリを開きます。

![](/images/git/pull_request-02.png)

`New pull request`というボタンを選択することで、以下のような画面に移ります。


![](/images/git/pull_request-03.png)

**Able to merge**と表示されていいる(conflictが発生していない)ことを確認して、
`Create pull request`ボタンを押します。
PRのタイトルやメッセージを編集すれば、[Pull Requestを作成](https://github.com/AmusementCreators/GitPractice/pull/1)することができます。

# Pull Requestの内容を修正しよう
PRを開くことができましたが、リポジトリの管理者から以下のように修正を求められるかもしれません。

![](/images/git/pull_request-04.png)

この場合は、一度PRをcloseして新しくPRを開き直す必要があるのでしょうか？

それは**違います**。
最初にも書いたとおり、Pull Requestはbranchからbranchへ送るものなので、追加でpushすることでPRの内容を変更することができます。

```diff
しりとり
リス
- スイカ
+ すき焼き
```

管理者によって承認されて、無事Mergeされました。

![](/images/git/pull_request-05.png)

最終的に、以下のように変更されたことになります。

```
*       wraikny(管理者) dab7b08   (upstream/master) Merge pull request #1 from wraikny/master
|\
| *     wraikny(あなた) 7628ca7  (origin/master) Change しりとり word
| *     wraikny(あなた) b00f99e  Add new word in しりとり
|/
*       wraikny(管理者) 0758b78  Add しりとり
*       wraikny(管理者) 5b25c32  add attributes
*       wraikny(管理者) f22e4c7  Initial commit
```


# rebaseで最新のmasterに合わせる
では、再びPull Requestを作成していきましょう。

その後の変更によって、upstream/masterの`Siritori-01.txt`は以下のような内容になっていました。

```
しりとり
リス
すき焼き
機械
岩
輪っか
かもめ
メモ帳
海牛
```

rebaseコマンドでリポジトリを最新のmasterに合わせます。

```bash
$ git rebase upstream/master
```

今はupstream/masterがlocalのmasterの延長線上にあり、これは**Fast-forward**と呼ばれる操作です。

では、次のcommitをpushします。

```diff
メモ帳
海牛
+ ウサギ
```

再び[Pull Request](https://github.com/AmusementCreators/GitPractice/pull/2)を送ってみます。

![](/images/git/pull_request-07.png)

おや、mergeできないと表示されています。
conflictしてしまいました。
とりあえずPRを送ってみます。

![](/images/git/pull_request-08.png)

`rebase`をするように言われてしまいました。

ここで一度、gitのlogを表示してみましょう。

```
*       wraikny(あなた) c946d15  (HEAD -> master, origin/master, origin/HEAD) Add ウサギ in しりとり
| *     wraikny(管理者) 3b38776  (upstream/master) Fix Animal name to カタカナ in Siritori-01
| *     wraikny(管理者) dd98ac1  Add Siritori-02.txt
|/
*       wraikny 7933534  Add しりとり words
*       wraikny dab7b08  Merge pull request #1 from wraikny/master
|\
| *     wraikny(あなた) 7628ca7  Change しりとり word
| *     wraikny(あなた) b00f99e  Add new word in しりとり
|/
*       wraikny(管理者) 0758b78  Add しりとり
*       wraikny(管理者) 5b25c32  add attributes
*       wraikny(管理者) f22e4c7  Initial commit
```

手元で編集してPull Requestを開くまでの間に、新たなcommitが行われていたのです。

今回は同じ箇所を編集してしまったことで、conflictが発生してしまいました。

そうでなくとも、最新ではないcommitから編集をしてしまったせいで、実際の複雑なプログラムでは依存関係が壊れているかもしれません。


また、gitのlogも見にくくなってしまいます。

こんな状況で活躍するのが`rebase`コマンドです。

```bash
$ git rebase upstream/master
First, rewinding head to replay your work on top of it...
Applying: Add ウサギ in しりとり
error: Failed to merge in the changes.
Using index info to reconstruct a base tree...
M       Siritori-01.txt
Falling back to patching base and 3-way merge...
Auto-merging Siritori-01.txt
CONFLICT (content): Merge conflict in Siritori-01.txt
Patch failed at 0001 Add ウサギ in しりとり
The copy of the patch that failed is found in: .git/rebase-apply/patch

Resolve all conflicts manually, mark them as resolved with
"git add/rm <conflicted_files>", then run "git rebase --continue".
You can instead skip this commit: run "git rebase --skip".
To abort and get back to the state before "git rebase", run "git rebase --abort".
```

`Siritori-01.txt`をVSCodeで見てみます。

![](/images/git/pull_request-06.png)

このように、どちらの変更を採用するかを適切に解消する必要があります。
この場合は `ウミウシ -> ウサギ` とするのが適切でしょうから、そのようにしてあげましょう。

`両方の変更を取り込む`を選択すると以下のようになるので、

```
メモ帳
ウミウシ
海牛
ウサギ
```

`海牛`を削除してファイルを保存してから
```diff
メモ帳
ウミウシ
- 海牛
ウサギ
```

```bash
$ git add Siritori-01.txt

$ git rebase --continue
Applying: Add ウサギ in しりとり

```

conflictが解消できたので、pushしてみましょう。
rebaseしたことで、force pushが必要になっています。

```
$ $ git push --force-with-lease
```

(force pushは強制的に上書きしてしまうので、複数人で編集しているbranchでは使わないようにしましょう。
まあ、そのためにbranchを分ける事が必要になるのですが)

Pull Requestが更新されています。
conflictが解消されたことで、管理者によってmergeされました。

![](/images/git/pull_request-09.png)

では、gitのlogを見てみます。

```
*       wraikny(管理者) cb8aa77  (upstream/master) Merge pull request #2 from wraikny/master
|\
| *     wraikny(あなた) 1d537f6  (HEAD -> master, origin/master, origin/HEAD) Add ウサギ in しりとり
|/
*       wraikny(管理者) 3b38776  Fix Animal name to カタカナ in Siritori-01
*       wraikny(管理者) dd98ac1  Add Siritori-02.txt
*       wraikny(管理者) 7933534  Add しりとり words
*       wraikny(管理者) dab7b08  Merge pull request #1 from wraikny/master
|\
| *     wraikny(あなた) 7628ca7  Change しりとり word
| *     wraikny(あなた) b00f99e  Add new word in しりとり
|/
*       wraikny(管理者) 0758b78  Add しりとり
*       wraikny(管理者) 5b25c32  add attributes
*       wraikny(管理者) f22e4c7  Initial commit
```

先程は二股に別れていましたが、`rebase`によって綺麗に1本のlogになっています。
`upstream/master`の最新のcommit`3b38776`から`1d537f6`のcommitができていることになっていますね。

また、`rabase`のかわりに`merge`を使っていた場合は、無駄なmerge commitが発生していました。
何度もレビューを受けて編集する間にmergeも何回も行うことになれば、履歴が見にくくなってしまいますね。

ただ、rebaseは歴史改変の一種なので、使い所は気をつけましょう。
自分は今回のようにPR時に最新に合わせる使い方がほとんどですし、それくらいが良いのではないでしょうか。

あまりmasterなどに対してやる操作では無いと思います。

# おわりに
以下は練習用のリポジトリとして好きにPRを投げたりしてみてください。

[AmusementCreators/GitPractice - GitHub](https://github.com/AmusementCreators/GitPractice)