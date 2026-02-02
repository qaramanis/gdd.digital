export type MentionEntityType =
  | "character"
  | "scene"
  | "mechanic"
  | "custom_mechanic"
  | "audio_asset";

export interface MentionItem {
  id: string;
  name: string;
  type: MentionEntityType;
  description?: string;
}

export interface MentionGroup {
  type: MentionEntityType;
  label: string;
  items: MentionItem[];
}

export interface MentionCharacter {
  id: string;
  name: string;
  description?: string | null;
  mechanics?: string[];
}

export interface MentionScene {
  id: string;
  name: string;
  description?: string | null;
}

export interface MentionAudioAsset {
  id: string;
  name: string;
  description?: string | null;
  linkedCharacters?: string[];
  linkedScenes?: string[];
  linkedMechanics?: string[];
}

export interface MentionData {
  characters: MentionCharacter[];
  scenes: MentionScene[];
  mechanics: string[];
  customMechanics: { id: string; name: string; description?: string | null }[];
  audioAssets: MentionAudioAsset[];
}

export function getMentionGroups(data: MentionData): MentionGroup[] {
  const groups: MentionGroup[] = [];

  if (data.characters.length > 0) {
    groups.push({
      type: "character",
      label: "Characters",
      items: data.characters.map((c) => ({
        id: c.id,
        name: c.name,
        type: "character" as const,
      })),
    });
  }

  if (data.scenes.length > 0) {
    groups.push({
      type: "scene",
      label: "Scenes",
      items: data.scenes.map((s) => ({
        id: s.id,
        name: s.name,
        type: "scene" as const,
      })),
    });
  }

  if (data.mechanics.length > 0) {
    groups.push({
      type: "mechanic",
      label: "Mechanics",
      items: data.mechanics.map((name) => ({
        id: name.toLowerCase().replace(/\s+/g, "_"),
        name,
        type: "mechanic" as const,
      })),
    });
  }

  if (data.customMechanics.length > 0) {
    groups.push({
      type: "custom_mechanic",
      label: "Custom Mechanics",
      items: data.customMechanics.map((m) => ({
        id: m.id,
        name: m.name,
        type: "custom_mechanic" as const,
        description: m.description || undefined,
      })),
    });
  }

  if (data.audioAssets.length > 0) {
    groups.push({
      type: "audio_asset",
      label: "Audio Assets",
      items: data.audioAssets.map((a) => ({
        id: a.id,
        name: a.name,
        type: "audio_asset" as const,
      })),
    });
  }

  return groups;
}

export function filterMentionItems(
  groups: MentionGroup[],
  query: string
): MentionItem[] {
  const lowerQuery = query.toLowerCase();
  const results: MentionItem[] = [];

  for (const group of groups) {
    const filtered = group.items.filter((item) =>
      item.name.toLowerCase().includes(lowerQuery)
    );
    results.push(...filtered);
  }

  return results;
}

export function getEntityTypeLabel(type: MentionEntityType): string {
  switch (type) {
    case "character":
      return "Character";
    case "scene":
      return "Scene";
    case "mechanic":
      return "Mechanic";
    case "custom_mechanic":
      return "Custom Mechanic";
    case "audio_asset":
      return "Audio Asset";
  }
}

export function getEntityRoute(
  gameId: string,
  type: MentionEntityType,
  id: string
): string {
  switch (type) {
    case "character":
      return `/playground?game=${gameId}&character=${id}`;
    case "scene":
      return `/playground?game=${gameId}&scene=${id}`;
    case "mechanic":
      return `/games/${gameId}/document/gameplay-mechanics`;
    case "custom_mechanic":
      return `/games/${gameId}/document/gameplay-mechanics`;
    case "audio_asset":
      return `/games/${gameId}/audio-assets`;
  }
}
