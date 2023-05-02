# API

Légende :

| Emoji | Description |
| --- | --- |
| 👤 | Utilisateur sans privilèges |
| 🔰 | Propriétaire (owner) |
| 🛡️ | Administrateur |

# 1. Groupe `/channels`

## 1.1 👤 GET `/all`

| État | Description |
| :---: | :---: |
| ✅ | Retourne une liste d’objets JSON représentant des salons |

Exemple :

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

Status HTTP : 

| Code | Description |
| :---: | :---: |
| `200` | OK |

## 1.2 👤 GET `/history/:id/:min/:max/:timestamp`

| État | Description |
| :---: | :---: |
| ❌ | Retourne une liste d’objets JSON représentant des messages |

Paramètres :

| Nom | Type | Notes |
| :---: | :---: | :---: |
| `id` | `number` | Id du salon |
| `min` | `number` | Nombre minimum de messages à récupérer (≥1) |
| `max` | `number` | Nombre maximum de messages à récupérer (≤50) |
| `timestamp` | `number` | Timestamp du message le plus vieux (0 pour récupérer les plus récents) |

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

Status HTTP :

| Code | Description |
| :---: | :---: |
| `200` | OK |
| `403` | Utilisateur banni |
| `404` | Plus d’anciens messages |

## 1.3 🔰 DELETE `/:id`

| État | Description |
| :---: | :---: |
| ❌ | Supprime le salon |

Status HTTP :

| Code | Description |
| :---: | :---: |
| `200` | OK |
| `403` | Utilisateur n’est pas “owner” |
| `404` | Salon n’existe pas |

## 1.4 👤 POST `/create`

| État | Description |
| :---: | :---: |
| ✅ | Crée un nouveau salon |

Exemple :

```json
{
	"name": "nom",
	"topic": "topic",
	"private": 0,
}
```

Status HTTP :

| Code | Description |
| :---: | :---: |
| `201` | Salon créé |
| `400` | Nom / topic trop long / trop court |

## 1.5 🛡️ PATCH `/:id/punish`

| État | Description |
| :---: | :---: |
| ❌ | Applique une sanction à un utilisateur |

Exemple :

```json
{
	"target_id": 0,
	"time": 600,
	"type": 0
}
```

Status HTTP :

| Code | Description |
| :---: | :---: |
| `200` | Sanction appliquée |
| `400` | Champ invalide |
| `403` | Pas de permission “admin” / “owner” |
| `404` | Cible introuvable / salon introuvable |

## 1.6 👤 PUT `/:id/typing`

| État | Description |
| :---: | :---: |
| ❌ | Indique à l’API que l’utilisateur est en train d’écrire |

Status HTTP :

| Code | Description |
| :---: | :---: |
| `200` | OK |
| `403` | Utilisateur banni / mute |
| `404` | Salon introuvable |

## 1.7 👤 POST `/:id/message`

| État | Description |
| :---: | :---: |
| ✅ | Envoie un message dans le salon |


Exemple de body :

```json
{
	"content": "Hello World!"
}
```

Status HTTP :

| Code | Description |
| :---: | :---: |
| `201` | Message envoyé |
| `400` | Message trop long |
| `403` | Utilisateur banni / mute |
| `404` | Salon introuvable |

## 1.8 👤 GET `/:id/listen`

| État | Description |
| :---: | :---: |
| ⏳ | WebSocket |

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