export interface Mechanic {
  name: string;
  description: string;
}

export interface MechanicCategory {
  category: string;
  mechanics: Mechanic[];
}

export interface GenreMechanics {
  genre: string;
  categories: MechanicCategory[];
}

export const gameMechanics: GenreMechanics[] = [
  {
    genre: "action",
    categories: [
      {
        category: "Physics",
        mechanics: [
          { name: "Movement Physics", description: "Realistic or arcade-style character movement with momentum and acceleration" },
          { name: "Shooting Mechanics", description: "Projectile physics, bullet drop, recoil patterns, and hit detection" },
          { name: "Jumping Physics", description: "Gravity, jump height, double jumps, and air control" },
          { name: "Collision Detection", description: "Character and object interactions with the environment" },
          { name: "Ragdoll Physics", description: "Realistic body reactions to impacts and falls" },
        ],
      },
      {
        category: "Economy",
        mechanics: [
          { name: "Power-ups", description: "Temporary boosts like speed, strength, or invincibility" },
          { name: "Collectables", description: "Items scattered throughout levels for bonus points or unlocks" },
          { name: "Points System", description: "Score tracking based on performance, kills, or objectives" },
          { name: "Lives System", description: "Limited attempts before game over, with extra lives as rewards" },
          { name: "Health Pickups", description: "Items that restore player health during gameplay" },
        ],
      },
      {
        category: "Progression",
        mechanics: [
          { name: "Predesigned Levels", description: "Hand-crafted stages with increasing difficulty and complexity" },
          { name: "Storyline Progression", description: "Narrative goals that drive the player through the game" },
          { name: "Boss Battles", description: "Challenging encounters at the end of levels or story arcs" },
          { name: "Difficulty Scaling", description: "Gradually harder enemies, obstacles, and challenges" },
          { name: "Checkpoint System", description: "Save points within levels to reduce repetition on death" },
        ],
      },
    ],
  },
  {
    genre: "strategy",
    categories: [
      {
        category: "Physics",
        mechanics: [
          { name: "Simple Movement Physics", description: "Basic movement mechanics for units across terrain" },
          { name: "Combat Physics", description: "Simplified physics for unit attacks and interactions" },
          { name: "Pathfinding", description: "Unit navigation around obstacles and terrain" },
          { name: "Collision Handling", description: "Basic collision detection between units and structures" },
        ],
      },
      {
        category: "Economy",
        mechanics: [
          { name: "Unit Building", description: "Constructing and training various unit types from resources" },
          { name: "Resource Harvesting", description: "Gathering raw materials like gold, wood, or minerals" },
          { name: "Unit Upgrading", description: "Improving unit stats, abilities, and equipment" },
          { name: "Combat Risk", description: "Risking units in battle with potential for loss or reward" },
          { name: "Resource Trading", description: "Exchanging resources between players or with the market" },
        ],
      },
      {
        category: "Progression",
        mechanics: [
          { name: "Scenario Challenges", description: "Predefined missions with unique objectives and constraints" },
          { name: "Campaign Mode", description: "Sequential scenarios forming a larger narrative" },
          { name: "Difficulty Tiers", description: "Increasing challenge levels across scenarios" },
          { name: "Unlockable Content", description: "New units, factions, or maps earned through progression" },
        ],
      },
      {
        category: "Tactical Maneuvering",
        mechanics: [
          { name: "Unit Positioning", description: "Placing units strategically for offensive or defensive advantage" },
          { name: "Flanking", description: "Attacking enemies from the side or rear for bonus damage" },
          { name: "High Ground Advantage", description: "Leveraging terrain elevation for combat bonuses" },
          { name: "Chokepoint Control", description: "Defending narrow passages to maximize defensive strength" },
          { name: "Formation Tactics", description: "Arranging units in formations for synergistic effects" },
        ],
      },
      {
        category: "Social Interaction",
        mechanics: [
          { name: "Coordinated Actions", description: "Synchronizing attacks or strategies with allied players" },
          { name: "Alliance System", description: "Forming formal alliances with shared goals and resources" },
          { name: "Player Competition", description: "Competitive play against other players for rankings or territory" },
          { name: "Diplomacy", description: "Negotiating treaties, truces, and trade agreements" },
          { name: "Team Objectives", description: "Collaborative goals requiring multiple players to achieve" },
        ],
      },
    ],
  },
  {
    genre: "rpg",
    categories: [
      {
        category: "Physics",
        mechanics: [
          { name: "Skill Trees", description: "Branching ability upgrades for character customization" },
          { name: "Attribute System", description: "Core stats like strength, intelligence, and agility" },
          { name: "Class System", description: "Predefined character archetypes with unique abilities" },
          { name: "Conflict System", description: "Simple system to resolve movement and conflict, often turn-based" },
        ],
      },
      {
        category: "Economy",
        mechanics: [
          { name: "Equipment System", description: "Strategic battles with alternating turns" },
          { name: "Experience Points", description: "Earned through combat and quests to level up" },
          { name: "Customization", description: "Options to customize a character or party" },
        ],
      },
      {
        category: "Progression",
        mechanics: [
          { name: "Main Quest Line", description: "Primary narrative driving the game forward" },
          { name: "Side Quests", description: "Optional missions for rewards and world-building" },
          { name: "Purpose and Goals", description: "Storyline and quests to guide the player" },
        ],
      },
      {
        category: "Tactical Maneuvering",
        mechanics: [
          { name: "Party Tactics", description: "Strategies for combat and exploration" },
        ],
      },
      {
        category: "Social Interaction",
        mechanics: [
          { name: "Play-acting", description: "Role-playing and interaction with NPCs" },
        ],
      },
    ],
  },
  {
    genre: "sports",
    categories: [
      {
        category: "Physics",
        mechanics: [
          { name: "Detailed Simulation", description: "Advanced physics engine for realistic gameplay" },
          { name: "Realistic Physics", description: "Ball physics, player momentum, and collision" },
          { name: "Player Controls", description: "Movement, passing, shooting, and special moves" },
          { name: "AI Teammates", description: "Computer-controlled players with positioning and decision-making" },
          { name: "Stamina System", description: "Energy management affecting player performance" },
        ],
      },
      {
        category: "Economy",
        mechanics: [
          { name: "Roster Management", description: "Selecting and organizing team lineups" },
          { name: "Player Stats", description: "Individual attributes affecting performance" },
          { name: "Training System", description: "Improving player abilities over time" },
          { name: "Transfer Market", description: "Buying and selling players between teams" },
        ],
      },
      {
        category: "Progression",
        mechanics: [
          { name: "Team Management", description: "Managing team finances, roster, and strategy" },
          { name: "Season Mode", description: "Playing through a full competitive season" },
          { name: "Tournament Brackets", description: "Knockout-style competition structure" },
          { name: "League Tables", description: "Point-based standings and rankings" },
          { name: "Multiplayer Matches", description: "Local or online competitive play" },
        ],
      },
      {
        category: "Tactical Maneuvering",
        mechanics: [
          { name: "Team Tactics", description: "Developing and executing strategies for team play" },
        ],
      },
    ],
  },
  {
    genre: "vehicle-simulation",
    categories: [
      {
        category: "Physics",
        mechanics: [
          { name: "Detailed Simulation", description: "Accurate representation of real-world physics principles" },
          { name: "Realistic Handling", description: "Weight transfer, traction, and suspension simulation" },
          { name: "Damage Model", description: "Visual and mechanical damage affecting performance" },
          { name: "Weather Effects", description: "Rain, snow, and wind affecting vehicle behavior" },
        ],
      },
      {
        category: "Economy",
        mechanics: [
          { name: "Vehicle Tuning", description: "Vehicle tuning between missions" },
          { name: "Fuel & Wear", description: "Resource management for tires, fuel, and parts" },
          { name: "Track Design", description: "Circuit layouts with turns, straights, and elevation" },
          { name: "Drafting & Slipstream", description: "Aerodynamic advantages from following other vehicles" },
          { name: "Pit Stops", description: "Strategic maintenance breaks during races" },
        ],
      },
      {
        category: "Progression",
        mechanics: [
          { name: "Missions", description: "Challenges and objectives to unlock new content" },
          { name: "Races", description: "Competitive races with varying difficulty levels" },
          { name: "Challenges", description: "Competitive challenges with varying difficulty levels" },
          { name: "Competitions", description: "Competitive events with varying difficulty levels" },
          { name: "Tournaments", description: "Tournament-style competitions" },
        ],
      },
    ],
  },
  {
    genre: "management-simulation",
    categories: [
      {
        category: "Economy",
        mechanics: [
          { name: "Resource Management", description: "Managing resources to meet needs and generate income" },
          { name: "Pricing Strategy", description: "Setting prices for goods or services" },
          { name: "Investment System", description: "Spending money to generate future returns" },
          { name: "Economy Building", description: "Building and managing an economy" },
        ],
      },
      {
        category: "Progression",
        mechanics: [
          { name: "Scenarios", description: "Scenarios to provide new sets of challenges" },
          { name: "Facility Building", description: "Constructing and placing buildings and infrastructure" },
          { name: "Staff Management", description: "Hiring, training, and assigning employees" },
          { name: "Production Chains", description: "Managing manufacturing and service delivery" },
          { name: "Logistics", description: "Transportation and distribution of goods" },
        ],
      },
    ],
  },
  {
    genre: "adventure",
    categories: [
      {
        category: "Economy",
        mechanics: [
          { name: "Inventory System", description: "Managing a player's inventory including items and tools" },
          { name: "Open World", description: "Large, freely explorable environments" },
          { name: "Fast Travel", description: "Quick transportation between discovered locations" },
          { name: "Hidden Secrets", description: "Concealed areas, items, and easter eggs" },
          { name: "Environmental Storytelling", description: "Narrative conveyed through world details" },
        ],
      },
      {
        category: "Progression",
        mechanics: [
          { name: "Storyline", description: "Story to drive game progression" },
          { name: "Locks and Keys", description: "Locks and Keys to control player progress" },
          { name: "Side Quests", description: "Optional quests that enhance gameplay but are not required" },
        ],
      },
    ],
  },
  {
    genre: "puzzle",
    categories: [
      {
        category: "Physics",
        mechanics: [
          { name: "Pattern Recognition", description: "Identifying and matching visual or logical patterns" },
          { name: "Spatial Reasoning", description: "Manipulating objects in 2D or 3D space" },
          { name: "Logic Chains", description: "Sequential reasoning to reach solutions" },
          { name: "Time Pressure", description: "Optional time limits adding challenge" },
        ],
      },
      {
        category: "Progression",
        mechanics: [
          { name: "Levels System", description: "Short Levels to provide increasingly more difficult challenges" },
        ],
      },
    ],
  },
  {
    genre: "social-games",
    categories: [
      {
        category: "Economy",
        mechanics: [
          { name: "Resource Harvesting", description: "Collecting resources from various sources" },
          { name: "Unit Building", description: "Constructing structures or units using resources" },
          { name: "Resource Spending", description: "Spending resources on upgrades or improvements" },
        ],
      },
      {
        category: "Progression",
        mechanics: [
          { name: "Quests", description: "Completing tasks or objectives to advance" },
          { name: "Challenges", description: "Challenges to give player a purpose and a goal" },
        ],
      },
      {
        category: "Social interaction",
        mechanics: [
          { name: "Player Exchange Resources", description: "Trading resources with other players" },
          { name: "Team-Events", description: "Events that require teamwork and coordination" },
          { name: "Groups", description: "Mechanics to encourage players for cooperation and/or conflict" },
        ],
      },
    ],
  },
];

export function getMechanicsByGenre(genreValue: string): GenreMechanics | undefined {
  return gameMechanics.find((gm) => gm.genre === genreValue);
}

export function getAllMechanicsFlat(genreValue: string): Mechanic[] {
  const genreMechanics = getMechanicsByGenre(genreValue);
  if (!genreMechanics) return [];
  return genreMechanics.categories.flatMap((cat) => cat.mechanics);
}
