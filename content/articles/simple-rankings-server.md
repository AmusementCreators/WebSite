+++
title =  "自作ゲームに手軽にオンラインランキングを導入しよう！"
date = 2020-04-26T06:03:55+09:00
draft = false
tags = ["Online", "Ranking", "CSharp", "FSharp"]
toc = true
featured_image = ""
authors = ["wraikny(れいにー)"]
description = "拙作のSimpleRankingsServerを利用して手軽に"
aliases = ["/post/articles/simple-rankings-server"]
+++

世界中の人とゲームスコアを競い合おう！

# 概要

拙作の
[Simple Rankings Server](https://github.com/wraikny/simple-rankings-server)
をつかって、ゲームに手軽にオンラインスコアランキング機能を実装する記事です。

Amusement CreatorsのVPSサーバーで稼働しているので、内部の人は設定ファイルを追記してプログラム再起動するだけで使えます！！

また、C#とF#でのクライアント側の
[サンプルコード](https://github.com/wraikny/simple-rankings-server/tree/master/sample)
を用意してあり、ライブラリ相当の1ファイルをコピペするだけで簡単に使えます。

# サーバー側の設定 (3ステップ)

## サーバーに実行ファイルを置く (1/3)
（AmuCre鯖を使うならデプロイ済みなのでスキップ）

1. [Simple Rankings Server](https://github.com/wraikny/simple-rankings-server)をcloneする。

2. Build (シングルバイナリを生成)
    ```bash
    dotnet tool restore
    dotnet paket restore
    dotnet fake build -t Publish
    ```

3. sshなどして`publish/linux-x64/SimpleRankingsServer`と`config.json`をサーバーに置く。

4. `config.json`の`port`,`directory`等を設定してファイルを実行する。

## configに設定を記述 (2/3)

サーバーにsshなどで入りましょう。
ファイル編集のおすすめは[CyberDuck](https://cyberduck.io/)。

(AmuCre鯖を使うなら：ssh周りは鯖管等に手伝ってもらおう！)

以下のようなコードがあります。

**config.json**
```json
{
    "directory": "databases",

    "port": 12345,

    "games": {
        "SamplGame": {
            "username": "sample",
            "password": "sample",
            "tables": {
                "SampleTable": {
                    "Score1": "Int",
                    "Score2": "Float",
                    "Name": "Text"
                },
                "SampleTable2": {
                    "Score1": "Text",
                    "Name": "Text"
                }
            }
        }
    }
}
```

- `games`: ここにゲームごとの設定を追記します。

    なお、この名前はDBファイル名とAPIエンドポイント名に使われます。
    できる限り英数などを使ってください（日本語とかはダメ！）

    また、他のゲームと名前が被らないようにしてください。

- `username`と`password`: Basic認証に用います。

- `tables`: ここに各ゲームのテーブル構造を定義します。

    テーブルの名前が被らないようにしてください。

    テーブルの型に指定できるのは`Int`,`Float`,`Text`となっています。

なお、一度DBが作成された後はDB定義を書き換えないでください。


<details>
<summary>詳細なデータ構造</summary>

---

```FSharp
type TableType = Int | Float | Text

type TableConfig = Map<string, TableType>

type GameConfig = {
  username : string
  password : string
  tables: Map<string, TableConfig>
}

type Config = {
  port : uint16
  directory : string
  games : Map<string, GameConfig>
}
```

---

</details>

では、今回はこんな風にコードを追加します。

```json
{
    "games": {
        "SampleGame": {
            "$comment": "省略"
        },
        "wraiknysTutorialSTG": {
            "username": "hoge",
            "password": "fuga",
            "tables": {
                "ScoreTable": {
                    "Score": "Int",
                    "Time": "Float",
                    "Name": "Text"
                }
            }
        }
    }
}
```

## SimpleRankingsServerを(再)起動する (3/3)
configを書き換えたら、プログラムを再起動します。
tmuxを利用する前提で話を進めます。

### 再起動する場合
(AmuCre鯖を使うならこっち)

```bash
# ssh接続済み

$ tmux a -t SimpleRankingsServer # tmuxセッションを再開
# -----------------------------------------
# Ctrl + C でプログラムを停止
$ ./SimpleRankingsServer # プログラムを起動
# Ctrl + B その後 D と押してセッションをデタッチ
# -----------------------------------------
```

### 新規セッションで起動する場合

こんな感じにファイルを配置しておく

```
SimpleRankingsServer
- SimpleRankingsServer
- config.json
```

なお、`config.json`で指定したポートは解放しておいてください。

```bash
# ssh接続済み

$ tmux new -s SimpleRankingsServer # 新規tmuxセッションを開始
# -----------------------------------------
$ cd SimpleRankingsServer
$ ./SimpleRankingsServer
# Ctrl + B その後 D と押してセッションをデタッチ
# -----------------------------------------
```

# クライアントの記述 (3ステップ)

## サンプルコードをコピペする (1/3)
以下のファイルをコピペしてプロジェクトに含めると、簡単に利用可能です。

- C#: [sample/CSharp/SimpleRankingsServer.cs](https://github.com/wraikny/simple-rankings-server/blob/master/sample/CSharp/SimpleRankingsServer.cs)
- F#: [sample/FSharp/SimpleRankingsServer.fs](https://github.com/wraikny/simple-rankings-server/blob/master/sample/FSharp/SimpleRankingsServer.fs) (注意: [FSharp.Json](https://www.nuget.org/packages/FSharp.Json/)に依存しています。)

他の言語のsampleはPRをお待ちしています。

では、上記のコードを利用してC#でのランキングにアクセスするコードを記述します。

## データ定義 (2/3)
先程`config.json`に記述した内容に合わせてデータを定義します。

```C#
using System.Runtime.Serialization;

class Program
{
    [DataContract]
    class ScoreData
    {
        [DataMember]
        public int Score { get; set; }

        [DataMember]
        public float Time { get; set; }

        [DataMember]
        public string Name { get; set; }
    }

    const string Url = @"http://example.com:12345/api/wraiknysTutorialSTG";
    const string Username = "hoge";
    const string Password = "fuga";
}
```

`"http://{address}:{port}/api/{GameName}"`がURLになります。

`DataContract`周りはこちらの記事でも見るとよいのではないでしょうか。

[C# JSON Serialize - Qiita](https://qiita.com/Akasaki/items/dee137b24aea4b7e2bcb)

## サーバーにアクセスする。(3/3)

<details>
<summary>`Data<T>`と`Client`のメソッドはこちら</summary>

---

C#では以下のメソッドを利用可能です。
型だけ抽出したので雰囲気で感じ取ってください。

F#でも大体同じコードを書いてあります。

```C#
public class SimpleRankingsServer.Data<T>
{
    public long Id { get; }
    public Guid UserId { get; }
    public DateTime UTCDate { get; }
    public T values { get; }
}

public class SimpleRankingsServer.Client
{
    // データのIdが返ってくる
    // userId: ユーザーを識別するIdを指定。
    public async Task<long> InsertAsync<T>(string tableName, Guid userId, T data);

    public async Task<Data<T>[]> SelectAsync<T>(
        string tableName,
        // 指定したキーで並び替えたデータが返ってくる
        string orderBy = null,
        // trueだと降順のデータが返ってくる
        bool isDescending = true,
        // 返ってくるデータ数を制限する
        int limit = 100
    );
}
```

---

</details>

それではやっていきます。

```C#
using System;
using System.Threading.Tasks;

class Program
{
    static SimpleRankingsServer.Client client =
        new SimpleRankingsServer.Client(Url, Username, Password);

    static async Task Main(string[] args)
    {
        // ユーザー識別用。ファイルに保存などして使い回す。(ToStringとParseで相互変換できる)
        var userId = Guid.NewGuid();

        var scoreData = new ScoreData { Score = 80, Time = 81.6, Name = "nyamnyam" };

        // ランキングに追加する
        var _recordId = await client.InsertAsync("ScoreTable", userId, scoreData);

        // ランキングからデータを取得する
        var data = await client.SelectAsync<ScoreData>("ScoreTable", orderBy: "Score", limit: 10);

        foreach (var x in data)
        {
            Console.WriteLine(x);
        }
    }
}
```

なお、サーバー側の仕様として

- 新しいデータを追加する
- データを取得する

以外のこと（例：既存のデータを書き換える）はできないようにしています。

## まとめ

<details>
<summary>C#のサンプルコード全体</summary>

---

```CSharp
using System;
using System.Threading.Tasks;
using System.Runtime.Serialization;

class Program
{
    [DataContract]
    class ScoreData
    {
        [DataMember]
        public int Score { get; set; }

        [DataMember]
        public float Time { get; set; }

        [DataMember]
        public string Name { get; set; }
    }

    const string Url = @"http://example.com:12345/api/wraiknysTutorialSTG";
    const string Username = "hoge";
    const string Password = "fuga";

    static SimpleRankingsServer.Client client =
        new SimpleRankingsServer.Client(Url, Username, Password);

    static async Task Main(string[] args)
    {
        // ユーザー識別用。ファイルに保存などして使い回す。(ToStringとParseで相互変換できる)
        var userId = Guid.NewGuid();

        var scoreData = new ScoreData { Score = 80, Time = 81.6, Name = "nyamnyam" };

        // ランキングに追加する
        var _recordId = await client.InsertAsync("ScoreTable", userId, scoreData);

        // ランキングからデータを取得する
        var data = await client.SelectAsync<ScoreData>("ScoreTable", orderBy: "Score", limit: 10);

        foreach (var x in data)
        {
            Console.WriteLine(x);
        }
    }
}
```

---

</details>

<details>
<summary>F#のサンプルコード</summary>

---

```FSharp
type ScoreData = {
  Score : int
  Time : float
  Name : string
}

let [<Literal>] Url = @"http://example.com:12345/api/wraiknysTutorialSTG"
let [<Literal>] Username = "hoge"
let [<Literal>] Password = "fuga"

let client = new SimpleRankingsServer.Client(Url, Username, Password)
let userId = System.Guid.NewGuid()

[<EntryPoint>]
let main _ =
  async {
    let scoreData = { Score = 90; Time = 111.1; Name = "zawaka" }
    let! _recordId = client.AsyncInsert("ScoreTable", userId, scoreData)
    return! client.AsyncSelect<Sample1>("ScoreTable", orderBy = "Score", limit = 5)
  }
  |> Async.Catch
  |> Async.RunSynchronously
  |> printfn "%A"
  0
```

---

</details>

あとはこれをいい感じのUIに落とし込むだけ！　ですね。

なお、セキュリティ上の観点から、重要なデータは置かないようにしてください。
なにかあっても責任は取れません。

# おわり

質問等があれば[Twitter@wraikny](https://twitter.com/wraikny)かslackで聞いてください！

それでは。

[wraikny/simple-rankings-server - GitHub](https://github.com/wraikny/simple-rankings-server)
