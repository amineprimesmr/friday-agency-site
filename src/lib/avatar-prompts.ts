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
Output must read as a REAL photograph, not stylized art. Technical target:
full-frame mirrorless / DSLR capture quality; tack-sharp focus on the eyes and plane of the face;
natural micro-contrast and controlled highlight roll-off; physically plausible shadows;
accurate skin: visible pores where appropriate, subtle subsurface scattering, no wax or plastic sheen;
true color rendition (no oversaturated candy skin); neutral or intentional studio white balance;
shot on equivalent 85mm or 50mm prime at wide aperture for gentle subject separation where the scene allows.
Resolution intent: ultra-high detail, editorial portrait / campaign still, 8K clarity, uncompressed RAW aesthetic.
`.trim();

export const NEGATIVE_SUFFIX = `
FORBIDDEN: cartoon, anime, manga, illustration, painting, drawing, sketch, vector, sticker, emoji look,
3D render, CGI, uncanny Valley doll, synthetic skin, airbrushed plastic face, waxy complexion,
beauty-filter smoothing, fake HDR glow, oversharpen halos, AI artifact fingers, deformed hands or teeth,
asymmetric pupils, melted features, duplicated limbs, wrong number of fingers, text or watermarks on image,
low resolution, heavy JPEG blocks, motion blur on static portraits, muddy chroma noise, wrong ethnicity drift,
changing outfit or accessories from the reference, inventing jewelry or glasses not in the description.`.trim();

const REFERENCE_IDENTITY_LOCK = `
IDENTITY (non-negotiable): You MUST reproduce the exact same real human as the uploaded reference images.
Lock: facial bone structure, nose shape and width, lip shape, ear shape if visible, eye spacing, brow shape and density,
skin undertone and texture, visible pores and micro-details, hair color, hairline, curl pattern or straight texture,
facial hair pattern, and every garment exactly as in the references. Do not beautify into a different face.
`.trim();

const SCENE_IDENTITY_LOCK = `
IDENTITY LOCK: The reference files depict ONE specific person. Preserve that identity pixel-accurate in face and body:
same bone structure, skin undertone, hair, facial hair, and the same clothing items and colors as in the references.
Do not substitute a generic model. Lighting and background change; the person does not.
`.trim();

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
      "Full-body studio shot, dead-center frontal camera, subject standing tall, feet shoulder-width, arms relaxed at sides, neutral shoulders. Seamless white cyclorama (infinity curve) or pure white seamless paper; soft key + fill; ratio about 2:1 to minimize shadows under nose and chin; catchlights small and natural in both eyes. Critical: left and right sides of face must be symmetric in lens distortion only—not mirrored facial asymmetry removed.",
    aspectRatio: "portrait_4_3",
  },
  {
    id: "back",
    label: "Dos",
    icon: "↓",
    suffix:
      "Full-body, strict 180° rear view; camera at subject’s mid-back height. Same wardrobe read clearly: collar, seams, back pockets, shoe soles orientation. White seamless studio; even soft backlight rim for edge separation; no frontal face visible.",
    aspectRatio: "portrait_4_3",
  },
  {
    id: "left_profile",
    label: "Profil gauche",
    icon: "←",
    suffix:
      "Full-body, geometrically true 90° left profile (camera perpendicular to sagittal plane). Single clean profile silhouette; nose tip, lips, chin aligned on one plane; one eye visible as sliver only. Studio white seamless; narrow strip or gridded side light to carve cheek and jaw; preserve exact nose bridge height and lip projection from reference.",
    aspectRatio: "portrait_4_3",
  },
  {
    id: "three_quarters",
    label: "3/4 avant",
    icon: "↗",
    suffix:
      "Full-body three-quarter view: torso turned ~35–45° to camera right, head slightly counter-turned toward lens for eye contact. Hands in pockets or relaxed—no odd finger overlap. Same outfit wrinkles and fabric drape as references. White cyclorama; cinematic but still high-key catalog clarity; subtle directional key from camera left.",
    aspectRatio: "portrait_4_3",
  },
  {
    id: "close_up",
    label: "Portrait close-up",
    icon: "◎",
    suffix:
      "Tight beauty / editorial portrait: face and upper shoulders only, frontal; both irises and catchlights tack sharp; visible skin micro-texture (no beauty blur). Beauty dish or large softbox very close; shallow depth but ears still plausible; background pure white or very light gray falloff. Lip color and skin undertone must match reference exactly.",
    aspectRatio: "square_hd",
  },
];

export function buildReferencePrompt(
  masterPrompt: string,
  angle: ReferenceAngle,
): string {
  const config = REFERENCE_ANGLES.find((a) => a.id === angle)!;
  const body = masterPrompt.trim();
  return `${REFERENCE_IDENTITY_LOCK}

Production-ready character specification (extract every cue; do not invent features not listed):
${body}

Shot and lighting brief:
${config.suffix}

${QUALITY_SUFFIX}

${NEGATIVE_SUFFIX}`;
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

  return `${SCENE_IDENTITY_LOCK}

Full character bible (match every line; wardrobe continuity mandatory):
${masterPrompt.trim()}

Scene action and blocking:
The same person is ${sceneDesc}

Cinematography:
Camera / lens feel: ${shotFinal}. Spherical 35mm or 40mm cinematic portrait look unless scene demands wider; natural perspective, no fisheye.
Lighting direction and mood: ${lightingFinal}. Motivated sources only—no random rim from nowhere. Preserve skin undertone under colored light.
Grade: subtle halation on speculars allowed; fine grain; print-film color science; high dynamic range without crushed blacks or clipped neon unless diegetic.

Final quality bar: photoreal live-action film still, IMAX-grade clarity, no AI sheen, no wax skin.

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
