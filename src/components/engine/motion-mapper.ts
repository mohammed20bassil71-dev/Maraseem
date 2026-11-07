import { TransitionType, SceneAnimationSequence, AnimationKeyframe } from '../../types/template-schema';

export interface MotionMappingResult {
  initial: Record<string, any>;
  animate: Record<string, any>;
  exit: Record<string, any>;
  transition: Record<string, any>;
}

/**
 * Generates 3D Card Flip variants in mid-air using Framer Motion rotation features
 * (rotateY, rotateX, scale, y lift, and 3D perspective).
 */
export function get3DCardFlipVariants(direction: number = 1, springStiffness: number = 115): MotionMappingResult {
  return {
    initial: {
      opacity: 0,
      rotateY: direction > 0 ? 92 : -92,
      rotateX: direction > 0 ? 8 : -8,
      scale: 0.86,
      y: -18,
      z: -160,
      transformPerspective: 1400,
      filter: 'brightness(0.75) blur(2px)',
    },
    animate: {
      opacity: 1,
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      y: 0,
      z: 0,
      transformPerspective: 1400,
      filter: 'brightness(1) blur(0px)',
    },
    exit: {
      opacity: 0,
      rotateY: direction > 0 ? -92 : 92,
      rotateX: direction > 0 ? -8 : 8,
      scale: 0.86,
      y: 14,
      z: -160,
      transformPerspective: 1400,
      filter: 'brightness(0.7) blur(2px)',
    },
    transition: {
      type: 'spring',
      stiffness: springStiffness,
      damping: 18,
      mass: 0.85,
    },
  };
}

/**
 * Maps a JSON schema transition type, animation sequence, and keyframes
 * to motion/react (Framer Motion) animation variants and spring/timing transitions.
 */
export function mapAnimationSequenceToMotion(
  transitionType: TransitionType = '3d-flip',
  sequence?: SceneAnimationSequence,
  direction: number = 1
): MotionMappingResult {
  const durationSec = sequence ? sequence.durationMs / 1000 : 0.65;
  const delaySec = sequence?.delayMs ? sequence.delayMs / 1000 : 0;

  // Resolve Easing
  let transitionConfig: Record<string, any> = {
    duration: durationSec,
    delay: delaySec,
  };

  if (sequence?.easing === 'spring') {
    transitionConfig = {
      type: 'spring',
      stiffness: sequence.springStiffness || 140,
      damping: 18,
      mass: 0.8,
      delay: delaySec,
    };
  } else if (sequence?.easing === 'cinematic') {
    transitionConfig.ease = [0.16, 1, 0.3, 1]; // Smooth luxury cinematic deceleration
  } else if (sequence?.easing === 'easeInOut') {
    transitionConfig.ease = [0.42, 0, 0.58, 1];
  } else if (sequence?.easing === 'linear') {
    transitionConfig.ease = 'linear';
  } else {
    transitionConfig.ease = [0, 0, 0.2, 1]; // standard easeOut
  }

  // If custom keyframe array is supplied in schema
  if (sequence?.keyframes && sequence.keyframes.length > 0) {
    const scales: number[] = [];
    const opacities: number[] = [];
    const rotates: number[] = [];
    const xs: (number | string)[] = [];
    const ys: (number | string)[] = [];

    sequence.keyframes.forEach((kf) => {
      if (kf.scale !== undefined) scales.push(kf.scale);
      if (kf.opacity !== undefined) opacities.push(kf.opacity);
      if (kf.rotate !== undefined) rotates.push(kf.rotate);
      if (kf.x !== undefined) xs.push(kf.x);
      if (kf.y !== undefined) ys.push(kf.y);
    });

    const animateProps: Record<string, any> = {};
    if (scales.length) animateProps.scale = scales;
    if (opacities.length) animateProps.opacity = opacities;
    if (rotates.length) animateProps.rotate = rotates;
    if (xs.length) animateProps.x = xs;
    if (ys.length) animateProps.y = ys;

    return {
      initial: { opacity: 0, scale: 0.95 },
      animate: animateProps,
      exit: { opacity: 0, scale: 0.95 },
      transition: transitionConfig,
    };
  }

  // Dynamic mapping based on TransitionType
  switch (transitionType) {
    case '3d-flip': {
      const flipResult = get3DCardFlipVariants(direction, sequence?.springStiffness || 115);
      return {
        ...flipResult,
        transition: {
          ...flipResult.transition,
          delay: delaySec,
        },
      };
    }

    case 'film-pan':
      // Cinematic 35mm film sweep with subtle motion blur simulation
      return {
        initial: {
          opacity: 0,
          x: direction > 0 ? 120 : -120,
          scale: 0.96,
          filter: 'blur(4px)',
        },
        animate: {
          opacity: 1,
          x: 0,
          scale: 1,
          filter: 'blur(0px)',
        },
        exit: {
          opacity: 0,
          x: direction > 0 ? -120 : 120,
          scale: 0.96,
          filter: 'blur(4px)',
        },
        transition: {
          ...transitionConfig,
          ease: [0.16, 1, 0.3, 1],
        },
      };

    case 'book-unfold':
      // 3D royal book / envelope flap unfold
      return {
        initial: {
          opacity: 0,
          rotateY: direction > 0 ? -65 : 65,
          rotateX: direction > 0 ? 5 : -5,
          scale: 0.9,
          transformPerspective: 1200,
        },
        animate: {
          opacity: 1,
          rotateY: 0,
          rotateX: 0,
          scale: 1,
          transformPerspective: 1200,
        },
        exit: {
          opacity: 0,
          rotateY: direction > 0 ? 65 : -65,
          rotateX: direction > 0 ? -5 : 5,
          scale: 0.9,
          transformPerspective: 1200,
        },
        transition: {
          type: 'spring',
          stiffness: sequence?.springStiffness || 130,
          damping: 20,
          delay: delaySec,
        },
      };

    case 'card-slide':
      // Directional slide
      return {
        initial: {
          opacity: 0,
          x: direction > 0 ? 60 : -60,
          y: 0,
        },
        animate: {
          opacity: 1,
          x: 0,
          y: 0,
        },
        exit: {
          opacity: 0,
          x: direction > 0 ? -60 : 60,
          y: 0,
        },
        transition: transitionConfig,
      };

    case 'zoom-spring':
      // Bouncy celebratory spring
      return {
        initial: {
          opacity: 0,
          scale: 0.8,
          y: 20,
        },
        animate: {
          opacity: 1,
          scale: 1,
          y: 0,
        },
        exit: {
          opacity: 0,
          scale: 0.8,
          y: -20,
        },
        transition: {
          type: 'spring',
          stiffness: sequence?.springStiffness || 160,
          damping: 16,
          delay: delaySec,
        },
      };

    case 'curtain-reveal':
      // Theater curtain rise
      return {
        initial: {
          opacity: 0,
          y: 70,
          scale: 0.98,
        },
        animate: {
          opacity: 1,
          y: 0,
          scale: 1,
        },
        exit: {
          opacity: 0,
          y: -70,
          scale: 0.98,
        },
        transition: {
          ...transitionConfig,
          ease: [0.16, 1, 0.3, 1],
        },
      };

    case 'fade-in-out':
      // Cinematic, silky smooth Fade-in / Fade-out transition
      return {
        initial: {
          opacity: 0,
          scale: 0.98,
          filter: 'blur(3px)',
        },
        animate: {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
        },
        exit: {
          opacity: 0,
          scale: 0.98,
          filter: 'blur(3px)',
        },
        transition: {
          duration: sequence?.durationMs ? sequence.durationMs / 1000 : 0.45,
          ease: [0.22, 1, 0.36, 1], // Cubic bezier for buttery smooth easing
          delay: delaySec,
        },
      };

    case 'crossfade':
    default:
      // Pristine, smooth luxury crossfade / fade-in-out
      return {
        initial: {
          opacity: 0,
          scale: 0.98,
          filter: 'blur(2px)',
        },
        animate: {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
        },
        exit: {
          opacity: 0,
          scale: 0.98,
          filter: 'blur(2px)',
        },
        transition: {
          ...transitionConfig,
          duration: sequence?.durationMs ? sequence.durationMs / 1000 : 0.45,
          ease: [0.22, 1, 0.36, 1],
        },
      };
  }
}

/**
 * Staggered Entrance Variants for scene child elements (texts, images, cards, buttons)
 * using motion/react orchestration (staggerChildren & delayChildren).
 */
export const STAGGER_CONTAINER_VARIANTS: Record<string, any> = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.13,
      delayChildren: 0.08,
    },
  },
};

export const STAGGER_ITEM_VARIANTS = {
  /**
   * Royal header & calligraphy entrance (top-down subtle float)
   */
  royalHeader: {
    hidden: { opacity: 0, y: -14, scale: 0.97, filter: 'blur(3px)' },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  },
  /**
   * Standard smooth upward fade for titles, names, and paragraphs
   */
  fadeUp: {
    hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  },
  /**
   * Luxury scale-up reveal for portraits, images, ornamental cards, countdowns, and map boxes
   */
  scaleReveal: {
    hidden: { opacity: 0, scale: 0.92, y: 16, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  },
  /**
   * Spring button entrance for interactive CTAs
   */
  actionButton: {
    hidden: { opacity: 0, y: 16, scale: 0.94 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 220, damping: 20 },
    },
  },
};

