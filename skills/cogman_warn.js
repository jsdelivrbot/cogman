module.exports = function(controller) {

    controller.hears('^warnings (.*)', 'direct_message,direct_mention', function(bot, message) {
        var userToWarn = message.match[1].replace(/^\<\@/, '').replace(/\>$/, '');

        controller.storage.users.get(userToWarn, function (err, user) {
            if (!user || !user.warnings || user.warnings.length == 0) {
                bot.reply(message, 'User has no warnings');
            } else {
                var warnings = user.warnings.map(warnee => `${warnee}, `).join(', ');

                bot.reply(message, 'User warnings: ' + warnings);
            }

        });
    });

    controller.hears('^clearWarnings (.*)', 'direct_message,direct_mention', function(bot, message) {
        var userToClearWarningsFor = message.match[1].replace(/^\<\@/, '').replace(/\>$/, '');

        controller.storage.users.get(userToClearWarningsFor, function (err, user) {
            if (!user || !user.warnings || user.warnings.length == 0) {
                bot.reply(message, 'User has no warnings');
            } else {
                user.warnings = [];

                controller.storage.users.save(user, function(err, saved) {
                    if (saved) {
                        bot.reply(message, 'User warnings cleared');
                    }
                });
            }
        });
    });

    controller.hears('^warn (.*)', 'direct_message,direct_mention', function(bot, message) {
        var userToWarn = message.match[1].replace(/^\<\@/, '').replace(/\>$/, '');

        bot.startConversation(message, function(err, convo) {
            convo.ask('What would you like to warn <@' + userToWarn + '> about?', function(response, convo) {
                controller.storage.users.get(userToWarn, function (err, user) {
                    if (user) {
                        if (! user.warnings) {
                            user.warnings = []
                        }

                        controller.storage.users.save(user, function(err, saved) {
                            if (saved) {
                                user.warnings.push(response.text);

                                bot.api.im.open({user: userToWarn}, function(err, res) {
                                    bot.sendEphemeral({
                                        channel: res.channel.id,
                                        user: userToWarn,
                                        text: 'You have received a warning:\n' + response.text
                                    });
                                });
                            }
                        });
                    }
                });

                convo.next();

                convo.say('OK, I\'ve sent that warning.');
            });
        });
    });

}
