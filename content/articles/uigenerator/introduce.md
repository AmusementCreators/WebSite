+++
title =  "Altseed1向けのUI生成ツール「UIGenerator」の紹介"
date = 2020-01-20T19:05:16+09:00
draft = false
tags = ["CSharp","Altseed"]
toc = true
featured_image = "/images/uigenerator/Top.png"
authors = ["Funny_Silkie"]
description = "Altseed1向けのUI制作ツールの紹介記事です。"
aliases = ["/post/articles/uigenerator/introduce"]
+++

# UIGeneratorとは
UIGeneratorは，私Funny_Silkieが制作したAltseed1×C#におけるUI自動生成GUIアプリケーションです。  
ゲームでメニュー画面などのUIを作る時はウィンドウやテキストなどの位置関係や色の微調整が大事になります。  
しかし確認するためにはいちいちコンパイルしてexeファイルを生成して起動しなければなりません。  
**それだとめんどくさい！**という事で，実際に状態を見ながらUIを制作できるこのアプリケーションを作成しました。

# 1.どんな事が出来るのか
ざっくり言うと，

- 作りたいUIを編集できる
- リソースを読み込める
- C#のコードを自動生成できる

といった感じです。

![Ex_UI](/images/uigenerator/Top.png)
こんなUIが…
![Ex_Code](/images/uigenerator/Code_0.png)
こんな感じになります。  

詳しくは事項にて説明します。  

# 2.機能紹介
## 2-1.メインウィンドウ
アプリケーション"UIGenerator.exe"を起動するとこのように3つのウィンドウが開きます。
![Windows](/images/uigenerator/Windows.png)

コンソールウィンドウでは一部処理の成否が通知され，Altseedのウィンドウでは編集中のUIが表示されます。  
メインウィンドウは"UIGenerator"と表示されているウィンドウです。  
このメインウィンドウからは様々な機能にアクセスする事が出来ます。  
上のメニューのファイル，編集，ツールのそれぞれの機能は以下の通りです。

**ファイル**

- 新規作成：現在編集しているプロジェクトをすべて破棄して初期状態にリセットする 警告は無いので注意
- プロジェクトを開く：保存されているプロジェクトファイル(.ugpf)を読み込む
- 上書き保存：プロジェクトファイルを上書き保存
- 名前を付けて保存：プロジェクトファイル名を指定して保存する
- エクスポート：C#コードを生成する
- リソースの管理：リソースの保存でリソースデータをまとめて保存(.ugrpfファイル)し，リソースの読み込みで復元する

**編集**

- 要素を追加/削除する：UIオブジェクトを追加/削除を行う
- フォントを編集する：使用するフォントの追加/削除を行う(テキストオブジェクトなどで使用できる)
- テクスチャを編集する：使用するテクスチャの追加/削除を行う(テクスチャオブジェクトなどで使用できる)
- ファイルパッケージの管理する：ファイルパッケージの追加/削除を行う

**ツール**

- ファイルの有無をチェック：指定したファイルパスが存在するかどうか検証できる(ファイルパッケージ導入時の確認など)
- オプション：Altseedウィンドウのサイズやプロジェクトの名前を変更できる

## 2-2.UIオブジェクトについて
UIオブジェクトには，`asd.Object2D`を継承したText，Texture，Windowがあります。  
Windowは枠線などを設定できるテクスチャの発展形です。  
Textでは登録したフォントが，Textureでは登録したテクスチャを使用する事が出来ます。  
それぞれが専用のフォームから設定をする事が出来ます。

**Text**
![TextEdittor](/images/uigenerator/TextEdittor.png)

**Texture**
![TextureEdittor](/images/uigenerator/TextureEdittor.png)

**Window**
![WindowEdittor](/images/uigenerator/WindowEdittor.png)

こんな感じでフォームが有りますが，ここで**Mode**とか**Name**ってなんだ？ってなるのではと思います。  
Modeはint型で表される値です。  
UIオブジェクトが登録されているレイヤー自体にも`Mode`という変数が定義されており，レイヤーの`Mode`の値と一致している`Mode`変数をもつUIオブジェクトのみが描画されます。  

Textの`Mode`を0に，Windowの`Mode`を1に設定してみます。  
現在のレイヤー全体の`Mode`は0なので，Textのみが表示されています。
![Mode0](/images/uigenerator/Mode0.png)

全体の`Mode`を1にすることで，Textが表示されなくなりWindowが表示されるようになりました。
![Mode1](/images/uigenerator/Mode1.png)

このような感じで`Mode`は使われます。  

`Name`はそのUIオブジェクトの名前です。  
UIオブジェクトの検索(内部処理で行われる)は`Mode`と`Name`の組み合わせで行われるため，その為の物です。  
その為，`Mode`と`Name`の組み合わせが重複する場合は登録できません。  

UIオブジェクトには`asd.Layer2D`から呼び出せる追加描画メソッド関連の物も含まれています。  
Arc，Circle，Line，Rectangle，RotatedRectangle，Sprite，Text，Triangleが使用可能です。  
追加描画系も`Mode`と`Name`を持ちますが，`asd.Object2D`派生の物とは別枠で使用されるためそちらとの重複は可能です。

## 2-3.エクスポート
エクスポート時にはこのようなウィンドウが開かれます。  
![Export](/images/uigenerator/Export.png)

出力は`asd.Layer2D`の派生クラスとして定義されるため，その型名と，所属名前空間を設定します。  
あとは保存先のファイルパスを設定してExportボタンを押すと出力可能です。  
今は文字エンコードの設定も実装したいなーと思っています。  
言語は現在はC#しか選択できません。~~好事家の皆さん！C++とかJava対応してみてください！~~  

生成結果がこんな感じです。
![Code](/images/uigenerator/Code_0.png)

# 3.最後に
操作に関する説明は[こちら](https://github.com/Funny-Silkie/UIGenerator)から。  
Altseed2ができるため風前の灯火ですが，よろしければ使ってみてください。  
改造したい場合はプルリク送ってください。  
バグや要望などはissue立てといてください。  

**リンク**  
[ソースコード&説明書](https://github.com/Funny-Silkie/UIGenerator)  
[DLリンク](https://drive.google.com/drive/folders/1xd2uPFpxAVmuKH_G-gvwP8y4MBraGvNa)  
[作者Twitter](https://twitter.com/Funny_Silkie)  
[作者Github](https://github.com/Funny-Silkie)  
[Altseed](https://altseed.github.io)