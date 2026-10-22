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
import { initialNodes as dataNodes, initialEdges, AINode, Language, levelLabels, AbstractionLevel } from '@/data/nodes';
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

// Faint background stars, fixed to the screen (no parallax)
function generateDust(count: number, seed: number) {
  const stars: { x: number; y: number; r: number; o: number }[] = [];
  let s = seed;
  const random = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  for (let i = 0; i < 10; i++) random();
  for (let i = 0; i < count; i++) {
    const m = random();
    stars.push({ x: random() * 100, y: random() * 100, r: m > 0.93 ? 2 : m > 0.7 ? 1.4 : 1, o: 0.12 + random() * 0.28 });
  }
  return stars;
}
const dust = generateDust(160, 7);

// Star magnitude order: field is the 1st magnitude
const magnitude: Record<AbstractionLevel, number> = { field: 0, theory: 1, method: 2, algorithm: 3, implementation: 4 };
const magnitudeGlyph: Record<AbstractionLevel, number> = { field: 16, theory: 11, method: 8, algorithm: 6, implementation: 4 };
// Zoom below which a magnitude's label is hidden (shown on hover / selection)
const labelZoom: Record<AbstractionLevel, number> = { field: 0, theory: 0, method: 0.34, algorithm: 0.5, implementation: 0.58 };

// The tree is drawn top-down on landscape screens and left-to-right on portrait ones
function isLandscape() {
  return typeof window !== 'undefined' && window.innerWidth > window.innerHeight;
}

function getAtlasPositions(): Map<string, { x: number; y: number }> {
  const base = getManualPositions();
  const out = new Map<string, { x: number; y: number }>();
  const landscape = isLandscape();
  base.forEach((p, id) => {
    // portrait: lift the root above the first branch so its label stays clear
    out.set(id, landscape ? { x: p.y * 1.7, y: p.x * 1.6 } : (id === 'ai' ? { x: 0, y: 0 } : { x: p.x * 0.9, y: p.y + 300 }));
  });
  return out;
}

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

  const connections = useMemo<Connection[]>(() => 
    initialEdges.map(edge => ({
      from: edge.source,
      to: edge.target,
      dashed: edge.style?.strokeDasharray !== undefined,
    })),
    []
  );
  
  const initialPositions = useMemo(() => getAtlasPositions(), []);
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(initialPositions);
  
  const nodes = useMemo<SpaceNode[]>(() => 
    dataNodes
      .filter(node => visibleNodeIds.has(node.id))
      .map(node => {
        const pos = nodePositions.get(node.id) || { x: 0, y: 0 };
        return {
          id: node.id,
          name: node.data[lang]?.label || node.id,
          level: node.data.level,
          x: pos.x,
          y: pos.y,
          data: node.data,
        };
      }),
    [lang, nodePositions, visibleNodeIds]
  );

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [zoom, setZoom] = useState(0.65);
  const [intro, setIntro] = useState(true);
  const [landscape] = useState(isLandscape);
  const MIN_ZOOM = 0.12;
  const MAX_ZOOM = 2;
  
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const nodeStartPos = useRef({ x: 0, y: 0 });

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
  const fitNodes = useCallback((ids: string[], fitZoom: boolean, withInfoPanel: boolean, instant = false) => {
    const points = ids.map(id => nodePositions.get(id)).filter((p): p is { x: number; y: number } => !!p);
    if (points.length === 0) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const NODE_W = 160, NODE_H = 40; // star + label to its right
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x)) + NODE_W;
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y)) + NODE_H;
    const isDesktop = W >= 768;
    const areaW = W - (isDesktop && withInfoPanel ? 440 : 0);
    const areaTop = isDesktop ? 150 : 200; // header
    const areaBottom = isDesktop ? H - 72 : (withInfoPanel ? H * 0.3 + 140 : H - 96); // mobile: bottom sheet / legend
    let z = targetZoom.current;
    if (fitZoom) {
      z = Math.min(0.9, (areaW - 80) / (maxX - minX), (areaBottom - areaTop - 60) / (maxY - minY));
      z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));
      targetZoom.current = z;
      if (instant) setZoom(z);
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const targetX = areaW / 2;
    const targetY = (areaTop + areaBottom) / 2;
    setPan({ x: targetX - W / 2 - (cx - W / 2) * z, y: targetY - H / 2 - (cy - H / 2) * z });
  }, [nodePositions]);

  // First screen: the whole atlas fits the free area (left of the task column on desktop)
  const fitAll = useCallback((recipesDocked: boolean, instant = false) => {
    fitNodes(dataNodes.map(n => n.id), true, recipesDocked && window.innerWidth >= 768, instant);
  }, [fitNodes]);
  const firstVisit = useRef<boolean | null>(null);
  if (firstVisit.current === null) {
    try { firstVisit.current = typeof window !== 'undefined' && !localStorage.getItem(RECIPES_SEEN_KEY); } catch { firstVisit.current = false; }
  }
  useEffect(() => {
    fitAll(!!firstVisit.current, true);
    const t = setTimeout(() => setIntro(false), 1800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Re-frame the atlas when the docked task column opens or closes on desktop
  const recipesOpen = openPanel === 'recipes';
  const prevRecipesOpen = useRef(recipesOpen);
  useEffect(() => {
    if (prevRecipesOpen.current === recipesOpen) return;
    prevRecipesOpen.current = recipesOpen;
    if (window.innerWidth >= 768 && !selectedNode && !activeRecipe) fitAll(recipesOpen);
  }, [recipesOpen, selectedNode, activeRecipe, fitAll]);

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
    <div ref={containerRef} className={`space-container ${isPanning ? 'panning' : ''} ${intro ? 'intro' : ''} ${landscape ? 'orient-landscape' : ''}`}>
      {/* Background dust + plate frame */}
      <div className="atlas-dust" aria-hidden>
        {dust.map((d, i) => (
          <span key={i} style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.r, height: d.r, opacity: d.o }} />
        ))}
      </div>
      <div className="atlas-frame" aria-hidden />

      {/* Header: Title + Language + XP */}
      <div className="absolute top-5 left-5 md:top-6 md:left-6 z-50 w-[calc(100vw-6.5rem)] max-w-[300px]" data-no-pan>
        <div className="bg-atlas-sky/90 border border-atlas-grid rounded-[6px] px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-atlas italic text-2xl md:text-[28px] leading-none text-atlas-chalk">AI Mindmap</h1>
              <p className="hidden md:block text-atlas-mist text-xs mt-1.5">
                {lang === 'ru' ? 'Нажми на звезду, чтобы прочитать. Поиск: ⌘K' : 'Click a star to read about it. Search: ⌘K'}
              </p>
            </div>
            <LanguageToggle lang={lang} onChange={setLang} />
          </div>
          <button
            onClick={() => openRecipe(null)}
            className="mt-2.5 md:mt-3 w-full px-3 py-2 rounded-[4px] text-sm font-medium bg-atlas-brass text-atlas-sky hover:bg-[#E0B96E] transition-colors"
          >
            {lang === 'ru' ? 'Решить задачу с AI' : 'Solve a task with AI'}
          </button>
          <div className="mt-2.5 pt-2.5 md:mt-3 md:pt-3 border-t border-atlas-grid">
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
        {/* SVG: coordinate grid + constellation lines (world units) */}
        <svg className="connections" style={{
          position: 'absolute', left: '-2000px', top: '-2000px',
          width: '10000px', height: '10000px', overflow: 'visible',
        }} aria-hidden>
          <g className="atlas-grid">
            {Array.from({ length: 21 }, (_, i) => -2000 + i * 500).map(v => (
              <g key={v}>
                <line x1={v + 2000} y1={0} x2={v + 2000} y2={10000} vectorEffect="non-scaling-stroke" strokeWidth={1} />
                <line x1={0} y1={v + 2000} x2={10000} y2={v + 2000} vectorEffect="non-scaling-stroke" strokeWidth={1} />
              </g>
            ))}
          </g>
          {connections.map((conn, i) => {
            const fromVisible = visibleNodeIds.has(conn.from);
            const toVisible = visibleNodeIds.has(conn.to);
            const from = nodePositions.get(conn.from);
            const to = nodePositions.get(conn.to);
            if (!from || !to) return null;
            const ghost = !(fromVisible && toVisible);
            if (ghost && conn.dashed) return null;
            const isActive = !ghost && isConnectionActive(conn);
            return (
              <line key={i}
                x1={from.x + 2000} y1={from.y + 2000} x2={to.x + 2000} y2={to.y + 2000}
                vectorEffect="non-scaling-stroke"
                strokeWidth={isActive ? 1.75 : 1}
                strokeDasharray={conn.dashed ? '3 5' : undefined}
                className={`constellation-line ${conn.dashed ? 'dashed' : ''} ${ghost ? 'ghost' : ''} ${isActive ? 'active' : ''}`}
              />
            );
          })}
        </svg>

        {/* Hidden stars: faint points, so the whole constellation is visible from the start */}
        {dataNodes.filter(n => !visibleNodeIds.has(n.id)).map(n => {
          const pos = nodePositions.get(n.id);
          if (!pos) return null;
          return (
            <div key={`ghost-${n.id}`} className={`ghost-star mag-${n.data.level}`}
              style={{ left: pos.x, top: pos.y, '--inv': 1 / zoom, '--mag-i': magnitude[n.data.level] } as React.CSSProperties}>
              <span className="star-dot" style={{ width: magnitudeGlyph[n.data.level] * 0.7, height: magnitudeGlyph[n.data.level] * 0.7, left: -magnitudeGlyph[n.data.level] * 0.35, top: -magnitudeGlyph[n.data.level] * 0.35 }} />
            </div>
          );
        })}

        {/* Stars */}
        {nodes.map((node) => {
          const isDragging = draggingNodeId === node.id;
          const isInActivePath = (activePath ? getPathById(activePath)?.nodeIds.includes(node.id) : false) || activeRecipeNodeIds.includes(node.id);
          const isCompleted = completedNodes.includes(node.id);
          const isSelected = selectedNode?.id === node.id;
          const hiddenCount = getHiddenChildCount(node.id);
          const labelOff = zoom < labelZoom[node.level] && !isSelected && !isInActivePath;
          
          return (
            <div
              key={node.id}
              role="button"
              tabIndex={0}
              aria-label={node.name}
              className={`space-node mag-${node.level} ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isInActivePath ? 'in-path' : ''} ${isCompleted ? 'completed' : ''} ${labelOff ? 'label-off' : ''}`}
              style={{ left: `${node.x}px`, top: `${node.y}px`, '--inv': 1 / zoom, '--mag-i': magnitude[node.level] } as React.CSSProperties}
              onMouseDown={(e) => { e.stopPropagation(); handleNodeDragStart(node.id, e.clientX, e.clientY); }}
              onTouchStart={(e) => { e.stopPropagation(); if (e.touches.length === 1) handleNodeDragStart(node.id, e.touches[0].clientX, e.touches[0].clientY); }}
              onClick={(e) => { 
                e.stopPropagation(); 
                const wasDragging = Math.abs(e.clientX - dragStart.current.x) > 5 || Math.abs(e.clientY - dragStart.current.y) > 5;
                handleNodeClick(node, wasDragging); 
              }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNodeClick(node, false); } }}
            >
              <span className="star-hit" />
              <span className="star-dot" />
              <span className="star-label">
                {node.name}
                {hiddenCount > 0 && <span className="star-more">+{hiddenCount > 99 ? '99' : hiddenCount}</span>}
              </span>
            </div>
          );
        })}
      </div>

      {/* Magnitude scale: the abstraction levels, as on an atlas legend */}
      <div className="absolute z-50 left-3 bottom-3 md:left-6 md:bottom-6" data-no-pan>
        <div title={(Object.keys(magnitude) as Array<AbstractionLevel>).map(l => levelLabels[lang][l]).join(', ')}
          className="inline-flex items-center gap-x-3 md:gap-x-5 whitespace-nowrap bg-atlas-sky/90 border border-atlas-grid rounded-[6px] px-3 py-2 md:px-4 text-[13px] text-atlas-mist">
          {(Object.keys(magnitude) as Array<AbstractionLevel>).map((level) => (
            <span key={level} className="flex items-center gap-2">
              <span className="relative inline-flex items-center justify-center" style={{ width: 16, height: 16 }}>
                <span className="rounded-full bg-atlas-chalk" style={{ width: magnitudeGlyph[level], height: magnitudeGlyph[level] }} />
              </span>
              <span className="hidden sm:inline">{levelLabels[lang][level]}</span>
            </span>
          ))}
          <button
            onClick={() => setExpandAll(!expandAll)}
            className="ml-1 pl-4 border-l border-atlas-grid text-atlas-chalk hover:text-atlas-brass transition-colors"
          >
            {expandAll ? (lang === 'ru' ? 'Свернуть' : 'Collapse') : (lang === 'ru' ? 'Показать все' : 'Show all')}
          </button>
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
