module.exports = function(controller) {

    controller.hears('mutees', 'direct_message,direct_mention,mention', function(bot, message) {
        controller.storage.teams.get(bot.team_info.id, function (err, team) {
            if (!team || !team.mutees || team.mutees.length == 0) {
                respond(bot, message, 'No-one on your team is muted');
            } else {
                var mutees = team.mutees.map(mutee => `<@${mutee}>`).join(', ');

                respond(bot, message, 'Team mutees: ' + mutees);
            }
        });
    });

    controller.hears(['^mute (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
        var userToMute = message.match[1].replace(/^\<\@/, '').replace(/\>$/, '');

        controller.storage.teams.get(bot.team_info.id, function (err, team) {
            if (team) {
                if (!team.mutees) {
                    team.mutees = [];
                }

                var userToUnmuteIndex = team.mutees.indexOf(userToMute);

                if (userToUnmuteIndex !== -1) {
                    respond(bot, message, '<@' + userToMute + '>' + ' is already muted');
                } else {
                    team.mutees.push(userToMute);

                    controller.storage.teams.save(team, function(err, saved) {
                        respond(bot, message, '<@' + userToMute + '>' + ' has been muted');
                    });
                }
            }
        });
    });

    controller.hears(['^unmute (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
        var userToUnmute = message.match[1].replace(/^\<\@/, '').replace(/\>$/, '');

        controller.storage.teams.get(bot.team_info.id, function (err, team) {
            if (team) {
                if (!team.mutees) {
                    team.mutees = [];
                }

                var userToUnmuteIndex = team.mutees.indexOf(userToUnmute);

                if (userToUnmuteIndex !== -1) {
                    team.mutees.splice(userToUnmuteIndex, 1)

                    controller.storage.teams.save(team, function(err, saved) {
                        respond(bot, message, '<@' + userToUnmute + '>' + ' has been unmuted');
                    });
                } else {
                    respond(bot, message, '<@' + userToUnmute + '>' + ' is not in the mutees list');
                }
            }
        });
    });

    function respond(bot, message, returnMessage) {
        bot.sendEphemeral({
            channel: message.channel,
            user: message.user,
            text: returnMessage
        });
    }
}
