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

// All filled content from the GDD
export interface AllSectionsContent {
  [sectionSlug: string]: {
    [subSectionId: string]: string;
  };
}

// Context for AI generation
export interface GenerationContext {
  sectionType: string;
  subSectionType: string;
  subSectionTitle: string;
  instructions: string;
  gameContext: GameContext;
  allContent: AllSectionsContent;
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

// Strip HTML tags from content for cleaner context
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

// Check if content is meaningful (not empty or just whitespace)
function hasContent(content: string): boolean {
  const stripped = stripHtml(content);
  return stripped.length > 10;
}

// Count filled subsections across all content
export function countFilledContent(allContent: AllSectionsContent): {
  totalFilled: number;
  filledSections: string[];
} {
  let totalFilled = 0;
  const filledSections: string[] = [];

  for (const [sectionSlug, subsections] of Object.entries(allContent)) {
    for (const [subId, content] of Object.entries(subsections)) {
      if (hasContent(content)) {
        totalFilled++;
        filledSections.push(`${sectionSlug}/${subId}`);
      }
    }
  }

  return { totalFilled, filledSections };
}

// Section titles for context building
const SECTION_TITLES: Record<string, string> = {
  overview: "Overview",
  "game-concept": "Game Concept",
  storyline: "Storyline & Background",
  "gameplay-mechanics": "Gameplay Mechanics",
  "level-design": "Level Design",
  assets: "Assets",
  "technical-features": "Technical Features",
  "user-interface": "User Interface",
  monetization: "Monetization Strategy",
  marketing: "Marketing & Promotion",
  "development-plan": "Development Plan",
  legal: "Legal & Compliance",
};

// Subsection titles for context building
const SUBSECTION_TITLES: Record<string, string> = {
  // Overview
  brief_introduction: "Brief Introduction",
  game_concept_summary: "Game Concept Summary",
  target_audience: "Target Audience",
  market_analysis: "Market Analysis",
  // Game Concept
  core_concept: "Core Concept",
  unique_selling_points: "Unique Selling Points",
  genre_and_style: "Genre & Visual Style",
  player_experience: "Player Experience Goals",
  // Storyline
  narrative_overview: "Narrative Overview",
  world_setting: "World & Setting",
  main_characters: "Main Characters",
  story_progression: "Story Progression",
  // Gameplay Mechanics
  core_gameplay_loop: "Core Gameplay Loop",
  controls_and_input: "Controls & Input",
  game_systems: "Game Systems",
  difficulty_and_balance: "Difficulty & Balance",
  // Level Design
  level_structure: "Level Structure",
  environment_themes: "Environment Themes",
  progression_flow: "Progression Flow",
  puzzles_and_challenges: "Puzzles & Challenges",
  // Assets
  art_style_guide: "Art Style Guide",
  character_assets: "Character Assets",
  environment_assets: "Environment Assets",
  audio_assets: "Audio Assets",
  // Technical Features
  engine_and_tools: "Engine & Tools",
  platform_requirements: "Platform Requirements",
  networking_features: "Networking & Online",
  performance_targets: "Performance Targets",
  // User Interface
  ui_overview: "UI Overview",
  main_menus: "Main Menus",
  in_game_hud: "In-Game HUD",
  accessibility: "Accessibility Features",
  // Monetization
  business_model: "Business Model",
  pricing_strategy: "Pricing Strategy",
  in_game_purchases: "In-Game Purchases",
  revenue_projections: "Revenue Projections",
  // Marketing
  marketing_strategy: "Marketing Strategy",
  target_channels: "Target Channels",
  community_building: "Community Building",
  launch_plan: "Launch Plan",
  // Development Plan
  project_timeline: "Project Timeline",
  team_structure: "Team Structure",
  development_phases: "Development Phases",
  risk_assessment: "Risk Assessment",
  // Legal
  intellectual_property: "Intellectual Property",
  age_ratings: "Age Ratings",
  privacy_and_data: "Privacy & Data",
  platform_compliance: "Platform Compliance",
};

// Build context from all filled sections
function buildFilledContentContext(allContent: AllSectionsContent): string {
  const contextParts: string[] = [];

  for (const [sectionSlug, subsections] of Object.entries(allContent)) {
    const sectionTitle = SECTION_TITLES[sectionSlug] || sectionSlug;
    const filledSubsections: string[] = [];

    for (const [subId, content] of Object.entries(subsections)) {
      if (hasContent(content)) {
        const subTitle = SUBSECTION_TITLES[subId] || subId;
        const cleanContent = stripHtml(content);
        filledSubsections.push(`### ${subTitle}\n${cleanContent}`);
      }
    }

    if (filledSubsections.length > 0) {
      contextParts.push(`## ${sectionTitle}\n${filledSubsections.join("\n\n")}`);
    }
  }

  return contextParts.join("\n\n---\n\n");
}

// Validate if there's enough context to generate content
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  filledCount: number;
  hasGameInfo: boolean;
}

export function validateGenerationContext(
  gameContext: GameContext,
  allContent: AllSectionsContent
): ValidationResult {
  const hasGameName = Boolean(gameContext.name && gameContext.name.trim().length > 0);
  const hasGameConcept = Boolean(gameContext.concept && gameContext.concept.trim().length > 10);
  const hasGameInfo = hasGameName && hasGameConcept;

  const { totalFilled } = countFilledContent(allContent);

  // Require at least game info OR 2+ filled subsections
  if (!hasGameInfo && totalFilled < 2) {
    return {
      isValid: false,
      error: "Not enough information. Please fill in the game name, concept, or at least 2 other subsections first.",
      filledCount: totalFilled,
      hasGameInfo,
    };
  }

  return {
    isValid: true,
    filledCount: totalFilled,
    hasGameInfo,
  };
}

// Build the full generation prompt with all context
export function buildGenerationPrompt(context: GenerationContext): string {
  const { gameContext, allContent, instructions, subSectionTitle } = context;

  // Build game info section
  const gameInfo = `
## Game Information
- **Name:** ${gameContext.name || "Untitled Game"}
- **Concept:** ${gameContext.concept || "Not specified"}
- **Platforms:** ${gameContext.platforms?.length > 0 ? gameContext.platforms.join(", ") : "Not specified"}
${gameContext.timeline ? `- **Timeline:** ${gameContext.timeline}` : ""}
`.trim();

  // Build existing content context
  const existingContent = buildFilledContentContext(allContent);
  const hasExistingContent = existingContent.length > 0;

  // Build the full prompt
  let prompt = `You are writing content for a Game Design Document (GDD).

${gameInfo}
`;

  if (hasExistingContent) {
    prompt += `
# Existing GDD Content
Use the following already-written sections as context to ensure consistency and build upon established details:

${existingContent}

---

`;
  }

  prompt += `
# Your Task
Write content for the "${subSectionTitle}" subsection.

## Instructions
${instructions}

## Important Guidelines
- Write EXACTLY 2 paragraphs, no more (allowed to write upt 4 ONLY IF specifically instructed to)
- Each paragraph should be separated by a blank line
- Write professional, specific content tailored to THIS game
- Reference and build upon the existing content above for consistency
- Use concrete details, not generic placeholder text
- Write in a clear, professional tone suitable for a game design document
- Do not repeat information that's already covered in other sections
- Focus on what's unique and specific to this subsection's purpose
- Do not use bullet points or lists - write in flowing paragraphs only

Generate the content now. Write only the content itself (2 paragraphs), no headers or meta-commentary.`;

  return prompt;
}

// System prompt for generation
export const GENERATION_SYSTEM_PROMPT = `You are an expert game design document writer with deep knowledge of game development, design principles, and industry standards.

Your role is to help game developers create professional, comprehensive game design documents. You write content that is:
- Specific and detailed, not generic
- Consistent with established game details
- Professional yet engaging
- Actionable for development teams
- Well-structured and clear

When generating content, you carefully consider all provided context about the game and ensure your writing aligns with the established vision, tone, and details.`;
