/* =============================================
   UI — Rendering and DOM manipulation
   ============================================= */

const UI = {
    currentTab: 'manana',
    currentDay: 'today',

    /**
     * Render all lottery input cards
     */
    renderLotteries() {
        const container = document.getElementById('lotteryContainer');
        container.innerHTML = '';

        const periods = {
            manana: { title: 'MAÑANA', badge: 'time-manana', icon: '🌅' },
            dia: { title: 'DÍA', badge: 'time-dia', icon: '☀️' },
            tarde: { title: 'TARDE', badge: 'time-tarde', icon: '🌆' },
            noche: { title: 'NOCHE', badge: 'time-noche', icon: '🌙' }
        };

        for (const [period, lotteries] of Object.entries(LOTTERIES)) {
            const section = document.createElement('div');
            section.className = 'lottery-section';
            section.id = `section-${period}`;
            section.style.display = (this.currentTab === 'all' || this.currentTab === period) ? 'block' : 'none';

            let cardsHtml = '';

            lotteries.forEach(lot => {
                const isTarget = lot.isTarget ? 'is-target' : '';
                const days = this.currentDay === 'both' ? ['today', 'yesterday'] : [this.currentDay];

                days.forEach(day => {
                    const prefix = `${day}_${lot.id}`;
                    const dayLabel = day === 'today'
                        ? '<span class="day-label today">HOY</span>'
                        : '<span class="day-label yesterday">AYER</span>';

                    cardsHtml += `
                        <div class="lottery-card ${isTarget}" id="card-${prefix}">
                            <div class="lottery-name">
                                ${lot.name}
                                <span class="lottery-time">${lot.time}</span>
                            </div>
                            ${this.currentDay === 'both' ? dayLabel : ''}
                            <div class="number-inputs">
                                <input type="text" class="number-input pos-1" id="${prefix}_1"
                                    maxlength="2" placeholder="--" inputmode="numeric"
                                    oninput="UI.handleInput(this, '${prefix}_2')">
                                <input type="text" class="number-input pos-2" id="${prefix}_2"
                                    maxlength="2" placeholder="--" inputmode="numeric"
                                    oninput="UI.handleInput(this, '${prefix}_3')">
                                <input type="text" class="number-input pos-3" id="${prefix}_3"
                                    maxlength="2" placeholder="--" inputmode="numeric"
                                    oninput="UI.handleInput(this, null)">
                            </div>
                        </div>
                    `;
                });
            });

            section.innerHTML = `
                <h2>
                    ${periods[period].icon} SORTEOS ${periods[period].title}
                    <span class="time-badge ${periods[period].badge}">${lotteries.length} sorteos</span>
                </h2>
                <div class="lottery-grid">${cardsHtml}</div>
            `;

            container.appendChild(section);
        }
    },

    /**
     * Handle number input: auto-advance, validate
     */
    handleInput(input, nextId) {
        input.value = input.value.replace(/[^0-9]/g, '');
        if (input.value.length === 2 && nextId) {
            document.getElementById(nextId)?.focus();
        }
        // Update card visual
        const card = input.closest('.lottery-card');
        if (card) {
            const inputs = card.querySelectorAll('.number-input');
            const hasData = Array.from(inputs).some(inp => inp.value.length > 0);
            card.classList.toggle('has-data', hasData);
        }
    },

    /**
     * Show status message
     */
    showStatus(message, type = 'info') {
        const el = document.getElementById('statusMessage');
        el.innerHTML = `<div class="status-msg status-${type}">${message}</div>`;
        setTimeout(() => { el.innerHTML = ''; }, 6000);
    },

    /**
     * Render analysis results
     */
    renderResults(analysis) {
        const section = document.getElementById('resultsSection');
        section.classList.add('active');

        // Stats
        document.getElementById('totalLotteries').textContent = analysis.totalSorteos;
        document.getElementById('statsRow').innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${analysis.totalSorteos}</div>
                <div class="stat-label">Sorteos Analizados</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${analysis.totalNumbers}</div>
                <div class="stat-label">Números Procesados</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${analysis.frequency.hot.length + analysis.frequency.warm.length}</div>
                <div class="stat-label">Números Calientes</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${analysis.frequency.sorted[0]?.[0] || '--'}</div>
                <div class="stat-label">Más Repetido (${analysis.frequency.sorted[0]?.[1] || 0}x)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${analysis.volteos.length}</div>
                <div class="stat-label">Volteos Activos</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${analysis.pairs.length}</div>
                <div class="stat-label">Pares Frecuentes</div>
            </div>
        `;

        // Target predictions
        this.renderTargetPredictions(analysis.predictions);

        // Frequency grid
        this.renderFrequencyGrid(analysis.frequency.sorted);

        // Position analysis
        this.renderPositionAnalysis(analysis.positionFreq.sorted);

        // Pairs
        this.renderPairs(analysis.pairs);

        // Prediction cards
        this.renderPredictionCards(analysis.predictions);

        // Scroll to results
        section.scrollIntoView({ behavior: 'smooth' });
    },

    /**
     * Render target lottery predictions (Gana Más & Nacional)
     */
    renderTargetPredictions(predictions) {
        const p = predictions;
        const grid = document.getElementById('targetGrid');

        const renderCard = (name, emoji) => `
            <div class="target-card">
                <div class="target-name">${emoji} ${name}</div>
                <div class="target-predictions">
                    <div class="target-pred-row">
                        <span class="target-pred-label">🎰 Pale Perfecto</span>
                        <span class="target-pred-value">${p.pale.main?.numbers.join(' - ') || '--'}</span>
                        <span class="target-pred-confidence">${p.pale.main?.confidence || 0}%</span>
                    </div>
                    <div class="target-pred-row">
                        <span class="target-pred-label">🔄 Pale Alternativo</span>
                        <span class="target-pred-value">${p.pale.alt?.numbers.join(' - ') || '--'}</span>
                        <span class="target-pred-confidence">${p.pale.alt?.confidence || 0}%</span>
                    </div>
                    <div class="target-pred-row">
                        <span class="target-pred-label">🎯 Quiniela</span>
                        <span class="target-pred-value">${p.quiniela.main?.numbers[0] || '--'}</span>
                        <span class="target-pred-confidence">${p.quiniela.main?.confidence || 0}%</span>
                    </div>
                    <div class="target-pred-row">
                        <span class="target-pred-label">🔄 Quiniela Alt.</span>
                        <span class="target-pred-value">${p.quiniela.alt?.numbers[0] || '--'}</span>
                        <span class="target-pred-confidence">${p.quiniela.alt?.confidence || 0}%</span>
                    </div>
                    <div class="target-pred-row">
                        <span class="target-pred-label">🏆 Tripleta</span>
                        <span class="target-pred-value">${p.tripleta.main?.numbers.join(' - ') || '--'}</span>
                        <span class="target-pred-confidence">${p.tripleta.main?.confidence || 0}%</span>
                    </div>
                    <div class="target-pred-row">
                        <span class="target-pred-label">🔄 Tripleta Alt.</span>
                        <span class="target-pred-value">${p.tripleta.alt?.numbers.join(' - ') || '--'}</span>
                        <span class="target-pred-confidence">${p.tripleta.alt?.confidence || 0}%</span>
                    </div>
                </div>
            </div>
        `;

        grid.innerHTML = renderCard('GANA MÁS', '🟡') + renderCard('LOTERÍA NACIONAL', '🔵');
    },

    /**
     * Render frequency grid
     */
    renderFrequencyGrid(sorted) {
        document.getElementById('freqGrid').innerHTML = sorted.slice(0, 25).map(([num, freq]) => {
            const isHot = freq >= 3;
            const isCooking = freq === 2;
            return `
                <div class="freq-item ${isHot ? 'hot' : ''} ${isCooking ? 'cooking' : ''}">
                    <div class="freq-number">${num}</div>
                    <div class="freq-count">${freq}x ${isHot ? '🔥' : isCooking ? '♨️' : ''}</div>
                </div>
            `;
        }).join('');
    },

    /**
     * Render position analysis
     */
    renderPositionAnalysis(sorted) {
        const renderPosNums = (posArr) =>
            posArr.slice(0, 5).map(([n, f]) =>
                `<span class="pos-num">${n} (${f}x)</span>`
            ).join('');

        document.getElementById('positionGrid').innerHTML = `
            <div class="position-card">
                <h4 class="pos-1">🥇 PRIMERA</h4>
                <div class="position-numbers">${renderPosNums(sorted.pos1)}</div>
            </div>
            <div class="position-card">
                <h4 class="pos-2">🥈 SEGUNDA</h4>
                <div class="position-numbers">${renderPosNums(sorted.pos2)}</div>
            </div>
            <div class="position-card">
                <h4 class="pos-3">🥉 TERCERA</h4>
                <div class="position-numbers">${renderPosNums(sorted.pos3)}</div>
            </div>
        `;
    },

    /**
     * Render frequent pairs
     */
    renderPairs(pairs) {
        const grid = document.getElementById('pairsGrid');
        if (pairs.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-secondary); padding: 10px;">No se encontraron pares repetidos. Agrega más sorteos.</p>';
            return;
        }

        grid.innerHTML = pairs.slice(0, 10).map(pair => `
            <div class="pair-item">
                <div class="pair-numbers">${pair.numbers.join(' - ')}</div>
                <div class="pair-count">${pair.count}x juntos</div>
            </div>
        `).join('');
    },

    /**
     * Render main prediction cards
     */
    renderPredictionCards(predictions) {
        const renderPred = (pred) => {
            if (!pred) return '<p style="color: var(--text-secondary);">Datos insuficientes</p>';
            const confClass = pred.confidence >= 80 ? 'high' : pred.confidence >= 70 ? 'medium' : 'low';
            return `
                <div class="prediction-main">
                    <div class="prediction-numbers">
                        ${pred.numbers.map(n => `<div class="pred-number">${n}</div>`).join('')}
                    </div>
                    <div class="confidence-bar">
                        <div class="confidence-fill confidence-${confClass}" style="width: ${pred.confidence}%">
                            ${pred.confidence}%
                        </div>
                    </div>
                </div>
                <div>${pred.methods.map(m => `<span class="method-tag">${m}</span>`).join('')}</div>
            `;
        };

        document.getElementById('analysisGrid').innerHTML = `
            <div class="analysis-card gold">
                <h3>🎯 Quiniela Perfecta</h3>
                ${renderPred(predictions.quiniela.main)}
            </div>
            <div class="analysis-card blue">
                <h3>🔄 Quiniela Alternativa</h3>
                ${renderPred(predictions.quiniela.alt)}
            </div>
            <div class="analysis-card gold">
                <h3>🎰 Pale Perfecto</h3>
                ${renderPred(predictions.pale.main)}
            </div>
            <div class="analysis-card blue">
                <h3>🔄 Pale Alternativo</h3>
                ${renderPred(predictions.pale.alt)}
            </div>
            <div class="analysis-card green">
                <h3>🏆 Tripleta Perfecta</h3>
                ${renderPred(predictions.tripleta.main)}
            </div>
            <div class="analysis-card purple">
                <h3>🔄 Tripleta Alternativa</h3>
                ${renderPred(predictions.tripleta.alt)}
            </div>
        `;
    }
};
