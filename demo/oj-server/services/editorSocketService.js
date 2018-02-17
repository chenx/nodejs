const redisClient = require('../modules/redisClient');
const TIMEOUT_IN_SECONDS = 3600;

module.exports = function(io) {
    const sessionPath = '/tmp_session';

    // collaboration sessions
    const collaborations = {};
    const socketIdToSessionId = {};
    io.on('connection', (socket) => {
        // console.log(socket);
        // const message = socket.handshake.query['message'];
        // console.log(message);
        // io.to(socket.id).emit('message', 'hahaha from server');
        const sessionId = socket.handshake.query['sessionId'];
        socketIdToSessionId[socket.id] = sessionId;

        // if (!(sessionId in collaborations)) {
        //     collaborations[sessionId] = {
        //         participants: []
        //     };
        // }
        // collaborations[sessionId]['participants'].push(socket.id);
        if (sessionId in collaborations) {
            collaborations[sessionId]['participants'].push(socket.id);
        } else {
            redisClient.get(sessionPath + '/' + sessionId, data => {
                if (data) {
                    console.log('session terminated before, pulling back from redis');
                    collaborations[sessionId] = {
                        'cachedInstructions': JSON.parse(data), 
                        'participants': []
                    };
                } else {
                    console.log('create new session');
                    collaborations[sessionId] = {
                        'cachedInstructions': [], 
                        'participants': []
                    };
                }
                collaborations[sessionId]['participants'].push(socket.id);
            });
        }

        socket.on('change', delta => {
            console.log('socket' + socketIdToSessionId[socket.id] + ' ' + delta);
            // const sessionId = socketIdToSessionId[socket.id];
            // if (sessionId in collaborations) {
            //     const participants = collaborations[sessionId]['participants'];
            //     for (let participant of participants) {
            //         if (socket.id != participant) {
            //             io.to(participant).emit('change', delta);
            //         }
            //     }
            // } else {
            //     console.warn('WARNING');
            // }
            const sessionId = socketIdToSessionId[socket.id];
            if (sessionId in collaborations) {
                // console.log('push cached instruction: ' + JSON.stringify(delta));
                collaborations[sessionId]['cachedInstructions'].push(['change', delta, Date.now()]);
            }
            forwardEvent(socket.id, 'change', delta);
        });

        socket.on('cursorMove', cursor => {
            console.log('cursorMove' + socketIdToSessionId[socket.id] + ' ' + cursor);
            cursor = JSON.parse(cursor);
            cursor['socketId'] = socket.id;
            forwardEvent(socket.id, 'cursorMove', JSON.stringify(cursor));
        });

        socket.on('restoreBuffer', () => {
            const sessionId = socketIdToSessionId[socket.id];
            console.log('restore buffer for session: ' + sessionId);
            if (sessionId in collaborations) {
                const instructions = collaborations[sessionId]['cachedInstructions'];
                for (let instruction of instructions) {
                    // console.log('restore instruction: ' + JSON.stringify(instruction[0]) + ',' + JSON.stringify(instruction[1]));
                    socket.emit(instruction[0], instruction[1]);  // ('change', delta)
                }
            } else {
                console.log('restoreBuffer error: sessionId NOT in collaborations');
            }
        });

        socket.on('disconnect', () => {
            const sessionId = socketIdToSessionId[socket.id];
            console.log('socket ' + socket.id + ' disconnected');
            let foundAndRemove = false;
            if (sessionId in collaborations) {
                const participants = collaborations[sessionId]['participants'];
                const index = participants.indexOf(socket.id);
                if (index >= 0) {
                    participants.splice(index, 1);
                    foundAndRemove = true;
                    if (participants.length == 0) {
                        const key = sessionPath + '/' + sessionId;
                        const value = JSON.stringify(collaborations[sessionId]['cachedInstructions']);
                        redisClient.set(key, value, redisClient.redisPrint);
                        redisClient.expire(key, TIMEOUT_IN_SECONDS);
                        delete collaborations[sessionId];
                    }
                }
            } else {
                console.log('disconnect error: sessionId NOT in collaborations');
            }
        });
    });

    const forwardEvent = function(socketId, eventName, dataString) {
        const sessionId = socketIdToSessionId[socketId];
        if (sessionId in collaborations) {
            const participants = collaborations[sessionId]['participants'];
            for (let participant of participants) {
                if (socketId != participant) {
                    io.to(participant).emit(eventName, dataString);
                }
            }
        } else {
            console.warn('WARNING');
        }
    };
}