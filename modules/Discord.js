const Discord = require("discord.js");
const Events = require('events');
const Path = require('path');

const authorImageURL = 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/75/753bd236bb93a2484807ba75a3dbb916441825bc_full.jpg';

module.exports = function(Config) {
    this.client = new Discord.Client();
    this.events = new Events.EventEmitter();

    this.login = () => {
        const _this = this;
        _this.client.login(Config.Discord.botToken);
    };

    this.client.on('error', (err) => {
        const _this = this;
        _this.events.emit('error', 'error_event', err);
    });

    this.client.on('ready', () => {
        const _this = this;
        _this.events.emit('ready');
    });

    this.client.on('message', (message) => {
        const _this = this;

        if (message.author.bot) return;
        if (message.content.indexOf(Config.Discord.botPrefix) !== 0) return;

        const channelType = message.channel.type;
        const channelName = message.channel.name;
        const channelID = message.channel.id;
        if (channelType != 'text' || !channelName || channelID != Config.Discord.channelID) return;

        if (message.member.roles.cache.some(role => role.name === Config.Discord.roleName)) {
            const arguments = message.content.slice(Config.Discord.botPrefix.length).trim().split(/ +/g);
            const command = arguments.shift().toLowerCase();

            if (command === 'add') {
                const argument = arguments.join(' ');
                _this.events.emit('add', argument, message);
            }

            if (command === 'stats') {
                _this.events.emit('stats', message);
            }
        } else {
            return message.reply(`You don't have permissions to use this command!`);
        }
    });

    this.createBanMessage = (messageTitle, profileField, userField, dateField, imagePath) => {
        if (imagePath) {
            return new Discord.MessageEmbed()
            .setTitle(messageTitle)
            .addFields(profileField, userField, dateField)
            .attachFiles([imagePath])
            .setImage('attachment://' + Path.parse(imagePath).base)
            .setTimestamp()
            .setFooter('SteamBanChecker by IceQ1337', authorImageURL);
        } else {
            return new Discord.MessageEmbed()
            .setTitle(messageTitle)
            .addFields(profileField, userField, dateField)
            .setTimestamp()
            .setFooter('SteamBanChecker by IceQ1337', authorImageURL);
        }
    };

    this.createStatsMessage = (messageTitle, totalProfilesField, bannedProfilesField, percentageField, totalProfilesUserField, bannedProfilesUserField, percentageUserField) => {
        return new Discord.MessageEmbed()
        .setTitle(messageTitle)
        .addFields(totalProfilesField, bannedProfilesField, percentageField, { name: '\u200B', value: '\u200B' }, totalProfilesUserField, bannedProfilesUserField, percentageUserField)
        .setTimestamp()
        .setFooter('SteamBanChecker by IceQ1337', authorImageURL);
    };

    this.sendReply = (message, messageText) => {
        message.reply(messageText);
    };

    this.sendMessage = (messageText) => {
        const _this = this;
        _this.client.channels.cache.get(Config.Discord.channelID).send(messageText).catch((err) => _this.events.emit('error', 'sendMessage', err));
    };
}