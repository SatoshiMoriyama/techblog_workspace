# Amazon Aurora PostgreSQL Serverlessの新機能「Express Configuration」で数秒でデータベースを作成してみた

## はじめに

2026年3月、Amazon Aurora PostgreSQL Serverlessに「Express Configuration」という新機能が登場しました。なんと、たった2クリック・数秒でデータベースを作成できるとのこと。

従来のAuroraといえば、VPCの設定やサブネットグループの作成、セキュリティグループの設定など、データベースを使い始めるまでにそこそこの手間がかかっていました。それが数秒で終わるなら、ちょっと試してみたくなりますよね。

ということで、実際にExpress Configurationでデータベースを作成して、接続するところまでやってみました！

### この記事で学べること

- Express Configurationとは何か、従来のAuroraとの違い
- マネジメントコンソールとAWS CLIでのDB作成手順
- Internet Access Gatewayを通じた接続方法
- Express Configurationの制約事項
- Aurora DSQLとの使い分けについての所感

### 前提知識・条件

- AWSアカウントを持っていること
- AWS CLIがインストール済みであること（CLI接続を試す場合）

| 項目 | バージョン・情報 |
| ------ | ----------------- |
| サービス | Amazon Aurora PostgreSQL Serverless v2 |
| 機能 | Express Configuration |
| エンジン | aurora-postgresql |
| デフォルトポート | 5432 |
| 認証方式 | IAM認証（デフォルト・変更不可） |

## Express Configurationとは？

Express Configurationは、Aurora PostgreSQL Serverless v2のデータベースを2クリック・数秒で作成できる新機能です。

従来のAuroraでは、データベースを作成するためにVPCやサブネットグループ、セキュリティグループなどのネットワーク設定が必要でした。Express Configurationでは、これらが一切不要になります。

大きな特徴をまとめると、こんな感じです:

- VPCなしでデータベースが作成される
- 新しい「Internet Access Gateway」を通じて、世界中どこからでもPostgreSQLワイヤプロトコルで接続可能
- IAM認証がデフォルトで有効（パスワードレス）
- ACU（Aurora Capacity Units）の秒単位従量課金
- AWS Free Tier対応

VPCを使わないというのが、従来のAuroraとの最大の違いですね。Internet Access Gatewayという新しい仕組みを通じて、インターネットから直接接続できるようになっています。

公式ブログにも詳しい情報が載っています。

https://aws.amazon.com/jp/blogs/aws/announcing-amazon-aurora-postgresql-serverless-database-creation-in-seconds/

## やってみた

### Step 1: データベースを作成する（コンソール）

では、早速試してみます！

マネジメントコンソールでの手順はとてもシンプルです。

1. AWSマネジメントコンソールでAmazon RDSを開く
2. 左ペインから「Databases」を選択
3. 「Create with express configuration in seconds」セクションにある「Create」をクリック
4. DB cluster identifierを確認（変更も可能）
5. 「Create database」をクリック

<!-- TODO: screenshot - RDSコンソールの「Create with express configuration in seconds」セクション -->

これだけです。本当に2クリックで完了しますね。数秒待つと、ステータスが「Available」になりました。

<!-- TODO: screenshot - データベースがAvailableになった画面 -->

従来のAurora作成画面で、エンジンやインスタンスサイズ、ネットワーク設定をポチポチ選んでいたのが嘘みたいです。

AWS CLIからも作成できます。こちらもシンプルですね。

```bash
aws rds create-db-cluster \
    --db-cluster-identifier my-express-cluster \
    --engine aurora-postgresql \
    --with-express-configuration  # このオプションがExpress Configurationの指定
```

`--with-express-configuration` を付けるだけで、VPCの設定やインスタンスの作成、Internet Access Gatewayのセットアップまで全部自動でやってくれます。

### Step 2: データベースに接続する

データベースが作成できたので、次は接続してみます。Express Configurationで作成したデータベースにはいくつかの接続方法があります。

#### CloudShellで接続（一番お手軽）

一番簡単なのはCloudShellからの接続です。

1. RDSコンソールで対象のクラスタを選択
2. 「Connectivity & Security」タブの「CloudShell」セクションを開く
3. 「Launch Cloudshell」をクリック
4. 表示されたコマンドの「Run」をクリック

<!-- TODO: screenshot - CloudShellでの接続成功画面（postgres=>プロンプト） -->

これで `postgres=>` プロンプトが表示されれば接続成功です。ブラウザだけで完結するので、ローカルに何もインストールする必要がないのがいいですね！

#### psqlで接続

ローカル環境からpsqlで接続する場合は、IAM認証トークンを使います。

RDSコンソールの「Connectivity & Security」タブにある「PSQL code snippet」をコピーして、ターミナルに貼り付けるだけです。裏側では、AWS CLIが自動的にIAM認証トークンを生成してくれています。

```bash
# RDSコンソールからコピーしたコマンドを実行
# AWS CLIのクレデンシャルが設定済みであることが前提
PGPASSWORD=$(aws rds generate-db-auth-token \
    --hostname my-express-cluster.cluster-xxxxxxxxxxxx.ap-northeast-1.rds.amazonaws.com \
    --port 5432 \
    --username postgres) \
psql "host=my-express-cluster.cluster-xxxxxxxxxxxx.ap-northeast-1.rds.amazonaws.com \
    port=5432 \
    dbname=postgres \
    user=postgres \
    sslmode=require"
```

ポイントは、パスワードの代わりにIAM認証トークンを使っているところです。このトークンは15分間有効で、`rds-db:connect` のIAM権限が必要になります。

#### pgAdminなどのGUIツールで接続

pgAdminなどのGUIツールから接続したい場合は、RDSコンソールの「Get token」ユーティリティで一時トークンを生成して、それをパスワード欄に入力します。

接続に必要な情報は「Connectivity & Security」タブの「Endpoints」から確認できます。

| 項目 | 値 |
| ------ | ----- |
| Hostname | Writer endpoint |
| Port | 5432 |
| Username | postgres |
| Password | Get tokenで生成したトークン（15分有効） |
| Database | postgres |

### 制約事項

Express Configurationはお手軽な反面、制約事項もそれなりにあります。使う前に把握しておきたいところです。

| カテゴリ | 制約内容 |
| --------- | --------- |
| エンジン | Aurora PostgreSQLのみ（MySQLは非対応） |
| ネットワーク | VPCへの関連付け不可 |
| ネットワーク | Internet Access Gatewayの無効化不可 |
| ネットワーク | IPv4のみ（IPv6非対応） |
| 認証 | IAM認証のみ（Secrets Manager非対応） |
| 暗号化 | カスタムKMSキー使用不可（AWS/RDSサービスキーのみ） |
| バージョン | エンジンバージョンの選択不可（アップグレードのみ可） |

非対応機能も結構あります:

- Aurora Limitless Database
- Aurora Global Database
- RDS Proxy
- Aurora Zero-ETL Integration
- RDS Query Editor
- Blue/Green Deployments
- Database Activity Streams
- Zero Downtime Patching
- Babelfish

VPCに入れられないというのは、セキュリティ要件が厳しい本番環境では気になるポイントかもしれません。ただ、IAM認証が必須になっているので、認証面はしっかりしている印象です。

> なお、Express Configurationで作成したクラスタを後からVPC内に移動する、といったことはできない模様です。VPCが必要な場合は、最初から従来の方法で作成する必要があります。

## DSQLとの比較についての所感

ここからは個人的な所感です。

Express Configurationを試してみて、正直なところ「これがあるならDSQLを無理に使わなくてもいいのでは…」と少し思いました。

どちらもサーバーレスで秒単位の従量課金、数秒で起動できる、という点は共通しています。Express ConfigurationはVPCが不要で手軽に使い始められますし、PostgreSQL互換なのでエコシステムもそのまま活用できます。

ただ、DSQLにはマルチリージョン対応という強みがあります。グローバルに展開するアプリケーションでは、引き続きDSQLの方が適しているケースもあるかなと思います。

一方的にどちらが優れているとは言えないですが、「ちょっとPostgreSQLのデータベースが欲しい」というシーンでは、Express Configurationがかなり便利な選択肢になりそうですね。

## 過去記事の紹介

Express ConfigurationではIAM認証がデフォルトで有効になっていて、15分有効なエフェメラルトークンをパスワードとして使います。

実はこの仕組み、Aurora DSQLでも同じなんですよね。以前、Aurora DSQLでSQLAlchemyを使ったコネクションプーリングの記事を書いた際にも、15分ごとのIAMトークンの扱いがポイントになっていました。

IAM認証トークンの接続まわりに興味がある方は、こちらの記事も参考になるかなと思います。

https://qiita.com/s_moriyama/items/35600a26f0c83f30a4ee

## まとめ

Aurora PostgreSQL Serverlessの新機能「Express Configuration」を試してみました。

- Express Configurationを使うと、VPCの設定なしに2クリック・数秒でAurora PostgreSQL Serverlessデータベースを作成できる
- Internet Access Gatewayにより、世界中どこからでもPostgreSQLワイヤプロトコルで直接接続可能
- IAM認証がデフォルトで有効。15分有効な一時トークンをパスワードとして使用する
- CloudShellからの接続が一番お手軽。ローカルからはpsqlとAWS CLIを組み合わせて接続できる
- 制約事項は多め（VPC不可、MySQL非対応、カスタムKMS不可など）。本番利用の際は要確認
- IAM認証トークンの仕組みはAurora DSQLと共通で、同じノウハウが活かせる

「ちょっとAuroraを試してみたい」「開発環境にサクッとPostgreSQLが欲しい」というときに、Express Configurationはぴったりの選択肢だと感じました。VPC周りの設定が不要なだけで、ここまで体験が変わるのかと驚きましたね。

公式ドキュメントも貼っておきます。

https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_GettingStartedAurora.AuroraPostgreSQL.ExpressConfig.html

最後まで読んでいただきありがとうございました！誰かのお役に立てると幸いです〜。
