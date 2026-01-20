export interface Genre {
  value: string;
  label: string;
  description: string;
}

export const genres: Genre[] = [
  { value: "action", label: "Action", description: "Shooters, fighting, fast-paced combat" },
  { value: "strategy", label: "Strategy", description: "Tactics, planning, resource management" },
  { value: "rpg", label: "Role Playing", description: "Character progression, story, quests" },
  { value: "sports", label: "Sports", description: "Athletic competitions, team sports" },
  { value: "vehicle-simulation", label: "Vehicle Simulation", description: "Driving, flying, racing vehicles" },
  { value: "management-simulation", label: "Management Simulation", description: "Business, city, life management" },
  { value: "adventure", label: "Adventure", description: "Narrative, exploration, discovery" },
  { value: "puzzle", label: "Puzzle", description: "Brain teasers, logic challenges" },
  { value: "social-games", label: "Social Games", description: "Multiplayer, casual, party games" },
];
