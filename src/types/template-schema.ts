export type ExperienceMode = 
  | 'envelope-reveal' 
  | 'film-strip' 
  | 'oriental-lantern' 
  | 'birthday-cake' 
  | 'academic-scroll' 
  | 'ribbon-cutting';

export type TransitionType = 
  | '3d-flip'
  | 'crossfade' 
  | 'fade-in-out'
  | 'card-slide' 
  | 'film-pan' 
  | 'book-unfold' 
  | 'zoom-spring' 
  | 'curtain-reveal';

export type BackgroundTexture = 
  | 'arabic_arabesque' 
  | 'film_perforations' 
  | 'starry_night' 
  | 'silk_mesh' 
  | 'blueprint_grid' 
  | 'subtle_grain'
  | 'marble_obsidian';

export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  options?: { label: string; labelEn: string; value: string }[];
}

export interface TemplateCustomField {
  key: string;
  label: string;
  labelEn: string;
  type: 'text' | 'textarea' | 'date' | 'time' | 'color' | 'select' | 'image' | 'number' | 'boolean' | 'url';
  section: 'hosts' | 'event_info' | 'location' | 'aesthetic' | 'media' | 'rsvp';
  defaultValue: any;
  placeholder?: string;
  validation?: FieldValidation;
  conditionalOn?: { field: string; equals: any };
  description?: string;
}

export interface AnimationKeyframe {
  step: number; // 0 to 100 percentage
  scale?: number;
  rotate?: number;
  rotateX?: number;
  rotateY?: number;
  opacity?: number;
  x?: number | string;
  y?: number | string;
}

export interface SceneAnimationSequence {
  trigger: 'onMount' | 'onClick' | 'onScroll' | 'onCountdownZero';
  durationMs: number;
  delayMs?: number;
  easing: 'linear' | 'easeOut' | 'easeInOut' | 'spring' | 'cinematic';
  springStiffness?: number;
  keyframes?: AnimationKeyframe[];
  soundEffect?: 'paper_rustle' | 'camera_shutter' | 'fanfare' | 'candle_blow' | 'scissors_snip' | 'gentle_chime';
}

export interface TemplateSceneDefinition {
  id: string;
  sceneIndex: number;
  title: string;
  titleEn: string;
  sceneType: 'interactive_opener' | 'hero_proclamation' | 'timeline_countdown' | 'location_navigation' | 'rsvp_portal' | 'guestbook_registry';
  layout: 'centered_card' | 'widescreen_cinema' | 'split_column' | 'golden_ratio';
  transition: TransitionType;
  animationSequence: SceneAnimationSequence;
  requiredComponents: string[];
  backgroundOverride?: string;
}

export interface TemplatePalette {
  primary: string; // Brand accent e.g. gold, royal red
  secondary: string; // Supporting color
  background: string; // Base canvas
  surface: string; // Card surface
  textPrimary: string;
  textMuted: string;
  border: string;
  glowColor?: string;
}

export interface TemplateTypography {
  headlineFont: 'Amiri' | 'Cairo' | 'Cinzel' | 'Playfair' | 'Plus Jakarta Sans';
  bodyFont: 'Cairo' | 'Plus Jakarta Sans' | 'Amiri';
  calligraphyStyle?: 'thuluth' | 'diwani' | 'kufi' | 'naskh' | 'modern_serif';
  scaleRatio: number; // e.g. 1.25 for major third
}

export interface TemplateSoundtrackConfig {
  defaultTrack: 'romantic_piano' | 'royal_oud' | 'cinematic_strings' | 'festive_traditional' | 'calm_acoustic' | 'zen_harp' | 'none';
  autoPlay?: boolean;
  soundEffects: {
    onOpen?: 'paper_rustle' | 'camera_shutter' | 'fanfare' | 'candle_blow' | 'scissors_snip';
    onAction?: 'gentle_chime' | 'soft_click';
    onComplete?: 'fanfare';
  };
}

export interface InvitationTemplateSchema {
  $schema?: string;
  schemaVersion: '1.0.0';
  id: string;
  name: string;
  nameEn: string;
  category: 'engagement' | 'henna' | 'wedding' | 'birthday' | 'graduation' | 'business_opening';
  style: string;
  badge?: 'new' | 'popular' | 'vip' | 'movie';
  isMovieInspired?: boolean;
  description: string;
  descriptionEn: string;
  
  // Experience Mode
  experienceMode: ExperienceMode;
  
  // Visual Aesthetics
  palette: TemplatePalette;
  typography: TemplateTypography;
  backgroundTexture: BackgroundTexture;
  soundtrack: TemplateSoundtrackConfig;
  
  // Custom dynamic fields configuration
  customFields: TemplateCustomField[];
  
  // Ordered sequence of scenes
  scenes: TemplateSceneDefinition[];
  
  // Default data seed
  defaultData: Record<string, any>;
}
