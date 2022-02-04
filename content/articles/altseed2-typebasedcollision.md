+++
title = "Altseed2で衝突判定を簡単に扱うパッケージの紹介"
date = 2022-02-05T01:32:07+09:00
draft = false
tags = ["Altseed2"]
toc = true
featured_image = ""
authors = ["wraikny"]
description = "Altseed2.TypeBasedCollisionの紹介"
+++

# はじめに

[Altseed2.TypeBasedCollision](https://github.com/wraikny/Altseed2.TypeBasedCollision)
というAltseed2拡張パッケージを以前作成したので紹介します。

当たり判定色々と使いますよね。
Altseed2のチュートリアル第6章で教えてくれますが、正直このコードはあまり良くないです。
（2022/02/05現在。今後そっちも修正しようとは思います）

良くない点
* 継承ベースということ
   * 本来なら`SpriteNode`でも`RectangleNode`でも衝突判定したいよね？
* `CollidableObject`全てに対して衝突チェックする。
    * 無駄が多い！！
    * `PlayerBullet`と`Player`の衝突をチェックする必要は無い！

ということで、この辺を解決するパッケージの紹介記事となります。

# 使い方

本パッケージでは、`CollisionNode<T>`というクラスを提供しています。
`Altseed2.Collider`を利用して当たり判定の処理を行うためのクラスです。

とりあえず例を見てみましょう。

シューティングゲームで、`Player`が`EnemyBullet`との衝突処理を行いたいとします。

まずは`CollisionNode<T>`を作成しています。

```csharp
// ゲームプレイヤーを表すノード
sealed class Player : Node, ICollisionMarker
{
    private readonly CollisionNode<Player> collision;

    public Player()
    {
        // 当たり判定の形状（Collider）を作成する。
        var collider = new CircleCollider();
        collider.Radius = 50f;

        // 当たり判定を登録する。
        collision = new CollisionNode<Player>(this, collider);
        AddChildNode(collision);
    }

    protected override void OnUpdate()
    {
        /* 衝突判定処理 */
    }
}
```

ポイント

* `Player`クラスを衝突判定で利用するために、`ICollisionMarker`インターフェースを実装する。
* `CollisionNode<T>`のコンストラクタでは、`T`型の**キーとなる値**と`Altseed2.Collider`のインスタンスを受け取る。
* `CollisionNode<T>`は、当たり判定の機能を実装したいノードの**子ノードとして追加**する。

これは`EnemyBullet`クラスでも同様の記述を行うものとします。

次に、衝突判定処理を記述します。
1,2,3はすべて同じ処理なので、好きなものを使ってください。

1. `EnumerateCollisions<U>()`を利用する場合。

```csharp
// 対象と衝突判定を列挙する。
var bullets = collision.EnumerateCollisions<EnemyBullet>();

// 処理を行う。
foreach (var (b, isCollided) in bullets)
{
    // 衝突している場合
    if (isCollided)
    {
        /* 衝突時の処理 */
    }
}
```

2. `CheckCollision(Action<U, bool>)`を利用する場合。


```csharp
// 対象と衝突判定のコレクションに対して指定した処理を行う。
collision.CheckCollision<EnemyBullet>((b, isCollided) => {
    if (isCollided)
    {
        /* 衝突時の処理 */
    }
});
```
1. `CheckCollision(Action<U>)`を利用する場合。

```csharp
// 衝突している対象のコレクションに指定した処理を行う。
collision.CheckCollision<EnemyBullet>(b => {
    /* 衝突時の処理 */
});
```

# 型をキーとして管理する

`CollisionNode<T>`の`T`のこと、気になりますね。

Altseed2.TypeBasedCollisionでは、衝突判定を**型**に紐づけて管理しています。
（辞書のようなものですね）

`CollisionNode<T>.CheckCollision<U>`メソッドは、「`T`型に紐付けられた`CollisionNode<T>`」が、「`U`型に紐付けられた`CollisioNode<U>`のコレクション」に対して衝突判定処理を行います。

注意ですが、ここで**キーとして指定する型は完全一致している必要**があります。

`Linq`の`OfType<T>`とかと違って、継承しているクラスで指定はできません。
これは、型ごとに異なるコレクションで管理しているからです。
その分、余計なオブジェクトについて処理する必要がないのでパフォーマンス的に嬉しいです。

# おわりに

質問あれば、Slackでも、Discordでも、[Twitter @wraikny](https://twitter.com/wraikny)でも、GitHubのIssueでも大丈夫なので気軽に聞いてください～。
