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

## 1.1 👤 GET `/all`

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
		"password": false
	},
	{
		"id": 1,
		"name": "#test-mdp",
		"topic": "salon avec mot de passe",
		"private": 2,
		"creation_date": 1681504973654,
		"owner_id": 92,
		"password": true
	}
]
```

## 1.2 👤 GET `/history/:id/:min/:max/:timestamp`

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

## 1.3 🔰 DELETE `/:id`

- L’utilisateur qui envoie la requête doit être “owner”

Retourne :

- `200` si la suppression à réussi
- `403` si l’utilisateur n’est pas “owner”
- `404` si le salon n’existe pas

## 1.4 👤 POST `/new`

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

## 1.5 🛡️ PATCH `/:id/punish`

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

## 1.6 👤 PUT `/:id/typing`

Retourne :

- `200` le status a été mis à jour
- `403` l’utilisateur n’a pas les droits d'écrire dans le salon (banni / mute)
- `404` le salon n’existe pas

## 1.7 👤 POST `/:id/message`

Exemple de body :

```json
{
	"content": "Hello World!"
}
```

Retourne :

- `200` le message a été envoyé
- `403` l’utilisateur n’a pas les droits d'écrire dans le salon (banni / mute)
- `404` le salon n’existe pas

## 1.8 👤 GET `/:id/listen`

Endpoint de WebSocket

Permet de recevoir les informations suivantes :

* Nouveaux messages
* Un utilisateur est en train d’écrire
* Un utilisateur a arrêté d’écrire
* Un utilisateur a été sanctionné
* Un utilisateur a été dé-sanctionné

Retourne :

* (`101`) `200` si la connexion a réussi
	* Le client doit envoyer un message JSON contenant l’id du salon (`channel_id`)
	```json
	{
		"channel_id": 0
	}
	```

* `403` si l’utilisateur n’a pas les droits d’accès au salon (ou est banni)
* `404` si le salon n’existe pas