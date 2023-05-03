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
| Modification de salon | Modifier le nom / topic / mot de passe d'un salon (propriétaire seulement) | ✅ |
| Sanctions | Bannissement / Mute / Kick / Bloquer un utilisateur | ❌ |
| Rejoindre un salon avec un mot de passe | Demander / vérifier le mot de passe du salon et stocker le hash localement | ❌ |
| Invitations dans un salon caché | - | ❌ |
| Un utilisateur est en train d'écrire | Afficher un texte dans le salon dans lequel l'utilisateur est en train d'écrire | ❌ |
| Demandes d'amis | - | ❌ |

## TODO

- [ ] Demander un mot de passe pour rejoindre un salon protégé
    - [ ] Stocker le mot de passe dans le local storage (cookies?)
    - [ ] Vérifier le mot de passe
        - [ ] À chaque fois que les salons sont récupérés
        - [ ] À chaque fois qu'un salon est rejoint
        * Dans le cas ou le mot de passe n'est plus valide, il faut le supprimer du local storage et demander à l'utilisateur de le rentrer à nouveau
- [ ] Rendre visible le nom d'utilisateur dans le chat
- [ ] Afficher dans le salon les bannissements / mute (lors de l'application de la sanction)
- [ ] Ajouter un scheme `PrivateMessage` pour les messages privés inter-utilisateurs
    * `sender_id` : id de l'utilisateur qui envoie le message
    * `receiver_id` : id de l'utilisateur qui reçoit le message
    * `timestamp` : timestamp du message
    * `content` : contenu du message
    * `pm_id` : id du message privé
- [ ] Socket global, ne pas laisser les utilisateurs emettre (lecture seule)

- [x] Modifier des salons
    - [x] Changer le nom
    - [x] Changer le mot de passe
    - [x] Changer l'état "caché"
    - [x] Supprimer le mot de passe
