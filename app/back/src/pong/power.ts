import { Server } from 'socket.io';
import { roomInterface, BallData, PowerInterface } from 'src/interfaces/pong.interface';
import { convertToPixel } from './game.service';

// set playground value
const canvasHeight = 300;
const canvasWidth = 500;
const playerHeight = canvasHeight / 4;
const radiusBall = 10;
const spaceBetweenPlayerAndWall = canvasWidth * 0.05;


// Create New Power on Canvas && Add Power to the list of power in game
export const handleNewPower = (
    room: roomInterface,
    server: Server,
    timeToNewPower: number,
    powers: PowerInterface[],
    idPower: number,
) => {
    if (timeToNewPower === 100) {
        timeToNewPower = 0;
        if (powers.length < 3) {
            console.log('new power', powers.length);
            idPower += 1;

            const newPower = {
                x: Math.floor(Math.random() * 60) + 20,
                y: Math.floor(Math.random() * 60) + 20,
                type: Math.floor(Math.random() * 3),
                time: 0,
                id: idPower,
            };
            powers.push(newPower);
            server.to(room.pongState.player1.id).emit('newPower', {
                x: newPower.x,
                y: newPower.y,
                id: idPower,
                type: newPower.type
            });
            server.to(room.pongState.player2.id).emit('newPower', {
                x: 100 - newPower.x,
                y: 100 - newPower.y,
                id: idPower,
                type: newPower.type
            });
            return true;
        }
    }
    return false;
};

export const handleColisionWithPower = (room: roomInterface, server: Server, powers: PowerInterface[]) => {
    powers.forEach((power) => {
        if (room.pongState.ball.x > convertToPixel(power.x, canvasWidth) - 10 &&
            room.pongState.ball.x < convertToPixel(power.x, canvasWidth) + 10 &&
            room.pongState.ball.y > convertToPixel(power.y, canvasHeight) - 20 &&
            room.pongState.ball.y < convertToPixel(power.y, canvasHeight) + 20
        ) {
            server.to(room.pongState.player1.id).emit('removePower', {
                id: power.id,
            });
            server.to(room.pongState.player2.id).emit('removePower', {
                id: power.id,
            });
            powers.splice(powers.indexOf(power), 1);
            // random power
            const random = Math.floor(Math.random() * 3);
            if (random === 0) {
                console.log("speed up")
                room.pongState.ball.speedX + 0.5;
                room.pongState.ball.speedY + 0.5;
            }
            else if (random === 1) {
                console.log("change direction ")
                let newSpeedY = -room.pongState.ball.speedY
                if (newSpeedY < 0)
                    newSpeedY - 0.2;
                else
                    newSpeedY + 0.2;
                room.pongState.ball.speedY = newSpeedY;
            } else {
                console.log('change size');
            }
        }
    });
};
