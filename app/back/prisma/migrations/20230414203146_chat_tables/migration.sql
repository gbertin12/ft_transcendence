-- CreateTable
CREATE TABLE "Channel" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "topic" VARCHAR(128) NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "creation_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "owner_id" INTEGER NOT NULL,
    "password" VARCHAR(128) DEFAULT '',

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelAdmin" (
    "channel_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "ChannelAdmin_pkey" PRIMARY KEY ("channel_id","user_id")
);

-- CreateTable
CREATE TABLE "Message" (
    "channel_id" INTEGER NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "message_id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" VARCHAR(2000) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "Punishment" (
    "issuer_id" INTEGER NOT NULL,
    "punished_id" INTEGER NOT NULL,
    "channel_id" INTEGER NOT NULL,
    "type" SMALLINT NOT NULL,
    "punished_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP + INTERVAL '1 HOUR',

    CONSTRAINT "Punishment_pkey" PRIMARY KEY ("issuer_id","punished_id","channel_id")
);

-- CreateIndex
CREATE INDEX "channel_id_timestamp" ON "Message"("channel_id", "timestamp");

-- CreateIndex
CREATE INDEX "punished_id_issuer_id_type" ON "Punishment"("punished_id", "issuer_id", "type");

-- CreateIndex
CREATE INDEX "punished_id_channel_id_type" ON "Punishment"("punished_id", "channel_id", "type");

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
