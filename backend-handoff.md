# バックエンド引き継ぎメモ

## 概要

保護猫里親募集サイトのフロント用仮データです。
現在は `cats-data.js` の配列をローカルの予備データとして持ちつつ、フロントは `Supabase -> ローカル予備データ` の順で読み込む構成です。
バックエンド未接続時やSupabase障害時でも画面が止まらないよう、同内容のJSONを `cats-data.json` に切り出しています。

## 猫データ

ファイル: `cats-data.json`

1件あたりの項目は以下です。

| 項目名 | 型 | 例 | 用途 |
| --- | --- | --- | --- |
| `id` | string | `mike` | 猫の識別子。詳細画面や問い合わせの対象指定に使用 |
| `name` | string | `ミケ` | 表示名 |
| `age` | string | `8歳` | 現状は表示用文字列 |
| `gender` | string | `女の子` | 現状は表示用文字列 |
| `image` | string | `image/cat.png` | 画像URLまたは画像パス |
| `alt` | string | `ミケの写真` | 画像の代替テキスト |
| `shortDescription` | string | `8歳の女の子です。` | 一覧カード表示用 |
| `profileLines` | string[] | `["8歳の女の子です。", "ワクチン接種済み"]` | 詳細画面表示用 |

## フロントで使っている画面

1. 一覧画面
   `index.html`
   全猫データを表示します。

2. 詳細画面
   `profile.html?cat={id}`
   クエリパラメータ `cat` で対象猫を指定します。

3. 問い合わせ画面
   `contact-form.html?cat={id}`
   クエリパラメータ `cat` で問い合わせ対象猫を指定します。

4. 完了画面
   `thanks.html?cat={id}`
   クエリパラメータ `cat` があれば対象猫名を表示します。

## 問い合わせフォーム項目

現行フォームの送信項目は以下です。

| 項目名 | 型 | 必須 | 備考 |
| --- | --- | --- | --- |
| `cat` | string | 任意 | hidden。問い合わせ対象の猫ID |
| `name` | string | 必須 | お名前 |
| `phone` | string | 必須 | 電話番号 |
| `email` | string | 必須 | メールアドレス |
| `address` | string | 任意 | 住所 |
| `message` | string | 任意 | 問い合わせ内容 |

現在は `GET` で `thanks.html` に遷移するだけで、保存処理は未実装です。

## Supabase設定

ファイル: `supabase-config.js`

- `supabaseUrl`
- `supabaseAnonKey`
- `petsTable`

団体に引き渡したあと設定変更が必要な場合は、まずこのファイルを編集します。

## 画像の置き場所

- 画像は `image/` フォルダ配下にまとめています。
- 猫画像を差し替える時は、同じファイル名のまま置き換えるか、`cats-data.js` またはSupabase上の `image` 列を書き換えてください。
- Supabase Storageを使う場合は、`image` 列に公開URLを入れればそのまま表示できます。

## バックエンド実装時の想定

最低限あるとつなぎやすいテーブル/API例:

- `GET /cats`
  猫一覧を返す
- `GET /cats/:id`
  猫詳細を返す
- `POST /inquiries`
  問い合わせ内容を受け付ける

問い合わせのリクエスト例:

```json
{
  "catId": "mike",
  "name": "山田花子",
  "phone": "09012345678",
  "email": "example@example.com",
  "address": "東京都...",
  "message": "ミケについて問い合わせしたいです。"
}
```

Supabaseで `pets` テーブルを使う場合の列の例:

| 列名 | 型 | 備考 |
| --- | --- | --- |
| `id` | text | 一意な猫ID |
| `name` | text | 表示名 |
| `age` | text | 例: `3歳` |
| `gender` | text | 例: `女の子` |
| `type` | text | 例: `雑種` |
| `status` | text | 例: `募集中` |
| `image` | text | `image/cat1.png` または公開URL |
| `alt` | text | 代替テキスト |
| `shortDescription` | text | 一覧用説明 |
| `description` | text | 詳細文 |
| `profileLines` | jsonb | 詳細表示用の文字列配列 |

## 補足

- `age` と `gender` は現状だと表示用文字列です。
  検索や絞り込みを想定するなら、将来的には `ageYears` や `sex` など別項目で持つほうが扱いやすいです。
- `profileLines` はそのままだと自由文配列です。
  項目管理を厳密にするなら、`vaccinated`, `personality`, `notes` のように分ける余地があります。
- 画像は現状ローカルファイル参照です。
  本番では画像URLまたはストレージ上のパスに置き換える想定です。
