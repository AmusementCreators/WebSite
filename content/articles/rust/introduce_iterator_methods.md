+++
title =  "[Rust] 個人的によく使うイテレーターのメソッドのメモ"
date = 2020-03-05T18:57:44+09:00
draft = false
tags = ["Rust", "Iterator"]
toc = true
featured_image = "/images/acac2019/2_00_hero.png"
authors = ["Kaisei Yokoyama"]
description = "Rustでよく使うイテレータのメソッドのメモです"
aliases = ["/post/articles/rust/introduce_iterator_methods"]
+++

Rustに触れて2年ぐらい経ち、ようやくまともにイテレータの使い方を理解し始めたような気がします。

よく使うイテレータのメソッドと小技について、日本語の記事としてここに書き留めておきます。列挙の順序は僕の偏見です。`next()`は割愛です。

### イテレータは進めずに次の値を見たい: [`peek(&self)`](https://doc.rust-lang.org/std/iter/struct.Peekable.html#method.peek)
イテレータは進めずに、次の値を`Option<&T>`に包んで返します。
次の値を覗き見(peek)する、ということのようです。

```rust
let vec = [1,2,3];

// peekableなイテレータ
let mut iter = vec.iter().peekable();

// peekの内容と 次のnextの内容が一致
println!("{}", iter.peek().cloned() == iter.next());
```

### イテレータから、条件に合うものだけを残したい: [`filter<P>(self, predicate: P) -> Filter<Self, P>`](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.filter)
```rust
let vec = [1,2,3,4,5,6];

let iter = vec.iter();
let mut odd_numbers = iter.filter(|&&i| i%2==1 );

assert_eq!(odd_numbers.next(),Some(&1));
assert_eq!(odd_numbers.next(),Some(&3));
assert_eq!(odd_numbers.next(),Some(&5));
```

### イテレータの中身全てに同じ操作をしたい: [`map<B, F>(self, f: F) -> Map<Self, F>`](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.map)
イテレータの中身から新たな型への写像(map)を定義します。

```rust
let vec = [1,2,3];

let iter = vec.iter();
let mapped = iter.map(|i| i+1).collect::<Vec<i32>>();

assert_eq!(vec![2,3,4], mapped)
```

### イテレータの中身全てに同じ操作をして、成功したものだけを残したい: [`filter_map<B, F>(self, f: F) -> FilterMap<Self, F>`](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.filter_map)
```rust
let vec = ["1", "a", "2", "b", "3", "c"];
let iter = vec.iter();

// 注釈: `.ok()`メソッドで`Result<T,E>`を`Option<T>`に変換できる
let mut numbers = iter.filter_map(|s| s.parse::<i32>().ok());

assert_eq!(numbers.next(), Some(1));
assert_eq!(numbers.next(), Some(2));
assert_eq!(numbers.next(), Some(3));
```

### イテレータの中身のうち、一番最初に操作に成功したものが欲しい: [`find_map<B, F>(&mut self, f: F) -> Option<B>`](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.find_map)
```rust
let vec = ["1", "a", "2", "b", "3", "c"];
let mut iter = vec.iter();

// 注釈: `.ok()`メソッドで`Result<T,E>`を`Option<T>`に変換できる
let one = iter.find_map(|s| s.parse::<i32>().ok());

assert_eq!(one, Some(1));
```

### イテレータの中身の全てに複数の要素を返す操作をして、結果をまとめたい: [`flat_map<U, F>(self, f: F) -> FlatMap<Self, U, F>`](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.flat_map)
```rust
let vec = vec!["Amusement"," ", "Creators"];
let amusement_creators = vec.iter()
    .flat_map(|s| s.chars())
    .collect::<String>();

assert_eq!("Amusement Creators", &amusement_creators);
```

### 加工途中のイテレータの中身を見たい: [`inspect<F>(self, f: F) -> Inspect<Self, F>`](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.inspect)
実は、`map(self, f:F)`では`println!`ができません ex.[docs](https://doc.rust-lang.org/std/iter/trait.Iterator.html#examples-8)。イテレータの加工の途中で中身が見たい場合は、この`inspect(self, f: F)`を使う必要があります。

```rust
let vec = [1,2,3];

let iter = vec.iter();
let mapped = iter.map(|i| i*2)
                .inspect(|i| println!("i = {}", i))
                .map(|i| i*0)
                .collect::<Vec<i32>>();

println!("{:?}", mapped);
```

### 二つのイテレータを合体させたい: [`zip(self, other: U)`](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.zip)
ちなみに逆の動作は[`unzip<A, B, FromA, FromB>(self) -> (FromA, FromB)`](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.unzip)
```rust
let characters =
    vec!["天真＝ガヴリール＝ホワイト",
          "月乃瀬＝ヴィネット＝エイプリル",
          "胡桃沢＝サタニキア＝マクドウェル",
          "白羽＝ラフィエル＝エインズワース"];
let voice_actors =
    vec!["富田美憂",
          "大西沙織",
          "大空直美",
          "花澤香菜"];

let mut cast = characters.into_iter()
    .zip(
        voice_actors.into_iter()
    );

assert_eq!(Some(("天真＝ガヴリール＝ホワイト", "富田美憂")),cast.next());
assert_eq!(Some(("月乃瀬＝ヴィネット＝エイプリル", "大西沙織")),cast.next());
assert_eq!(Some(("胡桃沢＝サタニキア＝マクドウェル", "大空直美")),cast.next());
assert_eq!(Some(("白羽＝ラフィエル＝エインズワース", "花澤香菜")),cast.next());
```

### イテレータに通し番号をつけたい: [`enumerate(self)`](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.enumerate)
```rust
let characters =
    vec!["天真＝ガヴリール＝ホワイト",
          "月乃瀬＝ヴィネット＝エイプリル",
          "胡桃沢＝サタニキア＝マクドウェル",
          "白羽＝ラフィエル＝エインズワース"];

let mut classmates = characters.into_iter()
    .enumerate();

assert_eq!(Some((0, "天真＝ガヴリール＝ホワイト",)),
            classmates.next());
assert_eq!(Some((1, "月乃瀬＝ヴィネット＝エイプリル")),
            classmates.next());
assert_eq!(Some((2, "胡桃沢＝サタニキア＝マクドウェル")),
            classmates.next());
assert_eq!(Some((3, "白羽＝ラフィエル＝エインズワース")),
            classmates.next());
```

### イテレータの要素すべてから一つの結果を得たい: [`fold<B, F>(self, init: B, f: F) -> B`](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.fold)
和を取りたい場合は [`sum<S>(self) -> S`](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.sum)もどうぞ。

```rust
let vec = vec!["Amusement", " ", "Creators"];
let amusement_creators = vec.iter()
    .fold(String::new(),|mut acc, str| {
        acc.push_str(str);
        acc
    });

assert_eq!("Amusement Creators", &amusement_creators);
```

### イテレータの全ての要素が条件を満たすかどうかを判定したい: [`all<F>(&mut self, f: F) -> bool`](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.all)
```rust
let vec_positive = vec![1, 2, 3, 4, 5, 6, 7];
let vec_positive_with_0 = vec![0, 1, 2, 3, 4, 5, 6, 7];

assert_eq!(vec_positive.iter().all(|i| i > &0), true);
assert_eq!(vec_positive_with_0.iter().all(|i| i > &0), false);
```

### イテレータの要素の中に条件を満たすものがあるかどうかを判定したい: [`any<F>(&mut self, f: F) -> bool`](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.any)
```rust
let timimouryou = vec!["魑", "魅", "魍", "魎"];
let timitimi = vec!["魑", "魅", "魑", "魅"];

assert_eq!(timimouryou.iter().any(|&s| s == "魍"), true);
assert_eq!(timitimi.iter().any(|&s| s == "魍"), false);
```

### イテレータを条件に沿って2つに分離したい: [`partition<B, F>(self, f: F) -> (B, B)`](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.partition)
```rust
let numbers = vec![0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
let (even_numbers, odd_numbers): (Vec<i32>, Vec<i32>)
    = numbers.iter().partition(|&&i| i % 2 == 0);

assert_eq!(even_numbers, vec![0, 2, 4, 6, 8]);
assert_eq!(odd_numbers, vec![1, 3, 5, 7, 9]);
```

### イテレータをループさせたい: [`cycle(self) -> Cycle<Self>`](https://doc.rust-lang.org/1.41.0/std/iter/trait.Iterator.html#method.cycles)
```rust
let xmas = vec!["🎄メリクリ〜🎄", "🍈メロパリ〜🍞"];
let mut endless_xmas = xmas.iter().cycle();

assert_eq!(endless_xmas.next(), Some(&"🎄メリクリ〜🎄"));
assert_eq!(endless_xmas.next(), Some(&"🍈メロパリ〜🍞"));
assert_eq!(endless_xmas.next(), Some(&"🎄メリクリ〜🎄"));
assert_eq!(endless_xmas.next(), Some(&"🍈メロパリ〜🍞"));
```

### イテレータをVecに戻したい: [`collect<B>(self) -> B`](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.collect)
```rust
let strs = vec!["0", "1", "2", "3", "4"];
let nums = strs.iter()
    .filter_map(|&s| s.parse().ok())
    .collect::<Vec<i32>>();

assert_eq!(nums, vec![0, 1, 2, 3, 4]);
```

`Vec<T>`でなくとも、[`std::iter::FromIterator`](https://doc.rust-lang.org/std/iter/trait.FromIterator.html)を実装している型なら変換することができます。

```rust
let results = vec![Ok(0),Err("a"),Ok(1),Err("b")];
let result : Result<Vec<i32>, &str> = results.into_iter().collect();

assert_eq!(result, Err("a"));

let results = vec![Ok(0),Ok(1)];
let result : Result<Vec<i32>, &str> = results.into_iter().collect();

assert_eq!(result, Ok(vec![0,1]));
```

## 参考文献
* [Rustのイテレータの網羅的かつ大雑把な紹介](https://qiita.com/lo48576/items/34887794c146042aebf1)
   * Rustのイテレータについての具体的な知識を日本語で得たいなら、まずはこの記事。
* [Trait std::iter::Iterator](https://doc.rust-lang.org/std/iter/trait.Iterator.html)
   * 英語が読めるなら公式リファレンスが一番。