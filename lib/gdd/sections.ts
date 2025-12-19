export interface GDDSubSection {
  id: string;
  title: string;
  placeholder: string;
  description?: string;
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
      },
      {
        id: "game_concept_summary",
        title: "Game Concept Summary",
        placeholder:
          "Describe the genre, setting, and main objectives. What does the player do and why?",
        description: "Concise explanation covering genre, setting, and core objectives.",
      },
      {
        id: "target_audience",
        title: "Target Audience",
        placeholder:
          "Define your primary demographic: age range, interests, gaming habits, platforms they use...",
        description: "Identify the primary demographic and their characteristics.",
      },
      {
        id: "market_analysis",
        title: "Market Analysis",
        placeholder:
          "Analyze the market: competitors, your unique position, and how you'll differentiate...",
        description: "Competitors, market positioning, and differentiation strategy.",
      },
    ],
  },
  {
    number: 2,
    slug: "game-concept",
    title: "Game Concept",
    description:
      "Define the core concept, unique selling points, and the overall vision for your game.",
    subSections: [
      {
        id: "core_concept",
        title: "Core Concept",
        placeholder: "What is the fundamental idea that drives your entire game experience?",
      },
      {
        id: "unique_selling_points",
        title: "Unique Selling Points",
        placeholder: "List 3-5 key features that make your game stand out from competitors...",
      },
      {
        id: "genre_and_style",
        title: "Genre & Visual Style",
        placeholder: "Define the genre(s), sub-genres, visual aesthetic, and overall tone...",
      },
      {
        id: "player_experience",
        title: "Player Experience Goals",
        placeholder: "What emotions and experiences do you want players to have?",
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
      },
      {
        id: "world_setting",
        title: "World & Setting",
        placeholder: "Describe the game world: history, geography, rules, and atmosphere...",
      },
      {
        id: "main_characters",
        title: "Main Characters",
        placeholder: "Introduce key characters, their motivations, and roles in the story...",
      },
      {
        id: "story_progression",
        title: "Story Progression",
        placeholder: "How does the narrative unfold? Key plot points and story beats...",
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
      },
      {
        id: "controls_and_input",
        title: "Controls & Input",
        placeholder: "Define control schemes for each platform...",
      },
      {
        id: "game_systems",
        title: "Game Systems",
        placeholder: "Detail major systems: combat, crafting, progression, economy...",
      },
      {
        id: "difficulty_and_balance",
        title: "Difficulty & Balance",
        placeholder: "Describe difficulty settings, balancing approach, and player challenge...",
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
      },
      {
        id: "environment_themes",
        title: "Environment Themes",
        placeholder: "Describe the different environments, biomes, or areas players explore...",
      },
      {
        id: "progression_flow",
        title: "Progression Flow",
        placeholder: "How do players move through the game? Gates, unlocks, milestones...",
      },
      {
        id: "puzzles_and_challenges",
        title: "Puzzles & Challenges",
        placeholder: "Types of puzzles, challenges, and obstacles players will encounter...",
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
      },
      {
        id: "character_assets",
        title: "Character Assets",
        placeholder: "List character models, animations, and visual requirements...",
      },
      {
        id: "environment_assets",
        title: "Environment Assets",
        placeholder: "Catalog environment art, props, and level assets needed...",
      },
      {
        id: "audio_assets",
        title: "Audio Assets",
        placeholder: "Music, sound effects, voice acting requirements...",
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
      },
      {
        id: "platform_requirements",
        title: "Platform Requirements",
        placeholder: "Target platforms, minimum specs, and technical constraints...",
      },
      {
        id: "networking_features",
        title: "Networking & Online",
        placeholder: "Multiplayer, online features, server requirements...",
      },
      {
        id: "performance_targets",
        title: "Performance Targets",
        placeholder: "Frame rate, resolution, loading times, optimization goals...",
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
      },
      {
        id: "main_menus",
        title: "Main Menus",
        placeholder: "Main menu, pause menu, settings, and navigation flow...",
      },
      {
        id: "in_game_hud",
        title: "In-Game HUD",
        placeholder: "Health bars, minimaps, inventory, and on-screen information...",
      },
      {
        id: "accessibility",
        title: "Accessibility Features",
        placeholder: "Colorblind modes, subtitles, control remapping, difficulty options...",
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
      },
      {
        id: "pricing_strategy",
        title: "Pricing Strategy",
        placeholder: "Base price, editions, regional pricing, launch discounts...",
      },
      {
        id: "in_game_purchases",
        title: "In-Game Purchases",
        placeholder: "DLC, microtransactions, cosmetics, season passes...",
      },
      {
        id: "revenue_projections",
        title: "Revenue Projections",
        placeholder: "Expected sales, revenue targets, break-even analysis...",
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
      },
      {
        id: "target_channels",
        title: "Target Channels",
        placeholder: "Social media, influencers, press, events, advertising...",
      },
      {
        id: "community_building",
        title: "Community Building",
        placeholder: "Discord, forums, social engagement, beta programs...",
      },
      {
        id: "launch_plan",
        title: "Launch Plan",
        placeholder: "Pre-launch, launch day, and post-launch marketing activities...",
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
      },
      {
        id: "team_structure",
        title: "Team Structure",
        placeholder: "Team roles, responsibilities, and resource allocation...",
      },
      {
        id: "development_phases",
        title: "Development Phases",
        placeholder: "Pre-production, production, alpha, beta, launch phases...",
      },
      {
        id: "risk_assessment",
        title: "Risk Assessment",
        placeholder: "Potential risks, mitigation strategies, contingency plans...",
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
      },
      {
        id: "age_ratings",
        title: "Age Ratings",
        placeholder: "ESRB, PEGI, and other regional rating considerations...",
      },
      {
        id: "privacy_and_data",
        title: "Privacy & Data",
        placeholder: "GDPR, COPPA, data collection, privacy policies...",
      },
      {
        id: "platform_compliance",
        title: "Platform Compliance",
        placeholder: "Store requirements, certification processes, guidelines...",
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
