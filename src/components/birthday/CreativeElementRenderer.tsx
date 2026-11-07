import React from 'react';
import { motion } from 'motion/react';
import { CreativeElementAsset, PlacedCanvasElement } from '../../types/birthdayExperience';

interface CreativeElementGraphicProps {
  svgType: CreativeElementAsset['svgType'];
  dimension: '2d' | '3d';
  color: string;
  secondaryColor?: string;
  size?: number;
}

export const CreativeElementGraphic: React.FC<CreativeElementGraphicProps> = ({
  svgType,
  dimension,
  color,
  secondaryColor = '#F3E5AB',
  size = 56,
}) => {
  const is3D = dimension === '3d';
  const filterStyle = is3D
    ? {
        filter: `drop-shadow(0 8px 14px rgba(0,0,0,0.28)) drop-shadow(0 2px 4px ${color}55)`,
        transformStyle: 'preserve-3d' as const,
      }
    : undefined;

  switch (svgType) {
    case 'royal_cake':
    case 'tiered_cake':
    case 'cupcake_sparkle':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 80 80"
          fill="none"
          style={filterStyle}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`cakeGrad-${color}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={secondaryColor} />
            </linearGradient>
          </defs>
          {/* Plate */}
          <ellipse cx="40" cy="68" rx="30" ry="5" fill={secondaryColor} opacity="0.85" />
          {/* Bottom Tier */}
          <rect
            x="16"
            y="44"
            width="48"
            height="22"
            rx="6"
            fill={is3D ? `url(#cakeGrad-${color})` : color}
            stroke={secondaryColor}
            strokeWidth="1.5"
          />
          {/* Frosting Drips */}
          <path
            d="M16 48 Q22 54 28 48 T40 48 T52 48 T64 48"
            stroke="#FFFDF8"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {/* Top Tier */}
          {svgType !== 'cupcake_sparkle' && (
            <rect
              x="24"
              y="28"
              width="32"
              height="17"
              rx="5"
              fill={secondaryColor}
              stroke={color}
              strokeWidth="1.5"
            />
          )}
          {/* Candles */}
          <rect x="33" y="15" width="4" height="13" rx="2" fill="#FFFDF8" />
          <rect x="43" y="15" width="4" height="13" rx="2" fill="#FFFDF8" />
          <circle cx="35" cy="12" r="3.5" fill="#FBBF24" />
          <circle cx="45" cy="12" r="3.5" fill="#FBBF24" />
          {is3D && (
            <ellipse cx="32" cy="49" rx="10" ry="2.5" fill="#FFFFFF" opacity="0.35" />
          )}
        </svg>
      );

    case 'velvet_heart':
    case 'crystal_heart':
    case 'winged_heart':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 80 80"
          fill="none"
          style={filterStyle}
          aria-hidden="true"
        >
          <defs>
            <radialGradient id={`heartGrad-${color}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity={is3D ? 0.65 : 0.15} />
              <stop offset="35%" stopColor={color} />
              <stop offset="100%" stopColor="#2A0810" stopOpacity={is3D ? 0.9 : 0.3} />
            </radialGradient>
          </defs>
          {svgType === 'winged_heart' && (
            <>
              <path
                d="M18 38 C6 28 4 44 16 48 C10 52 14 58 24 52"
                fill={secondaryColor}
                opacity="0.85"
              />
              <path
                d="M62 38 C74 28 76 44 64 48 C70 52 66 58 56 52"
                fill={secondaryColor}
                opacity="0.85"
              />
            </>
          )}
          <path
            d="M40 66 C40 66 14 49 14 29 C14 19 22 13 30 13 C35 13 38.5 16 40 19.5 C41.5 16 45 13 50 13 C58 13 66 19 66 29 C66 49 40 66 40 66 Z"
            fill={is3D ? `url(#heartGrad-${color})` : color}
            stroke={secondaryColor}
            strokeWidth={svgType === 'crystal_heart' ? '2.2' : '1.2'}
          />
          {is3D && (
            <ellipse
              cx="29"
              cy="25"
              rx="6"
              ry="3.5"
              transform="rotate(-25 29 25)"
              fill="#FFFFFF"
              opacity="0.45"
            />
          )}
        </svg>
      );

    case 'damask_rose':
    case 'golden_bouquet':
    case 'cherry_blossom':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 80 80"
          fill="none"
          style={filterStyle}
          aria-hidden="true"
        >
          {/* Stem & Leaves */}
          <path d="M40 44 L40 70" stroke="#566B49" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M40 56 Q26 50 28 42 Q38 46 40 56 Z" fill="#6E8261" />
          <path d="M40 60 Q54 54 52 46 Q42 50 40 60 Z" fill="#91A77D" />
          {/* Petals */}
          <circle cx="40" cy="30" r="16" fill={color} />
          <circle cx="33" cy="25" r="10" fill={secondaryColor} opacity="0.55" />
          <circle cx="47" cy="26" r="10" fill={color} />
          <path
            d="M32 28 C34 20 46 20 48 28 C46 36 34 36 32 28 Z"
            fill={secondaryColor}
            opacity="0.75"
          />
          <circle cx="40" cy="28" r="5" fill={color} />
        </svg>
      );

    case 'luxury_gift_box':
    case 'surprise_chest':
    case 'ribbon_parcel':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 80 80"
          fill="none"
          style={filterStyle}
          aria-hidden="true"
        >
          {/* Box Body */}
          <rect
            x="18"
            y="34"
            width="44"
            height="34"
            rx="5"
            fill={color}
            stroke={secondaryColor}
            strokeWidth="1.5"
          />
          {/* Box Lid */}
          <rect
            x="14"
            y="24"
            width="52"
            height="11"
            rx="4"
            fill={color}
            stroke={secondaryColor}
            strokeWidth="1.5"
          />
          {/* Vertical & Horizontal Ribbon */}
          <rect x="36" y="24" width="8" height="44" fill={secondaryColor} />
          <rect x="18" y="47" width="44" height="7" fill={secondaryColor} opacity="0.9" />
          {/* Bow */}
          <path
            d="M40 24 C30 12 22 18 28 24 C34 26 40 24 40 24 Z"
            fill={secondaryColor}
          />
          <path
            d="M40 24 C50 12 58 18 52 24 C46 26 40 24 40 24 Z"
            fill={secondaryColor}
          />
          {is3D && (
            <rect
              x="21"
              y="37"
              width="10"
              height="26"
              rx="2"
              fill="#FFFFFF"
              opacity="0.18"
            />
          )}
        </svg>
      );

    case 'metallic_balloon':
    case 'heart_balloon':
    case 'confetti_balloon':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 80 80"
          fill="none"
          style={filterStyle}
          aria-hidden="true"
        >
          <path
            d="M40 54 Q36 64 43 74"
            stroke={secondaryColor}
            strokeWidth="1.8"
            fill="none"
          />
          <ellipse cx="40" cy="31" rx="18" ry="22" fill={color} />
          <polygon points="37,53 43,53 40,57" fill={color} />
          {is3D && (
            <ellipse
              cx="33"
              cy="22"
              rx="5"
              ry="9"
              transform="rotate(-18 33 22)"
              fill="#FFFFFF"
              opacity="0.48"
            />
          )}
          {svgType === 'confetti_balloon' && (
            <>
              <circle cx="35" cy="36" r="2.5" fill={secondaryColor} />
              <circle cx="46" cy="26" r="2" fill="#FFFDF8" />
              <circle cx="43" cy="39" r="2.5" fill="#FBBF24" />
            </>
          )}
        </svg>
      );

    case 'wax_candle':
    case 'golden_candelabra':
    case 'wish_flame':
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 80 80"
          fill="none"
          style={filterStyle}
          aria-hidden="true"
        >
          {/* Outer Flame Glow */}
          <circle cx="40" cy="20" r="12" fill="#FBBF24" opacity="0.28" />
          {/* Flame */}
          <path
            d="M40 8 C40 8 48 17 48 23 C48 27.5 44.5 31 40 31 C35.5 31 32 27.5 32 23 C32 17 40 8 40 8 Z"
            fill="#F59E0B"
          />
          <path
            d="M40 14 C40 14 44 19 44 23 C44 25.5 42.2 28 40 28 C37.8 28 36 25.5 36 23 C36 19 40 14 40 14 Z"
            fill="#FEF3C7"
          />
          {/* Candle Pillar */}
          <rect
            x="31"
            y="32"
            width="18"
            height="34"
            rx="4"
            fill={color}
            stroke={secondaryColor}
            strokeWidth="1.5"
          />
          {/* Base Holder */}
          <ellipse cx="40" cy="67" rx="16" ry="4" fill={secondaryColor} />
        </svg>
      );
  }
};

interface CanvasElementsLayerProps {
  elements: PlacedCanvasElement[];
  currentPageType: string;
  skipAnimations?: boolean;
  onSelectElement?: (id: string) => void;
  selectedElementId?: string | null;
}

export const CanvasElementsLayer: React.FC<CanvasElementsLayerProps> = ({
  elements,
  currentPageType,
  skipAnimations = false,
  onSelectElement,
  selectedElementId,
}) => {
  const visibleElements = elements.filter(
    (el) => el.targetPage === 'all' || el.targetPage === currentPageType
  );

  if (visibleElements.length === 0) return null;

  const getMotionAnimate = (el: PlacedCanvasElement) => {
    if (skipAnimations || el.animationType === 'none') return {};
    switch (el.animationType) {
      case 'float':
        return { y: [0, -12, 0] };
      case 'pulse':
        return { scale: [1, 1.14, 1] };
      case 'spin_3d':
        return { rotateY: [0, 180, 360] };
      case 'bounce':
        return { y: [0, -18, 0], scaleY: [1, 1.06, 0.96, 1] };
      case 'swing':
        return { rotate: [-9, 9, -9] };
      case 'glow':
        return { opacity: [el.opacity, Math.min(1, el.opacity + 0.25), el.opacity], scale: [1, 1.07, 1] };
      default:
        return {};
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
      {visibleElements.map((el) => {
        const isSelected = selectedElementId === el.id;
        return (
          <motion.div
            key={el.id}
            style={{
              position: 'absolute',
              left: `${el.x}%`,
              top: `${el.y}%`,
              opacity: el.opacity,
              transform: 'translate(-50%, -50%)',
            }}
            animate={getMotionAnimate(el)}
            transition={{
              duration: el.animationDuration || 3,
              delay: el.animationDelay || 0,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            onClick={
              onSelectElement
                ? (e) => {
                    e.stopPropagation();
                    onSelectElement(el.id);
                  }
                : undefined
            }
            className={`${
              onSelectElement ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'
            } ${
              isSelected
                ? 'ring-2 ring-amber-400 rounded-2xl bg-white/10 p-1'
                : ''
            }`}
          >
            <CreativeElementGraphic
              svgType={el.svgType}
              dimension={el.dimension}
              color={el.color}
              secondaryColor={el.secondaryColor}
              size={el.size}
            />
          </motion.div>
        );
      })}
    </div>
  );
};
