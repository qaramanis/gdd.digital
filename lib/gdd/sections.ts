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
        description:
          "A compelling hook that summarizes the main idea or theme.",
        instructions: `Write a compelling  sentence introduction that immediately captures what makes this game special. Start with a hook that conveys the core fantasy or experience. Use vivid, evocative language that makes readers want to learn more. Reference the game's genre and unique twist. This should read like an elevator pitch - concise but exciting.`,
      },
      {
        id: "game_concept_summary",
        title: "Game Concept Summary",
        placeholder:
          "Describe the genre, setting, and main objectives. What does the player do and why?",
        description:
          "Concise explanation covering genre, setting, and core objectives.",
        instructions: `Write a comprehensive yet focused summary of the game concept in 2 paragraphs. Cover: 1) The primary genre and any sub-genres, 2) The setting (time period, world type, atmosphere), 3) The main player objectives and what they're trying to achieve, 4) The core activities players engage in. Be specific about mechanics without going into excessive detail. This should give readers a clear mental picture of what playing this game looks and feels like.`,
      },
      {
        id: "target_audience",
        title: "Target Audience",
        placeholder:
          "Define your primary demographic: age range, interests, gaming habits, platforms they use...",
        description:
          "Identify the primary demographic and their characteristics.",
        instructions: `Define the target audience in 2 paragraphs. Include: 1) Primary age range and demographics, 2) Gaming experience level (casual, core, hardcore), 3) What other games they likely play (reference similar successful titles), 4) What appeals to them (competition, exploration, story, social features), 5) How they discover and purchase games. Be realistic and specific - avoid saying "everyone" as the target.`,
      },
      {
        id: "market_analysis",
        title: "Market Analysis",
        placeholder:
          "Analyze the market: competitors, your unique position, and how you'll differentiate...",
        description:
          "Competitors, market positioning, and differentiation strategy.",
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
        placeholder:
          "Provide a comprehensive overview of your game - what it is, what players do, and the core experience it delivers...",
        instructions: `Write a high-level description of the game in 2-3 paragraphs. Cover: 1) The central premise and what the game is about, 2) The primary experience players will have, 3) The setting, theme, and atmosphere, 4) What players are trying to achieve, 5) Why this game exists and what makes it worth playing. This should paint a complete picture of the game at a glance - comprehensive yet accessible.`,
      },
      {
        id: "core_gameplay_mechanics",
        title: "Core Gameplay Mechanics",
        placeholder:
          "Describe the fundamental mechanics players interact with - movement, actions, systems, and how they work together...",
        instructions: `Detail the core gameplay mechanics in 2-3 paragraphs. Cover: 1) The primary actions players can take and how they're performed, 2) The main systems players interact with (combat, exploration, building, etc.), 3) How these mechanics work together to create the gameplay loop, 4) What makes these mechanics satisfying and engaging, 5) Any innovative or unique mechanical twists. Be specific about how players interact with the game moment-to-moment.`,
      },
      {
        id: "unique_selling_points",
        title: "Unique Selling Points (USPs)",
        placeholder:
          "List 3-5 key features that make your game stand out from competitors and similar titles...",
        instructions: `List and explain 3-5 unique selling points, each in its own paragraph. For each USP: 1) State the feature or aspect clearly and concisely, 2) Explain why it's unique or innovative compared to similar games, 3) Describe the direct benefit to players, 4) Reference how it differentiates from competitors. These should be the features that would headline marketing materials - concrete, compelling, and clearly differentiated from the competition.`,
      },
      {
        id: "replayability",
        title: "Replayability",
        placeholder:
          "Explain what brings players back - procedural elements, multiple paths, unlockables, mastery curves...",
        instructions: `Describe the replayability factors in 2 paragraphs. Cover: 1) What motivates players to replay (new content, different outcomes, mastery), 2) Procedural or randomized elements that create variety, 3) Multiple paths, builds, or playstyles to explore, 4) Unlockables, achievements, or progression that spans sessions, 5) Long-term engagement hooks. Explain why players will return after completing the main content.`,
      },
      {
        id: "player_agency_and_choices",
        title: "Player Agency and Choices",
        placeholder:
          "Describe how players shape their experience - meaningful decisions, customization, branching paths...",
        instructions: `Detail player agency and choices in 2 paragraphs. Cover: 1) The meaningful decisions players make and their impact, 2) How players can customize or personalize their experience, 3) Branching narratives or multiple endings (if applicable), 4) Freedom vs. guidance balance in gameplay, 5) How player choices affect the game world or story. Show how players feel ownership over their experience and outcomes.`,
      },
    ],
  },
  {
    number: 3,
    slug: "storyline",
    title: "Storyline & Background",
    description:
      "Develop the narrative framework, characters, world, and storytelling methods that bring your game to life.",
    subSections: [
      {
        id: "background_story",
        title: "Background Story",
        placeholder:
          "Describe the history and events that set the stage for your game - what happened before the player arrives...",
        instructions: `Write the background story in 2 paragraphs. Cover: 1) The history of the world leading up to the game's events, 2) Key past events that shaped the current situation, 3) The state of the world when the game begins, 4) How this backstory creates context for the player's journey, 5) Any mysteries or secrets from the past that will be revealed. This is the foundation that gives meaning to the present-day narrative.`,
      },
      {
        id: "setting_and_atmosphere",
        title: "Setting and Atmosphere",
        placeholder:
          "Describe the game world's environment, mood, tone, and the feeling it evokes...",
        instructions: `Describe the setting and atmosphere in 2 paragraphs. Cover: 1) The type of world (fantasy, sci-fi, real-world, etc.) and its defining characteristics, 2) Key locations and their visual/emotional qualities, 3) The overall mood and tone (dark, hopeful, mysterious, etc.), 4) How the environment reflects or contrasts with the narrative themes, 5) Sensory details that immerse players in the world. Paint a vivid picture of what it feels like to exist in this world.`,
      },
      {
        id: "main_characters_motivation",
        title: "Main Characters and their Motivation",
        placeholder:
          "Introduce the key characters - who they are, what they want, and why they matter to the story...",
        instructions: `Introduce the main characters in 2-3 paragraphs. For each major character include: 1) Name, role, and basic description, 2) Their primary motivation and what drives them, 3) Their goals and what they're trying to achieve, 4) Their personality traits and how they present themselves, 5) Their relationship to the protagonist and story. Focus on what makes each character compelling and why players will care about them.`,
      },
      {
        id: "character_arcs_development",
        title: "Character Arcs and Development",
        placeholder:
          "Explain how characters grow and change throughout the story - their transformations and lessons learned...",
        instructions: `Detail character arcs in 2 paragraphs. Cover: 1) How the protagonist evolves from beginning to end, 2) Key moments that catalyze character growth, 3) Internal conflicts characters must overcome, 4) How supporting characters develop alongside the main story, 5) The emotional journey players experience through character development. Show how characters are transformed by the events of the game.`,
      },
      {
        id: "central_conflict",
        title: "Central Conflict",
        placeholder:
          "Define the main conflict driving the narrative - what forces oppose each other and what's at stake...",
        instructions: `Describe the central conflict in 2 paragraphs. Cover: 1) The primary opposing forces (protagonist vs. antagonist, order vs. chaos, etc.), 2) The nature of the conflict (physical, ideological, internal), 3) What's at stake if the conflict isn't resolved, 4) How the conflict escalates throughout the game, 5) Why this conflict matters to the player and characters. Make the stakes clear and compelling.`,
      },
      {
        id: "themes_and_motifs",
        title: "Themes and Motifs",
        placeholder:
          "Identify the deeper meanings, recurring symbols, and philosophical questions your story explores...",
        instructions: `Explore themes and motifs in 2 paragraphs. Cover: 1) The central themes the narrative explores (redemption, sacrifice, identity, etc.), 2) Recurring motifs and symbols that reinforce these themes, 3) The philosophical or emotional questions the story raises, 4) How gameplay mechanics reflect or reinforce themes, 5) What players should take away from the experience. Show the deeper meaning beneath the surface story.`,
      },
      {
        id: "plot_points_and_events",
        title: "Plot Points and Events",
        placeholder:
          "Outline the major story beats - inciting incident, rising action, climax, and resolution...",
        instructions: `Outline the plot structure in 2-3 paragraphs. Cover: 1) The inciting incident that starts the journey, 2) Major plot points and story beats in sequence, 3) Rising action and how tension builds, 4) The climax and its emotional impact, 5) Resolution and how the story concludes. Provide a clear narrative structure without excessive spoilers - enough to understand the story's shape and pacing.`,
      },
      {
        id: "branching_paths_and_choices",
        title: "Branching Paths and Choices",
        placeholder:
          "Describe player-driven narrative choices - how decisions affect the story, relationships, and endings...",
        instructions: `Detail branching narrative elements in 2 paragraphs. Cover: 1) Key decision points where players shape the story, 2) How choices affect character relationships and story outcomes, 3) Multiple endings and what determines them, 4) The balance between player agency and authored narrative, 5) Consequences that make choices feel meaningful. If the story is linear, explain why that serves the narrative better.`,
      },
      {
        id: "narrative_delivery",
        title: "Narrative Delivery",
        placeholder:
          "Explain how the story is told - cutscenes, dialogue, environmental storytelling, found documents...",
        instructions: `Describe narrative delivery methods in 2 paragraphs. Cover: 1) Primary storytelling methods (cutscenes, in-game dialogue, narration), 2) Environmental storytelling and world-building details, 3) Found documents, logs, or collectible lore, 4) How story is integrated with gameplay vs. separated from it, 5) Pacing of narrative reveals throughout the experience. Show how players will actually experience and absorb the story.`,
      },
    ],
  },
  {
    number: 4,
    slug: "gameplay-mechanics",
    title: "Gameplay Mechanics",
    description:
      "Document the core gameplay systems, controls, progression, and interactive elements that define player experience.",
    subSections: [
      {
        id: "general_mechanics",
        title: "General Mechanics",
        placeholder:
          "Describe the fundamental gameplay mechanics - the primary actions, systems, and gameplay loop that players interact with...",
        instructions: `Define the core mechanics in 2-3 paragraphs. Cover: 1) The primary cycle of actions players repeat (the gameplay loop), 2) The fundamental systems that drive moment-to-moment gameplay, 3) How these mechanics work together to create the core experience, 4) What makes these mechanics satisfying and engaging, 5) How mechanics support the game's core concept. This should clearly show what players spend most of their time doing.`,
      },
      // Dynamic subsections are rendered based on selected mechanics from the SuggestedMechanics component
      // The following subsections are commented out as they are now replaced by dynamic mechanic-based subsections:
      // {
      //   id: "controls",
      //   title: "Controls",
      //   placeholder:
      //     "Define the control schemes - how players physically interact with the game across different platforms...",
      //   instructions: `Describe controls in 2 paragraphs. Cover: 1) Primary control scheme for the main platform (button mappings, inputs), 2) Key actions and how they're performed, 3) Any unique or innovative control mechanics, 4) How controls differ across platforms (controller, keyboard/mouse, touch), 5) Control customization and accessibility options. Be specific about interaction patterns and responsiveness.`,
      // },
      // {
      //   id: "progression_systems",
      //   title: "Progression Systems",
      //   placeholder:
      //     "Explain how players grow and advance - leveling, unlocks, skill trees, upgrades...",
      //   instructions: `Detail progression systems in 2 paragraphs. Cover: 1) Character or player progression (levels, experience, stats), 2) Unlock systems (abilities, items, content), 3) Skill trees or upgrade paths, 4) Resource acquisition and spending, 5) How progression pacing maintains engagement. Show how players feel a sense of growth and advancement over time.`,
      // },
      // {
      //   id: "challenge_design",
      //   title: "Challenge Design",
      //   placeholder:
      //     "Describe how challenges are structured - difficulty curves, obstacles, skill tests, and learning...",
      //   instructions: `Describe challenge design in 2 paragraphs. Cover: 1) Types of challenges players face (combat, puzzles, skill tests), 2) How difficulty scales and progresses, 3) The learning curve and how players develop mastery, 4) Optional vs. required challenges, 5) How failure is handled and what players learn from it. Show how challenges create engagement without frustration.`,
      // },
      // {
      //   id: "balancing",
      //   title: "Balancing",
      //   placeholder:
      //     "Explain the approach to game balance - difficulty options, power curves, fair play...",
      //   instructions: `Describe balancing approach in 2 paragraphs. Cover: 1) Difficulty options and how they affect gameplay, 2) Power curves and how player strength scales, 3) Economy balance (resources, rewards, costs), 4) Competitive balance (if multiplayer), 5) Philosophy on player fairness and challenge. Address how the game remains engaging for different skill levels.`,
      // },
      // {
      //   id: "feedback_and_response",
      //   title: "Feedback and Response",
      //   placeholder:
      //     "Describe how the game communicates with players - visual, audio, and haptic feedback systems...",
      //   instructions: `Detail feedback systems in 2 paragraphs. Cover: 1) Visual feedback (animations, effects, UI responses), 2) Audio feedback (sound effects, music changes), 3) Haptic feedback (controller rumble, if applicable), 4) How feedback reinforces successful actions, 5) How feedback communicates failure or danger. Show how the game creates satisfying, responsive interactions.`,
      // },
      // {
      //   id: "emergent_gameplay",
      //   title: "Emergent Gameplay",
      //   placeholder:
      //     "Describe unscripted gameplay possibilities - system interactions, player creativity, unexpected strategies...",
      //   instructions: `Describe emergent gameplay in 2 paragraphs. Cover: 1) How game systems interact to create unplanned scenarios, 2) Opportunities for player creativity and experimentation, 3) Unexpected strategies or solutions the mechanics allow, 4) Sandbox elements or systemic interactions, 5) How emergence enhances replayability. Show how players can surprise themselves through play.`,
      // },
      // {
      //   id: "game_modes",
      //   title: "Game Modes",
      //   placeholder:
      //     "List and describe available game modes - campaign, multiplayer, challenges, custom modes...",
      //   instructions: `Describe game modes in 2 paragraphs. Cover: 1) Primary game mode (campaign, endless, etc.), 2) Additional modes (multiplayer, challenge modes, endless), 3) What makes each mode distinct, 4) How modes cater to different play styles, 5) Unlockable or post-game modes. Show the variety of ways players can experience the game.`,
      // },
    ],
  },
  {
    number: 5,
    slug: "level-design",
    title: "Level Design",
    description:
      "Plan the structure, challenges, enemies, and secrets within your game's levels and environments.",
    subSections: [
      {
        id: "stages_overview",
        title: "Overview of the Different Stages or Levels",
        placeholder:
          "Describe the different levels, stages, or areas in your game - their themes, settings, and purpose...",
        instructions: `Provide an overview of the game's levels in 2-3 paragraphs. Cover: 1) The total number and types of levels/stages, 2) Themes and visual identity of each major area, 3) How levels are organized (linear, branching, open), 4) The purpose each level serves in the overall experience, 5) How levels connect or transition. Give a high-level map of the player's journey through the game world.`,
      },
      {
        id: "objectives_layouts_challenges",
        title: "Objectives, Layouts, Obstacles and Challenges",
        placeholder:
          "Detail level objectives, physical layouts, obstacles players face, and challenges to overcome...",
        instructions: `Describe level design elements in 2-3 paragraphs. Cover: 1) Primary and secondary objectives within levels, 2) Typical level layouts and spatial design philosophy, 3) Types of obstacles (environmental hazards, locked doors, gaps), 4) Challenges that test player skills, 5) How layouts guide player movement and discovery. Show how levels are designed to create engaging gameplay spaces.`,
      },
      {
        id: "progression_difficulty_balancing",
        title: "Progression Curve and Difficulty Balancing",
        placeholder:
          "Explain how difficulty increases across levels - pacing, skill introduction, challenge escalation...",
        instructions: `Describe progression and difficulty in 2 paragraphs. Cover: 1) How difficulty ramps up across the game, 2) Introduction and mastery of new mechanics per level, 3) Pacing between intense and relaxed sections, 4) Checkpoints and save systems, 5) How the curve accommodates different skill levels. Show the designed experience from start to finish.`,
      },
      {
        id: "enemy_placement_ai",
        title: "Enemy Placement and A.I.",
        placeholder:
          "Describe enemy positioning strategy and AI behaviors - patrol patterns, aggression, tactics...",
        instructions: `Detail enemy design in 2 paragraphs. Cover: 1) Philosophy behind enemy placement in levels, 2) Enemy variety and when new types are introduced, 3) AI behaviors (patrol, pursuit, retreat, group tactics), 4) How enemy encounters are designed to challenge players, 5) Boss encounters and unique enemy scenarios. Show how enemies create dynamic and engaging challenges.`,
      },
      {
        id: "secrets_collectibles_easter_eggs",
        title: "Secrets, Collectibles and Easter Eggs",
        placeholder:
          "Describe hidden content - secret areas, collectible items, references, and rewards for exploration...",
        instructions: `Describe hidden content in 2 paragraphs. Cover: 1) Types of secrets and how they're hidden, 2) Collectible items and their rewards, 3) Easter eggs and references for attentive players, 4) How secrets encourage exploration and replayability, 5) Rewards for completionists. Show how hidden content adds depth and rewards curiosity.`,
      },
    ],
  },
  {
    number: 6,
    slug: "assets",
    title: "Assets",
    description:
      "Catalog all visual, audio, UI, and production assets needed to bring your game to life.",
    subSections: [
      {
        id: "character_environments_models",
        title: "Character Design, Environments and Models",
        placeholder:
          "Describe character designs, environment art, and 3D/2D model requirements...",
        instructions: `Describe character and environment assets in 1-2 paragraphs. Cover character model types (player, NPCs, enemies), environment art needs, level of detail requirements, and the scope of 3D/2D model production.`,
      },
      {
        id: "art_style_direction",
        title: "Art Style and Direction",
        placeholder:
          "Define the overall visual style, artistic vision, and direction for the game...",
        instructions: `Define the art style and direction in 1-2 paragraphs. Cover the overall visual style (realistic, stylized, pixel art), color palette, art direction principles, and how the style supports the game's mood and genre.`,
      },

      {
        id: "visual_assets_graphics",
        title: "Visual Assets - Graphics",
        placeholder:
          "List graphical assets - textures, sprites, effects, animations...",
        instructions: `Detail visual graphics assets in 1-2 paragraphs. Cover textures, sprites, particle effects, visual effects (VFX), animations, and any special graphical requirements for the game.`,
      },
      {
        id: "audio_assets",
        title: "Audio Assets",
        placeholder:
          "Define music, sound effects, voice acting, and ambient audio needs...",
        instructions: `Describe audio assets in 1-2 paragraphs. Cover music style and quantity, sound effects categories, voice acting requirements, ambient audio, and any dynamic audio systems needed.`,
      },
      {
        id: "ui_ux_assets",
        title: "UI/UX Assets",
        placeholder:
          "List user interface elements - buttons, icons, menus, HUD components...",
        instructions: `Detail UI/UX assets in 1-2 paragraphs. Cover menu designs, HUD elements, icons, buttons, fonts, and how UI assets align with the game's visual style and user experience goals.`,
      },
      {
        id: "concept_art",
        title: "Concept Art",
        placeholder:
          "Describe concept art needs - characters, environments, props, key scenes...",
        instructions: `Outline concept art requirements in 1-2 paragraphs. Cover what needs concept art (characters, environments, key items), the purpose of concept art in production, and how it guides final asset creation.`,
      },
      {
        id: "asset_pipeline",
        title: "Asset Pipeline",
        placeholder:
          "Explain the workflow for creating assets - from concept to implementation...",
        instructions: `Describe the asset pipeline in 1-2 paragraphs. Cover the workflow from concept to final asset, tools and software used, file formats, and how assets move from creation to integration in the game.`,
      },
      {
        id: "asset_management",
        title: "Asset Management",
        placeholder:
          "Define how assets are organized, versioned, and stored...",
        instructions: `Detail asset management in 1-2 paragraphs. Cover folder structures, naming conventions, version control, asset databases, and how the team organizes and tracks assets throughout development.`,
      },
      {
        id: "external_resources",
        title: "External Resources",
        placeholder:
          "List third-party assets, licensed content, and external asset sources...",
        instructions: `Describe external resources in 1-2 paragraphs. Cover third-party asset packs, licensed content, stock resources, outsourced work, and any external assets that will be used in the game.`,
      },
      {
        id: "localization_assets",
        title: "Localization Assets",
        placeholder:
          "Define assets needed for localization - translated text, regional audio, cultural adaptations...",
        instructions: `Detail localization assets in 1-2 paragraphs. Cover text localization needs, voiceover translations, region-specific assets, and how assets are structured to support multiple languages and regions.`,
      },
      {
        id: "qa_assets",
        title: "Quality Assurance (QA) Assets",
        placeholder:
          "List assets for testing - debug tools, test builds, QA documentation...",
        instructions: `Describe QA assets in 1-2 paragraphs. Cover debug tools, test assets, placeholder content, QA builds, and any special assets created specifically for testing and quality assurance purposes.`,
      },
      {
        id: "storyboarding",
        title: "Storyboarding",
        placeholder:
          "Describe storyboard needs - cutscenes, key moments, narrative sequences...",
        instructions: `Outline storyboarding requirements in 1-2 paragraphs. Cover what scenes need storyboards, the level of detail required, how storyboards guide cutscene and cinematic production.`,
      },
      {
        id: "mood_boards",
        title: "Mood Boards",
        placeholder:
          "Define mood boards - visual references, tone inspiration, aesthetic guides...",
        instructions: `Describe mood board needs in 1-2 paragraphs. Cover what mood boards exist or are needed, the visual references and inspirations they contain, and how they guide the overall aesthetic direction.`,
      },
    ],
  },
  {
    number: 7,
    slug: "technical-features",
    title: "Technical Features",
    description:
      "Outline the technical requirements, platforms, engine, networking, and performance specifications.",
    subSections: [
      {
        id: "platforms_technologies",
        title: "Platforms and Technologies",
        placeholder:
          "Define target platforms, hardware requirements, and core technologies used...",
        instructions: `Describe platforms and technologies in 2 paragraphs. Cover: 1) Target platforms at launch and post-launch (PC, console, mobile), 2) Minimum and recommended system specifications, 3) Core technologies and frameworks used, 4) Platform-specific features or limitations, 5) Storage and download size targets. Be realistic about technical constraints and platform requirements.`,
      },
      {
        id: "engine_choice",
        title: "Engine Choice",
        placeholder:
          "Describe the game engine selection, rationale, and key engine features utilized...",
        instructions: `Detail the engine choice in 2 paragraphs. Cover: 1) The selected game engine and why it was chosen, 2) Key engine features being utilized, 3) Custom tools or extensions built on top of the engine, 4) Middleware and third-party integrations, 5) Version control and collaboration tools. If building a custom engine, explain the rationale and architecture.`,
      },
      {
        id: "networking_multiplayer",
        title: "Networking and Multiplayer Requirements",
        placeholder:
          "Define online features, multiplayer modes, server architecture, and connectivity needs...",
        instructions: `Describe networking requirements in 2 paragraphs. Cover: 1) Single-player vs. multiplayer (or both), 2) Multiplayer modes, player counts, and matchmaking, 3) Server architecture (dedicated, P2P, cloud-based), 4) Online services (leaderboards, cloud saves, achievements), 5) Latency and connection requirements. If single-player only, explain any online service integrations.`,
      },
      {
        id: "performance_optimization",
        title: "Performance Considerations and Optimization",
        placeholder:
          "Define performance targets, optimization strategies, and resource management...",
        instructions: `Detail performance considerations in 2 paragraphs. Cover: 1) Target frame rate and resolution per platform, 2) Loading time goals and streaming strategies, 3) Memory and CPU/GPU optimization priorities, 4) LOD systems and culling strategies, 5) Profiling approach and performance budgets. Set realistic expectations for technical performance across target hardware.`,
      },
      {
        id: "debugging_profiling",
        title: "Debugging and Profiling Tools",
        placeholder:
          "List tools for debugging, profiling, testing, and quality assurance...",
        instructions: `Describe debugging and profiling tools in 2 paragraphs. Cover: 1) In-engine debugging and logging tools, 2) Performance profiling tools (CPU, GPU, memory), 3) Crash reporting and analytics systems, 4) Testing frameworks and automation, 5) Development builds and debug features. Show how the team identifies and resolves technical issues.`,
      },
      {
        id: "input_control",
        title: "Input and Control",
        placeholder:
          "Define input systems, controller support, and platform-specific input handling...",
        instructions: `Detail input and control systems in 2 paragraphs. Cover: 1) Supported input devices (keyboard/mouse, controller, touch, motion), 2) Platform-specific input requirements, 3) Input remapping and accessibility options, 4) Haptic feedback and rumble support, 5) Input latency considerations. Ensure all target platforms have appropriate input support.`,
      },
    ],
  },
  {
    number: 8,
    slug: "user-interface",
    title: "User Interface (UI)",
    description:
      "Design the menus, HUD, navigation, and all user experience elements of your game.",
    subSections: [
      {
        id: "main_menu",
        title: "Main Menu",
        placeholder:
          "Describe the main menu structure, options, and visual presentation...",
        instructions: `Describe the main menu in 2 paragraphs. Cover: 1) Main menu layout and visual design, 2) Available options (New Game, Continue, Options, etc.), 3) Background visuals, animations, or interactive elements, 4) Navigation flow and button hierarchy, 5) Any unique presentation features. Show how players are welcomed into the game.`,
      },
      {
        id: "in_game_huds",
        title: "In-Game HUDs",
        placeholder:
          "Define the heads-up display elements - health, ammo, objectives, status indicators...",
        instructions: `Describe the in-game HUD in 2 paragraphs. Cover: 1) Core HUD elements always visible (health, resources, etc.), 2) Contextual UI that appears when needed, 3) How information is prioritized and displayed, 4) HUD positioning and screen layout, 5) How HUD adapts to different gameplay situations. Focus on clarity and player information needs.`,
      },
      {
        id: "inventory_equipment",
        title: "Inventory and Equipment Management",
        placeholder:
          "Describe inventory systems, equipment screens, item management interfaces...",
        instructions: `Detail inventory and equipment UI in 2 paragraphs. Cover: 1) Inventory layout and organization, 2) Equipment and loadout management screens, 3) Item comparison and stat displays, 4) Sorting, filtering, and search features, 5) How players interact with items (equip, use, drop, craft). Show how players manage their in-game possessions.`,
      },
      {
        id: "dialogue_interaction",
        title: "Dialogue and Interaction Prompts",
        placeholder:
          "Define dialogue boxes, NPC interactions, choice prompts, and contextual actions...",
        instructions: `Describe dialogue and interaction UI in 2 paragraphs. Cover: 1) Dialogue box design and text presentation, 2) Character portraits or speaker indicators, 3) Choice/response selection interfaces, 4) Contextual interaction prompts (press X to interact), 5) How conversations flow and can be navigated. Show how players communicate with the game world.`,
      },
      {
        id: "map_navigation",
        title: "Map and Navigation",
        placeholder:
          "Describe map screens, minimaps, waypoints, and navigation aids...",
        instructions: `Detail map and navigation UI in 2 paragraphs. Cover: 1) World/area map design and functionality, 2) Minimap or compass systems, 3) Waypoints, markers, and objective indicators, 4) Fast travel or location selection, 5) Map legends and points of interest. Show how players orient themselves and navigate the game world.`,
      },
      {
        id: "settings_options",
        title: "Settings and Options Menu",
        placeholder:
          "Define settings categories - graphics, audio, controls, gameplay options...",
        instructions: `Describe settings and options in 2 paragraphs. Cover: 1) Settings categories (Graphics, Audio, Controls, Gameplay), 2) Key options available in each category, 3) Preset options vs. granular controls, 4) How settings are saved and applied, 5) Reset to defaults and profile management. Ensure players can customize their experience.`,
      },
      {
        id: "loading_progress",
        title: "Loading Screens and Progress Indicators",
        placeholder:
          "Describe loading screen design, progress bars, tips, and transition screens...",
        instructions: `Detail loading screens in 2 paragraphs. Cover: 1) Loading screen visual design and branding, 2) Progress indicators (bars, spinners, percentages), 3) Loading tips, lore, or hints displayed, 4) Transition animations between areas, 5) How loading is minimized or hidden. Show how wait times are made engaging or informative.`,
      },
      {
        id: "help_feature",
        title: "Help Feature",
        placeholder:
          "Define in-game help systems - tutorials, tooltips, guides, control references...",
        instructions: `Describe help features in 2 paragraphs. Cover: 1) Tutorial systems and onboarding, 2) Tooltips and contextual help, 3) In-game manual or guide access, 4) Control reference screens, 5) Hint systems for stuck players. Show how new players learn and how all players can find assistance.`,
      },
      {
        id: "accessibility_features",
        title: "Accessibility Features",
        placeholder:
          "Define accessibility options - colorblind modes, subtitles, control remapping, assists...",
        instructions: `Describe accessibility features in 2 paragraphs. Cover: 1) Visual accessibility (colorblind modes, text size, contrast), 2) Audio accessibility (subtitles, visual cues for sounds), 3) Motor accessibility (control remapping, assist modes, one-handed play), 4) Cognitive accessibility (difficulty options, simplified UI modes), 5) Commitment to accessibility standards. Show inclusivity in design.`,
      },
    ],
  },
  {
    number: 9,
    slug: "monetization",
    title: "Monetization Strategy",
    description:
      "Plan your revenue model, in-game economy, purchases, and player retention strategies.",
    subSections: [
      {
        id: "business_model",
        title: "Business Model",
        placeholder:
          "Define the core revenue model - premium, F2P, subscription, hybrid...",
        instructions: `Define the business model in 2 paragraphs. Cover: 1) Primary revenue model (premium, free-to-play, subscription, hybrid), 2) Rationale for this choice given the game and target audience, 3) How the model affects game design decisions, 4) Comparison to similar successful games, 5) Long-term sustainability and revenue projections. Be strategic and realistic about monetization.`,
      },
      {
        id: "virtual_currency_economy",
        title: "Virtual Currency and Economy",
        placeholder:
          "Design in-game currencies, earning rates, spending sinks, and economic balance...",
        instructions: `Describe the virtual economy in 2 paragraphs. Cover: 1) Types of in-game currencies (soft currency, premium currency), 2) How players earn currency through gameplay, 3) Currency sinks and spending opportunities, 4) Exchange rates and premium currency pricing, 5) Economic balance to maintain engagement without frustration. Create a fair and engaging economy.`,
      },
      {
        id: "in_game_store",
        title: "In-Game Store and Purchasable Items",
        placeholder:
          "Define store structure, item categories, pricing tiers, and purchase flow...",
        instructions: `Detail the in-game store in 2 paragraphs. Cover: 1) Store layout and navigation, 2) Categories of purchasable items (cosmetics, boosters, content), 3) Pricing tiers and value perception, 4) Limited-time offers and promotions, 5) How purchases are presented without being intrusive. Balance revenue goals with player experience.`,
      },
      {
        id: "advertising_integration",
        title: "Advertising Integration",
        placeholder:
          "Plan ad placements, formats, frequency, and opt-in rewards...",
        instructions: `Describe advertising integration in 2 paragraphs. Cover: 1) Types of ads (rewarded video, interstitial, banner), 2) Ad placement and timing, 3) Opt-in vs. forced ad experiences, 4) Rewards for watching ads, 5) Ad network partnerships and revenue expectations. If no ads, explain the rationale. Ensure ads don't harm player experience.`,
      },
      {
        id: "retention_strategies",
        title: "Retention Strategies",
        placeholder:
          "Design systems to keep players engaged - daily rewards, events, battle passes...",
        instructions: `Detail retention strategies in 2 paragraphs. Cover: 1) Daily login rewards and streaks, 2) Seasonal events and limited-time content, 3) Battle passes or subscription perks, 4) Social features that encourage return, 5) Re-engagement campaigns for lapsed players. Create reasons for players to return day after day.`,
      },
      {
        id: "regulatory_compliance",
        title: "Regulatory Compliance",
        placeholder:
          "Address legal requirements - loot box disclosures, age ratings, regional regulations...",
        instructions: `Describe regulatory compliance in 2 paragraphs. Cover: 1) Loot box and randomized purchase disclosures, 2) Age rating implications of monetization, 3) Regional regulations (Belgium, Netherlands, China, etc.), 4) Refund policies and consumer protection, 5) Parental controls and spending limits. Ensure monetization is legally compliant and ethically sound.`,
      },
    ],
  },
  {
    number: 10,
    slug: "marketing",
    title: "Marketing & Promotion",
    description:
      "Define your marketing approach, brand identity, audience targeting, and launch strategy.",
    subSections: [
      {
        id: "target_audience_demographics",
        title: "Target Audience and Demographics",
        placeholder:
          "Define your primary and secondary audiences - age, interests, gaming habits, platforms...",
        instructions: `Define the target audience in 3-5 paragraphs. Cover: 1) Primary demographic profiles (age, gender, location, income), 2) Gaming habits and platform preferences, 3) Psychographic traits (interests, values, lifestyle), 4) Secondary audiences and their characteristics, 5) How to reach and appeal to each segment, 6) Competitor audience analysis, 7) Market size and growth potential. Be specific and data-driven about who will play and buy this game.`,
      },
      {
        id: "brand_identity_messaging",
        title: "Brand Identity and Messaging",
        placeholder:
          "Define the game's brand - visual identity, tone of voice, key messages, positioning...",
        instructions: `Describe brand identity and messaging in 3-5 paragraphs. Cover: 1) Core brand values and personality, 2) Visual identity (logo, colors, typography), 3) Tone of voice and communication style, 4) Key marketing messages and taglines, 5) Unique value proposition, 6) How the brand differentiates from competitors, 7) Brand consistency across all touchpoints. Create a memorable and cohesive brand presence.`,
      },
      {
        id: "marketing_goals_objectives",
        title: "Marketing Goals and Objectives",
        placeholder:
          "Set measurable marketing goals - awareness, wishlists, conversions, engagement targets...",
        instructions: `Define marketing goals in 3-5 paragraphs. Cover: 1) Primary marketing objectives (awareness, acquisition, retention), 2) Specific measurable targets (wishlist numbers, social followers, conversion rates), 3) Key performance indicators (KPIs) and how they'll be tracked, 4) Timeline for achieving goals, 5) Budget allocation and resource requirements, 6) Success criteria and benchmarks, 7) How goals align with overall business objectives.`,
      },
      {
        id: "public_relations",
        title: "Public Relations (PR)",
        placeholder:
          "Plan PR activities - press outreach, media coverage, influencer partnerships, events...",
        instructions: `Describe the PR strategy in 3-5 paragraphs. Cover: 1) Press and media outreach approach, 2) Key gaming outlets and journalists to target, 3) Press kit and asset preparation, 4) Influencer and content creator partnerships, 5) Event participation (conventions, showcases, awards), 6) Crisis communication planning, 7) PR timeline aligned with development milestones. Build credibility and generate buzz through earned media.`,
      },
      {
        id: "community_engagement",
        title: "Community Engagement",
        placeholder:
          "Plan community building - Discord, social media, forums, player feedback loops...",
        instructions: `Detail community engagement in 3-5 paragraphs. Cover: 1) Primary community platforms (Discord, Reddit, forums), 2) Social media strategy and content calendar, 3) Community management approach and tone, 4) Player feedback collection and integration, 5) Community events and activities, 6) Beta testing and early access programs, 7) Building advocates and word-of-mouth. Turn players into a passionate, engaged community.`,
      },
      {
        id: "launch_strategy",
        title: "Launch Strategy",
        placeholder:
          "Plan the launch - pre-launch activities, launch day, promotional campaigns, partnerships...",
        instructions: `Describe the launch strategy in 3-5 paragraphs. Cover: 1) Pre-launch marketing timeline and activities, 2) Launch day plans and events, 3) Promotional campaigns and advertising, 4) Platform partnerships and featuring opportunities, 5) Launch pricing and promotional offers, 6) Coordinated content creator coverage, 7) Launch metrics and real-time response plans. Create maximum impact at launch.`,
      },
      {
        id: "post_launch_support",
        title: "Post-Launch Support and Updates",
        placeholder:
          "Plan ongoing support - content updates, patches, DLC roadmap, community communication...",
        instructions: `Detail post-launch plans in 3-5 paragraphs. Cover: 1) Post-launch content roadmap (updates, DLC, expansions), 2) Patch and bug fix communication, 3) Ongoing community engagement and support, 4) Player retention strategies, 5) Long-term marketing and re-engagement campaigns, 6) Analytics and player behavior monitoring, 7) End-of-life planning if applicable. Keep players engaged and the game alive long after launch.`,
      },
    ],
  },
  {
    number: 11,
    slug: "development-plan",
    title: "Development Plan",
    description:
      "Create the project timeline, development phases, resource allocation, and risk management strategy.",
    subSections: [
      {
        id: "project_overview",
        title: "Project Overview",
        placeholder:
          "Summarize the project scope, goals, team size, and overall development approach...",
        instructions: `Provide a project overview in 2 paragraphs. Cover: 1) Project scope and high-level goals, 2) Team size and composition, 3) Development methodology (agile, waterfall, hybrid), 4) Tools and infrastructure, 5) Key success criteria for the project.`,
      },
      {
        id: "timeline_milestones",
        title: "Timeline and Milestones",
        placeholder:
          "Define the overall timeline, major milestones, and key deliverable dates...",
        instructions: `Outline timeline and milestones in 2 paragraphs. Cover: 1) Overall development duration, 2) Major milestones and their target timing, 3) Key deliverables at each milestone, 4) Dependencies and critical path items, 5) Buffer time and schedule flexibility.`,
      },
      {
        id: "pre_production_phase",
        title: "Pre-Production Phase",
        placeholder:
          "Describe pre-production activities - prototyping, documentation, concept validation...",
        instructions: `Detail the pre-production phase in 2 paragraphs. Cover: 1) Concept development and validation, 2) Prototyping and proof of concept, 3) Documentation and design specifications, 4) Art and audio direction establishment, 5) Team assembly and tool setup.`,
      },
      {
        id: "production_phase",
        title: "Production Phase",
        placeholder:
          "Describe the main production phase - asset creation, feature development, integration...",
        instructions: `Detail the production phase in 2 paragraphs. Cover: 1) Core feature development priorities, 2) Asset creation pipeline and workflow, 3) Integration and build processes, 4) Sprint or milestone structure, 5) Quality gates and review processes.`,
      },
      {
        id: "alpha_beta_testing",
        title: "Alpha and Beta Testing",
        placeholder:
          "Plan alpha and beta phases - testing scope, participant selection, feedback integration...",
        instructions: `Describe alpha and beta testing in 2 paragraphs. Cover: 1) Alpha phase goals and scope, 2) Beta testing approach (closed, open, early access), 3) Tester recruitment and management, 4) Feedback collection and prioritization, 5) Bug tracking and resolution process.`,
      },
      {
        id: "polishing_optimization",
        title: "Polishing and Optimization",
        placeholder:
          "Plan the polish phase - bug fixing, performance optimization, final tuning...",
        instructions: `Detail polishing and optimization in 2 paragraphs. Cover: 1) Bug fixing priorities and certification preparation, 2) Performance optimization targets, 3) Balance tuning and player experience refinement, 4) Localization and accessibility finalization, 5) Launch readiness criteria.`,
      },
      {
        id: "post_launch_support",
        title: "Post-Launch Support",
        placeholder:
          "Plan post-launch activities - patches, updates, community support, content roadmap...",
        instructions: `Describe post-launch support in 2 paragraphs. Cover: 1) Day-one patch and hotfix planning, 2) Ongoing update and content schedule, 3) Community support and communication, 4) Live operations team structure, 5) Long-term support commitment and end-of-life planning.`,
      },
      {
        id: "risk_management_contingency",
        title: "Risk Management and Contingency",
        placeholder:
          "Identify project risks and mitigation strategies - technical, schedule, resource risks...",
        instructions: `Address risk management in 2 paragraphs. Cover: 1) Key technical risks and mitigation, 2) Schedule and scope risks, 3) Resource and team risks, 4) External risks (market, competition, platform), 5) Contingency plans and escalation procedures.`,
      },
      {
        id: "resource_allocation_budget",
        title: "Resource Allocation and Budget Management",
        placeholder:
          "Plan resource distribution and budget - team allocation, outsourcing, financial tracking...",
        instructions: `Detail resource and budget management in 2 paragraphs. Cover: 1) Team allocation across phases and disciplines, 2) Outsourcing strategy and vendor management, 3) Budget breakdown by category, 4) Financial tracking and reporting, 5) Cost control measures and approval processes.`,
      },
    ],
  },
  {
    number: 12,
    slug: "legal",
    title: "Legal & Compliance",
    description:
      "Address intellectual property, privacy, ratings, and regulatory compliance requirements.",
    subSections: [
      {
        id: "intellectual_property_rights",
        title: "Intellectual Property (IP) Rights",
        placeholder:
          "Define IP ownership, trademarks, copyrights, patents, and licensing agreements...",
        instructions: `Address IP rights in 2 paragraphs. Cover: 1) Original IP ownership and protection strategy, 2) Trademark registration for game name, logo, and branding, 3) Copyright considerations for code, art, and music, 4) Third-party asset licensing and attribution requirements, 5) Patent considerations if applicable.`,
      },
      {
        id: "privacy_data_protection",
        title: "Privacy and Data Protection",
        placeholder:
          "Plan data collection, storage, privacy policies, and compliance with GDPR, COPPA...",
        instructions: `Detail privacy and data protection in 2 paragraphs. Cover: 1) Types of data collected and purposes, 2) GDPR compliance for European users, 3) COPPA compliance if targeting children under 13, 4) Data storage, security, and retention policies, 5) Privacy policy and user consent mechanisms.`,
      },
      {
        id: "age_rating_classification",
        title: "Age Rating and Content Classification",
        placeholder:
          "Plan for ESRB, PEGI, and other regional ratings - content considerations and target ratings...",
        instructions: `Describe age rating plans in 2 paragraphs. Cover: 1) Target age rating and rationale, 2) Content elements affecting ratings (violence, language, themes), 3) Regional rating boards (ESRB, PEGI, USK, CERO, etc.), 4) Content modifications for different regions if needed, 5) Rating submission timeline and process.`,
      },
      {
        id: "terms_of_service_eula",
        title: "Terms of Service and End User License Agreements (EULAs)",
        placeholder:
          "Define user agreements, license terms, liability limitations, and dispute resolution...",
        instructions: `Detail ToS and EULA requirements in 2 paragraphs. Cover: 1) Key terms and conditions for users, 2) License grant and usage restrictions, 3) Liability limitations and disclaimers, 4) Dispute resolution and governing law, 5) User-generated content policies if applicable.`,
      },
      {
        id: "industry_standards_regulations",
        title: "Compliance with Industry Standards and Regulations",
        placeholder:
          "Address platform requirements, accessibility laws, consumer protection, and industry guidelines...",
        instructions: `Describe compliance requirements in 2 paragraphs. Cover: 1) Platform certification requirements (Steam, PlayStation, Xbox, Nintendo, App Stores), 2) Accessibility regulations and guidelines, 3) Consumer protection laws and refund policies, 4) Advertising and marketing regulations, 5) Regional regulations and market-specific requirements.`,
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
    next:
      currentIndex < GDD_SECTIONS.length - 1
        ? GDD_SECTIONS[currentIndex + 1]
        : undefined,
  };
}

// Helper to get a specific subsection with its instructions
export function getSubSection(
  sectionSlug: string,
  subSectionId: string,
): GDDSubSection | undefined {
  const section = getSection(sectionSlug);
  return section?.subSections.find((sub) => sub.id === subSectionId);
}
