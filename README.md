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

# API

Légende :

| Emoji | Description |
| --- | --- |
| 👤 | Utilisateur sans privilèges |
| 🔰 | Propriétaire (owner) |
| 🛡️ | Administrateur |

# 1. Groupe `/channels`

## 1.1 👤GET `/all`

Retourne une liste d’objets JSON représentant des salons

```json
[
	{
		"id": 0,
		"name": "#test",
		"topic": "test topic",
		"private": 0,
		"creation_date": 1681504983654,
		"owner_id": 1,
		"password": ""
	},
	{
		"id": 1,
		"name": "#test-mdp",
		"topic": "salon avec mot de passe",
		"private": 2,
		"creation_date": 1681504973654,
		"owner_id": 92,
		"password": "efd2fa9cd038d6c96e4e7b2472f3d06d432f46711c38e5c8e546afb96f2ead5420338da45ee4b0ace8bccb02dbeb6b4ca243b2f5ce0c490bc8bd3445519eac54",
	}
]
```

## 1.2 👤GET `/history/:id/:min/:max/:timestamp`

- min ≥ 1
- max ≤ 50
- timestamp = message le plus vieux (0 pour récupérer les plus récents)

Retourne une liste d’objets JSON représentant des messages 

```json
[
	{
	  "channel_id": 12,
	  "sender_id": 11,
	  "message_id": 157,
	  "timestamp": "1681504973654",
	  "content": "Hello World!"
	}
]
```

- `200`
- `403` Utilisateur banni
- `404` Plus d’anciens messages

## 1.3 🔰DELETE `/:id`

- L’utilisateur qui envoie la requête doit être “owner”

Retourne :

- `200` si la suppression à réussi
- `403` si l’utilisateur n’est pas “owner”
- `404` si le salon n’existe pas

## 1.4 👤POST `/new`

Exemple de body :

```json
{
	"name": "nom",
	"topic": "topic",
	"private": 0,
}
```

Retourne :

- `201` si le salon à été créé
- `400` si le nom du salon / le topic du salon est trop long / trop court

## 1.5 🛡️PATCH `/:id/punish`

Exemple de body :

```json
{
	"target_id": 0,
	"time": 600,
	"type": 0
}
```

Retourne :

- `400` champ invalide
- `403` pas de permission “admin” / “owner”
- `404` cible introuvable / salon introuvable
- `200` sanction appliquée
