---
title: "ISUCON13に参加しました。最終スコアは8654でした"
description: "ISUCON13に参加しました。最終スコアは8654でした"
pubDate: "2023/11/30"
heroImage: "/placeholder-hero.webp"
---

ISUCON13に参加しました。最終スコアは8,654でした。 (大敗北)
出来たこと、出来なかったこと、反省点などあるので振り返ります。

## 出来たこと

- ベンチマーク実行前後のログ解析等
  - 準備していたスクリプトが上手く使えたのは良かったです。
  - [用意していたスクリプト](https://github.com/tkancf/isucon-tools)
    - 昨年までは一つのMakefileに詰め込んでいたんですが、ちょっとスクリプトを修正したいとなったときにバッティングすることがあったので、一つのスクリプトで一つのことをやるという形にしました。
    - これは個人的には良い判断だったと思っています。
- いくつかのMySQLスロークエリにインデックス追加
  - 今回はインデックス追加すべき箇所が多かったですね。一つずつ様子見しながら貼っていましたが、一気にやっちゃったほうが良かったかなと思っています。
- 一部N+1の解消
  - N+1も目に付くものが多かったです。これは全部の対処が出来ませんでした。
- reserveLivestreamHandlerのタグ追加をバルクインサートに変更
  - 目に入ったのでやってみたんですが、あまり効果はなかったように思います。ちゃんと計測した上で取りかかるべきですね。
- PowerDNSのキャッシュ時間変更
  - 60sに変更しただけですが、捌ける数が増えました。
- register処理を若干改善
  - pdnsutilでのレコード追加処理をgoroutineで並列処理にしてみたんですが、これは無駄な作業だったかもしれません。あまり効いた感じはしませんでした。

## やろうとしたけど出来なかったこと

- PowerDNSにlua Scriptを実行する機能があったので、それを利用して存在しない名前解決は無視しようとした
  - 試したんですが、設定変更後にPowerDNSを再起動しようとすると失敗してしまいました。追試の中でもう一度試してみたいです。
- PowerDNSのバックエンドをMySQLからファイルに変換
  - これもやり方が分からず迷走してしまいました。
- サーバを複数台に分割
  - 後述しますが、練習不足と計画性が無かったです。
- searchLivestreamsHandlerのN+1など、複数個所のN+1改善
  - 試してはFailしてを繰り返していました。

## 反省点

- ISUCON11予選で練習していたんですが、一台のサーバで練習していたこともあり、サーバ分割をどの段階でやり始めるか決められていなかった
  - 結果、ラスト30分とかで慌ててやろうとしてベンチマークが通らず差し戻しになってしまいました。
- MySQLとnginxのログ解析はしていたが、pprofも欲しかった
  - netdataのようなモニタリングもあれば良かったです。
- 複数台サーバを活用出来なかった
  - サーバが3台あったので、各々が各サーバで作業すれば良かったが一台に全員で取り掛かったせいで順番待ち時間が多発しました。
- 上記からも分かる通り、チームでの練習が足りていなかった
  - 今年は時間合わない問題もあって一度も集まって練習出来ませんでした。来年はなんとか時間を作りたいですね。
- Goに対する慣れ不足
  - ちょっとしたプログラムを組むことはあってもGo言語をがっつり扱うのはほぼISUCONだけという状態なので、プライベートでがっつり触る時間を作らないとなと考えています。

## 振り返りでやりたいこと

- 複数台分割の練習
- PowerDNSについて、やりたかったことを改めて検証
- その他、やろうとして出来なかったことの復習とそもそも知らなかったことを講評みつつ復習

## 来年に向けて

ウー馬場ーイー222 チームのmatsuuさんが昔、[AtCoderとHighLoad Cupやっているという話](https://matsuu.hatenablog.com/entry/2019/04/16/230038)をみたので、作りたいものが思い浮かばなかったら真似してみようかと思っています。
毎年、感想戦やりたいと思いつつちゃんとやりきれていないので、今年はやりつつ学んだことをブログに残してみたいと思っています。