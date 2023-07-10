import { Controller, Post, Body, Get, Param, HttpException, Delete, Patch, UseGuards, Req, BadRequestException, NotFoundException, Put, ForbiddenException, NotImplementedException } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, Length, Matches, Min } from 'class-validator';
import ChatGateway from '../chat/chat.gateway';
import { Channel, Message, User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import * as argon2 from 'argon2';
import { MessageData } from '../interfaces/chat.interfaces';
import { PunishmentsService } from '../punishments/punishments.service';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import { DbService } from '../db/db.service';

class ChannelDto {
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    channel_id: number;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @IsPositive()
    last_message_id: number;
}

class ChannelUpdateDto {
    @Type(() => String)
    @Length(1, 20)
    @Matches(/^[^#\s]+$/) // No spaces or #
    name: string;

    @Type(() => Boolean)
    private: boolean;

    @Type(() => String || null)
    password: string | null;
}

class ChannelPasswordDto {
    @Type(() => String)
    @Length(2, 100)
    password: string;
}

class GenericIdDto {
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    id: number;
}

class OwnershipTransferDto {
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    new_owner: number

    // Optionnal 2FA code
    @Type(() => String)
    @Matches(/^[0-9]{6}$/) // Only 6 digits
    @IsOptional() // The user might not always have 2FA enabled
    otp: string;

    // Optionnal password (if the user has 2FA setup, we're using the 2FA instead)
    @Type(() => String)
    @Length(2, 100)
    @IsOptional()
    password: string;
}

class RoleUpdateDto {
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    user_id: number;

    @Type(() => String)
    @Matches(/^(admin|member)$/i)
    role: string;
}

class MessageDeleteDto {
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    message_id: number;

    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    channel_id: number;
}

class ChannelPunishmentDto {
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    @Min(60) // 1 minute
    duration: number;
}

class UserActionDto {
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    user_id: number;

    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    channel_id: number;
}

/**
 * Checks if the user has the required privileges to perform an action, throws an exception if not
 * @param channel The channel in which the action is performed (contains owner_id and admins)
 * @param punisher The user performing the action
 * @param punished The user being punished
 */
function privilegesCheck(channel, punisher, punished) {
    if (punisher.id === punished.id) { throw new ForbiddenException('You cannot perform this action on yourself'); }
    if (channel.owner_id !== punisher.id && !channel.admins.map(a => a.user_id).includes(punisher.id)) { throw new ForbiddenException('You do not have the required privileges to perform this action'); }
    if (channel.owner_id === punished.id) { throw new ForbiddenException('You cannot perform this action on the owner'); }
}

/**
 * Formats a punishment duration to a human-readable string
 * Format : 1 year, 2 months, 10 days, 5 hours, 30 minutes, 10 seconds
 * @param seconds The duration in seconds
 */
function formatPunishmentDuration(seconds): string {
    if (seconds >= 31536000 * 5) { return "forever" }
    let output: string = "";
    let years: number = Math.floor(seconds / 31536000);
    let months: number = Math.floor((seconds % 31536000) / 2592000);
    let days: number = Math.floor(((seconds % 31536000) % 2592000) / 86400);
    let hours: number = Math.floor((((seconds % 31536000) % 2592000) % 86400) / 3600);
    let minutes: number = Math.floor(((((seconds % 31536000) % 2592000) % 86400) % 3600) / 60);
    let secs: number = Math.floor((((((seconds % 31536000) % 2592000) % 86400) % 3600) % 60));
    // ^^^ LMFAO ^^^ please send help

    if (years > 0) { output += `${years} year${years > 1 ? 's' : ''}, `; }
    if (months > 0) { output += `${months} month${months > 1 ? 's' : ''}, `; }
    if (days > 0) { output += `${days} day${days > 1 ? 's' : ''}, `; }
    if (hours > 0) { output += `${hours} hour${hours > 1 ? 's' : ''}, `; }
    if (minutes > 0) { output += `${minutes} minute${minutes > 1 ? 's' : ''}, `; }
    if (secs > 0) { output += `${secs} second${secs > 1 ? 's' : ''}, `; }
    return "for " + output.slice(0, -2); // Remove the last comma and space
}

@Controller('channel')
export class ChannelController {
    constructor(
        private channelService: ChannelService,
        private chatGateway: ChatGateway,
        private punishmentsService: PunishmentsService,
        private userService: UserService,
        private authService: AuthService,
        private dbService: DbService
    ) { }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Get('all')
    async allUsers(@Req() req) {
        return await this.channelService.allChannels(req.user);
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Get(':channel_id/messages')
    async channelMessages(@Param() dto: ChannelDto, @Req() req) {
        // Check if user is banned
        if (await this.punishmentsService.hasActiveBan(dto.channel_id, req.user['id'])) {
            throw new HttpException('You are banned from this channel', 403);
        }
        return await this.channelService.getMessages(dto.channel_id, req.user);
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Get(':channel_id/history/:last_message_id')
    async channelHistory(@Param() dto: ChannelDto, @Req() req) {
        if (!dto.last_message_id) { throw new HttpException('Invalid last_message_id', 400); }
        // Check if user is banned
        if (await this.punishmentsService.hasActiveBan(dto.channel_id, req.user['id'])) {
            throw new HttpException('You are banned from this channel', 403);
        }
        return await this.channelService.getHistory(dto.channel_id, req.user, dto.last_message_id);
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Get(":channel_id/punishments")
    async getPunishments(@Param() dto: ChannelDto, @Req() req) {
        const channel = await this.channelService.getChannel(dto.channel_id);
        const user = req.user;
        // Check if the user is admin or owner
        if (!channel.admins.map(a => a.user_id).includes(user['id']) && channel.owner_id !== user['id']) {
            throw new ForbiddenException("You are not allowed to get the punishments of this channel");
        }
        return await this.channelService.getPunishments(dto.channel_id);
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Get(":channel_id/members")
    async getMembers(@Param() dto: ChannelDto, @Req() req) {
        const channel = await this.channelService.getChannel(dto.channel_id);
        const user = req.user;
        // Check if the user is admin or owner
        if (!channel.admins.map(a => a.user_id).includes(user['id']) && channel.owner_id !== user['id']) {
            throw new ForbiddenException("You are not allowed to get the members of this channel");
        }
        return await this.channelService.getMembers(dto.channel_id);
    }
    @UseGuards(AuthGuard('jwt-2fa'))
    @Post(':channel_id/message')
    async createMessage(@Param() dto: ChannelDto, @Body() body: any, @Req() req) {
        if (!body || !body.content) { throw new HttpException('Invalid Message', 400); }
        if (body.content.length > 2000) { throw new HttpException('Message too long', 400); }

        // Check that the user is not muted
        if (await this.punishmentsService.hasActiveMute(dto.channel_id, req.user['id'])) {
            throw new HttpException('You are muted in this channel', 403);
        }

        // Check that the user is not banned
        if (await this.punishmentsService.hasActiveBan(dto.channel_id, req.user['id'])) {
            throw new HttpException('You are banned from this channel', 403);
        }

        // Check that the user is in the channel (if private)
        if (!await this.channelService.isUserInChannel(dto.channel_id, req.user['id'])) {
            throw new HttpException('You are not in this channel', 403);
        }

        let senderId = req.user['id'];
        let message: Message = await this.channelService.createMessage(senderId, dto.channel_id, body.content);
        let data: MessageData = {
            content: message.content,
            timestamp: message.timestamp,
            sender: req.user,
            message_id: message.message_id,
        }
        this.chatGateway.server.to(`channel-${dto.channel_id}`).emit('message', data);
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Post('create')
    async createChannel(@Body() body: any, @Req() req) {
        let ownerId = req.user['id'];
        let channel: Channel = await this.channelService.createChannel(body.name, ownerId, body.private, body.password);
        if (body.private && !body.password) {
            // Emit only creation to the owner
            this.chatGateway.server.to(`user-${ownerId}`).emit('newChannel', channel);
        } else {
            this.chatGateway.server.emit('newChannel', channel);
        }
        return channel;
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Delete(':channel_id')
    async deleteChannel(@Param() dto: ChannelDto, @Req() req) {
        let userId = req.user['id'];
        await this.channelService.deleteChannel(dto.channel_id, userId);
        this.chatGateway.server.emit('deleteChannel', dto.channel_id);
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Patch(':channel_id')
    async updateChannel(@Param() dto: ChannelDto, @Body() body: ChannelUpdateDto, @Req() req) {
        let userId = req.user['id'];
        let channel: any = await this.channelService.getChannel(dto.channel_id);
        if (!channel) { throw new HttpException('Channel not found', 404); }
        if (channel.owner_id !== userId) { throw new HttpException('You are not the owner of this channel', 403); }

        // if password is null, remove it in the db
        if (body.password === null) {
            channel.password = null;
        }
        else if (body.password !== '') { // otherwise if password isn't empty, hash it
            const hash = await argon2.hash(body.password);
            channel.password = hash;
        }

        channel.name = body.name;

        // If the private becomes private, give access to anyone that sent a message into it
        if (channel.private === false && body.private === true) {
            let members = await this.channelService.getMembers(dto.channel_id);
            if (channel.users && channel.users.length > 0) {
                await this.dbService.channelAccess.createMany({
                    data: members.users.map(m => {
                        return {
                            channel_id: dto.channel_id,
                            user_id: m.id,
                        }
                    })
                });
            }
            if (channel.admins && channel.admins.length > 0) {
                await this.dbService.channelAccess.createMany({
                    data: channel.admins.map(a => {
                        return {
                            channel_id: dto.channel_id,
                            user_id: a.user_id,
                        }
                    })
                });
            }
            await this.dbService.channelAccess.create({
                data: {
                    channel_id: dto.channel_id,
                    user_id: channel.owner_id,
                }
            });
        } else if (channel.private === true && body.private === false) { // If the channel becomes public, remove all access
            await this.dbService.channelAccess.deleteMany({
                where: {
                    channel_id: dto.channel_id,
                }
            });
            await this.dbService.channelInvite.deleteMany({
                where: {
                    channel_id: dto.channel_id,
                }
            });
        }

        channel.private = body.private;

        // update the channel
        let updatedChannel: Channel = await this.channelService.updateChannel(dto.channel_id, channel);
        this.chatGateway.server.emit('editChannel', updatedChannel);
        return updatedChannel;
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Post(':channel_id/join')
    async joinChannel(@Param() dto: ChannelDto, @Body() body: ChannelPasswordDto, @Req() req) {
        let channelPassword: string = (await this.channelService.getChannel(dto.channel_id)).password;

        if (channelPassword === null) {
            throw new HttpException('Channel has no password', 400);
        }

        // Check if user has been banned
        if (await this.punishmentsService.hasActiveBan(dto.channel_id, req.user['id'])) {
            throw new HttpException('You are banned from this channel', 403);
        }

        if (!await argon2.verify(channelPassword, body.password)) {
            throw new HttpException('Invalid password', 401);
        }

        let userId = req.user['id'];
        let result = await this.channelService.joinChannel(dto.channel_id, userId);
        if (result) {
            this.chatGateway.server.emit('joinChannel', { channel_id: dto.channel_id, user_id: userId });
            return { status: 201 };
        } else {
            throw new HttpException('You are already in this channel', 400);
        }
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Get('/invites')
    async getInvites(@Req() req) {
        let userId = req.user['id'];
        return await this.channelService.getInvites(userId);
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Post(':channel_id/invite')
    async inviteUser(@Param() dto: ChannelDto, @Body() body: GenericIdDto, @Req() req) {
        const senderId = req.user['id'];
        const receiverId = body.id;
        if (senderId === receiverId) {
            throw new BadRequestException("You cannot invite yourself to a channel");
        }
        const channel = await this.channelService.getChannel(dto.channel_id);
        if (!channel) {
            throw new NotFoundException("Unknown channel");
        }
        if (!channel.private || channel.password !== null) {
            throw new BadRequestException("You cannot invite someone to a public channel, or a private channel with a password");
        }
        // No special permission is required to invite someone to a private channel
        this.channelService.inviteToChannel(
            senderId,
            receiverId,
            dto.channel_id,
        )
        this.chatGateway.server.to(`user-${receiverId}`).emit('invite', channel);
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Delete(':channel_id/invite')
    async cancelInvite(@Param() dto: ChannelDto, @Req() req) {
        this.channelService.revokeInvite(
            req.user['id'],
            dto.channel_id,
        )
        this.chatGateway.server.to(`user-${req.user.id}`).emit('cancelInvite', dto.channel_id);
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Put(':channel_id/invite')
    async acceptInvite(@Param() dto: ChannelDto, @Req() req) {
        let inviter_name = await this.channelService.acceptInvite(
            req.user['id'],
            dto.channel_id,
        )
        this.chatGateway.server.to(`user-${req.user['id']}`).emit('acceptInvite', dto.channel_id);
        this.chatGateway.sendSystemMessage(dto.channel_id, `${req.user['name']} joined the channel, invited by ${inviter_name}`);
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Put(':channel_id/leave')
    async leaveChannel(@Param() dto: ChannelDto, @Req() req) {
        // User cannot leave if he's the owner, he must delete the channel OR transfer ownership
        const userId = req.user['id'];
        const channel = await this.channelService.getChannel(dto.channel_id);
        if (!channel) {
            throw new NotFoundException("Unknown channel");
        }
        if (!channel.private) {
            throw new BadRequestException("You cannot leave a public channel");
        }
        if (channel.owner_id === userId) {
            throw new ForbiddenException("You cannot leave a channel you own, delete it instead or transfer ownership");
        }
        await this.channelService.leaveChannel(userId, dto.channel_id);
        this.chatGateway.sendSystemMessage(dto.channel_id, `${req.user['name']} left the channel`);
        // Send a socket message to the user to leave the channel
        this.chatGateway.server.to(`user-${userId}`).emit('leaveChannel', dto.channel_id);
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Patch(':channel_id/transfer')
    async transferOwnership(@Param() dto: ChannelDto, @Body() body: OwnershipTransferDto, @Req() req) {
        if (req.user.otp && !body.otp) { // User has 2fa but didn't provide a code
            throw new BadRequestException("Missing authentication fields");
        }
        if (req.user.password && !req.user.otp && !body.password) { // User has no 2fa but has a password and didn't provide it
            throw new BadRequestException("Missing authentication fields");
        }

        const userId = req.user['id'];
        const channel = await this.channelService.getChannel(dto.channel_id);
        if (!channel) {
            throw new NotFoundException("Unknown channel");
        }
        if (channel.owner_id !== userId) {
            throw new ForbiddenException("You are not the owner of this channel");
        }

        // Get new owner data for system message
        let user = await this.userService.getUserById(body.new_owner);
        if (!user) {
            throw new NotFoundException("Unknown user");
        }

        // Check authentication fields
        if (req.user.otp && body.otp && !await this.authService.verifyOTP(req.user['id'], body.otp)) {
            throw new HttpException('Invalid code', 401);
        }
        if (!req.user.otp && req.user.password && body.password && !await this.authService.verifyPassword(req.user, body.password)) {
            throw new HttpException('Invalid password', 401);
        }

        // Update ownership
        this.channelService.setOwner(body.new_owner, dto.channel_id);

        this.chatGateway.server.to(`channel-${dto.channel_id}`).emit('updateOwner', {
            channel_id: dto.channel_id,
            new_owner: body.new_owner,
        });

        // Remove user from administrators if he was one
        this.channelService.setRole(body.new_owner, dto.channel_id, 0);
        this.chatGateway.server.to(`channel-${dto.channel_id}`).emit('removeStaff', {
            channel_id: dto.channel_id,
            user_id: body.new_owner,
        });

        // Send a system message and a socket ping to the channel to update roles / badges
        this.chatGateway.sendSystemMessage(dto.channel_id, `${req.user['name']} transferred its ownership to ${user.name}`,);
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Patch(":channel_id/update_role")
    async updateRole(@Param() dto: ChannelDto, @Body() body: RoleUpdateDto, @Req() req) {
        let channelStaff = await this.channelService.getChannelStaff(dto.channel_id);
        let powerStatus = (channelStaff.owner_id === req.user.id ? 2 : channelStaff.administrators.includes(req.user.id) ? 1 : 0);
        let targetStatus = (channelStaff.owner_id === body.user_id ? 2 : channelStaff.administrators.includes(body.user_id) ? 1 : 0);
        let targetRole: number = -1;
        switch (body.role) {
            case "admin":
                targetRole = 1;
                break;
            case "member":
                targetRole = 0;
                break;
            default:
                throw new BadRequestException("Invalid role");
        }
        if (targetRole == powerStatus) {
            throw new BadRequestException("No-op update");
        } else if (targetRole > powerStatus) {
            throw new ForbiddenException("You don't have enough privileges to update a user's role");
        } else if (targetStatus >= powerStatus) {
            throw new ForbiddenException("Target user's privileges are too high")
        }
        this.channelService.setRole(body.user_id, dto.channel_id, targetRole);
        let targetName: string = (await this.userService.getUserById(body.user_id)).name;
        // Send system message
        this.chatGateway.sendSystemMessage(dto.channel_id, `${req.user['name']} ${targetStatus > targetRole ? "demoted" : "promoted"} ${targetName} to ${body.role}`);
        // Send promotion socket
        this.chatGateway.server.to(`channel-${dto.channel_id}`).emit((targetStatus > targetRole ? 'removeStaff' : 'addStaff'), {
            channel_id: dto.channel_id,
            user_id: body.user_id,
        });
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Delete(':channel_id/:message_id')
    async deleteMessage(@Param() dto: MessageDeleteDto, @Req() req) {
        const userId = req.user['id'];
        const channel = await this.channelService.getChannel(dto.channel_id);
        if (!channel) {
            throw new NotFoundException("Unknown channel");
        }
        // Get message and check if user is author, admin or owner
        const message = await this.channelService.getMessage(dto.message_id);
        if (!message) {
            throw new NotFoundException("Unknown message");
        }
        if (message.sender_id !== userId && !channel.admins.map(a => a.user_id).includes(userId) && channel.owner_id !== userId) {
            throw new ForbiddenException("You are not allowed to delete this message");
        }
        await this.channelService.deleteMessage(dto.message_id);
        // Send a socket message
        this.chatGateway.server.to(`channel-${dto.channel_id}`).emit('deleteMessage', {
            channel_id: dto.channel_id,
            message_id: dto.message_id,
        });
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Put(':channel_id/ban/:user_id')
    async banUser(@Param() dto: UserActionDto, @Req() req, @Body() body: ChannelPunishmentDto) {
        // Get the channel and the remote user
        const channel = await this.channelService.getChannel(dto.channel_id);
        const user = await this.userService.getUserById(dto.user_id);
        const punisher = req.user;
        privilegesCheck(channel, punisher, user);
        // Check if the user is already banned
        const isBanned = await this.punishmentsService.hasActiveBan(dto.user_id, dto.channel_id);
        if (isBanned) {
            throw new BadRequestException("User is already banned");
        }
        await this.punishmentsService.applyPunishment(
            dto.user_id,
            req.user['id'],
            dto.channel_id,
            body.duration,
            "banned"
        );
        this.chatGateway.sendSystemMessage(dto.channel_id, `${req.user['name']} banned ${user.name} from the channel ${formatPunishmentDuration(body.duration)}`);
        // send socket to punished user
        this.chatGateway.server.to(`user-${dto.user_id}`).emit('punishment', {
            type: 'banned',
            channel_id: dto.channel_id,
            duration: body.duration || null,
        });
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Put(':channel_id/mute/:user_id')
    async muteUser(@Param() dto: UserActionDto, @Req() req, @Body() body: ChannelPunishmentDto) {
        // Get the channel and the remote user
        const channel = await this.channelService.getChannel(dto.channel_id);
        const user = await this.userService.getUserById(dto.user_id);
        const punisher = req.user;
        privilegesCheck(channel, punisher, user);
        // Check if the user is already muted
        const isMuted = await this.punishmentsService.hasActiveMute(dto.user_id, dto.channel_id);
        if (isMuted) {
            throw new BadRequestException("User is already muted");
        }
        await this.punishmentsService.applyPunishment(
            dto.user_id,
            req.user['id'],
            dto.channel_id,
            body.duration,
            "muted"
        );
        this.chatGateway.sendSystemMessage(dto.channel_id, `${req.user['name']} muted ${user.name} in the channel ${formatPunishmentDuration(body.duration)}`);
        // send socket to punished
        this.chatGateway.server.to(`user-${dto.user_id}`).emit('punishment', {
            type: 'muted',
            channel_id: dto.channel_id,
            duration: body.duration || null,
        });
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Put(':channel_id/kick/:user_id')
    async kickUser(@Param() dto: UserActionDto, @Req() req) {
        // Get the channel and the remote user
        const channel = await this.channelService.getChannel(dto.channel_id);
        if (channel && !channel.private) {
            throw new ForbiddenException("You can't kick a user from a public channel");
        }
        const user = await this.userService.getUserById(dto.user_id);
        const punisher = req.user;
        privilegesCheck(channel, punisher, user);
        // Check if the user is in the channel
        const isInChannel = await this.channelService.isUserInChannel(dto.channel_id, dto.user_id);
        if (!isInChannel) {
            throw new BadRequestException("User is not in the channel");
        }
        await this.channelService.leaveChannel(dto.user_id, dto.channel_id);
        this.chatGateway.sendSystemMessage(dto.channel_id, `${req.user['name']} kicked ${user.name} from the channel`);
        // send socket to punished
        this.chatGateway.server.to(`user-${dto.user_id}`).emit('punishment', {
            type: 'kicked',
            channel_id: dto.channel_id,
        });
    }
}
