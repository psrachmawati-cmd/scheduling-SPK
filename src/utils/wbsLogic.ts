import { WbsNode, TaskStatus, SCurveDataPoint } from '../types';

/**
 * Format IDR currency
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Evaluates task status based on dates and progress (Spec 5.3)
 */
export function evaluateTaskStatus(
  progressActual: number,
  progressPlan: number,
  finishPlan: string,
  currentStatus?: TaskStatus
): TaskStatus {
  if (currentStatus === 'ON_HOLD') return 'ON_HOLD';
  if (progressActual >= 100) return 'COMPLETED';
  if (progressActual > 0) {
    const today = new Date().toISOString().split('T')[0];
    if (today > finishPlan && progressActual < progressPlan) {
      return 'DELAYED';
    }
    return 'ON_PROGRESS';
  }
  const today = new Date().toISOString().split('T')[0];
  if (today > finishPlan && progressPlan > 0) {
    return 'DELAYED';
  }
  return 'NOT_STARTED';
}

/**
 * Computes bottom-up roll-up progress across the WBS tree.
 * Function recursive roll-up progress (Spec 5.2 / 5.3):
 * node.progress_actual = total / SUM(bobot semua children)
 * where total += child.progress_actual * child.bobot
 */
export function calculateRollup(nodes: WbsNode[]): WbsNode[] {
  // Build parent-to-children map
  const childrenMap = new Map<string, WbsNode[]>();
  nodes.forEach((node) => {
    if (node.parentId) {
      const list = childrenMap.get(node.parentId) || [];
      list.push(node);
      childrenMap.set(node.parentId, list);
    }
  });

  // Clone nodes
  const nodeMap = new Map<string, WbsNode>();
  nodes.forEach((n) => nodeMap.set(n.id, { ...n }));

  // Post-order / leaf-first recursive computation
  function processNode(nodeId: string): { actual: number; plan: number; weightSum: number } {
    const node = nodeMap.get(nodeId);
    if (!node) return { actual: 0, plan: 0, weightSum: 0 };

    const children = childrenMap.get(nodeId);
    if (!children || children.length === 0) {
      // Leaf node: keep user input
      node.status = evaluateTaskStatus(node.progressActual, node.progressPlan, node.finishPlan, node.status);
      return {
        actual: node.progressActual,
        plan: node.progressPlan,
        weightSum: node.weight || 1,
      };
    }

    let weightedActualSum = 0;
    let weightedPlanSum = 0;
    let totalChildWeight = 0;

    children.forEach((child) => {
      const childResult = processNode(child.id);
      const childNode = nodeMap.get(child.id)!;
      const childWeight = childNode.weight > 0 ? childNode.weight : 1;
      totalChildWeight += childWeight;
      weightedActualSum += childResult.actual * childWeight;
      weightedPlanSum += childResult.plan * childWeight;
    });

    const divisor = totalChildWeight > 0 ? totalChildWeight : 1;
    node.progressActual = Number((weightedActualSum / divisor).toFixed(2));
    node.progressPlan = Number((weightedPlanSum / divisor).toFixed(2));

    // Roll up date boundaries from children
    const childStarts = children
      .map((c) => nodeMap.get(c.id)?.startPlan)
      .filter((d): d is string => Boolean(d));
    const childFinishes = children
      .map((c) => nodeMap.get(c.id)?.finishPlan)
      .filter((d): d is string => Boolean(d));

    if (childStarts.length > 0 && childFinishes.length > 0) {
      const minStart = [...childStarts].sort()[0];
      const maxFinish = [...childFinishes].sort().reverse()[0];
      node.startPlan = minStart;
      node.finishPlan = maxFinish;
      const s = new Date(minStart).getTime();
      const f = new Date(maxFinish).getTime();
      if (!isNaN(s) && !isNaN(f)) {
        node.durationDays = Math.max(1, Math.round((f - s) / (1000 * 60 * 60 * 24)));
      }
    }

    node.status = evaluateTaskStatus(node.progressActual, node.progressPlan, node.finishPlan, node.status);

    return {
      actual: node.progressActual,
      plan: node.progressPlan,
      weightSum: node.weight,
    };
  }

  // Find root nodes (parentId is null) and process them
  const rootNodes = nodes.filter((n) => !n.parentId);
  rootNodes.forEach((r) => processNode(r.id));

  // Return updated nodes preserving order
  return nodes.map((n) => nodeMap.get(n.id)!);
}

/**
 * Regenerate automatic WBS codes (1, 1.1, 1.1.1) based on tree order & hierarchy (Spec 5.2)
 */
export function reindexWbsCodes(nodes: WbsNode[]): WbsNode[] {
  const result: WbsNode[] = [];
  const childrenMap = new Map<string | null, WbsNode[]>();

  nodes.forEach((node) => {
    const pId = node.parentId;
    const list = childrenMap.get(pId) || [];
    list.push({ ...node });
    childrenMap.set(pId, list);
  });

  // Sort lists by order
  childrenMap.forEach((list) => list.sort((a, b) => a.order - b.order));

  function traverse(parentId: string | null, parentCode: string, level: number) {
    const children = childrenMap.get(parentId) || [];
    children.forEach((child, index) => {
      const currentCode = parentCode ? `${parentCode}.${index + 1}` : `${index + 1}`;
      child.wbsCode = currentCode;
      child.level = level;
      child.order = index + 1;
      result.push(child);
      // Strictly restrict WBS hierarchy to Order 2 (level 0 root, level 1 sub-package)
      if (level < 1) {
        traverse(child.id, currentCode, level + 1);
      }
    });
  }

  traverse(null, '', 0);
  return result;
}

/**
 * Normalizes sibling weights if they don't sum to 100% (Spec 5.2.3)
 */
export function normalizeWeights(nodes: WbsNode[], parentId: string | null): WbsNode[] {
  const siblings = nodes.filter((n) => n.parentId === parentId);
  const total = siblings.reduce((sum, n) => sum + (n.weight || 0), 0);
  if (total === 0) return nodes;

  return nodes.map((n) => {
    if (n.parentId === parentId) {
      return {
        ...n,
        weight: Number(((n.weight / total) * 100).toFixed(2)),
      };
    }
    return n;
  });
}

/**
 * Generates S-Curve data points for visualization (Spec 5.5 / 7)
 */
export function generateSCurveData(
  startDateStr: string,
  finishDateStr: string,
  currentActualProgress: number,
  targetPlanProgress: number
): SCurveDataPoint[] {
  const points: SCurveDataPoint[] = [];
  const start = new Date(startDateStr);
  const finish = new Date(finishDateStr);
  const totalWeeks = 12; // 12-week monitoring cycle
  const currentWeek = 7; // Currently at week 7 of execution

  for (let w = 0; w <= totalWeeks; w++) {
    const t = w / totalWeeks;
    // Standard Sigmoid S-Curve for plan: 1 / (1 + e^(-k*(t - 0.5))) scaled 0 to 100
    const rawPlan = 1 / (1 + Math.exp(-6 * (t - 0.5)));
    const planNormalized = Math.min(100, Math.max(0, Number((rawPlan * 100).toFixed(1))));

    // Actual progress recorded up to current week
    let actualValue: number | null = null;
    let deviation: number | null = null;

    if (w <= currentWeek) {
      if (w === 0) {
        actualValue = 0;
      } else if (w === currentWeek) {
        actualValue = currentActualProgress;
      } else {
        // Linear/smooth curve leading to current actual
        const ratio = w / currentWeek;
        actualValue = Number((currentActualProgress * Math.pow(ratio, 1.25)).toFixed(1));
      }
      deviation = Number((actualValue - planNormalized).toFixed(1));
    }

    const d = new Date(start.getTime() + (finish.getTime() - start.getTime()) * (w / totalWeeks));
    const dateStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

    points.push({
      date: dateStr,
      weekLabel: `Minggu ${w}`,
      progressPlanCumulative: planNormalized,
      progressActualCumulative: actualValue,
      deviation,
    });
  }

  return points;
}
