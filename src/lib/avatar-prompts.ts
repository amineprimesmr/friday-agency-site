// ─── Character Bible — prompt builder ───────────────────────────────────────

export interface CharacterBible {
  // Identity
  age: string;
  gender: string;
  ethnicity: string;

  // Skin
  skinTone: string;
  skinTexture: string;

  // Face
  faceShape: string;
  jawline: string;
  cheekbones: string;
  chin: string;

  // Eyes & brows
  eyeColor: string;
  eyeShape: string;
  eyebrows: string;

  // Lips & expression
  lips: string;
  expression: string;

  // Hair
  hairStyle: string;
  hairColor: string;
  hairTexture: string;
  fadeStyle: string;

  // Facial hair
  facialHair: string;

  // Accessories
  glasses: string;
  earrings: string;
  necklace: string;

  // Outfit
  top: string;
  bottom: string;
  shoes: string;

  // Body
  build: string;
  posture: string;
}

export const BIBLE_DEFAULTS: CharacterBible = {
  age: "24",
  gender: "man",
  ethnicity: "Black",
  skinTone: "medium-dark brown warm-toned",
  skinTexture: "smooth clear complexion",
  faceShape: "oval",
  jawline: "sharp",
  cheekbones: "high prominent",
  chin: "strong",
  eyeColor: "dark brown",
  eyeShape: "almond-shaped",
  eyebrows: "thick well-groomed black",
  lips: "full",
  expression: "confident neutral",
  hairStyle: "short tight 4C coily hair with natural curls on top",
  hairColor: "natural black",
  hairTexture: "4C coily tight curls",
  fadeStyle: "clean low fade on sides",
  facialHair: "very light sparse stubble on chin and upper lip",
  glasses: "thick square matte black acetate sunglasses with white pearl temple tips",
  earrings: "small diamond stud earring on left ear",
  necklace: "thin silver chain necklace at collar",
  top: "off-white bouclé textured crew-neck knit sweater oversized fit",
  bottom: "light blue washed baggy straight-leg jeans",
  shoes: "white leather sneakers",
  build: "lean athletic",
  posture: "confident upright",
};

const QUALITY_SUFFIX = `
Photorealistic, hyperrealistic, ultra-sharp, 8K resolution, RAW photo, DSLR,
professional studio photography, 85mm prime lens, f/2.0 aperture,
perfect skin texture, subsurface scattering, physically accurate lighting,
studio three-point lighting, neutral white background.`.trim();

const NEGATIVE_SUFFIX = `
NOT: cartoon, anime, illustration, painting, drawing, sketch, 3D render, CGI,
artificial-looking, plastic skin, blurry, low quality, distorted face,
extra limbs, warped proportions, bad anatomy.`.trim();

export function buildMasterPrompt(b: CharacterBible): string {
  const lines = [
    `A young ${b.ethnicity} ${b.gender}, approximately ${b.age} years old,`,
    `${b.skinTone} skin with ${b.skinTexture},`,
    `${b.faceShape} face shape, ${b.jawline} jawline, ${b.cheekbones} cheekbones, ${b.chin} chin,`,
    `${b.eyeColor} ${b.eyeShape} eyes, ${b.eyebrows} eyebrows,`,
    `${b.lips} lips, ${b.expression} expression,`,
    `${b.hairStyle}, ${b.hairColor} color, ${b.hairTexture}, ${b.fadeStyle},`,
    b.facialHair ? `${b.facialHair},` : "",
    b.glasses ? `wearing ${b.glasses},` : "",
    b.earrings ? `${b.earrings},` : "",
    b.necklace ? `${b.necklace},` : "",
    `outfit: ${b.top}, ${b.bottom}, ${b.shoes},`,
    `${b.build} build, ${b.posture} posture.`,
  ]
    .filter(Boolean)
    .join("\n");

  return `${lines}\n\n${QUALITY_SUFFIX}`;
}

// ─── Reference Sheet — 5 angles ─────────────────────────────────────────────

export type ReferenceAngle =
  | "front"
  | "back"
  | "left_profile"
  | "three_quarters"
  | "close_up";

/** Order for sequential reference generation (each step may use prior outputs as file refs). */
export const REFERENCE_ANGLE_ORDER: ReferenceAngle[] = [
  "front",
  "back",
  "left_profile",
  "three_quarters",
  "close_up",
];

export const REFERENCE_ANGLES: {
  id: ReferenceAngle;
  label: string;
  icon: string;
  suffix: string;
  aspectRatio: "portrait_4_3" | "portrait_16_9" | "square_hd";
}[] = [
  {
    id: "front",
    label: "Face avant",
    icon: "↑",
    suffix:
      "Full body, perfectly centered front view, standing straight, arms relaxed at sides, feet slightly apart, white studio background, even front lighting.",
    aspectRatio: "portrait_4_3",
  },
  {
    id: "back",
    label: "Dos",
    icon: "↓",
    suffix:
      "Full body from behind, exact 180° back view, standing straight, same outfit perfectly visible from back, white studio background.",
    aspectRatio: "portrait_4_3",
  },
  {
    id: "left_profile",
    label: "Profil gauche",
    icon: "←",
    suffix:
      "Full body strict left side profile, exactly 90° angle, standing straight, white studio background, perfect side profile lighting.",
    aspectRatio: "portrait_4_3",
  },
  {
    id: "three_quarters",
    label: "3/4 avant",
    icon: "↗",
    suffix:
      "Full body front 3/4 angle, 45° slight body turn to the right, hands casually in pockets, confident relaxed pose, white studio background, slight cinematic crop.",
    aspectRatio: "portrait_4_3",
  },
  {
    id: "close_up",
    label: "Portrait close-up",
    icon: "◎",
    suffix:
      "Extreme portrait close-up, face and shoulders only, front view perfectly centered, neutral expression, razor-sharp focus on eyes and skin pores, white neutral background, beauty dish lighting.",
    aspectRatio: "square_hd",
  },
];

export function buildReferencePrompt(
  masterPrompt: string,
  angle: ReferenceAngle,
): string {
  const config = REFERENCE_ANGLES.find((a) => a.id === angle)!;
  return `${masterPrompt}\n\n${config.suffix}\n\n${NEGATIVE_SUFFIX}`;
}

// ─── Scene Generator ─────────────────────────────────────────────────────────

export interface ScenePreset {
  id: string;
  label: string;
  emoji: string;
  lighting: string;
  shot: string;
  description: string;
}

export const SCENE_PRESETS: ScenePreset[] = [
  {
    id: "mac_shock",
    label: "Choqué devant le Mac",
    emoji: "😱",
    lighting: "MacBook screen glow, cool blue ambient, dark room",
    shot: "medium shot, slightly low angle",
    description:
      "sitting at a sleek minimal desk, working on a MacBook Pro, suddenly reacts with shock and disbelief at the screen, mouth slightly open, eyes wide, leaning forward, one hand gripping his head, the other flat on the desk, MacBook screen light casting dramatic blue glow on his face",
  },
  {
    id: "urban_walk",
    label: "Marche en ville la nuit",
    emoji: "🌆",
    lighting: "neon city lights, wet reflections, golden and blue tones",
    shot: "medium tracking shot",
    description:
      "walking confidently down a rain-slicked urban street at night, neon signs reflecting on wet pavement, light jacket collar up, one hand in pocket, purposeful stride, film grain, cinematic bokeh",
  },
  {
    id: "rooftop",
    label: "Rooftop contemplatif",
    emoji: "🌇",
    lighting: "golden hour, warm magic hour light, sun-kissed",
    shot: "wide shot, back 3/4 view",
    description:
      "standing on a rooftop at golden hour, overlooking a vast city skyline, back slightly turned, one foot on the ledge railing, arms resting on railing, warm golden light sculpting the silhouette, haze and depth in background",
  },
  {
    id: "studio_flex",
    label: "Studio / Fashion",
    emoji: "📸",
    lighting: "professional studio, rim lighting, dramatic shadows",
    shot: "close-up to medium, dynamic angle",
    description:
      "standing in a high-fashion studio setting, confident direct gaze at camera, dramatic rim light outlining the silhouette, one hand adjusting sunglasses, sharp shadow on white cyclorama background",
  },
  {
    id: "luxury_car",
    label: "Sortie de voiture de luxe",
    emoji: "🚗",
    lighting: "night club entrance, valet area, dramatic spotlights",
    shot: "medium low angle",
    description:
      "stepping out of a matte black luxury sedan at a high-end club entrance, valets in background, paparazzi flash reflections, polished marble floor, confident walk, slight smirk",
  },
  {
    id: "coffee_work",
    label: "Café / Remote work",
    emoji: "☕",
    lighting: "warm café ambient light, window natural light, golden tones",
    shot: "medium shot, slight overhead angle",
    description:
      "seated at a beautiful café window table, MacBook open, coffee cup beside keyboard, golden afternoon light streaming through window, deep in focus on screen, cozy productive atmosphere, bokeh street outside",
  },
];

export function buildScenePrompt(
  masterPrompt: string,
  scene: ScenePreset | null,
  customScene: string,
  lighting: string,
  shot: string,
): string {
  const sceneDesc = scene ? scene.description : customScene;
  const lightingFinal = scene ? scene.lighting : lighting;
  const shotFinal = scene ? scene.shot : shot;

  return `Use the reference images as the exact same real person — preserve face, skin, hair, body proportions, and outfit details.

Character (must match references exactly):
${masterPrompt.trim()}

Cinematic scene:
The character is ${sceneDesc}.

Camera: ${shotFinal}.
Lighting: ${lightingFinal}.
Style: cinematic, shallow depth of field, film grain, color graded,
photorealistic, 8K, high production value, 35mm lens look.

${NEGATIVE_SUFFIX}`;
}

// ─── Video Animator — Kling prompt builder ───────────────────────────────────

export interface AnimationConfig {
  cameraMove: string;
  beatByBeat: string;
  mood: string;
  duration: "5" | "10";
}

export function buildKlingPrompt(config: AnimationConfig): string {
  return `${config.cameraMove}.

${config.beatByBeat}

${config.mood}.
Realistic physics, natural facial micro-expressions, smooth fluid motion,
cinematic color grade, film grain, 35mm anamorphic lens,
high production value, 4K, slow motion moments where impactful.`;
}

export const ANIMATION_PRESETS: Record<
  string,
  { cameraMove: string; beatByBeat: string; mood: string }
> = {
  mac_shock: {
    cameraMove: "Medium shot, static locked frame, subtle push-in zoom over 3s",
    beatByBeat: `The character sits at a desk in front of a MacBook Pro.
He leans forward scrolling slowly, expression calm.
Suddenly his eyes go wide with shock, he jolts back in his chair.
His mouth drops open, one hand flies up and grips his head.
His other hand slaps the desk hard.
He leans back shaking his head slowly in disbelief.
Then leans forward again, squinting at the screen in disbelief.
MacBook screen glow pulses and flickers slightly on his face.`,
    mood:
      "Tense, dramatic, relatable — the feeling of seeing something unbelievable online",
  },
  urban_walk: {
    cameraMove:
      "Medium tracking shot, camera follows from side, slight parallax effect",
    beatByBeat: `The character walks at a confident, unhurried pace down the wet street.
His footsteps splash slightly on the glistening pavement.
He glances briefly to the side — neon signs blur in the bokeh.
He adjusts his jacket collar with one hand, never breaking stride.
A car passes in the background, headlights sweep across the scene.
He continues walking, the camera slowly drifts ahead of him.`,
    mood: "Cool, cinematic, lone wolf energy — late night city vibe",
  },
  rooftop: {
    cameraMove:
      "Wide shot, slow crane movement rising from below, then gentle orbit right to left",
    beatByBeat: `The character stands still on the rooftop edge, facing the city.
His silhouette is defined against the burning orange sky.
A gentle breeze moves his clothes slightly.
He slowly exhales — visible in the cool air.
He turns his head slightly to the left, looking at something distant.
One hand tightens on the railing. He breathes deeply.
Golden light flares softly across his face.`,
    mood: "Contemplative, powerful, introspective — built different energy",
  },
  studio_flex: {
    cameraMove: "Close to medium, slow dolly-in, then rack focus from background to face",
    beatByBeat: `The character stands center frame, direct gaze at camera.
He slowly adjusts his sunglasses with two fingers, never breaking eye contact.
A slight corner-of-mouth smile appears for just a moment.
He rolls his shoulders back subtly, posture expands.
Rim light catches the edge of his jawline.
He tilts his chin down slightly — commanding look.`,
    mood: "Confident, high-fashion, magnetic — campaign quality",
  },
};
