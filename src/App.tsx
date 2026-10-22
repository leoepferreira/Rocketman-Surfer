import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RocketmanGameEngine } from './game/GameEngine';
import { SOLAR_PLANETS } from './game/planets';
import { PlanetConfig, GameState } from './types/game';
import { soundManager } from './audio/SoundEffects';
import { HUD } from './components/HUD';
import { MobileControls } from './components/MobileControls';
import { StartScreen } from './components/StartScreen';
import { GameOverModal } from './components/GameOverModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { PlanetSelectModal } from './components/PlanetSelectModal';
import { ControlsGuideModal } from './components/ControlsGuideModal';
import { HostingGuideModal } from './components/HostingGuideModal';
import { PauseModal } from './components/PauseModal';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<RocketmanGameEngine | null>(null);

  // Game UI state
  const [gameState, setGameState] = useState<GameState>('START');
  const [currentPlanetIndex, setCurrentPlanetIndex] = useState(0);
  const currentPlanet: PlanetConfig = SOLAR_PLANETS[currentPlanetIndex] || SOLAR_PLANETS[0];

  // Telemetry state
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [collectibles, setCollectibles] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [speedKmh, setSpeedKmh] = useState(94);
  const [isWarping, setIsWarping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals state
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showPlanetSelect, setShowPlanetSelect] = useState(false);
  const [showControlsGuide, setShowControlsGuide] = useState(false);
  const [showHostingGuide, setShowHostingGuide] = useState(false);

  // Game over stats
  const [gameOverStats, setGameOverStats] = useState<{
    score: number;
    distance: number;
    collectibles: number;
    planetReached: string;
    planetIndex: number;
    maxSpeedKmh: number;
  } | null>(null);

  // Sound toggle
  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (next) {
        soundManager.setSfxVolume(0.7);
        soundManager.setMusicVolume(0.28);
      } else {
        soundManager.setSfxVolume(0);
        soundManager.setMusicVolume(0);
      }
      return next;
    });
  }, []);

  // Initialize Three.js Game Engine once on mount
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const engine = new RocketmanGameEngine(
      canvasMountRef.current,
      {
        onScoreUpdate: (newScore, newDist, newCollectibles, newMult, newKmh) => {
          setScore(newScore);
          setDistance(newDist);
          setCollectibles(newCollectibles);
          setSpeedMultiplier(newMult);
          setSpeedKmh(newKmh);
        },
        onPlanetChange: (planet, isWarp) => {
          setCurrentPlanetIndex(planet.id - 1);
          if (isWarp) {
            setIsWarping(true);
            setTimeout(() => setIsWarping(false), 2400);
          }
        },
        onGameOver: (stats) => {
          setGameOverStats(stats);
          setGameState('GAMEOVER');
        },
        onStateChange: (state) => {
          setGameState(state);
        },
      },
      currentPlanetIndex
    );

    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Keyboard and TV remote controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      // Prevent scrolling on arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      const key = e.key.toLowerCase();

      // Pause controls
      if (key === 'p' || key === 'escape') {
        if (engineRef.current.state === 'PLAYING') {
          engineRef.current.pause();
        } else if (engineRef.current.state === 'PAUSED') {
          engineRef.current.resume();
        }
        return;
      }

      // In game controls
      if (engineRef.current.state === 'PLAYING') {
        if (key === 'arrowleft' || key === 'a') {
          engineRef.current.moveLeft();
        } else if (key === 'arrowright' || key === 'd') {
          engineRef.current.moveRight();
        } else if (key === 'arrowup' || key === 'w' || key === ' ' || key === 'enter') {
          engineRef.current.jump();
        } else if (key === 'arrowdown' || key === 's') {
          engineRef.current.slide();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Touch swipe gesture listener on window/container
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !engineRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Minimum swipe threshold
    if (Math.max(absDx, absDy) > 28 && dt < 450) {
      if (absDx > absDy) {
        // Horizontal swipe
        if (dx < 0) {
          engineRef.current.moveLeft();
        } else {
          engineRef.current.moveRight();
        }
      } else {
        // Vertical swipe
        if (dy < 0) {
          engineRef.current.jump();
        } else {
          engineRef.current.slide();
        }
      }
    }

    touchStartRef.current = null;
  };

  // Start game
  const handleStartGame = (planetIdx = currentPlanetIndex) => {
    if (!engineRef.current) return;
    setGameOverStats(null);
    setCurrentPlanetIndex(planetIdx);
    engineRef.current.start(planetIdx);
  };

  // Pause / Resume
  const handleTogglePause = () => {
    if (!engineRef.current) return;
    if (engineRef.current.state === 'PLAYING') {
      engineRef.current.pause();
    } else if (engineRef.current.state === 'PAUSED') {
      engineRef.current.resume();
    }
  };

  // Restart game
  const handleRestart = () => {
    handleStartGame(currentPlanetIndex);
  };

  // Select planet
  const handleSelectPlanet = (idx: number) => {
    setCurrentPlanetIndex(idx);
    if (engineRef.current) {
      engineRef.current.setPlanet(idx);
      if (gameState === 'PLAYING') {
        engineRef.current.start(idx);
      }
    }
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#060814] select-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D WebGL Canvas Mount Container */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 z-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Start Screen Overlay */}
      {gameState === 'START' && (
        <StartScreen
          currentPlanet={currentPlanet}
          soundEnabled={soundEnabled}
          onStart={() => handleStartGame(currentPlanetIndex)}
          onOpenPlanetSelect={() => setShowPlanetSelect(true)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenControlsGuide={() => setShowControlsGuide(true)}
          onOpenHostingGuide={() => setShowHostingGuide(true)}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* In-Game HUD */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED' || isWarping) && (
        <HUD
          score={score}
          distance={distance}
          collectibles={collectibles}
          speedMultiplier={speedMultiplier}
          speedKmh={speedKmh}
          currentPlanet={currentPlanet}
          isPaused={gameState === 'PAUSED'}
          isWarping={isWarping}
          soundEnabled={soundEnabled}
          onTogglePause={handleTogglePause}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Mobile On-Screen Controls */}
      {gameState === 'PLAYING' && (
        <MobileControls
          visible={true}
          onLeft={() => engineRef.current?.moveLeft()}
          onRight={() => engineRef.current?.moveRight()}
          onJump={() => engineRef.current?.jump()}
          onSlide={() => engineRef.current?.slide()}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'GAMEOVER' && gameOverStats && (
        <GameOverModal
          stats={gameOverStats}
          onRestart={handleRestart}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenPlanetSelect={() => setShowPlanetSelect(true)}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          score={score}
          collectibles={collectibles}
          planetName={currentPlanet.portugueseName}
          speedKmh={speedKmh}
          soundEnabled={soundEnabled}
          onResume={handleTogglePause}
          onRestart={handleRestart}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onToggleSound={handleToggleSound}
          onHome={() => {
            if (engineRef.current) engineRef.current.state = 'START';
            setGameState('START');
          }}
        />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}

      {/* Planet Select Modal */}
      {showPlanetSelect && (
        <PlanetSelectModal
          currentPlanetIndex={currentPlanetIndex}
          onSelectPlanet={handleSelectPlanet}
          onClose={() => setShowPlanetSelect(false)}
        />
      )}

      {/* Controls Guide Modal */}
      {showControlsGuide && (
        <ControlsGuideModal onClose={() => setShowControlsGuide(false)} />
      )}

      {/* Free Hosting Guide Modal */}
      {showHostingGuide && (
        <HostingGuideModal onClose={() => setShowHostingGuide(false)} />
      )}
    </div>
  );
}
