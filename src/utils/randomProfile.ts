import { ANIMALS, AVATAR_COLORS, type AvatarConfig } from '../components/join/AvatarPicker';

const ADJECTIVES = [
  { m: 'nieśmiały', f: 'nieśmiała' },
  { m: 'cierpliwy', f: 'cierpliwa' },
  { m: 'wesoły', f: 'wesoła' },
  { m: 'sprytny', f: 'sprytna' },
  { m: 'leniwy', f: 'leniwa' },
  { m: 'odważny', f: 'odważna' },
  { m: 'figlarny', f: 'figlarna' },
  { m: 'mądry', f: 'mądra' },
  { m: 'zgubiony', f: 'zgubiona' },
  { m: 'głodny', f: 'głodna' },
  { m: 'senny', f: 'senna' },
  { m: 'szalony', f: 'szalona' },
  { m: 'tajemniczy', f: 'tajemnicza' },
  { m: 'uparty', f: 'uparta' },
  { m: 'wierny', f: 'wierna' },
  { m: 'zamyślony', f: 'zamyślona' },
  { m: 'energiczny', f: 'energiczna' },
  { m: 'marzycielski', f: 'marzycielska' },
] as const;

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function generateRandomNickname(animalId?: string): { nickname: string; animalId: string } {
  const animal = animalId
    ? ANIMALS.find((a) => a.id === animalId) ?? pickRandom(ANIMALS)
    : pickRandom(ANIMALS);
  const adj = pickRandom(ADJECTIVES);
  const adjective = animal.gender === 'f' ? adj.f : adj.m;
  return {
    nickname: `${adjective} ${animal.nickname}`,
    animalId: animal.id,
  };
}

export function generateRandomAvatar(animalId?: string): AvatarConfig {
  const animal = animalId
    ? ANIMALS.find((a) => a.id === animalId) ?? pickRandom(ANIMALS)
    : pickRandom(ANIMALS);
  return {
    animalId: animal.id,
    color: pickRandom(AVATAR_COLORS).value,
  };
}

export function generateRandomProfile(): { nickname: string; avatar: AvatarConfig } {
  const { nickname, animalId } = generateRandomNickname();
  const avatar = generateRandomAvatar(animalId);
  return { nickname, avatar };
}
