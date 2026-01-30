import { verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { SortingStrategy } from '@dnd-kit/sortable';

/**
 * Custom sorting strategy that respects frozen items.
 * Frozen items stay locked in place. Non-frozen items animate around them.
 */
export function frozenVerticalListStrategy(
  frozenIds: Set<string>,
  items: string[],
): SortingStrategy {
  return (args) => {
    // Safety check
    if (!items || items.length === 0) {
      return verticalListSortingStrategy(args);
    }

    const { index, activeIndex } = args;

    // Frozen items NEVER move - return null to prevent any transform
    const currentId = items[index];
    if (frozenIds.has(currentId)) {
      return null;
    }

    // Don't allow dragging frozen items
    const activeId = items[activeIndex];
    if (activeIndex !== -1 && frozenIds.has(activeId)) {
      return null;
    }

    // For non-frozen items, use the default strategy
    const defaultTransform = verticalListSortingStrategy(args);

    // If there's a transform and frozen items are in between, we need to adjust
    if (defaultTransform && index !== activeIndex) {
      // Build virtual (non-frozen) indices
      const nonFrozenIndices: number[] = [];
      for (let i = 0; i < items.length; i++) {
        if (!frozenIds.has(items[i])) {
          nonFrozenIndices.push(i);
        }
      }

      const virtualCurrent = nonFrozenIndices.indexOf(index);
      const virtualActive = nonFrozenIndices.indexOf(activeIndex);

      if (virtualCurrent === -1 || virtualActive === -1) {
        return defaultTransform;
      }

      // Determine where this item will land in the virtual list
      let targetVirtualIndex = virtualCurrent;
      if (virtualCurrent > virtualActive) {
        // Item is after the active item, moves up by 1
        targetVirtualIndex = virtualCurrent - 1;
      } else if (virtualCurrent < virtualActive) {
        // Item is before the active item, moves down by 1
        targetVirtualIndex = virtualCurrent + 1;
      }

      // Map back to real index
      const targetRealIndex = nonFrozenIndices[targetVirtualIndex];

      // Count frozen items between current and target real positions
      const start = Math.min(index, targetRealIndex);
      const end = Math.max(index, targetRealIndex);
      let frozenCount = 0;

      for (let i = start; i <= end; i++) {
        if (i !== index && i !== targetRealIndex && frozenIds.has(items[i])) {
          frozenCount++;
        }
      }

      // If there are frozen items to hop over, multiply the transform
      if (frozenCount > 0) {
        return {
          ...defaultTransform,
          y: defaultTransform.y * (frozenCount + 1),
        };
      }
    }

    return defaultTransform;
  };
}
