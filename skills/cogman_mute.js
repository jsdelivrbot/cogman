/*

    This is a sample bot that provides a simple todo list function
    and demonstrates the Botkit storage system.

    Botkit comes with a generic storage system that can be used to
    store arbitrary information about a user or channel. Storage
    can be backed by a built in JSON file system, or one of many
    popular database systems.

    See:

        botkit-storage-mongo
        botkit-storage-firebase
        botkit-storage-redis
        botkit-storage-dynamodb
        botkit-storage-mysql

*/

module.exports = function(controller) {


    // listen for someone saying 'tasks' to the bot
    // reply with a list of current tasks loaded from the storage system
    // based on this user's id
    controller.hears('mutees', 'direct_message,direct_mention,mention', function(bot, message) {
        let returnMessage = '';

        controller.storage.teams.get(bot.team_info.id, function (err, team) {
            if (err) {
                debug('Error: could not load team from storage system:', payload.identity.team_id, err);
            } else {
                if (!team || !team.mutees || team.mutees.length == 0) {
                    returnMessage = 'No-one on your team is muted';
                } else {
                    var mutees = team.mutees.map(mutee => `<@${mutee}>`).join(', ');

                    returnMessage = 'Team mutees: ' + mutees;
                }
            }
        });

        if (returnMessage) {
            bot.sendEphemeral({
                channel: message.channel,
                user: message.user,
                text: returnMessage
            });
        }
    });

    controller.hears(['^mute (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
        let returnMessage = '';

        var userToMute = message.match[1];

        userToMute = userToMute.replace(/^\<\@/, '').replace(/\>$/, '');

        controller.storage.teams.get(bot.team_info.id, function (err, team) {
            if (err) {
                debug('Error: could not load team from storage system:', payload.identity.team_id, err);
            } else {
                if (team) {
                    if (!team.mutees) {
                        team.mutees = [];
                    }

                    var userToUnmuteIndex = team.mutees.indexOf(userToMute);

                    if (userToUnmuteIndex !== -1) {
                        returnMessage = '<@' + userToMute + '>' + ' is already muted';
                    } else {
                        team.mutees.push(userToMute);

                        controller.storage.teams.save(team, function(err, saved) {
                            if (err) {
                                returnMessage = 'I experienced an error muting the user: ' + err;
                            } else {
                                returnMessage = '<@' + userToMute + '>' + ' has been muted';
                            }
                        });
                    }
                }
            }
        });

        if (returnMessage) {
            bot.sendEphemeral({
                channel: message.channel,
                user: message.user,
                text: returnMessage
            });
        }
    });

    controller.hears(['^unmute (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
        let returnMessage = '';

        var userToUnmute = message.match[1];

        userToUnmute = userToUnmute.replace(/^\<\@/, '').replace(/\>$/, '');

        controller.storage.teams.get(bot.team_info.id, function (err, team) {
            if (err) {
                debug('Error: could not load team from storage system:', payload.identity.team_id, err);
            } else {
                if (team) {
                    if (!team.mutees) {
                        team.mutees = [];
                    }

                    var userToUnmuteIndex = team.mutees.indexOf(userToUnmute);

                    if (userToUnmuteIndex !== -1) {
                        team.mutees.splice(userToUnmuteIndex, 1)

                        controller.storage.teams.save(team, function(err, saved) {
                            if (err) {
                                returnMessage = 'I experienced an error unmuting the user: ' + err;
                            } else {
                                returnMessage = '<@' + userToUnmute + '>' + ' has been unmuted';
                            }
                        });
                    } else {
                        returnMessage = '<@' + userToUnmute + '>' + ' is not in the mutees list';
                    }
                }
            }
        });

        if (returnMessage) {
            bot.sendEphemeral({
                channel: message.channel,
                user: message.user,
                text: returnMessage
            });
        }
    });
}
