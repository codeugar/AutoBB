import { describe, it, expect } from 'vitest';
import { parseUserCases } from './userCases';

describe('parseUserCases', () => {
    it('splits lines, trims, and removes empty lines', () => {
        const input = '  first\n\n second \n   \nthird  ';
        expect(parseUserCases(input)).toEqual(['first', 'second', 'third']);
    });

    it('limits to 5 entries', () => {
        const input = '1\n2\n3\n4\n5\n6\n7';
        expect(parseUserCases(input)).toEqual(['1', '2', '3', '4', '5']);
    });
});
