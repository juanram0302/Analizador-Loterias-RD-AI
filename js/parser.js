/* =============================================
   PARSER — Auto-detect and parse lottery results
   ============================================= */

const Parser = {
    /**
     * Parse pasted text and extract lottery results
     * Returns array of { lotteryId, numbers: [n1, n2, n3] }
     */
    parse(text) {
        if (!text || !text.trim()) return [];

        const results = [];
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            for (const lottery of ALL_LOTTERIES) {
                const matched = lottery.aliases.some(alias =>
                    line.toLowerCase().includes(alias.toLowerCase())
                );

                if (!matched) continue;

                // Look for numbers
                let numbers = this.extractNumbers(line);

                // If not enough numbers on same line, check next lines
                if (numbers.length < 3) {
                    for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
                        const nextLine = lines[j];

                        // Stop if next line is another lottery name
                        const isLotteryName = ALL_LOTTERIES.some(l =>
                            l.aliases.some(a => nextLine.toLowerCase().includes(a.toLowerCase()))
                        );
                        if (isLotteryName) break;

                        const moreNums = this.extractNumbers(nextLine);
                        numbers.push(...moreNums);
                        if (numbers.length >= 3) break;
                    }
                }

                if (numbers.length >= 3) {
                    // Avoid duplicates
                    if (!results.some(r => r.lotteryId === lottery.id)) {
                        results.push({
                            lotteryId: lottery.id,
                            lotteryName: lottery.name,
                            numbers: numbers.slice(0, 3).map(n => n.padStart(2, '0'))
                        });
                    }
                }

                break; // Stop checking aliases once matched
            }
        }

        return results;
    },

    /**
     * Extract 1-2 digit numbers from a line
     */
    extractNumbers(line) {
        // Remove lottery names to avoid matching numbers in names (like "3:30")
        let cleaned = line;
        ALL_LOTTERIES.forEach(l => {
            l.aliases.forEach(alias => {
                cleaned = cleaned.replace(new RegExp(alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '');
            });
        });

        // Match standalone 1-2 digit numbers
        const matches = cleaned.match(/\b(\d{1,2})\b/g);
        return matches ? matches.filter(n => parseInt(n) <= 99) : [];
    },

    /**
     * Fill inputs from parsed results
     */
    fillInputs(results, prefix = '') {
        let filled = 0;

        results.forEach(result => {
            const idPrefix = prefix ? `${prefix}_${result.lotteryId}` : result.lotteryId;

            for (let pos = 1; pos <= 3; pos++) {
                const input = document.getElementById(`${idPrefix}_${pos}`);
                if (input && result.numbers[pos - 1]) {
                    input.value = result.numbers[pos - 1];
                    // Trigger visual update
                    const card = input.closest('.lottery-card');
                    if (card) card.classList.add('has-data');
                }
            }

            filled++;
        });

        return filled;
    },

    /**
     * Collect all entered data from inputs
     */
    collectData() {
        const data = [];

        ALL_LOTTERIES.forEach(lottery => {
            // Check both today and yesterday inputs
            ['today', 'yesterday'].forEach(day => {
                const prefix = `${day}_${lottery.id}`;
                const n1 = document.getElementById(`${prefix}_1`)?.value?.trim();
                const n2 = document.getElementById(`${prefix}_2`)?.value?.trim();
                const n3 = document.getElementById(`${prefix}_3`)?.value?.trim();

                if (n1 && n2 && n3) {
                    data.push({
                        name: lottery.name,
                        id: lottery.id,
                        day: day,
                        isTarget: lottery.isTarget || false,
                        numbers: [
                            n1.padStart(2, '0'),
                            n2.padStart(2, '0'),
                            n3.padStart(2, '0')
                        ]
                    });
                }
            });
        });

        return data;
    }
};
