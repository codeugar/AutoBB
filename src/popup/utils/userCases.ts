export const parseUserCases = (input: string): string[] => {
    return input
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .slice(0, 5);
};
