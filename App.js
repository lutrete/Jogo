// App.js
import React, { useState, useEffect, useRef } from 'react';

const cardsData = [
  { id: 1, name: 'Monica', img: 'https://i.imgur.com/ZT3qfXy.png' },
  { id: 2, name: 'Cebolinha', img: 'https://i.imgur.com/6jT3h57.png' },
  { id: 3, name: 'Cascao', img: 'https://i.imgur.com/rQ6YZwC.png' },
  { id: 4, name: 'Magali', img: 'https://i.imgur.com/6AzG5J2.png' },
  { id: 5, name: 'Franjinha', img: 'https://i.imgur.com/lA0ysZt.png' },
  { id: 6, name: 'Chico Bento', img: 'https://i.imgur.com/WfJlh8Y.png' },
];

const audioHitSrc = 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg';
const audioMissSrc = 'https://actions.google.com/sounds/v1/cartoon/boing.ogg';
const audioBackgroundSrc = 'https://actions.google.com/sounds/v1/ambiences/fairy_forest.ogg';

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

export default function App() {
  const [page, setPage] = useState('menu');
  const [soundOn, setSoundOn] = useState(true);
  const [difficulty, setDifficulty] = useState('facil');
  const [phase, setPhase] = useState(1);
  const [score, setScore] = useState(0);

  const audioBackground = useRef(null);
  const audioHit = useRef(null);
  const audioMiss = useRef(null);

  useEffect(() => {
    if (soundOn) {
      audioBackground.current.play();
      audioBackground.current.loop = true;
    } else {
      audioBackground.current.pause();
      audioBackground.current.currentTime = 0;
    }
  }, [soundOn]);

  function getCardsForPhase() {
    let basePairs = difficulty === 'facil' ? 3 : difficulty === 'medio' ? 4 : 6;
    const pairsCount = Math.min(basePairs + (phase - 1), cardsData.length);
    const selected = cardsData.slice(0, pairsCount);
    return shuffleArray([...selected, ...selected].map((c, i) => ({ ...c, uniqueId: i + '_' + c.id })));
  }

  function Game() {
    const [cards, setCards] = useState(getCardsForPhase());
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [timer, setTimer] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
      return () => clearInterval(timerRef.current);
    }, []);

    useEffect(() => {
      setCards(getCardsForPhase());
      setFlipped([]);
      setMatched([]);
      setMoves(0);
      setTimer(0);
    }, [phase, difficulty]);

    useEffect(() => {
      if (flipped.length === 2) {
        const [first, second] = flipped;
        if (cards[first].id === cards[second].id) {
          setMatched(m => [...m, cards[first].uniqueId, cards[second].uniqueId]);
          if (soundOn) audioHit.current.play();
          setScore(s => s + 10);
          setTimeout(() => setFlipped([]), 1000);
        } else {
          if (soundOn) audioMiss.current.play();
          setScore(s => (s > 0 ? s - 2 : 0));
          setTimeout(() => setFlipped([]), 1000);
        }
        setMoves(m => m + 1);
      }
    }, [flipped]);

    useEffect(() => {
      if (matched.length === cards.length && cards.length > 0) {
        clearInterval(timerRef.current);
        alert(`Parabéns! Fase ${phase} concluída!\nMovimentos: ${moves}\nTempo: ${timer}s`);
        setPhase(p => p + 1);
      }
    }, [matched]);

    function handleCardClick(index) {
      if (flipped.length === 2) return;
      if (flipped.includes(index)) return;
      if (matched.includes(cards[index].uniqueId)) return;
      setFlipped(f => [...f, index]);
    }

    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Fase {phase} - Dificuldade: {difficulty}</h2>
        <p>Pontuação: {score} | Movimentos: {moves} | Tempo: {timer}s</p>
        <button onClick={() => setPage('menu')}>Voltar ao menu</button>

        <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: 600, margin: '20px auto', justifyContent: 'center' }}>
          {cards.map((card, i) => {
            const isFlipped = flipped.includes(i) || matched.includes(card.uniqueId);
            return (
              <div
                key={card.uniqueId}
                onClick={() => handleCardClick(i)}
                style={{
                  width: 100,
                  height: 120,
                  margin: 10,
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                  perspective: 1000,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    textAlign: 'center',
                    transition: 'transform 0.6s',
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'none',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      backgroundColor: '#1976d2',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 24,
                      fontWeight: 'bold',
                      userSelect: 'none',
                    }}
                  >
                    ?
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      borderRadius: 8,
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <img src={card.img} alt={card.name} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function Menu() {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h1>Jogo da Memória - Turma da Mônica</h1>

        <div style={{ margin: '20px 0' }}>
          <label>
            Dificuldade:{' '}
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="facil">Fácil</option>
              <option value="medio">Médio</option>
              <option value="dificil">Difícil</option>
            </select>
          </label>
        </div>

        <button onClick={() => { setPhase(1); setScore(0); setPage('game'); }} style={{ padding: 10, fontSize: 18 }}>
          Iniciar Jogo
        </button>

        <div style={{ marginTop: 20 }}>
          <button onClick={() => setSoundOn(s => !s)}>
            {soundOn ? 'Desativar Som' : 'Ativar Som'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <audio ref={audioBackground} src={audioBackgroundSrc} />
      <audio ref={audioHit} src={audioHitSrc} />
      <audio ref={audioMiss} src={audioMissSrc} />
      {page === 'menu' && <Menu />}
      {page === 'game' && <Game />}
    </>
  );
}