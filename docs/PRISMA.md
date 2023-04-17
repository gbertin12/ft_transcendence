# DB (Prisma)

# `channel`

| Column | Type | Autre | Note |
| --- | --- | --- | --- |
| `id` | `integer` | Auto Increment - Primary Key |  |
| `name` | `varchar(64)` |  |  |
| `topic` | `varchar(128)` |  |  |
| `private` | `smallint` |  | 0 = public -- 1 = private -- 2 = password blocked |
| `creation_date` | `timestamp` |  |  |
| `owner_id` | `integer` |  | Related to users.id |
| `password` | `varchar(128)` | default = “” | SHA512 + Custom Salt |

## Indexes

- `creation_date` — Peut-être un tri du plus récent au plus vieux
- `private` — Garder les channels cachés, query un truc du genre

# `channel_admins`

| Column | Type | Autre | Note |
| --- | --- | --- | --- |
| `channel_id` | `integer` |  | Related to channel.id |
| `user_id` | `integer` |  | Related to users.id |

## Indexes

- `channel_id` & `user_id` — Les deux seront query en même temps

# `messages`

| Column | Type | Autre | Note |
| --- | --- | --- | --- |
| `channel_id` | `integer` |  | Related to channel.id |
| `sender_id` | `integer` |  | Related to users.id |
| `message_id` | `integer` |  |  |
| `timestamp` | `timestamp` |  |  |
| `content` | `varchar(2000)` |  |  |

## Indexes

- `channel_id` & `timestamp` — Les deux seront query en même temps

# **`punishments`**

| Column | Type | Autre | Note |
| --- | --- | --- | --- |
| issuer_id | `integer` |  | Related to users.id |
| punished_id | `integer` |  | Related to users.id |
| channel_id | `integer` |  | Related to channel.id |
| type | `smallint` |  | 0 = mute -- 1 = ban -- 2 = block (?) |
| punished_at | `timestamp` | default = `current_timestamp` |  |
| expires_at | `timestamp` |  |  |

## Indexes

- `punished_id` & `issuer_id` & `type` — Pour cacher les utilisateurs bloqués
- `punished_id` & `channel_id` & `type` — Pour les bans / mutes