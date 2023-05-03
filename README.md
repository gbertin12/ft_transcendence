# Documentation

## Database (Prisma)

* [Models](docs/PRISMA.md)
* [seed.ts](app/back/prisma/seed.ts)

## API

* [Endpoints](docs/API.md)

## Fonctionnalités

| Fonctionnalité | Description | Status |
| :-- | :-- | :--: |
| Envoi de messages | Envoi de messages dans un salon | ✅ |
| Envoi de messages privés | Envoi de messages privés à un utilisateur | ❌ |
| Création de salons | Créer un salon avec / sans mot de passe / caché | ✅ |
| Suppression de salons | Supprimer un salon (propriétaire seulement) | ✅ |
| Modification de salon | Modifier le nom / topic / mot de passe d'un salon (propriétaire seulement) | ❌ |
| Sanctions | Bannissement / Mute / Kick / Bloquer un utilisateur | ❌ |
| Rejoindre un salon avec un mot de passe | Demander / vérifier le mot de passe du salon et stocker le hash localement | ❌ |
| Invitations dans un salon caché | - | ❌ |
| Un utilisateur est en train d'écrire | Afficher un texte dans le salon dans lequel l'utilisateur est en train d'écrire | ❌ |
| Demandes d'amis | - | ❌ |
