'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import InfoPanel from './InfoPanel';
import LanguageToggle from './LanguageToggle';
import LearningPathsPanel from './LearningPathsPanel';
import FlashcardsPanel from './FlashcardsPanel';
import QuizPanel from './QuizPanel';
import Breadcrumbs from './Breadcrumbs';
import SupportButton from './SupportButton';
import SearchPalette from './SearchPalette';
import XPBar from './XPBar';
import ToolbarMenu, { PanelId } from './ToolbarMenu';
import StatsPanel from './StatsPanel';
import SettingsPanel from './SettingsPanel';
import TopicQuizModal from './TopicQuizModal';
import { initialNodes as dataNodes, initialEdges, AINode, Language, levelColors, levelLabels, AbstractionLevel } from '@/data/nodes';
import { getPathById } from '@/data/learningPaths';
import { GamificationState, loadGamification, awardXP, saveGamification } from '@/data/gamification';
import { getDueCount, flashcardsData, loadSM2 } from '@/data/flashcards';
import { getQuizForNode, TopicQuiz } from '@/data/topicQuizzes';
import TimelinePanel from './TimelinePanel';
import GlossaryPanel from './GlossaryPanel';
import DailyChallengePanel from './DailyChallengePanel';
import ModelComparisonPanel from './ModelComparisonPanel';
import ConceptRelationsPanel from './ConceptRelationsPanel';
import RecipesPanel from './RecipesPanel';
import RecipeBar from './RecipeBar';
import { getRecipeById, getRecipeNodeIds } from '@/data/recipes';

interface SpaceNode {
  id: string;
  name: string;
  emoji: string;
  level: AbstractionLevel;
  x: number;
  y: number;
  data: AINode['data'];
}

interface Connection {
  from: string;
  to: string;
  dashed?: boolean;
}

// Star generation
function generateStars(count: number, seed: number) {
  const stars = [];
  let s = seed;
  const random = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  for (let i = 0; i < 10; i++) random();
  for (let i = 0; i < count; i++) {
    stars.push({ x: random() * 200 - 50, y: random() * 200 - 50 });
  }
  return stars;
}

const starLayers = [
  { stars: generateStars(60, 1), size: 0.8, speed: 140, opacity: 0.3 },
  { stars: generateStars(50, 2), size: 1, speed: 120, opacity: 0.4 },
  { stars: generateStars(45, 3), size: 1.3, speed: 100, opacity: 0.5 },
  { stars: generateStars(35, 4), size: 1.8, speed: 80, opacity: 0.6 },
  { stars: generateStars(30, 5), size: 2.2, speed: 60, opacity: 0.7 },
  { stars: generateStars(25, 6), size: 2.8, speed: 40, opacity: 0.8 },
  { stars: generateStars(15, 7), size: 3.5, speed: 25, opacity: 0.9 },
  { stars: generateStars(10, 8), size: 4.5, speed: 15, opacity: 1 },
  { stars: generateStars(5, 9), size: 6, speed: 8, opacity: 1 },
];

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  angle: number;
  length: number;
  speed: number;
}

const spaceColors: Record<AbstractionLevel, string> = {
  field: '#6366f1',
  theory: '#8b5cf6',
  method: '#06b6d4',
  algorithm: '#10b981',
  implementation: '#f59e0b',
};

// Manual positions for beautiful tree layout
function getManualPositions(): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const COL0 = 0; const COL1 = 350; const COL2 = 700; const COL3 = 1050; const COL4 = 1400; const COL5 = 1750;
  const ML_Y = 0; const DL_Y = 900; const NLP_Y = 2100; const CV_Y = 2900;
  const ROW = 120;
  
  positions.set('ai', { x: COL0, y: 1400 });
  positions.set('ml', { x: COL1, y: ML_Y + 300 });
  positions.set('supervised', { x: COL2, y: ML_Y + 100 });
  positions.set('unsupervised', { x: COL2, y: ML_Y + 400 });
  positions.set('rl', { x: COL2, y: ML_Y + 700 });
  positions.set('linear-reg', { x: COL3, y: ML_Y });
  positions.set('decision-tree', { x: COL3, y: ML_Y + ROW });
  positions.set('svm', { x: COL3, y: ML_Y + ROW * 2 });
  positions.set('random-forest', { x: COL4, y: ML_Y + ROW });
  positions.set('kmeans', { x: COL3, y: ML_Y + 400 });
  positions.set('pca', { x: COL3, y: ML_Y + 400 + ROW });
  positions.set('qlearning', { x: COL3, y: ML_Y + 720 });
  positions.set('dl', { x: COL1, y: DL_Y + 400 });
  positions.set('nn', { x: COL2, y: DL_Y });
  positions.set('cnn', { x: COL2, y: DL_Y + ROW });
  positions.set('rnn', { x: COL2, y: DL_Y + ROW * 2 });
  positions.set('transformer', { x: COL2, y: DL_Y + ROW * 3 });
  positions.set('gan', { x: COL2, y: DL_Y + ROW * 5 });
  positions.set('vae', { x: COL2, y: DL_Y + ROW * 6 });
  positions.set('diffusion', { x: COL2, y: DL_Y + ROW * 7 });
  positions.set('lstm', { x: COL3, y: DL_Y + ROW * 2 });
  positions.set('attention', { x: COL3, y: DL_Y + ROW * 3 });
  positions.set('nlp', { x: COL1, y: NLP_Y + 200 });
  positions.set('embeddings', { x: COL2, y: NLP_Y });
  positions.set('tokenization', { x: COL2, y: NLP_Y + ROW });
  positions.set('llm', { x: COL2, y: NLP_Y + ROW * 3 });
  positions.set('gpt', { x: COL3, y: NLP_Y + ROW * 3 });
  positions.set('bert', { x: COL3, y: NLP_Y + ROW * 4 });
  positions.set('clip', { x: COL4, y: NLP_Y + ROW * 5 });
  positions.set('cv', { x: COL1, y: CV_Y + 200 });
  positions.set('img-classification', { x: COL2, y: CV_Y });
  positions.set('obj-detection', { x: COL2, y: CV_Y + ROW });
  positions.set('segmentation', { x: COL2, y: CV_Y + ROW * 2 });
  positions.set('resnet', { x: COL3, y: CV_Y });
  positions.set('yolo', { x: COL3, y: CV_Y + ROW });
  positions.set('vit', { x: COL3, y: CV_Y + ROW * 3 });
  positions.set('word2vec', { x: COL3, y: NLP_Y });
  positions.set('rag', { x: COL4, y: NLP_Y + ROW * 3 });
  positions.set('finetuning', { x: COL4, y: NLP_Y + ROW * 5 });
  positions.set('agents', { x: COL5, y: NLP_Y + ROW * 4 });
  positions.set('dropout', { x: COL4, y: DL_Y + 30 });
  positions.set('batchnorm', { x: COL4, y: DL_Y + ROW + 50 });
  positions.set('adam', { x: COL4, y: DL_Y + ROW * 2 + 70 });
  positions.set('autoencoder', { x: COL2, y: DL_Y + ROW * 8 });
  positions.set('moe', { x: COL3, y: DL_Y + ROW * 5 });
  positions.set('logreg', { x: COL4, y: ML_Y + 240 });
  positions.set('xgboost', { x: COL5, y: ML_Y + 180 });
  positions.set('unet', { x: COL4, y: CV_Y + ROW * 2 + 30 });
  positions.set('stable-diffusion', { x: COL4, y: DL_Y + ROW * 8 });
  positions.set('prompt-eng', { x: COL3, y: NLP_Y + ROW * 5 + 30 });
  positions.set('cot', { x: COL4, y: NLP_Y + ROW * 6 });
  
  return positions;
}

const LEARNING_PROGRESS_KEY = 'mindmap-v2-learning-progress';
const RECIPES_SEEN_KEY = 'mindmap-v2-recipes-seen';

interface LearningProgress {
  activePath: string | null;
  completedNodes: string[];
}

function loadLearningProgress(): LearningProgress {
  if (typeof window === 'undefined') return { activePath: null, completedNodes: [] };
  try {
    const stored = localStorage.getItem(LEARNING_PROGRESS_KEY);
    if (!stored) return { activePath: null, completedNodes: [] };
    const parsed = JSON.parse(stored) as LearningProgress;
    return {
      activePath: typeof parsed.activePath === 'string' ? parsed.activePath : null,
      completedNodes: Array.isArray(parsed.completedNodes) ? parsed.completedNodes : [],
    };
  } catch { return { activePath: null, completedNodes: [] }; }
}

function saveLearningProgress(progress: LearningProgress) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(LEARNING_PROGRESS_KEY, JSON.stringify(progress)); } catch {}
}

// Build parent→children map from edges
function buildChildrenMap(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  initialEdges.forEach(edge => {
    if (!edge.style?.strokeDasharray) { // only solid edges = parent-child
      const children = map.get(edge.source) || [];
      children.push(edge.target);
      map.set(edge.source, children);
    }
  });
  return map;
}

// Get all descendants of a node
function getDescendants(nodeId: string, childrenMap: Map<string, string[]>): Set<string> {
  const result = new Set<string>();
  const queue = [nodeId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = childrenMap.get(current) || [];
    for (const child of children) {
      if (!result.has(child)) {
        result.add(child);
        queue.push(child);
      }
    }
  }
  return result;
}

export default function SpaceMindMap() {
  const [lang, setLang] = useState<Language>('en');
  const [selectedNode, setSelectedNode] = useState<AINode | null>(null);
  
  const initialProgress = loadLearningProgress();
  const [activePath, setActivePath] = useState<string | null>(initialProgress.activePath);
  const [completedNodes, setCompletedNodes] = useState<string[]>(initialProgress.completedNodes);
  const [smoothTilt, setSmoothTilt] = useState({ x: 0, y: 0 });
  const [openPanel, setOpenPanel] = useState<PanelId>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeExam, setActiveExam] = useState<TopicQuiz | null>(null);
  const [activeTopicQuiz, setActiveTopicQuiz] = useState<TopicQuiz | null>(null);
  // Recipes: task-first entry point
  const [recipeView, setRecipeView] = useState<string | null>(null);
  const [activeRecipe, setActiveRecipe] = useState<string | null>(null);
  const activeRecipeNodeIds = useMemo(() => {
    const recipe = activeRecipe ? getRecipeById(activeRecipe) : undefined;
    return recipe ? getRecipeNodeIds(recipe) : [];
  }, [activeRecipe]);
  
  // Gamification
  const [gamification, setGamification] = useState<GamificationState>(loadGamification());
  
  // Progressive disclosure
  const childrenMap = useMemo(() => buildChildrenMap(), []);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    // Start with top-level expanded
    return new Set(['ai']);
  });
  const [expandAll, setExpandAll] = useState(false);

  // Compute visible nodes
  const visibleNodeIds = useMemo<Set<string>>(() => {
    if (expandAll) {
      return new Set(dataNodes.map(n => n.id));
    }
    const visible = new Set<string>();
    // Always show field and theory levels
    dataNodes.forEach(n => {
      if (n.data.level === 'field' || n.data.level === 'theory') {
        visible.add(n.id);
      }
    });
    // Show children of expanded nodes
    expandedNodes.forEach(nodeId => {
      const children = childrenMap.get(nodeId) || [];
      children.forEach(c => visible.add(c));
    });
    // If a learning path is active, show all path nodes
    if (activePath) {
      const path = getPathById(activePath);
      if (path) {
        path.nodeIds.forEach(id => visible.add(id));
      }
    }
    activeRecipeNodeIds.forEach(id => visible.add(id));
    return visible;
  }, [expandedNodes, expandAll, childrenMap, activePath, activeRecipeNodeIds]);

  // Count hidden children for badge
  const getHiddenChildCount = useCallback((nodeId: string): number => {
    if (expandAll) return 0;
    const allDesc = getDescendants(nodeId, childrenMap);
    let hidden = 0;
    allDesc.forEach(id => {
      if (!visibleNodeIds.has(id)) hidden++;
    });
    return hidden;
  }, [expandAll, childrenMap, visibleNodeIds]);

  const toggleExpand = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    saveLearningProgress({ activePath, completedNodes });
  }, [activePath, completedNodes]);

  // First visit: start from tasks, not from theory
  useEffect(() => {
    try {
      if (!localStorage.getItem(RECIPES_SEEN_KEY)) {
        setOpenPanel('recipes');
        localStorage.setItem(RECIPES_SEEN_KEY, '1');
      }
    } catch {}
  }, []);

  const handleResetProgress = () => {
    setActivePath(null);
    setCompletedNodes([]);
  };

  // Award XP helper
  const doAwardXP = useCallback((action: string) => {
    setGamification(prev => awardXP(prev, action));
  }, []);

  const handleMarkComplete = useCallback((nodeId: string) => {
    if (!completedNodes.includes(nodeId)) {
      setCompletedNodes(prev => [...prev, nodeId]);
      doAwardXP('read_node');
    }
  }, [completedNodes, doAwardXP]);

  const handleStartExam = useCallback((nodeId: string) => {
    const quiz = getQuizForNode(nodeId);
    if (quiz) setActiveTopicQuiz(quiz);
  }, []);

  const handleExamPass = useCallback((xp: number) => {
    setGamification(prev => {
      const newState = { ...prev, totalXP: prev.totalXP + xp };
      saveGamification(newState);
      return newState;
    });
  }, []);

  const handleNavigateNext = useCallback((nodeId: string) => {
    const node = dataNodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      // Ensure node is visible
      setExpandedNodes(prev => {
        const next = new Set(prev);
        // Find parent edge
        const parentEdge = initialEdges.find(e => e.target === nodeId && !e.style?.strokeDasharray);
        if (parentEdge) next.add(parentEdge.source);
        return next;
      });
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const targetTilt = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  
  const connections = useMemo<Connection[]>(() => 
    initialEdges.map(edge => ({
      from: edge.source,
      to: edge.target,
      dashed: edge.style?.strokeDasharray !== undefined,
    })),
    []
  );
  
  const initialPositions = useMemo(() => getManualPositions(), []);
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(initialPositions);
  
  const nodes = useMemo<SpaceNode[]>(() => 
    dataNodes
      .filter(node => visibleNodeIds.has(node.id))
      .map(node => {
        const pos = nodePositions.get(node.id) || { x: 0, y: 0 };
        return {
          id: node.id,
          name: node.data[lang]?.label || node.id,
          emoji: node.data.emoji || '📦',
          level: node.data.level,
          x: pos.x,
          y: pos.y,
          data: node.data,
        };
      }),
    [lang, nodePositions, visibleNodeIds]
  );

  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [nodeSizes, setNodeSizes] = useState<Map<string, { width: number; height: number }>>(new Map());
  
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [zoom, setZoom] = useState(0.65);
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 2;
  
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const nodeStartPos = useRef({ x: 0, y: 0 });

  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const shootingStarId = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const sizes = new Map<string, { width: number; height: number }>();
      nodeRefs.current.forEach((el, id) => {
        if (el) {
          const rect = el.getBoundingClientRect();
          sizes.set(id, { width: rect.width / zoom, height: rect.height / zoom });
        }
      });
      setNodeSizes(sizes);
    }, 100);
    return () => clearTimeout(timer);
  }, [nodes, zoom]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const createShootingStar = () => {
      const startX = -20 + Math.random() * 140;
      const startY = -20 + Math.random() * 100;
      const star: ShootingStar = {
        id: shootingStarId.current++,
        startX, startY,
        angle: 30 + Math.random() * 30,
        length: 150 + Math.random() * 200,
        speed: 2 + Math.random() * 1.5,
      };
      setShootingStars(prev => [...prev, star]);
      setTimeout(() => setShootingStars(prev => prev.filter(s => s.id !== star.id)), star.speed * 1000 + 500);
      timeoutId = setTimeout(createShootingStar, 10000 + Math.random() * 20000);
    };
    timeoutId = setTimeout(createShootingStar, 2000 + Math.random() * 3000);
    return () => clearTimeout(timeoutId);
  }, []);

  // Node drag handlers
  const handleNodeDragStart = useCallback((nodeId: string, clientX: number, clientY: number) => {
    const pos = nodePositions.get(nodeId);
    if (!pos) return;
    setDraggingNodeId(nodeId);
    dragStart.current = { x: clientX, y: clientY };
    nodeStartPos.current = { x: pos.x, y: pos.y };
  }, [nodePositions]);

  const handleNodeDragMove = useCallback((clientX: number, clientY: number) => {
    if (draggingNodeId === null) return;
    const dx = (clientX - dragStart.current.x) / zoom;
    const dy = (clientY - dragStart.current.y) / zoom;
    setNodePositions(prev => {
      const next = new Map(prev);
      next.set(draggingNodeId, { x: nodeStartPos.current.x + dx, y: nodeStartPos.current.y + dy });
      return next;
    });
  }, [draggingNodeId, zoom]);

  const handleNodeDragEnd = useCallback(() => { setDraggingNodeId(null); }, []);

  const handlePanStart = useCallback((clientX: number, clientY: number) => {
    setIsPanning(true);
    panStart.current = { x: clientX, y: clientY };
    panOffset.current = { ...pan };
  }, [pan]);

  const handlePanMove = useCallback((clientX: number, clientY: number) => {
    if (!isPanning) return;
    setPan({ x: panOffset.current.x + (clientX - panStart.current.x), y: panOffset.current.y + (clientY - panStart.current.y) });
  }, [isPanning]);

  const handlePanEnd = useCallback(() => { setIsPanning(false); }, []);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.space-node') || (e.target as HTMLElement).closest('[data-no-pan]')) return;
      handlePanStart(e.clientX, e.clientY);
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingNodeId !== null) handleNodeDragMove(e.clientX, e.clientY);
      else if (isPanning) handlePanMove(e.clientX, e.clientY);
    };
    const handleMouseUp = () => { handlePanEnd(); handleNodeDragEnd(); };
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      container?.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, draggingNodeId, handlePanStart, handlePanMove, handlePanEnd, handleNodeDragMove, handleNodeDragEnd]);

  const targetZoom = useRef(zoom);
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest('[data-no-pan]')) return; // let panels scroll
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      targetZoom.current = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, targetZoom.current + delta));
    };
    const container = containerRef.current;
    if (container) container.addEventListener('wheel', handleWheel, { passive: false });
    return () => { container?.removeEventListener('wheel', handleWheel); };
  }, []);
  
  useEffect(() => {
    let animationId: number;
    const animateZoom = () => {
      setZoom(prev => {
        const diff = targetZoom.current - prev;
        if (Math.abs(diff) < 0.0005) return targetZoom.current;
        return prev + diff * 0.06;
      });
      animationId = requestAnimationFrame(animateZoom);
    };
    animationId = requestAnimationFrame(animateZoom);
    return () => cancelAnimationFrame(animationId);
  }, []);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('.space-node') || (e.target as HTMLElement).closest('[data-no-pan]')) return;
      if (e.touches.length === 1) handlePanStart(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        if (draggingNodeId !== null) handleNodeDragMove(e.touches[0].clientX, e.touches[0].clientY);
        else if (isPanning) handlePanMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => { handlePanEnd(); handleNodeDragEnd(); };
    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: true });
      container.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      container?.removeEventListener('touchstart', handleTouchStart);
      container?.removeEventListener('touchmove', handleTouchMove);
      container?.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPanning, draggingNodeId, handlePanStart, handlePanMove, handlePanEnd, handleNodeDragMove, handleNodeDragEnd]);

  useEffect(() => {
    const smoothing = () => {
      setSmoothTilt(prev => ({
        x: prev.x + (targetTilt.current.x - prev.x) * 0.08,
        y: prev.y + (targetTilt.current.y - prev.y) * 0.08,
      }));
      animationRef.current = requestAnimationFrame(smoothing);
    };
    animationRef.current = requestAnimationFrame(smoothing);
    const handleMouseMove = (event: MouseEvent) => {
      if (isPanning || draggingNodeId) return;
      targetTilt.current = {
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPanning, draggingNodeId]);

  const getNodeById = (id: string) => nodes.find(n => n.id === id);
  const getNodeSize = (id: string) => nodeSizes.get(id) || { width: 130, height: 70 };
  
  const getPathToRoot = useCallback((nodeId: string | null): string[] => {
    if (!nodeId) return [];
    const path: string[] = [nodeId];
    let current = nodeId;
    while (current !== 'ai') {
      const parentConn = connections.find(c => c.to === current && !c.dashed);
      if (!parentConn) break;
      path.push(parentConn.from);
      current = parentConn.from;
    }
    return path;
  }, [connections]);
  
  const isConnectionActive = useCallback((conn: Connection) => {
    if (!selectedNode) return false;
    const pathToRoot = getPathToRoot(selectedNode.id);
    const fromIndex = pathToRoot.indexOf(conn.from);
    const toIndex = pathToRoot.indexOf(conn.to);
    return fromIndex !== -1 && toIndex !== -1 && Math.abs(fromIndex - toIndex) === 1;
  }, [selectedNode, getPathToRoot]);

  // Visible connections (both ends must be visible)
  const visibleConnections = useMemo(() => 
    connections.filter(c => visibleNodeIds.has(c.from) && visibleNodeIds.has(c.to)),
    [connections, visibleNodeIds]
  );

  const handleNodeClick = (node: SpaceNode, wasDragging: boolean) => {
    if (wasDragging) return;
    const aiNode: AINode = {
      id: node.id,
      position: { x: node.x, y: node.y },
      type: 'custom',
      data: node.data,
    };
    
    if (selectedNode?.id === node.id) {
      setSelectedNode(null);
    } else {
      setSelectedNode(aiNode);
      // Expand this node to show children
      toggleExpand(node.id);
      // Track read nodes (no XP — must pass exam)
      if (!gamification.readNodes.includes(node.id)) {
        const newState = { ...gamification, readNodes: [...(gamification.readNodes || []), node.id] };
        saveGamification(newState);
        setGamification(newState);
      }
    }
  };

  // Move the camera so the given nodes fit in the free area: below the header,
  // and left of the info panel on desktop when one is about to be shown
  const fitNodes = useCallback((ids: string[], fitZoom: boolean, withInfoPanel: boolean) => {
    const points = ids.map(id => nodePositions.get(id)).filter((p): p is { x: number; y: number } => !!p);
    if (points.length === 0) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const NODE_W = 150, NODE_H = 60;
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x)) + NODE_W;
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y)) + NODE_H;
    const isDesktop = W >= 768;
    const areaW = W - (isDesktop && withInfoPanel ? 440 : 0);
    const areaTop = isDesktop ? 210 : 310; // header, recipe bar
    const areaBottom = isDesktop ? H - 40 : (withInfoPanel ? H * 0.3 + 140 : H - 120); // mobile: bottom sheet / legend
    let z = targetZoom.current;
    if (fitZoom) {
      z = Math.min(0.9, (areaW - 80) / (maxX - minX), (areaBottom - areaTop - 60) / (maxY - minY));
      z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));
      targetZoom.current = z;
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const targetX = areaW / 2;
    const targetY = (areaTop + areaBottom) / 2;
    setPan({ x: targetX - W / 2 - (cx - W / 2) * z, y: targetY - H / 2 - (cy - H / 2) * z });
  }, [nodePositions]);

  const focusNode = useCallback((nodeId: string) => {
    const node = dataNodes.find(n => n.id === nodeId);
    if (!node) return;
    setSelectedNode(node);
    const parentEdge = initialEdges.find(e => e.target === nodeId && !e.style?.strokeDasharray);
    if (parentEdge) setExpandedNodes(prev => { const next = new Set(prev); next.add(parentEdge.source); return next; });
    fitNodes([nodeId], false, true);
  }, [fitNodes]);

  const openRecipe = useCallback((recipeId: string | null) => {
    setRecipeView(recipeId);
    setOpenPanel('recipes');
  }, []);

  const handleRecipeNode = useCallback((nodeId: string, recipeId: string) => {
    setActiveRecipe(recipeId);
    setOpenPanel(null);
    focusNode(nodeId);
  }, [focusNode]);

  const handleShowRecipeOnMap = useCallback((recipeId: string) => {
    const recipe = getRecipeById(recipeId);
    if (!recipe) return;
    const ids = getRecipeNodeIds(recipe);
    setActiveRecipe(recipeId);
    setOpenPanel(null);
    setSelectedNode(null);
    fitNodes(ids, true, false);
  }, [fitNodes]);

  const handleSearchSelect = useCallback((node: AINode) => {
    setSelectedNode(node);
    // Ensure node is visible
    const parentEdge = initialEdges.find(e => e.target === node.id && !e.style?.strokeDasharray);
    if (parentEdge) {
      setExpandedNodes(prev => {
        const next = new Set(prev);
        next.add(parentEdge.source);
        return next;
      });
    }
    fitNodes([node.id], false, true);
  }, [fitNodes]);

  return (
    <div ref={containerRef} className={`space-container ${isPanning ? 'panning' : ''}`}>
      {/* Stars */}
      {starLayers.map((layer, i) => {
        const zoomFactor = 1 + (zoom - 0.65) * (0.1 + i * 0.08);
        return (
          <div key={i} className="star-layer" style={{
            transform: `translate(${smoothTilt.x * layer.speed + pan.x * (0.1 + i * 0.05)}px, ${smoothTilt.y * layer.speed + pan.y * (0.1 + i * 0.05)}px) scale(${zoomFactor})`,
            transition: 'transform 0.3s ease-out',
          }}>
            {layer.stars.map((star, j) => (
              <div key={j} className="star" style={{
                left: `${star.x}%`, top: `${star.y}%`,
                width: `${layer.size}px`, height: `${layer.size}px`,
                opacity: layer.opacity,
              }} />
            ))}
          </div>
        );
      })}

      {/* Shooting stars */}
      {shootingStars.map(star => (
        <div key={star.id} className="shooting-star" style={{
          left: `${star.startX}%`, top: `${star.startY}%`,
          '--angle': `${star.angle}deg`, '--length': `${star.length}px`, '--speed': `${star.speed}s`,
        } as React.CSSProperties} />
      ))}

      {/* Header: Title + Language + XP */}
      <div className="absolute top-4 left-4 z-50 flex flex-col gap-3 max-w-[calc(100vw-7.5rem)] md:max-w-none" data-no-pan>
        <div className="bg-gray-950/40 backdrop-blur-xl rounded-2xl border border-white/[0.06] px-5 py-3.5 shadow-2xl">
          <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
            <div className="text-white">
              <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 tracking-tight">
                <span className="text-2xl md:text-3xl">🧠</span>
                <span className="bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">AI Mindmap</span>
              </h1>
              <p className="text-gray-500 text-[11px] md:text-xs mt-0.5 tracking-wide">
                {lang === 'ru' ? 'Кликни для описания • ⌘K поиск' : 'Click for details • ⌘K search'}
              </p>
            </div>
            <LanguageToggle lang={lang} onChange={setLang} />
          </div>
          <button
            onClick={() => openRecipe(null)}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600/90 to-fuchsia-600/90 hover:from-purple-500 hover:to-fuchsia-500 shadow-lg shadow-purple-900/30 transition-all"
          >
            🧩 {lang === 'ru' ? 'Решить задачу с AI' : 'Solve a task with AI'}
          </button>
          <div className="mt-2.5 pt-2.5 border-t border-white/[0.06]">
            <XPBar lang={lang} state={gamification} />
          </div>
        </div>
      </div>

      {/* Unified Toolbar Menu */}
      <ToolbarMenu
        lang={lang}
        openPanel={openPanel}
        onPanelChange={setOpenPanel}
        onSearch={() => setSearchOpen(true)}
        expandAll={expandAll}
        onToggleExpandAll={() => setExpandAll(!expandAll)}
        gamification={gamification}
        dueCards={getDueCount(flashcardsData, loadSM2())}
        totalNodes={dataNodes.length}
        completedNodes={completedNodes.length}
      />

      {/* Panels — opened from ToolbarMenu */}
      <LearningPathsPanel
        lang={lang}
        activePath={activePath}
        onSelectPath={setActivePath}
        onNodeClick={(nodeId) => {
          const node = dataNodes.find(n => n.id === nodeId);
          if (node) setSelectedNode(node);
        }}
        completedNodes={completedNodes}
        onResetProgress={handleResetProgress}
        isOpen={openPanel === 'paths'}
        onOpenChange={(open) => setOpenPanel(open ? 'paths' : null)}
      />
      <FlashcardsPanel 
        lang={lang}
        isOpen={openPanel === 'flashcards'}
        onOpenChange={(open) => setOpenPanel(open ? 'flashcards' : null)}
        onXP={() => doAwardXP('flashcard')}
      />
      <QuizPanel 
        lang={lang}
        isOpen={openPanel === 'quiz'}
        onOpenChange={(open) => setOpenPanel(open ? 'quiz' : null)}
        onCorrectAnswer={() => doAwardXP('quiz_correct')}
      />
      <StatsPanel
        lang={lang}
        isOpen={openPanel === 'stats'}
        onClose={() => setOpenPanel(null)}
        gamification={gamification}
        completedNodes={completedNodes}
      />
      <SettingsPanel
        lang={lang}
        isOpen={openPanel === 'settings'}
        onClose={() => setOpenPanel(null)}
        onResetAll={() => {
          setGamification(loadGamification());
          setCompletedNodes([]);
          setActivePath(null);
        }}
      />

      {/* Search Palette */}
      <SearchPalette
        lang={lang}
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectNode={handleSearchSelect}
      />

      {/* Pan layer */}
      <div className="pan-layer" style={{ 
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, 
        transformOrigin: 'center center' 
      }}>
        {/* SVG connections */}
        <svg className="connections" style={{
          position: 'absolute', left: '-2000px', top: '-2000px',
          width: '6000px', height: '6000px', overflow: 'visible',
        }}>
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="30%" stopColor="#8b5cf6" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#8b5cf6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="activeLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#c084fc" stopOpacity="1" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.7" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          
          {visibleConnections.map((conn, i) => {
            const from = getNodeById(conn.from);
            const to = getNodeById(conn.to);
            if (!from || !to) return null;
            
            const fromSize = getNodeSize(from.id);
            const toSize = getNodeSize(to.id);
            const startX = from.x + fromSize.width + 2000;
            const startY = from.y + fromSize.height / 2 + 2000;
            const endX = to.x + 2000;
            const endY = to.y + toSize.height / 2 + 2000;
            const dx = Math.abs(endX - startX);
            const tension = Math.max(dx * 0.4, 50);
            const pathD = `M ${startX} ${startY} C ${startX + tension} ${startY}, ${endX - tension} ${endY}, ${endX} ${endY}`;
            const pathId = `path-${i}`;
            const isActive = isConnectionActive(conn);
            
            return (
              <g key={i}>
                {/* Background glow for active lines */}
                {isActive && (
                  <path d={pathD}
                    stroke="#a855f7" strokeWidth={8}
                    fill="none" opacity={0.1} filter="url(#softGlow)"
                  />
                )}
                <path id={pathId} d={pathD}
                  stroke={isActive ? 'url(#activeLineGradient)' : 'url(#lineGradient)'}
                  strokeWidth={isActive ? 2 : 1.5}
                  strokeDasharray={conn.dashed ? '6,6' : undefined}
                  fill="none" filter={isActive ? 'url(#glow)' : undefined}
                  className={`connection-line ${isActive ? 'active' : ''}`}
                />
                {isActive && (() => {
                  const baseOffset = (i * 1.7) % 5;
                  const glow = 'drop-shadow(0 0 4px #fff) drop-shadow(0 0 8px #a855f7) drop-shadow(0 0 15px #a855f7) drop-shadow(0 0 25px #8b5cf6)';
                  return (
                    <>
                      <circle r="2.5" fill="white" style={{ filter: glow }}>
                        <animateMotion dur="5s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear" begin={`${baseOffset}s`}><mpath href={`#${pathId}`} /></animateMotion>
                      </circle>
                      <circle r="2.5" fill="white" style={{ filter: glow }}>
                        <animateMotion dur="5s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear" begin={`${baseOffset + 1.6}s`}><mpath href={`#${pathId}`} /></animateMotion>
                      </circle>
                      <circle r="2.5" fill="white" style={{ filter: glow }}>
                        <animateMotion dur="5s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear" begin={`${baseOffset + 3.3}s`}><mpath href={`#${pathId}`} /></animateMotion>
                      </circle>
                    </>
                  );
                })()}
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const isDragging = draggingNodeId === node.id;
          const isInActivePath = (activePath ? getPathById(activePath)?.nodeIds.includes(node.id) : false) || activeRecipeNodeIds.includes(node.id);
          const isCompleted = completedNodes.includes(node.id);
          const hiddenCount = getHiddenChildCount(node.id);
          
          return (
            <div
              key={node.id}
              ref={(el) => { if (el) nodeRefs.current.set(node.id, el); }}
              className={`space-node ${selectedNode?.id === node.id ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isInActivePath ? 'in-path' : ''} ${isCompleted ? 'completed' : ''}`}
              style={{ left: `${node.x}px`, top: `${node.y}px`, '--level-color': spaceColors[node.level] } as React.CSSProperties}
              onMouseDown={(e) => { e.stopPropagation(); handleNodeDragStart(node.id, e.clientX, e.clientY); }}
              onTouchStart={(e) => { e.stopPropagation(); if (e.touches.length === 1) handleNodeDragStart(node.id, e.touches[0].clientX, e.touches[0].clientY); }}
              onClick={(e) => { 
                e.stopPropagation(); 
                const wasDragging = Math.abs(e.clientX - dragStart.current.x) > 5 || Math.abs(e.clientY - dragStart.current.y) > 5;
                handleNodeClick(node, wasDragging); 
              }}
            >
              <div className="node-glow"></div>
              <div className="node-content">
                <span className="node-icon">{node.emoji}</span>
                <span className="node-name">{node.name}</span>
                {/* Hidden children badge */}
                {hiddenCount > 0 && (
                  <span className="absolute -bottom-2 -right-2 bg-purple-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                    +{hiddenCount > 99 ? '99' : hiddenCount}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend + Expand toggle */}
      <div className="absolute bottom-4 left-4 bg-gray-950/40 backdrop-blur-xl rounded-2xl p-3.5 text-xs z-50 max-w-[300px] border border-white/[0.06] shadow-2xl" data-no-pan>
        <div className="text-gray-500 mb-2.5 uppercase tracking-wider text-[10px] font-medium flex items-center justify-between">
          <span>{lang === 'ru' ? 'Уровень абстракции' : 'Abstraction Level'}</span>
          <button
            onClick={() => setExpandAll(!expandAll)}
            className="text-purple-400 hover:text-purple-300 transition-colors normal-case text-xs"
          >
            {expandAll ? (lang === 'ru' ? '📁 Свернуть' : '📁 Collapse') : (lang === 'ru' ? '📂 Показать все' : '📂 Show All')}
          </button>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {(Object.keys(levelColors) as Array<AbstractionLevel>).map((level) => (
            <span key={level} className="flex items-center gap-1.5 text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: levelColors[level], boxShadow: `0 0 8px ${levelColors[level]}40` }} />
              <span className="text-[11px]">{levelLabels[lang][level]}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Breadcrumbs */}
      <Breadcrumbs
        selectedNode={selectedNode}
        activePath={activePath}
        lang={lang}
        onNodeClick={(nodeId) => {
          const node = dataNodes.find(n => n.id === nodeId);
          if (node) setSelectedNode(node);
        }}
      />

      <InfoPanel 
        node={selectedNode} 
        lang={lang} 
        onClose={() => setSelectedNode(null)}
        activePath={activePath}
        completedNodes={completedNodes}
        onMarkComplete={handleMarkComplete}
        onNavigateNext={handleNavigateNext}
        onStartExam={handleStartExam}
        onOpenRecipe={(recipeId) => openRecipe(recipeId)}
        onNodeNavigate={(nodeId) => {
          const node = dataNodes.find(n => n.id === nodeId);
          if (node) {
            setSelectedNode(node);
            // Ensure visible
            const parentEdge = initialEdges.find(e => e.target === nodeId && !e.style?.strokeDasharray);
            if (parentEdge) setExpandedNodes(prev => { const next = new Set(prev); next.add(parentEdge.source); return next; });
          }
        }}
      />

      {/* Topic Exam Modal */}
      {activeTopicQuiz && (
        <TopicQuizModal
          quiz={activeTopicQuiz}
          lang={lang}
          onClose={() => setActiveTopicQuiz(null)}
          onPass={handleExamPass}
        />
      )}

      <TimelinePanel lang={lang} isOpen={openPanel === 'timeline'} onClose={() => setOpenPanel(null)} />
      <GlossaryPanel lang={lang} isOpen={openPanel === 'glossary'} onClose={() => setOpenPanel(null)}
        onNodeClick={(nodeId) => { const node = dataNodes.find(n => n.id === nodeId); if (node) { setSelectedNode(node); setOpenPanel(null); } }} />
      <DailyChallengePanel lang={lang} isOpen={openPanel === 'daily'} onClose={() => setOpenPanel(null)}
        onXP={(xp) => setGamification(prev => { const s = { ...prev, totalXP: prev.totalXP + xp }; saveGamification(s); return s; })} />
      <ModelComparisonPanel lang={lang} isOpen={openPanel === 'models'} onClose={() => setOpenPanel(null)} />
      <ConceptRelationsPanel lang={lang} isOpen={openPanel === 'relations'} onClose={() => setOpenPanel(null)} />

      <RecipeBar
        lang={lang}
        recipeId={activeRecipe}
        selectedNodeId={selectedNode?.id ?? null}
        onNodeClick={focusNode}
        onOpenRecipe={(id) => openRecipe(id)}
        onClose={() => setActiveRecipe(null)}
      />
      <RecipesPanel
        lang={lang}
        isOpen={openPanel === 'recipes'}
        recipeId={recipeView}
        onSelectRecipe={setRecipeView}
        onClose={() => setOpenPanel(null)}
        onOpenNode={handleRecipeNode}
        onShowOnMap={handleShowRecipeOnMap}
      />

      {openPanel === 'support' && <SupportButton lang={lang} isModal onClose={() => setOpenPanel(null)} />}
    </div>
  );
}
