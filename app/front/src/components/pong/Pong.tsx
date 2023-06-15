import styles from '../../styles/pong.module.css'
import { useState, useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { Text, Avatar, Container, Grid, Row, Card, Spacer, Col } from '@nextui-org/react';
import Image from 'next/image'
import { useUser } from '@/contexts/user.context';
import { User } from '../../interfaces/user.interface'
import { PlayerEndGame, BallPosition, BallVectorSpeed } from '@/interfaces/pong.interface';
import { headers } from 'next/dist/client/components/headers';

const canvasHeightServerSide : number = 300;
const canvasWidthServerSide : number = 500;

function Player({ x, y, canvasHeight }: { x: number, y: number, canvasHeight: number }) {
    return (
        <div className={styles.player} style={{ top: y, left: x, height: canvasHeight / 8 }}></div>
    )
}

function Ball({ x, y }: { x: number, y: number }) {
    return (
        <div className={styles.ball} style={{ top: y, left: x }}></div>
    )
}

function Obstacle({ x, y, size, isActive }: { x: number, y: number, size: number, isActive: boolean }) {

    return <>{isActive && <div className={styles.obstacle} style={{ top: y, left: x, height: size }}></div>}</>
}

function Power({ isActive, x, y, type }: { isActive: boolean, x: number, y: number, type: number }) {
    if (type === 0)
        return <>{isActive && <Image src="/power.png" alt='power' width={30} height={40} className={styles.power} style={{ top: y, left: x }} />}</>
    else if (type === 1)
        return <>{isActive && <Image src="/bounce.png" alt='power' width={40} height={40} className={styles.power} style={{ top: y, left: x }} />}</>
    else
        return <>{isActive && <Image src="/fence.png" alt='power' width={40} height={40} className={styles.power} style={{ top: y, left: x }} />}</>
}

const convertToPixel = (value: number, maxValue: number) => {
    return (value * maxValue) / 100;
};

export default function Pong({ roomName, who, handleSetEndGame }: { roomName: string, who: number, handleSetEndGame: (endGame: PlayerEndGame) => void }) {
    const [score, setScore] = useState({ scorePlayer1: 0, scorePlayer2: 0 });
    const [playerOnePosition, setPlayerOnePosition] = useState<number>(0);
    const [playerTwoPosition, setPlayerTwoPosition] = useState<number>(0);
	const [ballPosition, setBallPosition] = useState<BallPosition>({
		x: 0,
		y: 0,
	})
    const [BallVectorSpeed, setBallVectorSpeed]  = useState<BallVectorSpeed>({
        speedX : 0,
        speedY : 0
    })
    const [canvas, setCanvas] = useState({ height: 0, width: 0, speedPlayer: 0 });
    const [powers, setPowers] = useState([
        { isActive: false, x: 0, y: 0, id: 0, type: 0 },
        { isActive: false, x: 0, y: 0, id: 1, type: 0 },
        { isActive: false, x: 0, y: 0, id: 2, type: 0 },
        { isActive: false, x: 0, y: 0, id: 3, type: 0 },
        { isActive: false, x: 0, y: 0, id: 4, type: 0 },
        { isActive: false, x: 0, y: 0, id: 5, type: 0 }
    ]); // [{x: 0, y: 0, type: 'speedUp', time: 0}]
    const [obstacles, setObstacles] = useState([
        { isActive: false, x: 0, y: 0, size: 0, id: 0 },
        { isActive: false, x: 0, y: 0, size: 0, id: 1 }
    ])
    const ref = useRef(null);
    const { socket } = useUser();

    const [keyState, setKeyState] = useState<number>(0);

    // ==================================================================================================================

    // ======================== CallBack pour update les dimensions du canvas ============================================

    // CallBack pour update le canvas avec les nouvelles dimensions
    const callBackSetCanvasProperties = useCallback(() => {
        if (ref && ref.current) {
            const height = ref.current.getBoundingClientRect().height;
            const width = ref.current.getBoundingClientRect().width;
            const speedPlayer = height / 42;
            if (height !== canvas.height || width !== canvas.width) {
                setCanvas((prevCanvas) => ({
                    ...prevCanvas,
                    height,
                    width,
                    speedPlayer
                }));
            }
        }
    }, [canvas.height, canvas.width]);

    // ==================================================================================================================

    // ======================== CallBack pour update la position de la balle ============================================

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
            setKeyState(1);
        }
        else if (e.key === 'ArrowDown') {
            setKeyState(-1);
        }
    }, [canvas]);


    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            setKeyState(0);
        }
    }, [canvas]);
    // =================================================================================================================

    // ======================== CallBack pour update la position de la balle ============================================

    const gameLoop = useCallback(() => {
        callBackSetCanvasProperties();
        // Arrow up
        let playerPos: number = (who === 0) ? playerOnePosition : playerTwoPosition;
        let newPos: number = -1;
        let newPosPixel: number = -1;
        switch (keyState) {
            case 1: // up
                newPos = (playerPos - canvas.speedPlayer) * 100 / canvas.height;
                newPos = (newPos < 0) ? 0 : newPos;
                newPosPixel = convertToPixel(newPos, canvas.height);
                break;
            case -1: // down
                newPos = (playerPos + canvas.speedPlayer) * 100 / canvas.height;
                newPos = (newPos > 87.5) ? 87.5 : newPos;
                newPosPixel = convertToPixel(newPos, canvas.height);
                break;
            default:
                newPos = -1;
                break;
        }
		setBallPosition({ x : ballPosition.x + BallVectorSpeed.speedX, y : ballPosition.y + BallVectorSpeed.speedY });
		// update paddle position
        if (newPos && newPos !== -1 && newPos !== playerPos) {
            socket.emit('playerMove',
                {
                    percent: newPos,
                    clientId: socket.id,
                    room: roomName
                }
            );
            if (who === 0)
                setPlayerOnePosition(newPosPixel);
            else
                setPlayerTwoPosition(newPosPixel);
        }
    }, [ballPosition, callBackSetCanvasProperties]);

    // =================================================================================================================

    // =============================== Handle receive socket information ===============================================

    const handleMovePlayer = ({ player, percent }: { player: number, percent: number}) => {
        if (player !== who) {
            if (player === 0) {
                setPlayerOnePosition(convertToPixel(percent, canvas.height));
            } else {
                setPlayerTwoPosition(convertToPixel(percent, canvas.height));
            }
        }
    }

    const handleUpdateScore = ({ scorePlayer1, scorePlayer2 }: { scorePlayer1: number, scorePlayer2: number }) => {
        setScore({ scorePlayer1, scorePlayer2 });
    }

	// set x & y position of ball 
    const handleUpdateBallPosition = ({ x, y }: { x: number, y: number }) => {
        x = convertToPixel(x, canvas.width);
        y = convertToPixel(y, canvas.height);
		setBallPosition({x : x, y : y});
    }

	// set xSpeed & ySpeed of ball 
    const handleUpdateVectorBall = ({ speedX, speedY }: { speedX: number, speedY: number }) => {
        const ratioX = canvasHeightServerSide / canvas.height;
        const ratioY = canvasWidthServerSide / canvas.width;

		setBallVectorSpeed({speedX : speedX * ratioX, speedY : speedY * ratioY});
    }

    const handleNewPowers = ({ x, y, id, type }: { x: number, y: number, id: number, type: number }) => {
        const PixelX = convertToPixel(x, canvas.width);
        const PixelY = convertToPixel(y, canvas.height);
        console.log("new power id", id, PixelX, PixelY);
        setPowers(prevPowers => {
            return prevPowers.map((power) => {
                if (power.id === id) {
                    return { isActive: true, x: PixelX, y: PixelY, id: id, type: type };
                } else {
                    return power;
                }
            });
        });
    }

    const handleRemovePower = ({ id }: { id: number }) => {
        setPowers(prevPowers => {
            return prevPowers.map((power) => {
                if (power.id == id) {
                    return { isActive: false, x: 0, y: 0, id: id, type: 0 };
                } else {
                    return power;
                }
            });
        });
    }

    const handleAddObstacle = ({ x, y, id, size }: { x: number, y: number, id: number, size: number }) => {
        let sizePixels = convertToPixel(size, canvas.height);
        let xPixels = convertToPixel(x, canvas.width);
        let yPixels = convertToPixel(y, canvas.height);
        console.log(x, y, size, xPixels, yPixels, sizePixels)
        setObstacles(prevObstacles => {
            return prevObstacles.map((obstacle) => {
                if (obstacle.id == id) {
                    return { isActive: true, x: xPixels, y: yPixels, size: sizePixels, id: id };
                } else {
                    return obstacle;
                }
            });
        });
    }

    const handleResetPlayer = ({ percentP1, percentP2 }: { percentP1: number, percentP2: number }) => {
        console.log('resetPlayers', percentP1, percentP2);
        const newYP1 = convertToPixel(percentP1, canvas.height);
        const newYP2 = convertToPixel(percentP2, canvas.height);
        setPlayerOnePosition(newYP1);
        setPlayerTwoPosition(newYP2);
    }

    const handleEndGame = (endGame: PlayerEndGame) => {
        handleSetEndGame(endGame);
        console.log(endGame);
    }

    useEffect(() => {
        socket.on('playerMove', handleMovePlayer);
        socket.on('updateScore', handleUpdateScore);
        socket.on('updateBallPosition', handleUpdateBallPosition);
		socket.on('updateBallVector', handleUpdateVectorBall);
        socket.on('resetPlayers', handleResetPlayer);
        socket.on('newPower', handleNewPowers);
        socket.on('removePower', handleRemovePower);
        socket.on('addObstacle', handleAddObstacle);
        socket.on('endGame', handleEndGame);
        return () => {
            socket.off('playerMove', handleMovePlayer);
            socket.off('updateScore', handleUpdateScore);
            socket.off('updateBallPosition', handleUpdateBallPosition);
			socket.off('updateBallVector', handleUpdateVectorBall);
            socket.off('newPower', handleNewPowers);
            socket.off('resetPlayers', handleResetPlayer);
            socket.off('removePower', handleRemovePower);
            socket.off('addObstacle', handleAddObstacle);
            socket.off('endGame', handleEndGame);
        }
    }, [socket, roomName, canvas]);

    useEffect(() => {
        if (socket) {
            requestAnimationFrame(gameLoop);
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
                window.removeEventListener('keyup', handleKeyUp);
                cancelAnimationFrame(gameLoop);
            }
        }
    }, [gameLoop, canvas, socket]);

    function DisplayInfoPlayer({ avatar, username, score, elo, reversed }: { avatar: string, username: string, score: number, elo: number, reversed: boolean }) {
        if (!reversed) {
            return <>
                <Container>
                    <Row justify='flex-start'>
                        <Avatar size={'lg'} src={avatar} />
                        <Spacer x={1} />
                        <Text css={{ transform: 'translateY(75%)', minWidth: "100px" }} h5>{username}</Text>
                    </Row>
                </Container>
            </>
        } else {
            return <>
                <Container>
                    <Row justify='flex-end'>
                        <Text css={{ transform: 'translateY(75%)', minWidth: "100px", ta: 'right' }} h5>{username}</Text>
                        <Spacer x={1} />
                        <Avatar size={'lg'} src={avatar} />
                    </Row>
                </Container>
            </>

        }
    }

    function DisplayScore({ scorePlayer1, scorePlayer2 }: { scorePlayer1: number, scorePlayer2: number }) {
        return <>
            <Container>
                <Row justify='center'>
                    <Text h1>{scorePlayer1}</Text>
                    <Spacer x={1} />
                    <Text h1>-</Text>
                    <Spacer x={1} />
                    <Text h1>{scorePlayer2}</Text>
                </Row>
            </Container>
        </>
    }

    // ======================== Render ============================================
    return (
        <>
            <Col>
                <DisplayScore scorePlayer1={score.scorePlayer1} scorePlayer2={score.scorePlayer2} />
                <div>
                    <div ref={ref} id="pong" className={styles.board}>
                        <Ball x={ballPosition.x} y={ballPosition.y} />
                        <Player x={canvas.width * 5 / 100 - 12} y={playerOnePosition} canvasHeight={canvas.height} />
                        <Player x={canvas.width - canvas.width * 5 / 100} y={playerTwoPosition} canvasHeight={canvas.height} />
                        <Power x={powers[0].x} y={powers[0].y} isActive={powers[0].isActive} type={powers[0].type} />
                        <Power x={powers[1].x} y={powers[1].y} isActive={powers[1].isActive} type={powers[1].type} />
                        <Power x={powers[2].x} y={powers[2].y} isActive={powers[2].isActive} type={powers[2].type} />
                        <Power x={powers[3].x} y={powers[3].y} isActive={powers[3].isActive} type={powers[3].type} />
                        <Power x={powers[4].x} y={powers[4].y} isActive={powers[4].isActive} type={powers[4].type} />
                        <Power x={powers[5].x} y={powers[5].y} isActive={powers[5].isActive} type={powers[5].type} />
                        <Obstacle x={obstacles[0].x} y={obstacles[0].y} size={obstacles[0].size} isActive={obstacles[0].isActive} />
                        <Obstacle x={obstacles[1].x} y={obstacles[1].y} size={obstacles[1].size} isActive={obstacles[1].isActive} />
                    </div>
                </div>
            </Col>
        </>
    );
}
