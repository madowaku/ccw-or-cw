/** Deterministic rules for ↺ OR ↻. Angles are 16 equal sectors, 0 = 12 o'clock, clockwise positive. */
export const SLOTS = 16;
export const normalize = (value) => ((value % SLOTS) + SLOTS) % SLOTS;
export const isOpen = (wall, angle) => wall.includes(normalize(angle));

export function validateStage(stage) {
  if (!stage || !Array.isArray(stage.walls) || stage.walls.length < 1 || stage.walls.length > 8) {
    throw Error('Stage must have 1–8 walls');
  }
  for (const wall of stage.walls) {
    if (!Array.isArray(wall) || wall.length === 0 || new Set(wall).size !== wall.length || wall.some(n => !Number.isInteger(n) || n < 0 || n >= SLOTS)) {
      throw Error('Walls must contain unique integers between 0 and 15');
    }
  }
}
export function initialState(stage) {
  validateStage(stage);
  const state = {layer: -1, angle: 8, moves: 0, rotations: Array(stage.walls.length).fill(0), history: [], status: 'playing'};
  return cascade(stage, state);
}
export function cascade(stage, state) {
  let layer = state.layer;
  const passed = [];
  while (layer + 1 < stage.walls.length && isOpen(stage.walls[layer + 1], state.angle)) {
    layer++;
    passed.push(layer);
  }
  return {...state, layer, status: layer === stage.walls.length - 1 ? 'won' : 'playing', passed};
}
export function step(stage, currentState, direction) {
  if (direction !== 1 && direction !== -1) throw Error('direction must be +1 or -1');
  if (currentState.status !== 'playing') return currentState;
  const wallIndex = currentState.layer + 1;
  const gates = stage.walls[wallIndex];
  const distances = gates.map(gate => ({gate, distance: normalize((gate - currentState.angle) * direction) || SLOTS}));
  distances.sort((a,b) => a.distance - b.distance);
  const {gate, distance} = distances[0];
  const rotations = [...currentState.rotations];
  if (currentState.layer >= 0) rotations[currentState.layer] = normalize(rotations[currentState.layer] + direction * distance);
  const next = cascade(stage, {
    ...currentState,
    angle: gate,
    rotations,
    moves: currentState.moves + 1,
    passed: [],
    history: [...currentState.history, direction],
  });
  return {...next, transition: {
    fromAngle: currentState.angle, toAngle: gate, direction,
    distance, fromLayer: currentState.layer, toLayer: next.layer, crossed: next.passed,
  }};
}
export function solve(stage) {
  const first = initialState(stage);
  if (first.status === 'won') return {moves: 0, paths: [[]]};
  let queue = [{state: first, path: []}];
  for (let depth = 1; depth <= stage.walls.length; depth++) {
    const next = [], winners = [];
    for (const {state,path} of queue) {
      for (const dir of [-1,1]) {
        const result = step(stage,state,dir);
        const newPath = [...path,dir];
        if (result.status === 'won') winners.push(newPath);
        else next.push({state:result,path:newPath});
      }
    }
    if (winners.length) return {moves:depth,paths:winners};
    queue = next;
  }
  throw Error('No winning route');
}
export const arrow = direction => direction === -1 ? '↺' : '↻';
