export interface GameContext {
  name: string;
  concept: string;
  platforms: string[];
  timeline?: string;
}

export interface CompletionContext {
  sectionType: string;
  subSectionType: string;
  currentText: string;
  gameContext: GameContext;
}

// System prompts for different GDD sections
export const SECTION_SYSTEM_PROMPTS: Record<string, string> = {
  overview: `You are an expert game design document writer. You help game developers write compelling and professional game design documents.
Your responses should be:
- Concise and to the point
- Professional yet engaging
- Specific to game development terminology
- Focused on the game's unique selling points`,

  game_concept: `You are an expert game designer helping to articulate game concepts clearly.
Focus on:
- Core gameplay loop
- Unique mechanics
- Player experience
- Genre conventions and innovations`,

  storyline: `You are a narrative designer helping craft compelling game stories.
Focus on:
- Engaging plot hooks
- Character motivations
- World-building elements
- Narrative pacing`,

  gameplay_mechanics: `You are a game mechanics expert helping document gameplay systems.
Focus on:
- Clear mechanic descriptions
- Player interactions
- Balance considerations
- Progression systems`,
};

// Sub-section specific prompts for ghost text completion
export const SUBSECTION_COMPLETION_PROMPTS: Record<string, string> = {
  // Overview section
  brief_introduction: `Complete this brief game introduction. Keep it to 1-2 impactful sentences that capture the essence of the game. Make it engaging and memorable.`,

  game_concept_summary: `Complete this game concept summary. Include the genre, setting, and main objectives. Be specific about what makes this game unique.`,

  target_audience: `Complete this target audience description. Include demographics (age range), interests, gaming habits, and what appeals to them about this type of game.`,

  market_analysis: `Complete this market analysis. Mention potential competitors, market positioning, and how this game differentiates itself in the market.`,

  // Game Concept section
  core_concept: `Complete this core concept description. Focus on the fundamental idea that drives the entire game experience.`,

  unique_selling_points: `Complete this unique selling points section. Highlight what makes this game stand out from competitors.`,

  genre_and_style: `Complete this genre and style description. Be specific about sub-genres, visual style, and tone.`,

  // Storyline section
  narrative_overview: `Complete this narrative overview. Set up the main conflict, stakes, and world.`,

  main_characters: `Complete this character description. Include personality traits, motivations, and role in the story.`,

  world_setting: `Complete this world-building section. Describe the environment, history, and rules of the game world.`,
};

// Enhancement prompts for the top buttons
export const ENHANCEMENT_PROMPTS = {
  enhance: `Improve this text to be more professional, engaging, and well-structured while maintaining the original meaning and intent. Fix any grammar issues and improve clarity.`,

  improve: `Refine this text to be clearer and more impactful. Improve word choice, sentence structure, and flow while keeping the same general content.`,

  expand: `Expand this text with more detail and depth. Add relevant examples, explanations, or supporting points while maintaining the same tone and style.`,

  concise: `Make this text more concise and punchy. Remove unnecessary words, combine sentences where appropriate, and get to the point faster while preserving key information.`,
};

// Build the full completion prompt
export function buildCompletionPrompt(context: CompletionContext): string {
  const { sectionType, subSectionType, currentText, gameContext } = context;

  const gameInfo = `
Game Name: ${gameContext.name}
Game Concept: ${gameContext.concept}
Platforms: ${gameContext.platforms.join(", ")}
${gameContext.timeline ? `Timeline: ${gameContext.timeline}` : ""}
`.trim();

  const subSectionPrompt = SUBSECTION_COMPLETION_PROMPTS[subSectionType] ||
    "Continue this text naturally and professionally.";

  return `${subSectionPrompt}

Game Information:
${gameInfo}

Current text to complete:
"${currentText}"

Continue the text naturally. Only provide the completion, not the original text. Keep it concise (1-2 sentences max for ghost text).`;
}

// Build enhancement prompt
export function buildEnhancementPrompt(
  action: "enhance" | "improve" | "expand" | "concise",
  text: string,
  gameContext: GameContext
): string {
  const actionPrompt = ENHANCEMENT_PROMPTS[action];

  return `${actionPrompt}

Context - This is for a game called "${gameContext.name}":
${gameContext.concept}

Text to ${action}:
"${text}"

Provide only the improved text, nothing else.`;
}
