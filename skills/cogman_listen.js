var wordfilter = require('wordfilter');

module.exports = function(controller) {
    controller.on('bot_channel_join', function(bot, message) {
        bot.reply(message, 'Never fear, Cogman is here!');
    });

    controller.on('user_channel_join,user_group_join', function(bot, message) {
        bot.reply(message, 'Welcome, <@' + message.user + '>');
    });

    controller.hears(['(.*)'], ['ambient,direct_mention,direct_message'], function(bot, message) {
        if (wordfilter.blacklisted(message.text)) {
            bot.api.chat.delete({
                token: bot.config.bot.app_token,
                ts: message.ts,
                channel: message.channel
            }, function (err, res) {
                if (err) {
                    bot.botkit.log('Failed to delete message :(', err);
                }
            });

            controller.trigger('swear_trigger', message);

            return;
        }

        controller.storage.users.get(message.user, function(err, user_data) {
            if (! user_data) {
                bot.api.users.info({user: message.user}, function(err, identity_data) {
                    controller.storage.users.save({
                        id: message.user,
                        username: identity_data.user.profile.display_name,
                        first_name: identity_data.user.profile.first_name,
                        last_name: identity_data.user.profile.last_name,
                        full_name: identity_data.user.profile.real_name,
                        email: identity_data.user.profile.email, // may be blank
                        timezone_offset: (identity_data.user.tz_offset / (60 * 60)), // convert from seconds to hours
                        timezone: identity_data.user.tz,
                    });
                });
            }
        });
    });
}
