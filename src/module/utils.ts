export function getRollAverage(formula: string) {
    if (!formula) return 0;
    const maxRoll = new Roll(formula).evaluate({ maximize: true });
    const minRoll = new Roll(formula).evaluate({ minimize: true });
    return (maxRoll.total - minRoll.total) / 2 + minRoll.total;
}
