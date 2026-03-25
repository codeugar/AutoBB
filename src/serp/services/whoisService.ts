import { hashCode, seededRandom, randomInt } from '../utils/helpers';

export async function getRegistrationDate(domain: string): Promise<string> {
    const seed = hashCode(`whois-${domain}`);
    const rng = seededRandom(seed);

    const year = randomInt(rng, 1995, 2025);
    const month = randomInt(rng, 1, 12);
    const day = randomInt(rng, 1, 28);

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
