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
  high_level_description: `Complete this high-level game description. Provide a comprehensive overview of what the game is, what players do, and the core experience.`,
  core_gameplay_mechanics: `Complete this core gameplay mechanics description. Focus on the fundamental actions and systems players interact with.`,
  unique_selling_points: `Complete this unique selling points section. Highlight what makes this game stand out from competitors.`,
  replayability: `Complete this replayability description. Explain what brings players back - procedural elements, multiple paths, unlockables.`,
  player_agency_and_choices: `Complete this player agency section. Describe meaningful decisions and how players shape their experience.`,

  // Storyline & Background section
  background_story: `Complete this background story. Describe the history and events that set the stage for the game.`,
  setting_and_atmosphere: `Complete this setting description. Describe the game world's environment, mood, and atmosphere.`,
  main_characters_motivation: `Complete this character description. Include who they are, what they want, and why they matter.`,
  character_arcs_development: `Complete this character development section. Explain how characters grow and change throughout the story.`,
  central_conflict: `Complete this central conflict description. Define what forces oppose each other and what's at stake.`,
  themes_and_motifs: `Complete this themes section. Identify deeper meanings, recurring symbols, and philosophical questions.`,
  plot_points_and_events: `Complete this plot structure. Outline major story beats from inciting incident to resolution.`,
  branching_paths_and_choices: `Complete this branching narrative section. Describe how player decisions affect the story.`,
  narrative_delivery: `Complete this narrative delivery section. Explain how the story is told - cutscenes, dialogue, environmental storytelling.`,

  // Gameplay Mechanics section
  core_mechanics: `Complete this core mechanics description. Focus on the primary gameplay loop and fundamental systems.`,
  controls: `Complete this controls section. Define how players physically interact with the game.`,
  progression_systems: `Complete this progression section. Explain how players grow and advance - leveling, unlocks, upgrades.`,
  challenge_design: `Complete this challenge design section. Describe how challenges are structured and difficulty scales.`,
  balancing: `Complete this balancing section. Explain the approach to game balance and difficulty options.`,
  feedback_and_response: `Complete this feedback section. Describe how the game communicates with players through visual, audio, and haptic feedback.`,
  emergent_gameplay: `Complete this emergent gameplay section. Describe unscripted possibilities from system interactions.`,
  game_modes: `Complete this game modes section. List and describe available modes - campaign, multiplayer, challenges.`,

  // Level Design section
  stages_overview: `Complete this stages overview. Describe the different levels, their themes and purpose.`,
  objectives_layouts_challenges: `Complete this level design section. Detail objectives, layouts, and challenges within levels.`,
  progression_difficulty_balancing: `Complete this progression curve description. Explain how difficulty increases across levels.`,
  enemy_placement_ai: `Complete this enemy design section. Describe positioning strategy and AI behaviors.`,
  secrets_collectibles_easter_eggs: `Complete this secrets section. Describe hidden content and rewards for exploration.`,

  // Assets section
  art_style_direction: `Complete this art direction section. Define the overall visual style and artistic vision.`,
  character_environments_models: `Complete this asset description. Describe character designs, environments, and model requirements.`,
  visual_assets_graphics: `Complete this visual assets section. List graphical assets - textures, sprites, effects, animations.`,
  audio_assets: `Complete this audio section. Define music, sound effects, voice acting, and ambient audio needs.`,
  ui_ux_assets: `Complete this UI assets section. List interface elements - buttons, icons, menus, HUD components.`,
  concept_art: `Complete this concept art section. Describe concept art needs for characters, environments, and key scenes.`,
  asset_pipeline: `Complete this pipeline section. Explain the workflow from concept to implementation.`,
  asset_management: `Complete this management section. Define how assets are organized, versioned, and stored.`,
  external_resources: `Complete this external resources section. List third-party assets and licensed content.`,
  localization_assets: `Complete this localization section. Define assets needed for different languages and regions.`,
  qa_assets: `Complete this QA assets section. List assets for testing - debug tools, test builds.`,
  storyboarding: `Complete this storyboarding section. Describe storyboard needs for cutscenes and key moments.`,
  mood_boards: `Complete this mood boards section. Define visual references and aesthetic inspiration.`,

  // Technical Features section
  platforms_technologies: `Complete this platforms section. Define target platforms and core technologies.`,
  engine_choice: `Complete this engine section. Describe the game engine selection and key features utilized.`,
  networking_multiplayer: `Complete this networking section. Define online features, multiplayer modes, and server architecture.`,
  performance_optimization: `Complete this performance section. Define targets and optimization strategies.`,
  debugging_profiling: `Complete this debugging section. List tools for debugging, profiling, and testing.`,
  input_control: `Complete this input section. Define input systems and controller support.`,

  // User Interface section
  main_menu: `Complete this main menu section. Describe structure, options, and visual presentation.`,
  in_game_huds: `Complete this HUD section. Define heads-up display elements and information layout.`,
  inventory_equipment: `Complete this inventory section. Describe inventory systems and equipment management.`,
  dialogue_interaction: `Complete this dialogue section. Define dialogue boxes and interaction prompts.`,
  map_navigation: `Complete this navigation section. Describe map screens, minimaps, and waypoints.`,
  settings_options: `Complete this settings section. Define settings categories and available options.`,
  loading_progress: `Complete this loading section. Describe loading screen design and progress indicators.`,
  help_feature: `Complete this help section. Define in-game help systems and tutorials.`,
  accessibility_features: `Complete this accessibility section. Define accessibility options and inclusive design features.`,

  // Monetization Strategy section
  business_model: `Complete this business model section. Define the core revenue model and rationale.`,
  virtual_currency_economy: `Complete this economy section. Design in-game currencies and economic balance.`,
  in_game_store: `Complete this store section. Define store structure, item categories, and pricing.`,
  advertising_integration: `Complete this advertising section. Plan ad placements, formats, and opt-in rewards.`,
  retention_strategies: `Complete this retention section. Design systems to keep players engaged long-term.`,
  regulatory_compliance: `Complete this compliance section. Address legal requirements for monetization.`,

  // Marketing & Promotion section
  target_audience_demographics: `Complete this audience section. Define primary and secondary target demographics.`,
  brand_identity_messaging: `Complete this branding section. Define visual identity, tone, and key messages.`,
  marketing_goals_objectives: `Complete this goals section. Set measurable marketing targets and KPIs.`,
  public_relations: `Complete this PR section. Plan press outreach and influencer partnerships.`,
  community_engagement: `Complete this community section. Plan community building and player engagement.`,
  launch_strategy: `Complete this launch section. Plan pre-launch, launch day, and promotional activities.`,
  post_launch_support: `Complete this post-launch section. Plan ongoing support, updates, and content roadmap.`,

  // Development Plan section
  project_overview: `Complete this project overview. Summarize scope, goals, and development approach.`,
  timeline_milestones: `Complete this timeline section. Define major milestones and deliverable dates.`,
  pre_production_phase: `Complete this pre-production section. Describe prototyping and concept validation.`,
  production_phase: `Complete this production section. Describe asset creation and feature development.`,
  alpha_beta_testing: `Complete this testing section. Plan alpha and beta phases and feedback integration.`,
  polishing_optimization: `Complete this polish section. Plan bug fixing and performance optimization.`,
  risk_management_contingency: `Complete this risk section. Identify project risks and mitigation strategies.`,
  resource_allocation_budget: `Complete this resource section. Plan team allocation and budget management.`,

  // Legal & Compliance section
  intellectual_property_rights: `Complete this IP section. Define ownership, trademarks, and licensing.`,
  privacy_data_protection: `Complete this privacy section. Plan data collection and GDPR/COPPA compliance.`,
  age_rating_classification: `Complete this ratings section. Plan for ESRB, PEGI, and regional classifications.`,
  terms_of_service_eula: `Complete this ToS section. Define user agreements and license terms.`,
  industry_standards_regulations: `Complete this compliance section. Address platform requirements and regulations.`,
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
  const { subSectionType, currentText, gameContext } = context;

  const gameInfo = `
Game Name: ${gameContext.name}
Game Concept: ${gameContext.concept}
Platforms: ${gameContext.platforms.join(", ")}
${gameContext.timeline ? `Timeline: ${gameContext.timeline}` : ""}
`.trim();

  const subSectionPrompt =
    SUBSECTION_COMPLETION_PROMPTS[subSectionType] ||
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
  gameContext: GameContext,
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
  high_level_description: "High-Level Description of the Game",
  core_gameplay_mechanics: "Core Gameplay Mechanics",
  unique_selling_points: "Unique Selling Points (USPs)",
  replayability: "Replayability",
  player_agency_and_choices: "Player Agency and Choices",
  // Storyline & Background
  background_story: "Background Story",
  setting_and_atmosphere: "Setting and Atmosphere",
  main_characters_motivation: "Main Characters and their Motivation",
  character_arcs_development: "Character Arcs and Development",
  central_conflict: "Central Conflict",
  themes_and_motifs: "Themes and Motifs",
  plot_points_and_events: "Plot Points and Events",
  branching_paths_and_choices: "Branching Paths and Choices",
  narrative_delivery: "Narrative Delivery",
  // Gameplay Mechanics
  core_mechanics: "Core Mechanics",
  controls: "Controls",
  progression_systems: "Progression Systems",
  challenge_design: "Challenge Design",
  balancing: "Balancing",
  feedback_and_response: "Feedback and Response",
  emergent_gameplay: "Emergent Gameplay",
  game_modes: "Game Modes",
  // Level Design
  stages_overview: "Overview of the Different Stages or Levels",
  objectives_layouts_challenges:
    "Objectives, Layouts, Obstacles and Challenges",
  progression_difficulty_balancing:
    "Progression Curve and Difficulty Balancing",
  enemy_placement_ai: "Enemy Placement and A.I.",
  secrets_collectibles_easter_eggs: "Secrets, Collectibles and Easter Eggs",
  // Assets
  art_style_direction: "Art Style and Direction",
  character_environments_models: "Character Design, Environments and Models",
  visual_assets_graphics: "Visual Assets - Graphics",
  audio_assets: "Audio Assets",
  ui_ux_assets: "UI/UX Assets",
  concept_art: "Concept Art",
  asset_pipeline: "Asset Pipeline",
  asset_management: "Asset Management",
  external_resources: "External Resources",
  localization_assets: "Localization Assets",
  qa_assets: "Quality Assurance (QA) Assets",
  storyboarding: "Storyboarding",
  mood_boards: "Mood Boards",
  // Technical Features
  platforms_technologies: "Platforms and Technologies",
  engine_choice: "Engine Choice",
  networking_multiplayer: "Networking and Multiplayer Requirements",
  performance_optimization: "Performance Considerations and Optimization",
  debugging_profiling: "Debugging and Profiling Tools",
  input_control: "Input and Control",
  // User Interface
  main_menu: "Main Menu",
  in_game_huds: "In-Game HUDs",
  inventory_equipment: "Inventory and Equipment Management",
  dialogue_interaction: "Dialogue and Interaction Prompts",
  map_navigation: "Map and Navigation",
  settings_options: "Settings and Options Menu",
  loading_progress: "Loading Screens and Progress Indicators",
  help_feature: "Help Feature",
  accessibility_features: "Accessibility Features",
  // Monetization Strategy
  business_model: "Business Model",
  virtual_currency_economy: "Virtual Currency and Economy",
  in_game_store: "In-Game Store and Purchasable Items",
  advertising_integration: "Advertising Integration",
  retention_strategies: "Retention Strategies",
  regulatory_compliance: "Regulatory Compliance",
  // Marketing & Promotion
  target_audience_demographics: "Target Audience and Demographics",
  brand_identity_messaging: "Brand Identity and Messaging",
  marketing_goals_objectives: "Marketing Goals and Objectives",
  public_relations: "Public Relations (PR)",
  community_engagement: "Community Engagement",
  launch_strategy: "Launch Strategy",
  post_launch_support: "Post-Launch Support and Updates",
  // Development Plan
  project_overview: "Project Overview",
  timeline_milestones: "Timeline and Milestones",
  pre_production_phase: "Pre-Production Phase",
  production_phase: "Production Phase",
  alpha_beta_testing: "Alpha and Beta Testing",
  polishing_optimization: "Polishing and Optimization",
  risk_management_contingency: "Risk Management and Contingency",
  resource_allocation_budget: "Resource Allocation and Budget Management",
  // Legal & Compliance
  intellectual_property_rights: "Intellectual Property (IP) Rights",
  privacy_data_protection: "Privacy and Data Protection",
  age_rating_classification: "Age Rating and Content Classification",
  terms_of_service_eula:
    "Terms of Service and End User License Agreements (EULAs)",
  industry_standards_regulations:
    "Compliance with Industry Standards and Regulations",
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
      contextParts.push(
        `## ${sectionTitle}\n${filledSubsections.join("\n\n")}`,
      );
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
  allContent: AllSectionsContent,
): ValidationResult {
  const hasGameName = Boolean(
    gameContext.name && gameContext.name.trim().length > 0,
  );
  const hasGameConcept = Boolean(
    gameContext.concept && gameContext.concept.trim().length > 10,
  );
  const hasGameInfo = hasGameName && hasGameConcept;

  const { totalFilled } = countFilledContent(allContent);

  // Require at least game info OR 2+ filled subsections
  if (!hasGameInfo && totalFilled < 2) {
    return {
      isValid: false,
      error:
        "Not enough information. Please fill in the game name, concept, or at least 2 other subsections first.",
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
