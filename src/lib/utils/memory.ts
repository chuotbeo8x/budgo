/**
 * Memory management utilities for React components
 */

import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Hook to cleanup listeners and prevent memory leaks
 */
export function useCleanup() {
  const cleanupRef = useRef<(() => void)[]>([]);

  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupRef.current.push(cleanup);
  }, []);

  useEffect(() => {
    return () => {
      cleanupRef.current.forEach(cleanup => cleanup());
      cleanupRef.current = [];
    };
  }, []);

  return addCleanup;
}

/**
 * Hook to debounce function calls
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Hook to throttle function calls
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
}

/**
 * Hook to manage component visibility for performance
 */
export function useVisibility() {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { isVisible, elementRef };
}

/**
 * Hook to manage component mounting state
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted;
}

/**
 * Hook to manage component focus state
 */
export function useFocus() {
  const [isFocused, setIsFocused] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, [handleFocus, handleBlur]);

  return { isFocused, elementRef };
}

/**
 * Hook to manage component hover state
 */
export function useHover() {
  const [isHovered, setIsHovered] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseEnter, handleMouseLeave]);

  return { isHovered, elementRef };
}

/**
 * Hook to manage component click state
 */
export function useClick() {
  const [isClicked, setIsClicked] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsClicked(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsClicked(false);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseUp]);

  return { isClicked, elementRef };
}

/**
 * Hook to manage component resize state
 */
export function useResize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const elementRef = useRef<HTMLElement>(null);

  const handleResize = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    setSize({
      width: element.offsetWidth,
      height: element.offsetHeight,
    });
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new ResizeObserver(handleResize);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [handleResize]);

  return { size, elementRef };
}

/**
 * Hook to manage component scroll state
 */
export function useScroll() {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLElement>(null);

  const handleScroll = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    setScrollPosition({
      x: element.scrollLeft,
      y: element.scrollTop,
    });
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll);

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return { scrollPosition, elementRef };
}

/**
 * Hook to manage component drag state
 */
export function useDrag() {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLElement>(null);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    setIsDragging(true);
    setDragPosition({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setDragPosition({ x: e.clientX, y: e.clientY });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  return { isDragging, dragPosition, elementRef };
}

/**
 * Hook to manage component keyboard state
 */
export function useKeyboard() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setPressedKeys(prev => new Set([...prev, e.key]));
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(e.key);
      return newSet;
    });
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return { pressedKeys };
}

/**
 * Hook to manage component touch state
 */
export function useTouch() {
  const [isTouching, setIsTouching] = useState(false);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    setIsTouching(true);
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isTouching) return;
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  }, [isTouching]);

  const handleTouchEnd = useCallback(() => {
    setIsTouching(false);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { isTouching, touchPosition, elementRef };
}

/**
 * Hook to manage component gesture state
 */
export function useGesture() {
  const [gesture, setGesture] = useState<{
    type: 'swipe' | 'pinch' | 'rotate' | null;
    direction: 'left' | 'right' | 'up' | 'down' | null;
    distance: number;
    angle: number;
  }>({
    type: null,
    direction: null,
    distance: 0,
    angle: 0,
  });

  const elementRef = useRef<HTMLElement>(null);

  const handleGestureStart = useCallback((e: TouchEvent) => {
    // Implementation for gesture detection
  }, []);

  const handleGestureMove = useCallback((e: TouchEvent) => {
    // Implementation for gesture tracking
  }, []);

  const handleGestureEnd = useCallback((e: TouchEvent) => {
    // Implementation for gesture completion
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleGestureStart);
    element.addEventListener('touchmove', handleGestureMove);
    element.addEventListener('touchend', handleGestureEnd);

    return () => {
      element.removeEventListener('touchstart', handleGestureStart);
      element.removeEventListener('touchmove', handleGestureMove);
      element.removeEventListener('touchend', handleGestureEnd);
    };
  }, [handleGestureStart, handleGestureMove, handleGestureEnd]);

  return { gesture, elementRef };
}

/**
 * Hook to manage component animation state
 */
export function useAnimation() {
  const [isAnimating, setIsAnimating] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
  }, []);

  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleAnimationStart = () => setIsAnimating(true);
    const handleAnimationEnd = () => setIsAnimating(false);

    element.addEventListener('animationstart', handleAnimationStart);
    element.addEventListener('animationend', handleAnimationEnd);

    return () => {
      element.removeEventListener('animationstart', handleAnimationStart);
      element.removeEventListener('animationend', handleAnimationEnd);
    };
  }, []);

  return { isAnimating, startAnimation, stopAnimation, elementRef };
}

/**
 * Hook to manage component transition state
 */
export function useTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const startTransition = useCallback(() => {
    setIsTransitioning(true);
  }, []);

  const stopTransition = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTransitionStart = () => setIsTransitioning(true);
    const handleTransitionEnd = () => setIsTransitioning(false);

    element.addEventListener('transitionstart', handleTransitionStart);
    element.addEventListener('transitionend', handleTransitionEnd);

    return () => {
      element.removeEventListener('transitionstart', handleTransitionStart);
      element.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, []);

  return { isTransitioning, startTransition, stopTransition, elementRef };
}

/**
 * Hook to manage component visibility for performance
 */
export function useVisibility() {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { isVisible, elementRef };
}

/**
 * Hook to manage component mounting state
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted;
}

/**
 * Hook to manage component focus state
 */
export function useFocus() {
  const [isFocused, setIsFocused] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, [handleFocus, handleBlur]);

  return { isFocused, elementRef };
}

/**
 * Hook to manage component hover state
 */
export function useHover() {
  const [isHovered, setIsHovered] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseEnter, handleMouseLeave]);

  return { isHovered, elementRef };
}

/**
 * Hook to manage component click state
 */
export function useClick() {
  const [isClicked, setIsClicked] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsClicked(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsClicked(false);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseUp]);

  return { isClicked, elementRef };
}

/**
 * Hook to manage component resize state
 */
export function useResize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const elementRef = useRef<HTMLElement>(null);

  const handleResize = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    setSize({
      width: element.offsetWidth,
      height: element.offsetHeight,
    });
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new ResizeObserver(handleResize);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [handleResize]);

  return { size, elementRef };
}

/**
 * Hook to manage component scroll state
 */
export function useScroll() {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLElement>(null);

  const handleScroll = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    setScrollPosition({
      x: element.scrollLeft,
      y: element.scrollTop,
    });
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll);

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return { scrollPosition, elementRef };
}

/**
 * Hook to manage component drag state
 */
export function useDrag() {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLElement>(null);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    setIsDragging(true);
    setDragPosition({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setDragPosition({ x: e.clientX, y: e.clientY });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  return { isDragging, dragPosition, elementRef };
}

/**
 * Hook to manage component keyboard state
 */
export function useKeyboard() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setPressedKeys(prev => new Set([...prev, e.key]));
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(e.key);
      return newSet;
    });
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return { pressedKeys };
}

/**
 * Hook to manage component touch state
 */
export function useTouch() {
  const [isTouching, setIsTouching] = useState(false);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    setIsTouching(true);
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isTouching) return;
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  }, [isTouching]);

  const handleTouchEnd = useCallback(() => {
    setIsTouching(false);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { isTouching, touchPosition, elementRef };
}

/**
 * Hook to manage component gesture state
 */
export function useGesture() {
  const [gesture, setGesture] = useState<{
    type: 'swipe' | 'pinch' | 'rotate' | null;
    direction: 'left' | 'right' | 'up' | 'down' | null;
    distance: number;
    angle: number;
  }>({
    type: null,
    direction: null,
    distance: 0,
    angle: 0,
  });

  const elementRef = useRef<HTMLElement>(null);

  const handleGestureStart = useCallback((e: TouchEvent) => {
    // Implementation for gesture detection
  }, []);

  const handleGestureMove = useCallback((e: TouchEvent) => {
    // Implementation for gesture tracking
  }, []);

  const handleGestureEnd = useCallback((e: TouchEvent) => {
    // Implementation for gesture completion
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleGestureStart);
    element.addEventListener('touchmove', handleGestureMove);
    element.addEventListener('touchend', handleGestureEnd);

    return () => {
      element.removeEventListener('touchstart', handleGestureStart);
      element.removeEventListener('touchmove', handleGestureMove);
      element.removeEventListener('touchend', handleGestureEnd);
    };
  }, [handleGestureStart, handleGestureMove, handleGestureEnd]);

  return { gesture, elementRef };
}

/**
 * Hook to manage component animation state
 */
export function useAnimation() {
  const [isAnimating, setIsAnimating] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
  }, []);

  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleAnimationStart = () => setIsAnimating(true);
    const handleAnimationEnd = () => setIsAnimating(false);

    element.addEventListener('animationstart', handleAnimationStart);
    element.addEventListener('animationend', handleAnimationEnd);

    return () => {
      element.removeEventListener('animationstart', handleAnimationStart);
      element.removeEventListener('animationend', handleAnimationEnd);
    };
  }, []);

  return { isAnimating, startAnimation, stopAnimation, elementRef };
}

/**
 * Hook to manage component transition state
 */
export function useTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const startTransition = useCallback(() => {
    setIsTransitioning(true);
  }, []);

  const stopTransition = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTransitionStart = () => setIsTransitioning(true);
    const handleTransitionEnd = () => setIsTransitioning(false);

    element.addEventListener('transitionstart', handleTransitionStart);
    element.addEventListener('transitionend', handleTransitionEnd);

    return () => {
      element.removeEventListener('transitionstart', handleTransitionStart);
      element.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, []);

  return { isTransitioning, startTransition, stopTransition, elementRef };
}
