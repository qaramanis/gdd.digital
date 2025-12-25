export interface GDDSubSection {
  id: string;
  title: string;
  placeholder: string;
  description?: string;
  instructions: string; // AI-specific guidance for generating content
}

export interface GDDSection {
  number: number;
  slug: string;
  title: string;
  description: string;
  subSections: GDDSubSection[];
}

export const GDD_SECTIONS: GDDSection[] = [
  {
    number: 1,
    slug: "overview",
    title: "Overview",
    description:
      "Provide a high-level introduction to your game, including its core concept, target audience, and market positioning.",
    subSections: [
      {
        id: "brief_introduction",
        title: "Brief Introduction",
        placeholder:
          "Begin with 1-2 sentences that capture the essence of your game. What makes it unique and exciting?",
        description: "A compelling hook that summarizes the main idea or theme.",
        instructions: `Write a compelling  sentence introduction that immediately captures what makes this game special. Start with a hook that conveys the core fantasy or experience. Use vivid, evocative language that makes readers want to learn more. Reference the game's genre and unique twist. This should read like an elevator pitch - concise but exciting.`,
      },
      {
        id: "game_concept_summary",
        title: "Game Concept Summary",
        placeholder:
          "Describe the genre, setting, and main objectives. What does the player do and why?",
        description: "Concise explanation covering genre, setting, and core objectives.",
        instructions: `Write a comprehensive yet focused summary of the game concept in 2 paragraphs. Cover: 1) The primary genre and any sub-genres, 2) The setting (time period, world type, atmosphere), 3) The main player objectives and what they're trying to achieve, 4) The core activities players engage in. Be specific about mechanics without going into excessive detail. This should give readers a clear mental picture of what playing this game looks and feels like.`,
      },
      {
        id: "target_audience",
        title: "Target Audience",
        placeholder:
          "Define your primary demographic: age range, interests, gaming habits, platforms they use...",
        description: "Identify the primary demographic and their characteristics.",
        instructions: `Define the target audience in 2 paragraphs. Include: 1) Primary age range and demographics, 2) Gaming experience level (casual, core, hardcore), 3) What other games they likely play (reference similar successful titles), 4) What appeals to them (competition, exploration, story, social features), 5) How they discover and purchase games. Be realistic and specific - avoid saying "everyone" as the target.`,
      },
      {
        id: "market_analysis",
        title: "Market Analysis",
        placeholder:
          "Analyze the market: competitors, your unique position, and how you'll differentiate...",
        description: "Competitors, market positioning, and differentiation strategy.",
        instructions: `Provide market analysis in 2 paragraphs covering: 1) The current state of the genre/market, 2)  key competitors and what they do well, 3) Gaps or opportunities in the market this game addresses, 4) How this game differentiates itself from competitors, 5) Why now is a good time for this game. Base analysis on the game's concept and target audience. Be analytical and strategic, not just promotional.`,
      },
    ],
  },
  {
    number: 2,
    slug: "game-concept",
    title: "Game Concept",
    description:
      "Define the core concept, gameplay mechanics, unique selling points, and what makes your game special.",
    subSections: [
      {
        id: "high_level_description",
        title: "High-Level Description of the Game",
        placeholder: "Provide a comprehensive overview of your game - what it is, what players do, and the core experience it delivers...",
        instructions: `Write a high-level description of the game in 2-3 paragraphs. Cover: 1) The central premise and what the game is about, 2) The primary experience players will have, 3) The setting, theme, and atmosphere, 4) What players are trying to achieve, 5) Why this game exists and what makes it worth playing. This should paint a complete picture of the game at a glance - comprehensive yet accessible.`,
      },
      {
        id: "core_gameplay_mechanics",
        title: "Core Gameplay Mechanics",
        placeholder: "Describe the fundamental mechanics players interact with - movement, actions, systems, and how they work together...",
        instructions: `Detail the core gameplay mechanics in 2-3 paragraphs. Cover: 1) The primary actions players can take and how they're performed, 2) The main systems players interact with (combat, exploration, building, etc.), 3) How these mechanics work together to create the gameplay loop, 4) What makes these mechanics satisfying and engaging, 5) Any innovative or unique mechanical twists. Be specific about how players interact with the game moment-to-moment.`,
      },
      {
        id: "unique_selling_points",
        title: "Unique Selling Points (USPs)",
        placeholder: "List 3-5 key features that make your game stand out from competitors and similar titles...",
        instructions: `List and explain 3-5 unique selling points, each in its own paragraph. For each USP: 1) State the feature or aspect clearly and concisely, 2) Explain why it's unique or innovative compared to similar games, 3) Describe the direct benefit to players, 4) Reference how it differentiates from competitors. These should be the features that would headline marketing materials - concrete, compelling, and clearly differentiated from the competition.`,
      },
      {
        id: "replayability",
        title: "Replayability",
        placeholder: "Explain what brings players back - procedural elements, multiple paths, unlockables, mastery curves...",
        instructions: `Describe the replayability factors in 2 paragraphs. Cover: 1) What motivates players to replay (new content, different outcomes, mastery), 2) Procedural or randomized elements that create variety, 3) Multiple paths, builds, or playstyles to explore, 4) Unlockables, achievements, or progression that spans sessions, 5) Long-term engagement hooks. Explain why players will return after completing the main content.`,
      },
      {
        id: "player_agency_and_choices",
        title: "Player Agency and Choices",
        placeholder: "Describe how players shape their experience - meaningful decisions, customization, branching paths...",
        instructions: `Detail player agency and choices in 2 paragraphs. Cover: 1) The meaningful decisions players make and their impact, 2) How players can customize or personalize their experience, 3) Branching narratives or multiple endings (if applicable), 4) Freedom vs. guidance balance in gameplay, 5) How player choices affect the game world or story. Show how players feel ownership over their experience and outcomes.`,
      },
    ],
  },
  {
    number: 3,
    slug: "storyline",
    title: "Storyline & Background",
    description:
      "Develop the narrative framework, characters, and world that bring your game to life.",
    subSections: [
      {
        id: "narrative_overview",
        title: "Narrative Overview",
        placeholder: "Summarize the main story, central conflict, and stakes...",
        instructions: `Write a narrative overview in 2 paragraphs covering: 1) The setting and initial situation, 2) The inciting incident that kicks off the story, 3) The central conflict and antagonistic forces, 4) The stakes - what happens if the player fails, 5) The general arc without spoiling the ending. Write this like a compelling story synopsis that makes readers want to experience it.`,
      },
      {
        id: "world_setting",
        title: "World & Setting",
        placeholder: "Describe the game world: history, geography, rules, and atmosphere...",
        instructions: `Describe the world in 2 paragraphs covering: 1) The type of world (fantasy realm, sci-fi universe, real-world location, etc.), 2) Key locations and their significance, 3) The history or lore that shapes the current situation, 4) The rules of the world (magic systems, technology level, social structures), 5) The atmosphere and mood. Create a sense of place that supports the story and gameplay.`,
      },
      {
        id: "main_characters",
        title: "Main Characters",
        placeholder: "Introduce key characters, their motivations, and roles in the story...",
        instructions: `Introduce the main characters in 2 paragraphs. For each major character include: 1) Name and basic description, 2) Their role (protagonist, antagonist, ally, etc.), 3) Their motivation and goals, 4) Their personality and notable traits, 5) Their relationship to the player/protagonist. Focus on characters that drive the narrative and player engagement.`,
      },
      {
        id: "story_progression",
        title: "Story Progression",
        placeholder: "How does the narrative unfold? Key plot points and story beats...",
        instructions: `Outline story progression in 2 paragraphs covering: 1) How the story begins and players are introduced to the world, 2) Major story beats or acts, 3) How story unfolds through gameplay (cutscenes, environmental storytelling, dialogue, etc.), 4) Key turning points and revelations, 5) How player choices affect the narrative (if applicable). Show the structure without detailed spoilers.`,
      },
    ],
  },
  {
    number: 4,
    slug: "gameplay-mechanics",
    title: "Gameplay Mechanics",
    description:
      "Document the core gameplay systems, controls, and interactive elements.",
    subSections: [
      {
        id: "core_gameplay_loop",
        title: "Core Gameplay Loop",
        placeholder: "Describe the primary cycle of actions players repeat...",
        instructions: `Define the core gameplay loop in 2 paragraphs. Cover: 1) The primary cycle of actions (explore → fight → loot → upgrade, for example), 2) How long a typical loop takes, 3) What makes this loop satisfying and replayable, 4) Short-term and long-term loops if different, 5) How the loop supports the core concept. This should clearly show what players spend most of their time doing.`,
      },
      {
        id: "controls_and_input",
        title: "Controls & Input",
        placeholder: "Define control schemes for each platform...",
        instructions: `Describe controls and input in 2 paragraphs covering: 1) Primary control scheme for the main platform, 2) Key actions and how they're performed, 3) Any unique control mechanics or innovations, 4) How controls differ across platforms (if applicable), 5) Accessibility considerations for input. Be specific about button mappings and interaction patterns.`,
      },
      {
        id: "game_systems",
        title: "Game Systems",
        placeholder: "Detail major systems: combat, crafting, progression, economy...",
        instructions: `Detail the major game systems in 2-3 paragraphs. For each major system (combat, progression, economy, crafting, etc.): 1) How the system works at a high level, 2) How players interact with it, 3) How it connects to other systems, 4) What makes it engaging. Focus on systems central to the core gameplay loop. Be specific enough for a designer to understand the intent.`,
      },
      {
        id: "difficulty_and_balance",
        title: "Difficulty & Balance",
        placeholder: "Describe difficulty settings, balancing approach, and player challenge...",
        instructions: `Describe difficulty and balance in 2 paragraphs covering: 1) Difficulty options available (if any), 2) How difficulty affects gameplay (enemy stats, resources, player abilities), 3) Approach to game balance and player progression, 4) How challenge scales throughout the game, 5) Onboarding and learning curve. Address both new players and experienced gamers.`,
      },
    ],
  },
  {
    number: 5,
    slug: "level-design",
    title: "Level Design",
    description:
      "Plan the structure, flow, and content of your game's levels and environments.",
    subSections: [
      {
        id: "level_structure",
        title: "Level Structure",
        placeholder: "Overview of level/world organization: linear, open-world, hub-based...",
        instructions: `Describe the level structure in 2 paragraphs covering: 1) Overall structure (linear, open-world, hub-and-spoke, etc.), 2) How levels/areas are organized and connected, 3) Approximate number and size of levels/areas, 4) How structure supports gameplay and pacing, 5) Any unique structural elements. Help readers visualize how the game world is organized.`,
      },
      {
        id: "environment_themes",
        title: "Environment Themes",
        placeholder: "Describe the different environments, biomes, or areas players explore...",
        instructions: `Describe environment themes in 2 paragraphs covering: 1) The variety of environments/biomes in the game, 2) Visual and atmospheric characteristics of each, 3) How environments relate to story or progression, 4) Unique gameplay elements per environment, 5) How environments create variety and interest. Paint a picture of the visual journey players experience.`,
      },
      {
        id: "progression_flow",
        title: "Progression Flow",
        placeholder: "How do players move through the game? Gates, unlocks, milestones...",
        instructions: `Describe progression flow in 2 paragraphs covering: 1) How players advance through content (story progress, ability unlocks, etc.), 2) Gating mechanisms that control access to new areas, 3) Key milestones and sense of progress, 4) Backtracking or revisiting previous areas, 5) Estimated playtime distribution. Show how players experience a sense of advancement.`,
      },
      {
        id: "puzzles_and_challenges",
        title: "Puzzles & Challenges",
        placeholder: "Types of puzzles, challenges, and obstacles players will encounter...",
        instructions: `Describe puzzles and challenges in 2 paragraphs covering: 1) Types of puzzles or challenges (environmental, combat, logical, etc.), 2) How challenges vary and escalate, 3) Optional vs. required challenges, 4) Rewards for completing challenges, 5) Examples of specific puzzle types. Show the variety and depth of player challenges beyond combat.`,
      },
    ],
  },
  {
    number: 6,
    slug: "assets",
    title: "Assets",
    description:
      "Catalog the visual, audio, and other assets needed to bring your game to life.",
    subSections: [
      {
        id: "art_style_guide",
        title: "Art Style Guide",
        placeholder: "Define the visual style, color palette, and art direction...",
        instructions: `Define the art style in 2 paragraphs covering: 1) Overall visual style (realistic, stylized, pixel art, etc.), 2) Color palette and its emotional purpose, 3) Art direction principles and references, 4) How style supports the game's mood and genre, 5) Consistency guidelines across assets. Be specific enough to guide artists.`,
      },
      {
        id: "character_assets",
        title: "Character Assets",
        placeholder: "List character models, animations, and visual requirements...",
        instructions: `Describe character assets in 2 paragraphs covering: 1) Types of character models needed (player, NPCs, enemies), 2) Animation requirements and styles, 3) Level of detail and fidelity needed, 4) Customization or variant requirements, 5) Technical constraints. Provide a scope of the character art production.`,
      },
      {
        id: "environment_assets",
        title: "Environment Assets",
        placeholder: "Catalog environment art, props, and level assets needed...",
        instructions: `Describe environment assets in 2 paragraphs covering: 1) Types of environments and their asset needs, 2) Key props and interactive objects, 3) Modular vs. unique asset approach, 4) Level of detail requirements, 5) Lighting and effects considerations. Give a sense of the environment art scope.`,
      },
      {
        id: "audio_assets",
        title: "Audio Assets",
        placeholder: "Music, sound effects, voice acting requirements...",
        instructions: `Describe audio assets in 2 paragraphs covering: 1) Music style, mood, and quantity needed, 2) Sound effects categories and scope, 3) Voice acting requirements (if any), 4) Ambient and environmental audio, 5) Audio technology needs (dynamic music, spatial audio). Define the audio vision and scope.`,
      },
    ],
  },
  {
    number: 7,
    slug: "technical-features",
    title: "Technical Features",
    description:
      "Outline the technical requirements, engine features, and platform specifications.",
    subSections: [
      {
        id: "engine_and_tools",
        title: "Engine & Tools",
        placeholder: "Game engine, development tools, and technology stack...",
        instructions: `Describe the technology stack in 2 paragraphs covering: 1) Game engine choice and rationale, 2) Key tools and middleware, 3) Version control and collaboration tools, 4) Build and deployment pipeline, 5) Any custom tools needed. Show the technical foundation the project is built on.`,
      },
      {
        id: "platform_requirements",
        title: "Platform Requirements",
        placeholder: "Target platforms, minimum specs, and technical constraints...",
        instructions: `Define platform requirements in 2 paragraphs covering: 1) Target platforms at launch and post-launch, 2) Minimum and recommended system specifications, 3) Platform-specific features or limitations, 4) Input and controller support, 5) Storage and download size targets. Be realistic about technical constraints.`,
      },
      {
        id: "networking_features",
        title: "Networking & Online",
        placeholder: "Multiplayer, online features, server requirements...",
        instructions: `Describe networking features in 2 paragraphs covering: 1) Single-player vs. multiplayer (or both), 2) Online connectivity requirements, 3) Multiplayer modes and player counts, 4) Server architecture (dedicated, P2P, cloud), 5) Online services (matchmaking, leaderboards, cloud saves). If single-player only, explain online service integrations.`,
      },
      {
        id: "performance_targets",
        title: "Performance Targets",
        placeholder: "Frame rate, resolution, loading times, optimization goals...",
        instructions: `Define performance targets in 2 paragraphs covering: 1) Target frame rate per platform, 2) Resolution targets and scaling options, 3) Loading time goals, 4) Memory and storage constraints, 5) Key optimization priorities. Set realistic expectations for technical performance.`,
      },
    ],
  },
  {
    number: 8,
    slug: "user-interface",
    title: "User Interface (UI)",
    description:
      "Design the menus, HUD, and user experience elements of your game.",
    subSections: [
      {
        id: "ui_overview",
        title: "UI Overview",
        placeholder: "General UI philosophy, style, and design principles...",
        instructions: `Define the UI philosophy in 2 paragraphs covering: 1) Overall UI style and aesthetic, 2) Design principles (minimalist, diegetic, etc.), 3) How UI supports the game's mood and genre, 4) Key UX goals (clarity, immersion, speed), 5) Inspiration or reference games. Set the tone for all UI decisions.`,
      },
      {
        id: "main_menus",
        title: "Main Menus",
        placeholder: "Main menu, pause menu, settings, and navigation flow...",
        instructions: `Describe the menu systems in 2 paragraphs covering: 1) Main menu structure and options, 2) Pause menu functionality, 3) Settings and options available, 4) Navigation flow and hierarchy, 5) Any unique menu features or presentations. Show how players navigate outside of gameplay.`,
      },
      {
        id: "in_game_hud",
        title: "In-Game HUD",
        placeholder: "Health bars, minimaps, inventory, and on-screen information...",
        instructions: `Describe the in-game HUD in 2 paragraphs covering: 1) Core HUD elements always visible, 2) Contextual UI that appears when needed, 3) How information is prioritized and displayed, 4) Minimap, radar, or navigation aids, 5) How HUD adapts to different situations. Focus on clarity and player information needs.`,
      },
      {
        id: "accessibility",
        title: "Accessibility Features",
        placeholder: "Colorblind modes, subtitles, control remapping, difficulty options...",
        instructions: `Describe accessibility features in 2 paragraphs covering: 1) Visual accessibility (colorblind modes, text size, contrast), 2) Audio accessibility (subtitles, visual cues for audio), 3) Motor accessibility (control remapping, assist modes), 4) Cognitive accessibility (difficulty options, tutorials), 5) Commitment to accessibility standards. Show inclusivity in design.`,
      },
    ],
  },
  {
    number: 9,
    slug: "monetization",
    title: "Monetization Strategy",
    description:
      "Plan your revenue model, pricing, and any in-game purchase systems.",
    subSections: [
      {
        id: "business_model",
        title: "Business Model",
        placeholder: "Premium, F2P, subscription, or hybrid model...",
        instructions: `Define the business model in 2 paragraphs covering: 1) Primary revenue model (premium, F2P, subscription, etc.), 2) Rationale for this choice given the game and audience, 3) How the model affects game design, 4) Comparison to similar successful games, 5) Long-term sustainability of the model. Be strategic and realistic.`,
      },
      {
        id: "pricing_strategy",
        title: "Pricing Strategy",
        placeholder: "Base price, editions, regional pricing, launch discounts...",
        instructions: `Describe pricing strategy in 2 paragraphs covering: 1) Base game price point and justification, 2) Special editions or bundles (if any), 3) Regional pricing approach, 4) Launch pricing and promotional strategy, 5) Price positioning vs. competitors. Support decisions with market reasoning.`,
      },
      {
        id: "in_game_purchases",
        title: "In-Game Purchases",
        placeholder: "DLC, microtransactions, cosmetics, season passes...",
        instructions: `Describe in-game purchases in 2 paragraphs covering: 1) Types of purchasable content (cosmetics, DLC, expansions), 2) Pricing tiers and value proposition, 3) How purchases are presented in-game, 4) Avoiding pay-to-win perception, 5) Post-launch content roadmap. If no in-game purchases, explain why.`,
      },
      {
        id: "revenue_projections",
        title: "Revenue Projections",
        placeholder: "Expected sales, revenue targets, break-even analysis...",
        instructions: `Provide revenue analysis in 2 paragraphs covering: 1) Target sales numbers with reasoning, 2) Revenue breakdown by source (base game, DLC, etc.), 3) Break-even point and path to profitability, 4) Comparison to similar games' performance, 5) Optimistic and conservative scenarios. Be realistic and data-informed.`,
      },
    ],
  },
  {
    number: 10,
    slug: "marketing",
    title: "Marketing & Promotion",
    description:
      "Develop your marketing strategy, community building, and launch plans.",
    subSections: [
      {
        id: "marketing_strategy",
        title: "Marketing Strategy",
        placeholder: "Overall approach to marketing, key messages, and positioning...",
        instructions: `Define the marketing strategy in 2 paragraphs covering: 1) Overall marketing philosophy and approach, 2) Key messages and positioning, 3) Unique selling points to emphasize, 4) Target marketing spend (if known), 5) Success metrics for marketing. Set the strategic foundation for all promotional activities.`,
      },
      {
        id: "target_channels",
        title: "Target Channels",
        placeholder: "Social media, influencers, press, events, advertising...",
        instructions: `Describe target channels in 2 paragraphs covering: 1) Social media platforms and strategy, 2) Influencer and content creator partnerships, 3) Press and media outreach, 4) Events and conferences (if applicable), 5) Paid advertising approach. Prioritize channels that reach the target audience effectively.`,
      },
      {
        id: "community_building",
        title: "Community Building",
        placeholder: "Discord, forums, social engagement, beta programs...",
        instructions: `Describe community building in 2 paragraphs covering: 1) Primary community platforms (Discord, Reddit, forums), 2) Community engagement strategy, 3) Beta or early access programs, 4) Community feedback integration, 5) Long-term community support plans. Show how players become advocates.`,
      },
      {
        id: "launch_plan",
        title: "Launch Plan",
        placeholder: "Pre-launch, launch day, and post-launch marketing activities...",
        instructions: `Outline the launch plan in 2 paragraphs covering: 1) Pre-launch marketing timeline and activities, 2) Launch day strategy and events, 3) Post-launch content and marketing cadence, 4) Key milestones (announcements, trailers, demos), 5) Contingency for different launch scenarios. Create a marketing roadmap.`,
      },
    ],
  },
  {
    number: 11,
    slug: "development-plan",
    title: "Development Plan",
    description:
      "Create the project timeline, milestones, and team structure.",
    subSections: [
      {
        id: "project_timeline",
        title: "Project Timeline",
        placeholder: "Major phases, milestones, and target dates...",
        instructions: `Outline the project timeline in 2 paragraphs covering: 1) Overall development duration estimate, 2) Major phases and their duration, 3) Key milestones and deliverables, 4) Dependencies and critical path, 5) Buffer and contingency approach. Be realistic about timing without specific dates.`,
      },
      {
        id: "team_structure",
        title: "Team Structure",
        placeholder: "Team roles, responsibilities, and resource allocation...",
        instructions: `Describe team structure in 2 paragraphs covering: 1) Core team roles and responsibilities, 2) Team size at different project phases, 3) Internal vs. outsourced work, 4) Leadership and decision-making structure, 5) Collaboration and communication approach. Show how the team is organized to deliver.`,
      },
      {
        id: "development_phases",
        title: "Development Phases",
        placeholder: "Pre-production, production, alpha, beta, launch phases...",
        instructions: `Detail development phases in 2 paragraphs covering: 1) Pre-production goals and deliverables, 2) Production milestones and focus areas, 3) Alpha and beta definitions and goals, 4) Polish and launch preparation, 5) Post-launch support phase. Define what success looks like at each phase.`,
      },
      {
        id: "risk_assessment",
        title: "Risk Assessment",
        placeholder: "Potential risks, mitigation strategies, contingency plans...",
        instructions: `Assess risks in 2 paragraphs covering: 1) Technical risks and mitigation, 2) Scope and schedule risks, 3) Team and resource risks, 4) Market and competitive risks, 5) Contingency plans for major risks. Be honest about challenges and prepared with solutions.`,
      },
    ],
  },
  {
    number: 12,
    slug: "legal",
    title: "Legal & Compliance",
    description:
      "Address legal requirements, ratings, and compliance considerations.",
    subSections: [
      {
        id: "intellectual_property",
        title: "Intellectual Property",
        placeholder: "Trademarks, copyrights, patents, licensing...",
        instructions: `Address IP concerns in 2 paragraphs covering: 1) Original IP vs. licensed content, 2) Trademark considerations for game name and branding, 3) Third-party assets and licensing needs, 4) IP protection strategy, 5) Any licensing revenue opportunities. Ensure the project is legally sound.`,
      },
      {
        id: "age_ratings",
        title: "Age Ratings",
        placeholder: "ESRB, PEGI, and other regional rating considerations...",
        instructions: `Describe rating expectations in 2 paragraphs covering: 1) Target age rating and content considerations, 2) Content that may affect ratings (violence, language, etc.), 3) Regional rating boards to target (ESRB, PEGI, etc.), 4) Any content modifications for different regions, 5) Rating impact on marketing and distribution.`,
      },
      {
        id: "privacy_and_data",
        title: "Privacy & Data",
        placeholder: "GDPR, COPPA, data collection, privacy policies...",
        instructions: `Address privacy requirements in 2 paragraphs covering: 1) Data collection plans and purposes, 2) GDPR compliance approach, 3) COPPA considerations (if targeting under 13), 4) Privacy policy requirements, 5) Data security measures. Ensure responsible data handling.`,
      },
      {
        id: "platform_compliance",
        title: "Platform Compliance",
        placeholder: "Store requirements, certification processes, guidelines...",
        instructions: `Describe platform compliance in 2 paragraphs covering: 1) Target platform store requirements (Steam, PlayStation, Xbox, Nintendo, App Stores), 2) Certification process understanding, 3) Platform-specific content guidelines, 4) Technical requirements for certification, 5) Timeline for certification in project plan.`,
      },
    ],
  },
];

export function getSection(slug: string): GDDSection | undefined {
  return GDD_SECTIONS.find((s) => s.slug === slug);
}

export function getSectionNavigation(slug: string): {
  current: GDDSection | undefined;
  prev: GDDSection | undefined;
  next: GDDSection | undefined;
} {
  const currentIndex = GDD_SECTIONS.findIndex((s) => s.slug === slug);
  return {
    current: GDD_SECTIONS[currentIndex],
    prev: currentIndex > 0 ? GDD_SECTIONS[currentIndex - 1] : undefined,
    next: currentIndex < GDD_SECTIONS.length - 1 ? GDD_SECTIONS[currentIndex + 1] : undefined,
  };
}

// Helper to get a specific subsection with its instructions
export function getSubSection(sectionSlug: string, subSectionId: string): GDDSubSection | undefined {
  const section = getSection(sectionSlug);
  return section?.subSections.find((sub) => sub.id === subSectionId);
}
