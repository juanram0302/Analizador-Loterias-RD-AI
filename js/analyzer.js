/* =============================================
   ANALYZER — Mathematical Analysis Engine
   Frequency, Volteos, Cooking, Balancing, Pairs
   ============================================= */

const Analyzer = {
    /**
     * Run full analysis on collected data
     */
    analyze(data) {
        if (data.length < 2) return null;

        const freq = this.frequencyAnalysis(data);
        const posFreq = this.positionAnalysis(data);
        const volteos = this.volteoAnalysis(freq.sorted);
        const pairs = this.pairAnalysis(data);
        const cooking = this.cookingAnalysis(data);
        const predictions = this.generatePredictions(freq, posFreq, volteos, pairs, cooking, data);

        return {
            totalSorteos: data.length,
            totalNumbers: data.length * 3,
            frequency: freq,
            positionFreq: posFreq,
            volteos,
            pairs,
            cooking,
            predictions
        };
    },

    /**
     * Count frequency of each number across all lotteries
     */
    frequencyAnalysis(data) {
        const freq = {};

        data.forEach(d => {
            d.numbers.forEach(num => {
                freq[num] = (freq[num] || 0) + 1;
            });
        });

        const sorted = Object.entries(freq)
            .sort((a, b) => b[1] - a[1]);

        const hot = sorted.filter(([, f]) => f >= 3);
        const warm = sorted.filter(([, f]) => f === 2);
        const cold = sorted.filter(([, f]) => f === 1);

        return { freq, sorted, hot, warm, cold };
    },

    /**
     * Analyze frequency by position (1st, 2nd, 3rd)
     */
    positionAnalysis(data) {
        const pos = { pos1: {}, pos2: {}, pos3: {} };

        data.forEach(d => {
            d.numbers.forEach((num, idx) => {
                const key = `pos${idx + 1}`;
                pos[key][num] = (pos[key][num] || 0) + 1;
            });
        });

        // Sort each position
        const sorted = {};
        for (const key of Object.keys(pos)) {
            sorted[key] = Object.entries(pos[key])
                .sort((a, b) => b[1] - a[1]);
        }

        return { raw: pos, sorted };
    },

    /**
     * Generate volteos (number flips: 78 → 87)
     */
    volteoAnalysis(sorted) {
        const volteos = [];
        const seen = new Set();

        sorted.forEach(([num, freq]) => {
            if (freq < 2 || seen.has(num)) return;

            const flipped = num.split('').reverse().join('').padStart(2, '0');
            if (flipped !== num) {
                volteos.push({
                    original: num,
                    flipped,
                    originalFreq: freq,
                    // Check if the flipped version also appeared
                    flippedFreq: sorted.find(([n]) => n === flipped)?.[1] || 0,
                    combinedScore: freq + (sorted.find(([n]) => n === flipped)?.[1] || 0)
                });
                seen.add(num);
                seen.add(flipped);
            }
        });

        return volteos.sort((a, b) => b.combinedScore - a.combinedScore);
    },

    /**
     * Find number pairs that appear together in same lottery
     */
    pairAnalysis(data) {
        const pairMap = {};

        data.forEach(d => {
            // Generate all pairs from the 3 numbers
            for (let i = 0; i < d.numbers.length; i++) {
                for (let j = i + 1; j < d.numbers.length; j++) {
                    const pair = [d.numbers[i], d.numbers[j]].sort().join('-');
                    pairMap[pair] = (pairMap[pair] || 0) + 1;
                }
            }
        });

        return Object.entries(pairMap)
            .filter(([, count]) => count >= 2)
            .sort((a, b) => b[1] - a[1])
            .map(([pair, count]) => ({
                numbers: pair.split('-'),
                count
            }));
    },

    /**
     * Cooking analysis: numbers that appeared in yesterday but not today (ready to repeat)
     */
    cookingAnalysis(data) {
        const yesterdayNums = new Set();
        const todayNums = new Set();

        data.forEach(d => {
            const target = d.day === 'yesterday' ? yesterdayNums : todayNums;
            d.numbers.forEach(n => target.add(n));
        });

        // Numbers from yesterday that showed up today = confirmed hot
        const confirmed = [...yesterdayNums].filter(n => todayNums.has(n));

        // Numbers from yesterday that haven't appeared today = cooking
        const cooking = [...yesterdayNums].filter(n => !todayNums.has(n));

        return { confirmed, cooking };
    },

    /**
     * Generate all predictions
     */
    generatePredictions(freq, posFreq, volteos, pairs, cooking, data) {
        const predictions = {
            quiniela: { main: null, alt: null },
            pale: { main: null, alt: null },
            tripleta: { main: null, alt: null }
        };

        const topHot = freq.sorted.filter(([, f]) => f >= 2).slice(0, 8);

        // ============ QUINIELA PERFECTA ============
        // Best volteo of hottest number
        if (volteos.length > 0) {
            const v = volteos[0];
            const conf = Math.min(92, 68 + v.combinedScore * 6);
            predictions.quiniela.main = {
                numbers: [v.flipped],
                confidence: conf,
                methods: [
                    `Volteo del ${v.original} (${v.originalFreq}x)`,
                    `Score combinado: ${v.combinedScore}`,
                    'Máxima frecuencia'
                ]
            };
        } else if (topHot.length > 0) {
            const flipped = topHot[0][0].split('').reverse().join('').padStart(2, '0');
            predictions.quiniela.main = {
                numbers: [flipped],
                confidence: Math.min(85, 62 + topHot[0][1] * 7),
                methods: [`Volteo de #1 caliente (${topHot[0][0]})`, `Frecuencia: ${topHot[0][1]}x`]
            };
        }

        // ============ QUINIELA ALTERNATIVA ============
        // Position-based: most frequent in 2nd position (lotteries often shift positions)
        if (posFreq.sorted.pos2.length > 0) {
            const topPos2 = posFreq.sorted.pos2[0];
            const conf = Math.min(85, 58 + topPos2[1] * 8);
            predictions.quiniela.alt = {
                numbers: [topPos2[0]],
                confidence: conf,
                methods: [
                    `Dominante en 2da posición (${topPos2[1]}x)`,
                    'Cambio de posición probable'
                ]
            };
        } else if (volteos.length > 1) {
            predictions.quiniela.alt = {
                numbers: [volteos[1].flipped],
                confidence: Math.min(82, 60 + volteos[1].combinedScore * 5),
                methods: [`Volteo #2: ${volteos[1].original}`]
            };
        }

        // ============ PALE PERFECTO ============
        // Combine: top volteo + position analysis + pair analysis
        if (volteos.length >= 2) {
            const n1 = volteos[0].flipped;
            let n2 = volteos[1].flipped;
            // Ensure different numbers
            if (n1 === n2 && volteos.length > 2) n2 = volteos[2].flipped;

            const combinedFreq = volteos[0].combinedScore + volteos[1].combinedScore;
            predictions.pale.main = {
                numbers: [n1, n2],
                confidence: Math.min(88, 58 + combinedFreq * 4),
                methods: [
                    'Volteos combinados',
                    `${volteos[0].original}→${n1} + ${volteos[1].original}→${n2}`,
                    'Cocinados y balanceados'
                ]
            };
        } else if (topHot.length >= 2) {
            const n1 = topHot[0][0].split('').reverse().join('').padStart(2, '0');
            const n2 = topHot[1][0].split('').reverse().join('').padStart(2, '0');
            predictions.pale.main = {
                numbers: [n1, n2],
                confidence: Math.min(82, 55 + (topHot[0][1] + topHot[1][1]) * 4),
                methods: ['Top 2 volteos calientes']
            };
        }

        // ============ PALE ALTERNATIVO ============
        // Use frequent pairs or position dominants
        if (pairs.length > 0) {
            const topPair = pairs[0];
            predictions.pale.alt = {
                numbers: topPair.numbers,
                confidence: Math.min(82, 55 + topPair.count * 10),
                methods: [
                    `Par frecuente (${topPair.count}x juntos)`,
                    'Aparecen en mismo sorteo'
                ]
            };
        } else {
            const p1 = posFreq.sorted.pos1[0];
            const p2 = posFreq.sorted.pos2[0];
            if (p1 && p2 && p1[0] !== p2[0]) {
                predictions.pale.alt = {
                    numbers: [p1[0], p2[0]],
                    confidence: Math.min(78, 52 + (p1[1] + p2[1]) * 4),
                    methods: ['Análisis posicional', `Pos1:${p1[0]}(${p1[1]}x) + Pos2:${p2[0]}(${p2[1]}x)`]
                };
            }
        }

        // ============ TRIPLETA PERFECTA ============
        // Fusion: pale perfecto + best remaining candidate
        if (predictions.pale.main) {
            const usedNums = new Set(predictions.pale.main.numbers);
            let thirdNum = null;

            // Priority: cooking confirmed numbers not used
            const cookingConfirmed = cooking.confirmed.filter(n => !usedNums.has(n));
            if (cookingConfirmed.length > 0) {
                thirdNum = cookingConfirmed[0];
            }
            // Fallback: next volteo
            if (!thirdNum && volteos.length > 2) {
                const candidate = volteos[2].flipped;
                if (!usedNums.has(candidate)) thirdNum = candidate;
            }
            // Fallback: top position 3
            if (!thirdNum && posFreq.sorted.pos3.length > 0) {
                const candidate = posFreq.sorted.pos3[0][0];
                if (!usedNums.has(candidate)) thirdNum = candidate;
            }
            // Fallback: any hot number not used
            if (!thirdNum) {
                for (const [num] of topHot) {
                    if (!usedNums.has(num)) {
                        thirdNum = num.split('').reverse().join('').padStart(2, '0');
                        break;
                    }
                }
            }

            if (thirdNum) {
                predictions.tripleta.main = {
                    numbers: [...predictions.pale.main.numbers, thirdNum],
                    confidence: Math.min(80, predictions.pale.main.confidence - 12),
                    methods: [
                        'Pale perfecto + tercer candidato',
                        'Confluencia máxima',
                        'Cocinado + balanceado'
                    ]
                };
            }
        }

        // ============ TRIPLETA ALTERNATIVA ============
        // Position-based triple
        const p1 = posFreq.sorted.pos1[0];
        const p2 = posFreq.sorted.pos2[0];
        const p3 = posFreq.sorted.pos3[0];

        if (p1 && p2 && p3) {
            const nums = [p1[0], p2[0], p3[0]];
            // Ensure all different
            const unique = [...new Set(nums)];
            if (unique.length === 3) {
                predictions.tripleta.alt = {
                    numbers: unique,
                    confidence: Math.min(75, 48 + (p1[1] + p2[1] + p3[1]) * 3),
                    methods: [
                        'Tri-posicional',
                        `P1:${p1[0]}(${p1[1]}x) P2:${p2[0]}(${p2[1]}x) P3:${p3[0]}(${p3[1]}x)`,
                        'Dominante en cada posición'
                    ]
                };
            } else {
                // Use volteo alternatives for duplicates
                const altNums = [];
                const usedSet = new Set();

                [p1, p2, p3].forEach(([num, freq], idx) => {
                    if (!usedSet.has(num)) {
                        altNums.push(num);
                        usedSet.add(num);
                    } else {
                        // Use volteo
                        const flipped = num.split('').reverse().join('').padStart(2, '0');
                        if (!usedSet.has(flipped)) {
                            altNums.push(flipped);
                            usedSet.add(flipped);
                        }
                    }
                });

                if (altNums.length >= 3) {
                    predictions.tripleta.alt = {
                        numbers: altNums.slice(0, 3),
                        confidence: Math.min(72, 45 + (p1[1] + p2[1] + p3[1]) * 3),
                        methods: ['Tri-posicional con volteos', 'Balanceado']
                    };
                }
            }
        }

        return predictions;
    }
};
