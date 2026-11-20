import type { Dog } from '@/types';
import { site } from '@/data/site';

/** Hosts of free stock-photo services that must never be shown as our puppies. */
const STOCK_HOSTS = ['images.dog.ceo', 'placedog.net', 'images.unsplash.com', 'place.dog', 'placekitten.com'];

/** True when a photo is one we uploaded ourselves (not a stock/placeholder image). */
export function isOwnPhoto(url: string | undefined | null): url is string {
  if (!url || !url.trim()) return false;
  try {
    const host = new URL(url).hostname;
    return !STOCK_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return url.startsWith('/'); // relative paths served from /public
  }
}

const BREED_FIXES: Record<string, string> = {
  'shi tzu': 'Shih Tzu',
  'shih tzu': 'Shih Tzu',
  'shitzu': 'Shih Tzu',
  yorkie: 'Yorkie',
  maltipoo: 'Maltipoo',
  poodle: 'Poodle',
  dachshund: 'Dachshund',
  chihuahua: 'Chihuahua',
};

const tidy = (s: string | undefined | null) => (s ?? '').replace(/\s+/g, ' ').trim();

/**
 * Cleans a dog record for public display: trims stray whitespace, fixes common
 * breed misspellings and drops stock/placeholder photos.
 */
export function cleanDog(dog: Dog): Dog {
  const breedRaw = tidy(dog.breed);
  return {
    ...dog,
    name: tidy(dog.name),
    breed: BREED_FIXES[breedRaw.toLowerCase()] ?? breedRaw,
    ageLabel: tidy(dog.ageLabel),
    color: tidy(dog.color),
    weightLabel: tidy(dog.weightLabel),
    registry: tidy(dog.registry),
    location: tidy(dog.location),
    shortDescription: tidy(dog.shortDescription),
    story: (dog.story ?? '').trim(),
    personality: (dog.personality ?? []).map(tidy).filter(Boolean),
    images: (dog.images ?? []).filter(isOwnPhoto),
    videos: (dog.videos ?? []).filter((v) => Boolean(v && v.trim())),
  };
}

/** Only puppies with at least one real photo are shown publicly. */
export function publicDogs(dogs: Dog[]): Dog[] {
  return dogs.map(cleanDog).filter((d) => d.images.length > 0);
}

export const dogPath = (dog: Pick<Dog, 'id'>) => `/dogs/${encodeURIComponent(dog.id)}`;
export const dogUrl = (dog: Pick<Dog, 'id'>) => `${site.url}${dogPath(dog)}`;

/** "Female", "12 weeks old" → "12-week-old female". */
function ageSex(dog: Dog) {
  // "12 weeks old" -> "12-week-old", "9 to 10 weeks old" -> "9-to-10-week-old"
  const age = dog.ageLabel
    .replace(/\s*old$/i, '')
    .trim()
    .replace(/\b(week|month|year)s\b/i, '$1')
    .replace(/\s+/g, '-');
  const sex = dog.gender.toLowerCase();
  return age ? `${age}-old ${sex}` : sex;
}

const statusText: Record<Dog['status'], string> = {
  Available: 'available now',
  Pending: 'reserved (pending)',
  Sold: 'sold',
};

/**
 * Short description: the breeder's own text when written in /admin, otherwise a
 * factual one-liner built only from the listing's own fields.
 */
export function shortDescriptionOf(dog: Dog): string {
  if (dog.shortDescription) return dog.shortDescription;
  return `${dog.name} is a ${ageSex(dog)} ${dog.breed} puppy, ${statusText[dog.status]} for $${dog.price.toLocaleString()}.`;
}

/** Health / care items that are actually ticked on this listing. */
export function careItems(dog: Dog): string[] {
  const items: string[] = [];
  if (dog.vetChecked) items.push('Checked by a vet');
  if (dog.vaccinated) items.push('Vaccinations up to date for age');
  if (dog.microchipped) items.push('Microchipped');
  if (dog.neutered) items.push('Spayed / neutered');
  return items;
}

export function goodWithItems(dog: Dog): string[] {
  const items: string[] = [];
  if (dog.goodWithChildren) items.push('Children');
  if (dog.goodWithDogs) items.push('Other dogs');
  if (dog.goodWithCats) items.push('Cats');
  return items;
}

/** Quick-facts table rows; empty values are skipped. */
export function quickFacts(dog: Dog): { label: string; value: string }[] {
  return [
    { label: 'Price', value: `$${dog.price.toLocaleString()}` },
    { label: 'Status', value: dog.status },
    { label: 'Breed', value: dog.breed },
    { label: 'Sex', value: dog.gender },
    { label: 'Age', value: dog.ageLabel },
    { label: 'Color', value: dog.color },
    { label: 'Expected adult weight', value: dog.weightLabel },
    { label: 'Registry', value: dog.registry },
    { label: 'Location', value: dog.location },
  ].filter((f) => f.value);
}

/** Long description split into paragraphs. Empty when the breeder hasn't written one. */
export function longDescriptionParagraphs(dog: Dog): string[] {
  return dog.story
    .split(/\n\s*\n|\r\n\s*\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export const schemaAvailability: Record<Dog['status'], string> = {
  Available: 'https://schema.org/InStock',
  Pending: 'https://schema.org/PreOrder',
  Sold: 'https://schema.org/SoldOut',
};
