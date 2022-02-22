+++
title = "リアルタイムリレーサーバーSquirrelayServerの紹介"
date = 2022-02-22T15:25:56+09:00
draft = false
tags = ["CSharp", "LiteNetLib", "MessagePack", "Online"]
toc = true
featured_image = ""
authors = ["wraikny"]
description = "LiteNetLibを利用したリレー"
+++

オンラインゲーム作りたくないですか？

2020年のアドベントカレンダーにて
[LiteNetLibとMessagePackで行うリアルタイム通信](/articles/advent_calendar/2020/15/)
という記事を書いたのですが、ゲームロジックをサーバーで実行するのは実行コストも実装コストも高いですし、ゲームのたびに実装する必要があって大変ですよね。

今回はそれらを汎用的に扱いやすくした、メッセージリレーサーバーSquirrelayServerの紹介です。

サーバーサイドはビルドしたバイナリを起動するだけで利用できて、クライアントサイドの開発に集中できます。

リポジトリはこちら

[wraikny/SquirrelayServer - GitHub](https://github.com/wraikny/squirrelayserver)

# SquirrelayServer実装のポイント

冒頭でリンクした記事の「前提条件とか」を読むとわかると思うのですが、オンラインゲームでは同期を取るのがとても大変で、適当に実装しては、クライアント間で状態が異なってしまう**同期ずれ**という現象が起こります。

SquirrelayServerでは**楽に導入できる汎用性を重視**したので、サーバーサイドでゲームステートは持ちません。

ではどのように同期ズレを解決するかというと、以下のような方法をとっています。

* ルームがゲームプレイ状態になると、ルーム内時刻の計測を始める。
  * ゲームメッセージがサーバーに届くと、ルーム内時刻を記録する。
* クライアントが送信したゲームメッセージは自身に送り返される。
* つまりゲームメッセージは、ルーム内時刻と共に、その時刻で順序つけられて、全てのクライアントに送られる。
* すべてのゲームステートへの処理をルーム内時刻に基づいて各クライアントで更新を行うことで、同期ズレが起きにくくなる！！

※「ゲームメッセージ」とは、**各プレイヤーが入力する、ゲーム操作を表す型**を思い浮かべてください。例えば「右に移動」とか、「銃を打つ」とか。

ただし、サーバーに届いた時間が正義という実装なので、通信環境が悪いクライアントは不利になります。
各クライアントのレイテンシを考慮したい場合は、それもゲームメッセージに含めると良いでしょう。

ここで注意点です。

サーバー内の時刻を利用してゲームの更新を行うということは、各クライアントでの経過時間を利用してはいけないということです。

つまり、ゲームステートは以下のような実装をする必要があります。

```
class GameState
{
    void Update(ulong clientId, float elapsedSec, Message msg) { }
}
```

Altseed2ではよく`Engine.DeltaSeconds`を利用しますが、ゲームステートの更新にはそれを利用せず、こちらのサーバー内時刻を利用してください。

サーバーを介して自身の更新も行うため、60FPSの場合レイテンシが17ms程度でも往復で2~3フレームほど遅延することになります。

クライアント側のより良い実装としては、見た目上はローカルの操作を反映して、サーバーからの応答があった際にそちらで実際のステートを更新する（つまり、見た目と本当の処理を分けて記述する）ことで遅延をごまかすことはできます。

# 主な機能

通信にRUDP（LiteNetLib）を利用して、以下のような機能を実装してあります。

* サーバー接続中のクライアント数取得
* ルーム機能
  * ルームリスト取得
  * ルームリストへの非公開設定
  * ルーム作成時のパスワード設定
  * 一定間隔での`Tick`メッセージ送信
  * ルームメッセージ（ルームリストで「だれでも歓迎」とか「ガチ勢募集」とか出したい）
  * プレイヤーステータス（ルーム内で名前とか設定したい）
  * メッセージブロードキャスト
* async/await対応！

設定ファイルの記述や各メソッド等の使い方はGitHubのドキュメントに詳細があります。

[SquirrelayServer ドキュメント](https://github.com/wraikny/SquirrelayServer/tree/master/docs/ja)


# 使い方

リポジトリを用意したので、参考にしてください。
[wraikny/SquirrelayServer-example - GitHub](https://github.com/wraikny/SquirrelayServer-example)

1. SquirrelayServerをsubmoduleとして追加します。
```
mkdir lib
git submodule add https://github.com/wraikny/SquirrelayServer.git lib
git submodule update --init --recursive
```

2. 設定ファイルを記述します。サーバーとクライアント共通でOKです。（クライアントでは`netConfig`部分のみ利用されます。）

```
cp lib/SquirrelayServer/src/SquirrelayServer/config/config.json .
```

3. SquirrelayServerへのプロジェクト参照を追加します。

```
dotnet add src/ExampleClient reference lib/SquirrelayServer/src/SquirrelayServer
```

4. ローカルデバッグ時には、サーバーはSquirrelayServer.Appを実行するだけです。

```
dotnet run --project lib/SquirrelayServer/src/SquirrelayServer.App config.json
```


5. 以下、クライアントサイドの話です。

6. [Types.cs](https://github.com/wraikny/SquirrelayServer-example/blob/master/src/ExampleClient/Types.cs)のように型定義します。

7. [GameNode.cs](https://github.com/wraikny/SquirrelayServer-example/blob/master/src/ExampleClient/Game/GameNode.cs)と[PlayerNode.cs](https://github.com/wraikny/SquirrelayServer-example/blob/master/src/ExampleClient/Game/PlayerNode.cs)のようにゲームロジックを実装します。ここでは簡単に、マウスに追従する矩形を表示しています。

8. [ClientNode.cs](https://github.com/wraikny/SquirrelayServer-example/blob/master/src/ExampleClient/ClientNode.cs)のように、`Client<,,>`クラスの管理や更新などを行います。ここでは例なので簡単に書いていますが、本来はルームUIを実装してそれを操作する想定です。

9. [Program.cs](https://github.com/wraikny/SquirrelayServer-example/blob/master/src/ExampleClient/Program.cs)のように、`ClientNode`と`GameNode`を受け渡してあげます。

# おわりに
わたしもまだ簡単なサンプルプログラムくらいしか組んでないので、ちゃんと遊べるもの作りたいですね～。

あとは、サーバーサイドに興味ある人とか、こういう機能欲しいとか、バグが有るとか、issueからでもcommitお待ちしてます！
