import { useEffect, useRef } from "react";

/**
 * Hook to trap focus within a container for accessibility
 * Useful for modal-like step flows
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  isActive: boolean = true
) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    // Focus first element when trap activates
    firstElement?.focus();

    container.addEventListener("keydown", handleTabKey as EventListener);

    return () => {
      container.removeEventListener("keydown", handleTabKey as EventListener);
    };
  }, [isActive]);

  return containerRef;
}
