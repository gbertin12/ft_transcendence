# Prisma

## Setup

### Install

```bash
npm install prisma --save-dev
```

### Define Schema

```
generator client {
  provider = "prisma-client-js"
  // TODO: find why this line is necessary
  binaryTargets = [ "native", "debian-openssl-1.1.x", "debian-openssl-3.0.x", "linux-musl", "linux-musl-openssl-3.0.x" ]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String? <-- optional field
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

### Create DB

```bash
npx prisma migrate dev --name init
```

set `DATABASE_URL` in `.env`

## Insert Record

```javascript
await prisma.user.create({
    data: { username, password, role: 'player' }
});
```

Make sure to put **ALL** fields in the data object.

## Select Record

```javascript
const result = await this.db.user.findFirst({
    where: { username: username, password: password }
});
```