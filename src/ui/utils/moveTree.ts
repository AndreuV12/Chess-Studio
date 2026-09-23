import type { Move } from "@/types/move.types";

export type MoveNode = Move & {
  children: MoveNode[];
};

export function buildMoveTree(moves: Move[]): MoveNode[] {
  const nodes = new Map<number, MoveNode>();
  for (const move of moves) {
    nodes.set(move.id, {
      ...move,
      children: [],
    });
  }
  const roots: MoveNode[] = [];
  for (const node of nodes.values()) {
    if (node.parentId === null) {
      roots.push(node);
      continue;
    }
    const parent = nodes.get(node.parentId);
    if (parent) {
      parent.children.push(node);
    }
  }
  return roots;
}

export function findMoveNode(tree: MoveNode[], moveId: number): MoveNode | undefined {
  for (const node of tree) {
    if (node.id === moveId) return node;
    const found = findMoveNode(node.children, moveId);
    if (found) return found;
  }
}

export function getMovePath(tree: MoveNode[], moveId: number | null): Move[] {
  if (moveId === null) return [];
  function walk(nodes: MoveNode[], path: Move[]): Move[] | null {
    for (const node of nodes) {
      const nextPath = [...path, node];
      if (node.id === moveId) {
        return nextPath;
      }
      const found = walk(node.children, nextPath);
      if (found) return found;
    }
    return null;
  }
  return walk(tree, []) ?? [];
}
