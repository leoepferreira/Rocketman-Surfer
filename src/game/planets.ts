import { PlanetConfig } from '../types/game';

export const SOLAR_PLANETS: PlanetConfig[] = [
  {
    id: 1,
    name: 'Mercury',
    portugueseName: 'Mercúrio',
    tagline: 'Fornalha Solar & Pista Inicial',
    description: 'Fase 1 (+1.0%/jóia): Padrão de largada com pista espaçosa e apenas 1 obstáculo por linha para dominar esquiva, pulo e deslize.',
    skyColor: '#120703',
    fogColor: '#2b1008',
    groundColor: '#3a2018',
    accentColor: '#ff7733',
    crystalColor: '#ffaa33',
    trackColor: '#2a1a14',
    gemPalettes: [
      '#ffaa33', // Topázio Solar
      '#f59e0b', // Âmbar Fornalha
      '#ef4444', // Magma Rubelita
      '#fbbf24', // Ouro Calcinado
      '#ff7733', // Plasma Incandescente
      '#f97316', // Minério Térmico
    ],
    meteorPalettes: [
      '#334155', // Slate Titânio Frio (Alto contraste com pista bronze)
      '#1e293b', // Obsidiana Sideral Fria
      '#374151', // Grafite Frio de Cratera
      '#2d3748', // Ferro Frio Glacial
      '#3b4252', // Condrito Frio Ártico
    ],
    gravityFactor: 0.85,
    hazardTypes: ['1 Obstáculo por Linha', '2 Faixas Livres de Esquiva', 'Aceleração Inicial (+1.0%)'],
    planetScale: 1.0,
    atmosphereDensity: 0.005,
  },
  {
    id: 2,
    name: 'Venus',
    portugueseName: 'Vênus',
    tagline: 'Inferno Ácido & Jóias Aéreas',
    description: 'Fase 2 (+1.5%/jóia): Surgem jóias flutuantes no alto de obstáculos baixos, exigindo saltar sobre eles para resgatá-las.',
    skyColor: '#221908',
    fogColor: '#4d3910',
    groundColor: '#423315',
    accentColor: '#eab308',
    crystalColor: '#84cc16',
    trackColor: '#302613',
    gemPalettes: [
      '#84cc16', // Esmeralda Ácida
      '#eab308', // Sulfeto Dourado
      '#10b981', // Jade Sulfúrica
      '#facc15', // Citrino Tóxico
      '#a3e635', // Peridoto Vulcânico
      '#4ade80', // Bismuto Ácido
    ],
    meteorPalettes: [
      '#134e4a', // Teal Vulcânico Escuro (Contraste nítido com pista âmbar)
      '#1e3a5f', // Cobalto Sulfúrico Frio
      '#1f3a34', // Obsidiana Esmeralda Fria
      '#264653', // Mineral Abissal Tóxico
      '#2a3b4c', // Basalto Ciano de Vênus
    ],
    gravityFactor: 0.95,
    hazardTypes: ['Jóias Aéreas sobre Barreiras', 'Saltos de Jetpack Recompensados', 'Obstáculos de Pulo'],
    planetScale: 1.1,
    atmosphereDensity: 0.012,
  },
  {
    id: 3,
    name: 'Earth',
    portugueseName: 'Terra',
    tagline: 'Autopista Orbital & Jóias de Deslize',
    description: 'Fase 3 (+2.0%/jóia): Surgem jóias rente ao solo sob portais elevados, desafiando você a se arrastar por baixo para recolhê-las.',
    skyColor: '#030b1e',
    fogColor: '#0c2247',
    groundColor: '#0d2d3a',
    accentColor: '#38bdf8',
    crystalColor: '#60a5fa',
    trackColor: '#0f172a',
    gemPalettes: [
      '#38bdf8', // Safira Oceânica
      '#60a5fa', // Diamante Celeste
      '#06b6d4', // Água-Marinha Orbital
      '#34d399', // Esmeralda Biosfera
      '#818cf8', // Quartzo Estratosférico
      '#22d3ee', // Ciano Aurora
    ],
    meteorPalettes: [
      '#334155', // Titânio Sideral Frio (Contraste perfeito com pista #0f172a)
      '#475569', // Meteorito Lítico Cinzento
      '#2d3748', // Basalto Grafite Frio
      '#374151', // Condrito Metálico Orbital
      '#3e4c59', // Ferro Glacial Polar
    ],
    gravityFactor: 1.0,
    hazardTypes: ['Jóias Rasteiras sob Portais', 'Deslize Rápido Obrigatório', 'Jóias Aéreas (Cumulativo)'],
    planetScale: 1.2,
    atmosphereDensity: 0.007,
  },
  {
    id: 4,
    name: 'Mars',
    portugueseName: 'Marte',
    tagline: 'Planeta Vermelho & Duplo Bloqueio de Pulo',
    description: 'Fase 4 (+2.5%/jóia): Apresenta 2 caminhos bloqueados ao mesmo tempo por barreiras de pular, restando apenas uma faixa livre.',
    skyColor: '#1c0806',
    fogColor: '#3d1612',
    groundColor: '#4a1d17',
    accentColor: '#ef4444',
    crystalColor: '#f97316',
    trackColor: '#311410',
    gemPalettes: [
      '#ef4444', // Rubi Férrico
      '#f97316', // Jaspe Cânion
      '#b91c1c', // Granada Marciana
      '#fb923c', // Topázio de Areia
      '#f43f5e', // Quartzo Vulcânico
      '#ea580c', // Cristal Olympus
    ],
    meteorPalettes: [
      '#1e293b', // Basalto Frio de Cratera (Contraste frio complementar contra pista vermelha)
      '#2d3748', // Magnetita Escura Sideral
      '#334155', // Titânio de Cânion Frio
      '#223843', // Ardósia Marciana Fria
      '#263238', // Condrito Férrico Glacial
    ],
    gravityFactor: 0.9,
    hazardTypes: ['2 Barreiras de Pulo Simultâneas', 'Faixa Única de Fuga', 'Jóias Aéreas & de Deslize'],
    planetScale: 1.0,
    atmosphereDensity: 0.008,
  },
  {
    id: 5,
    name: 'Jupiter',
    portugueseName: 'Júpiter',
    tagline: 'Gigante Gasoso & Duplo Bloqueio de Deslize',
    description: 'Fase 5 (+3.0%/jóia): Apresenta 2 caminhos bloqueados ao mesmo tempo por barreiras de se abaixar em alta velocidade.',
    skyColor: '#1c1106',
    fogColor: '#452b14',
    groundColor: '#523418',
    accentColor: '#f59e0b',
    crystalColor: '#fbbf24',
    trackColor: '#36210f',
    gemPalettes: [
      '#fbbf24', // Olho de Tigre Joviano
      '#f59e0b', // Âmbar da Grande Mancha
      '#d97706', // Topázio Ciclônico
      '#f97316', // Plasma Relâmpago
      '#fde047', // Pirita Gasosa
      '#ea580c', // Quartzo Tempestuoso
    ],
    meteorPalettes: [
      '#312e54', // Espinela Fria Escura (Contraste cromático com pista âmbar-marrom)
      '#334155', // Titânio de Alta Pressão
      '#2c3e50', // Basalto Ciclônico Frio
      '#283344', // Grafite Joviano Frio
      '#3a3b5c', // Carbono Polar Escuro
    ],
    gravityFactor: 1.2,
    hazardTypes: ['2 Portais de Deslize Simultâneos', 'Abaixamento Sincronizado', 'Trilhas Estreitas'],
    planetScale: 1.8,
    atmosphereDensity: 0.010,
  },
  {
    id: 6,
    name: 'Saturn',
    portugueseName: 'Saturno',
    tagline: 'Anéis de Gelo & Tríplice Barreira',
    description: 'Fase 6 (+3.5%/jóia): Pistas extremas bloqueadas em todas as 3 faixas por barreiras puláveis ou por barreiras de passar por baixo.',
    skyColor: '#0a0d1e',
    fogColor: '#1e244d',
    groundColor: '#282b54',
    accentColor: '#c084fc',
    crystalColor: '#a855f7',
    trackColor: '#171a38',
    gemPalettes: [
      '#c084fc', // Ametista dos Anéis
      '#a855f7', // Espinela Violeta
      '#e879f9', // Quartzo Cósmico
      '#818cf8', // Gelo Interestelar
      '#d8b4fe', // Diamante Polar
      '#67e8f9', // Fragmento Criogênico
    ],
    meteorPalettes: [
      '#1f3a44', // Gelo Negro dos Anéis (Teal frio de alto contraste com pista anil)
      '#2d3748', // Basalto Criogênico Frio
      '#334155', // Titânio Glacial Escuro
      '#234556', // Mineral Polar dos Anéis
      '#374151', // Fragmento Cometário de Saturno
    ],
    gravityFactor: 1.0,
    hazardTypes: ['Até 3 Barreiras de Pulo (Sem Desvio)', 'Até 3 Portais de Deslize', 'Manobras Obrigatórias'],
    hasRings: true,
    ringColor: '#e2d9b8',
    planetScale: 1.6,
    atmosphereDensity: 0.006,
  },
  {
    id: 7,
    name: 'Uranus',
    portugueseName: 'Urano',
    tagline: 'Gigante Criogênico & Monólito Impassável',
    description: 'Fase 7 (+4.0%/jóia): Um dos caminhos é bloqueado por um Monólito intransponível, restando até 2 caminhos com barreiras passáveis.',
    skyColor: '#041820',
    fogColor: '#0e3a47',
    groundColor: '#104452',
    accentColor: '#2dd4bf',
    crystalColor: '#06b6d4',
    trackColor: '#0a2933',
    gemPalettes: [
      '#2dd4bf', // Turmalina de Metano
      '#06b6d4', // Berilo Ciano Polar
      '#a5f3fc', // Gelo Criogênico
      '#14b8a6', // Jade Glacial
      '#38bdf8', // Água-Marinha do Vácuo
      '#5eead4', // Zircônio Zero Absoluto
    ],
    meteorPalettes: [
      '#2e2a4a', // Obsidiana Glacial Fria (Contraste índigo/violeta com pista teal)
      '#334155', // Zircônio Criogênico Frio
      '#25283d', // Basalto Zero Absoluto
      '#363b52', // Metano Fóssil Frio
      '#2a324b', // Grafite Polar de Urano
    ],
    gravityFactor: 0.95,
    hazardTypes: ['1 Monólito 100% Bloqueado', '2 Barreiras Passáveis (Pulo/Deslize)', 'Escolha Rápida de Faixa'],
    hasRings: true,
    ringColor: '#67e8f9',
    planetScale: 1.3,
    atmosphereDensity: 0.007,
  },
  {
    id: 8,
    name: 'Neptune',
    portugueseName: 'Netuno',
    tagline: 'O Fim do Sistema Solar & Corredor Único',
    description: 'Fase 8 (+4.5%/jóia): Desafio extremo com 2 caminhos bloqueados por Monólitos e apenas 1 caminho passável disponível.',
    skyColor: '#040722',
    fogColor: '#0c154a',
    groundColor: '#0e1c5c',
    accentColor: '#818cf8',
    crystalColor: '#6366f1',
    trackColor: '#080f3b',
    gemPalettes: [
      '#818cf8', // Safira do Abismo
      '#6366f1', // Tanzanita Supersônica
      '#4f46e5', // Cobalto Profundo
      '#38bdf8', // Crio-Plasma Neon
      '#a78bfa', // Matéria Escura Estelar
      '#2563eb', // Vórtice Noturno
    ],
    meteorPalettes: [
      '#1e3a4c', // Cobalto Abissal Frio (Contraste ciano-aço com pista azul marinho)
      '#2d3748', // Matéria Escura Criogênica
      '#334155', // Fragmento Supersônico Frio
      '#223843', // Ardósia Polar de Tritão
      '#2c3e50', // Vórtice Glacial Escuro
    ],
    gravityFactor: 1.1,
    hazardTypes: ['2 Monólitos Bloqueados', '1 Único Caminho Passável', 'Precisão Máxima Supersônica'],
    planetScale: 1.3,
    atmosphereDensity: 0.009,
  },
];
