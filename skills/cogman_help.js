module.exports = function(controller) {

    controller.hears(['help'], 'direct_message,direct_mention', function(bot, message) {

        let help = 'Cogman use cases:';
        help += '```';
        help += '@cogman help - show a list of use cases';
        help += '```';

        bot.reply(message, help)

        // bot.replyPublic(message, help);

    });
    
}
