import { useState, useEffect, useCallback } from 'react'
import './App.css'

const TOWER_HEIGHT = 20
const GAME_TIME = 60 // seconds
const PLAYER_SIZE = 32
const FLOOR_HEIGHT = 40

function App() {
  const [playerLevel, setPlayerLevel] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_TIME)
  const [gameState, setGameState] = useState('start') // start, playing, ended
  const [coins, setCoins] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    const savedHighScore = localStorage.getItem('towerGameHighScore')
    return savedHighScore ? parseInt(savedHighScore, 10) : 0
  })
  const [playerX, setPlayerX] = useState(50)

  // Timer logic
  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, endGame])

  // Keyboard controls
  const handleKeyPress = useCallback((e) => {
    if (gameState !== 'playing') return

    switch(e.key) {
      case 'ArrowLeft':
        setPlayerX(prev => Math.max(10, prev - 10))
        break
      case 'ArrowRight':
        setPlayerX(prev => Math.min(90, prev + 10))
        break
      case 'ArrowUp':
      case ' ':
        if (playerLevel < TOWER_HEIGHT - 1) {
          setPlayerLevel(prev => {
            const newLevel = prev + 1
            setCoins(c => c + newLevel * 10) // More coins for higher levels
            return newLevel
          })
        }
        break
      case 'ArrowDown':
        if (playerLevel > 0) {
          setPlayerLevel(prev => prev - 1)
        }
        break
    }
  }, [gameState, playerLevel])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  const endGame = useCallback(() => {
    setGameState('ended')
    setPlayerLevel(current => {
      if (current > highScore) {
        setHighScore(current)
        localStorage.setItem('towerGameHighScore', current.toString())
      }
      return current
    })
  }, [highScore])

  const startGame = () => {
    setGameState('playing')
    setPlayerLevel(0)
    setTimeLeft(GAME_TIME)
    setCoins(0)
    setPlayerX(50)
  }

  const renderTower = () => {
    const floors = []
    for (let i = TOWER_HEIGHT - 1; i >= 0; i--) {
      const isPlayerFloor = i === playerLevel
      floors.push(
        <div
          key={i}
          className={`floor ${isPlayerFloor ? 'current-floor' : ''}`}
          style={{ height: `${FLOOR_HEIGHT}px` }}
        >
          <div className="floor-number">{i + 1}</div>
          <div className="floor-platform"></div>
          {isPlayerFloor && (
            <div
              className="player"
              style={{
                left: `${playerX}%`,
                width: `${PLAYER_SIZE}px`,
                height: `${PLAYER_SIZE}px`
              }}
            >
              🧗
            </div>
          )}
        </div>
      )
    }
    return floors
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>🏰 Башня Времени</h1>
        <div className="stats">
          <div className="stat">
            <span className="stat-label">Уровень:</span>
            <span className="stat-value">{playerLevel + 1}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Время:</span>
            <span className="stat-value">{timeLeft}с</span>
          </div>
          <div className="stat">
            <span className="stat-label">Монеты:</span>
            <span className="stat-value">💰 {coins}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Рекорд:</span>
            <span className="stat-value">🏆 {highScore + 1}</span>
          </div>
        </div>
      </div>

      {gameState === 'start' && (
        <div className="game-overlay">
          <div className="overlay-content">
            <h2>Добро пожаловать!</h2>
            <p>Поднимайтесь по башне и собирайте монеты!</p>
            <div className="controls-info">
              <p>🎮 Управление:</p>
              <p>⬆️ Стрелка вверх / Пробел - Подняться</p>
              <p>⬇️ Стрелка вниз - Спуститься</p>
              <p>⬅️➡️ Стрелки влево/вправо - Движение</p>
            </div>
            <p>Чем выше вы поднимаетесь, тем больше монет получаете!</p>
            <button className="game-button" onClick={startGame}>
              Начать игру
            </button>
          </div>
        </div>
      )}

      {gameState === 'ended' && (
        <div className="game-overlay">
          <div className="overlay-content">
            <h2>Игра окончена!</h2>
            <p>Вы достигли уровня: <strong>{playerLevel + 1}</strong></p>
            <p>Заработано монет: <strong>💰 {coins}</strong></p>
            {playerLevel >= highScore && (
              <p className="new-record">🎉 Новый рекорд!</p>
            )}
            <button className="game-button" onClick={startGame}>
              Играть снова
            </button>
          </div>
        </div>
      )}

      <div className="tower-container">
        <div className="tower">
          {renderTower()}
        </div>
      </div>

      {gameState === 'playing' && (
        <div className="game-instructions">
          <p>Используйте клавиши стрелок для движения. Поднимайтесь выше, чтобы заработать больше монет!</p>
        </div>
      )}
    </div>
  )
}

export default App
