export const modulo = (value: number, modulo: number): number => {
    if (value >= 0) {
        return value % modulo;
    }

    while (value < 0) {
        value += modulo;
    }
    return value;
};
