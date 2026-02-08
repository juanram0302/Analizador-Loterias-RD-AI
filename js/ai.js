/* =============================================
   AI MODULE — Claude API Integration
   Enhanced analysis with AI intelligence
   ============================================= */

// ============ API Key Management ============

function saveAIKey() {
    const key = document.getElementById('aiApiKey').value.trim();
    if (!key || !key.startsWith('sk-')) {
        showAIKeyStatus('❌ Key inválida. Debe empezar con sk-ant-...', 'error');
        return;
    }
    localStorage.setItem('lotteryAIKey', key);
    showAIKeyStatus('✅ API Key guardada', 'success');
}

function getAIKey() {
    const key = localStorage.getItem('lotteryAIKey') || '';
    if (key) document.getElementById('aiApiKey').value = key;
    return key;
}

function showAIKeyStatus(msg, type) {
    const el = document.getElementById('aiKeyStatus');
    el.textContent = msg;
    el.className = `ai-key-status ai-status-${type}`;
    setTimeout(() => { el.textContent = ''; }, 4000);
}

function toggleAIConfig() {
    const body = document.getElementById('aiConfigBody');
    const icon = document.getElementById('aiToggleIcon');
    if (body.style.display === 'none') {
        body.style.display = 'block';
        icon.textContent = '▲';
    } else {
        body.style.display = 'none';
        icon.textContent = '▼';
    }
}

// ============ AI Analysis ============

async function analyzeWithAI() {
    const key = getAIKey();
    if (!key) {
        UI.showStatus('⚠️ Configura tu API Key de Claude primero (sección 🤖)', 'error');
        // Open the config
        document.getElementById('aiConfigBody').style.display = 'block';
        document.getElementById('aiToggleIcon').textContent = '▲';
        document.getElementById('aiApiKey').focus();
        return;
    }

    // First run normal analysis
    const data = Parser.collectData();
    if (data.length < 3) {
        UI.showStatus('⚠️ Necesitas al menos 3 sorteos. Agrega más datos.', 'error');
        return;
    }

    const analysis = Analyzer.analyze(data);
    if (analysis) {
        UI.renderResults(analysis);
    }

    // Prepare data summary for AI
    const dataSummary = buildDataSummary(data, analysis);

    // Show loading
    const btn = document.getElementById('btnAnalyzeAI');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="ai-spinner"></span> ANALIZANDO CON IA...';
    btn.disabled = true;

    const aiSection = document.getElementById('aiResultsSection');
    aiSection.style.display = 'block';
    document.getElementById('aiAnalysisContent').innerHTML = `
        <div class="ai-loading">
            <div class="ai-spinner-large"></div>
            <p>🤖 Claude está analizando ${data.length} sorteos...</p>
            <p class="ai-loading-sub">Buscando patrones ocultos, ciclos y confluencias...</p>
        </div>
    `;
    aiSection.scrollIntoView({ behavior: 'smooth' });

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': key,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 2000,
                messages: [{
                    role: 'user',
                    content: dataSummary
                }]
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API Error ${response.status}: ${errText.substring(0, 200)}`);
        }

        const result = await response.json();
        const aiText = result.content.map(b => b.text || '').join('');

        // Parse and display AI response
        displayAIAnalysis(aiText, analysis);

        UI.showStatus('🤖 Análisis con IA completado exitosamente', 'success');

    } catch (err) {
        document.getElementById('aiAnalysisContent').innerHTML = `
            <div class="ai-error">
                <p>❌ Error al conectar con Claude</p>
                <p class="ai-error-detail">${err.message}</p>
                <p class="ai-error-tip">Verifica tu API Key y que tengas crédito disponible en console.anthropic.com</p>
            </div>
        `;
        UI.showStatus('❌ Error con la IA: ' + err.message.substring(0, 80), 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// ============ Build Data Summary for AI ============

function buildDataSummary(data, analysis) {
    // Group by day
    const todayData = data.filter(d => d.day === 'today');
    const yesterdayData = data.filter(d => d.day === 'yesterday');

    let prompt = `Eres un experto analista de loterías dominicanas. Analiza estos resultados y genera predicciones detalladas.

DATOS DE SORTEOS:
`;

    if (yesterdayData.length > 0) {
        prompt += `\n--- AYER ---\n`;
        yesterdayData.forEach(d => {
            prompt += `${d.name}: ${d.numbers.join(' - ')}\n`;
        });
    }

    if (todayData.length > 0) {
        prompt += `\n--- HOY ---\n`;
        todayData.forEach(d => {
            prompt += `${d.name}: ${d.numbers.join(' - ')}\n`;
        });
    }

    // Add pre-computed analysis
    prompt += `\n--- ANÁLISIS ESTADÍSTICO PRE-CALCULADO ---\n`;
    prompt += `Total sorteos: ${analysis.totalSorteos}\n`;
    prompt += `Total números: ${analysis.totalNumbers}\n`;

    // Top frequencies
    prompt += `\nNúmeros más frecuentes:\n`;
    analysis.frequency.sorted.slice(0, 15).forEach(([num, freq]) => {
        prompt += `  ${num}: ${freq}x${freq >= 3 ? ' 🔥' : freq >= 2 ? ' ♨️' : ''}\n`;
    });

    // Volteos
    if (analysis.volteos.length > 0) {
        prompt += `\nVolteos activos:\n`;
        analysis.volteos.slice(0, 5).forEach(v => {
            prompt += `  ${v.original} ↔ ${v.flipped} (score: ${v.combinedScore})\n`;
        });
    }

    // Pairs
    if (analysis.pairs.length > 0) {
        prompt += `\nPares frecuentes (aparecen juntos):\n`;
        analysis.pairs.slice(0, 5).forEach(p => {
            prompt += `  ${p.numbers.join(' - ')}: ${p.count}x juntos\n`;
        });
    }

    // Cooking
    if (analysis.cooking.confirmed.length > 0) {
        prompt += `\nNúmeros confirmados (ayer→hoy): ${analysis.cooking.confirmed.join(', ')}\n`;
    }
    if (analysis.cooking.cooking.length > 0) {
        prompt += `Cocinando (solo ayer): ${analysis.cooking.cooking.join(', ')}\n`;
    }

    // Current predictions
    const p = analysis.predictions;
    prompt += `\nPredicciones del motor estadístico:\n`;
    if (p.quiniela.main) prompt += `  Quiniela: ${p.quiniela.main.numbers.join(', ')} (${p.quiniela.main.confidence}%)\n`;
    if (p.pale.main) prompt += `  Palé: ${p.pale.main.numbers.join(' - ')} (${p.pale.main.confidence}%)\n`;
    if (p.tripleta.main) prompt += `  Tripleta: ${p.tripleta.main.numbers.join(' - ')} (${p.tripleta.main.confidence}%)\n`;

    prompt += `
--- TU TAREA ---
Analiza TODO lo anterior como un experto y responde en este formato JSON exacto (sin markdown, sin backticks, solo JSON puro):

{
  "patrones_ocultos": ["patrón 1", "patrón 2", "patrón 3"],
  "ciclos_detectados": ["ciclo 1", "ciclo 2"],
  "numeros_calientes": ["XX", "XX", "XX"],
  "numeros_frios_que_van_a_salir": ["XX", "XX"],
  "quiniela": {
    "principal": "XX",
    "alternativa": "XX",
    "por_que": "explicación breve"
  },
  "pale": {
    "principal": ["XX", "XX"],
    "alternativo": ["XX", "XX"],
    "por_que": "explicación breve"
  },
  "tripleta": {
    "principal": ["XX", "XX", "XX"],
    "alternativa": ["XX", "XX", "XX"],
    "por_que": "explicación breve"
  },
  "especial_gana_mas": {
    "quiniela": "XX",
    "pale": ["XX", "XX"],
    "tripleta": ["XX", "XX", "XX"],
    "consejo": "texto breve"
  },
  "especial_nacional": {
    "quiniela": "XX",
    "pale": ["XX", "XX"],
    "tripleta": ["XX", "XX", "XX"],
    "consejo": "texto breve"
  },
  "consejo_general": "texto con tu análisis general y recomendaciones"
}

REGLAS:
- Todos los números deben ser de 2 dígitos (00-99)
- Basa tu análisis en los patrones reales de los datos
- Usa volteos, confluencias, cocinados, posiciones dominantes
- Sé específico con las razones
- Responde SOLO JSON válido, nada más`;

    return prompt;
}

// ============ Display AI Results ============

function displayAIAnalysis(aiText, analysis) {
    let parsed;
    try {
        const jsonStr = aiText.replace(/```json\n?/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(jsonStr);
    } catch (e) {
        const match = aiText.match(/\{[\s\S]*\}/);
        if (match) {
            try {
                parsed = JSON.parse(match[0]);
            } catch (e2) {
                document.getElementById('aiAnalysisContent').innerHTML = `
                    <div class="ai-raw-response">
                        <h4>🤖 Respuesta de Claude:</h4>
                        <div class="ai-text-response">${aiText.replace(/\n/g, '<br>')}</div>
                    </div>`;
                return;
            }
        } else {
            document.getElementById('aiAnalysisContent').innerHTML = `
                <div class="ai-raw-response">
                    <h4>🤖 Respuesta de Claude:</h4>
                    <div class="ai-text-response">${aiText.replace(/\n/g, '<br>')}</div>
                </div>`;
            return;
        }
    }

    let html = '';

    // Patterns & Cycles
    if (parsed.patrones_ocultos && parsed.patrones_ocultos.length) {
        html += `<div class="ai-card ai-card-patterns">
            <h4>🔍 Patrones Ocultos Detectados</h4>
            <ul>${parsed.patrones_ocultos.map(p => `<li>${p}</li>`).join('')}</ul>
        </div>`;
    }

    if (parsed.ciclos_detectados && parsed.ciclos_detectados.length) {
        html += `<div class="ai-card ai-card-cycles">
            <h4>🔄 Ciclos Detectados</h4>
            <ul>${parsed.ciclos_detectados.map(c => `<li>${c}</li>`).join('')}</ul>
        </div>`;
    }

    // Hot/Cold numbers
    if (parsed.numeros_calientes || parsed.numeros_frios_que_van_a_salir) {
        html += `<div class="ai-card ai-card-numbers">
            <h4>🌡️ Temperatura de Números</h4>
            <div class="ai-nums-row">`;
        if (parsed.numeros_calientes) {
            html += `<div class="ai-nums-group">
                <span class="ai-nums-label">🔥 Calientes:</span>
                ${parsed.numeros_calientes.map(n => `<span class="ai-num hot">${n}</span>`).join('')}
            </div>`;
        }
        if (parsed.numeros_frios_que_van_a_salir) {
            html += `<div class="ai-nums-group">
                <span class="ai-nums-label">❄️→🔥 Por salir:</span>
                ${parsed.numeros_frios_que_van_a_salir.map(n => `<span class="ai-num cold">${n}</span>`).join('')}
            </div>`;
        }
        html += `</div></div>`;
    }

    // AI Predictions
    html += `<div class="ai-predictions-grid">`;

    // Quiniela
    if (parsed.quiniela) {
        html += `<div class="ai-pred-card ai-pred-gold">
            <div class="ai-pred-title">🎯 Quiniela IA</div>
            <div class="ai-pred-main">
                <span class="ai-pred-number big">${parsed.quiniela.principal}</span>
            </div>
            <div class="ai-pred-alt">Alt: <span class="ai-pred-number">${parsed.quiniela.alternativa}</span></div>
            <div class="ai-pred-reason">${parsed.quiniela.por_que}</div>
        </div>`;
    }

    // Pale
    if (parsed.pale) {
        html += `<div class="ai-pred-card ai-pred-blue">
            <div class="ai-pred-title">🎰 Palé IA</div>
            <div class="ai-pred-main">
                ${parsed.pale.principal.map(n => `<span class="ai-pred-number big">${n}</span>`).join(' - ')}
            </div>
            <div class="ai-pred-alt">Alt: ${parsed.pale.alternativo.map(n => `<span class="ai-pred-number">${n}</span>`).join(' - ')}</div>
            <div class="ai-pred-reason">${parsed.pale.por_que}</div>
        </div>`;
    }

    // Tripleta
    if (parsed.tripleta) {
        html += `<div class="ai-pred-card ai-pred-green">
            <div class="ai-pred-title">🏆 Tripleta IA</div>
            <div class="ai-pred-main">
                ${parsed.tripleta.principal.map(n => `<span class="ai-pred-number big">${n}</span>`).join(' - ')}
            </div>
            <div class="ai-pred-alt">Alt: ${parsed.tripleta.alternativa.map(n => `<span class="ai-pred-number">${n}</span>`).join(' - ')}</div>
            <div class="ai-pred-reason">${parsed.tripleta.por_que}</div>
        </div>`;
    }

    html += `</div>`;

    // Special predictions for target lotteries
    if (parsed.especial_gana_mas || parsed.especial_nacional) {
        html += `<div class="ai-targets">
            <h4>🎯 JUGADAS ESPECIALES POR LOTERÍA</h4>
            <div class="ai-targets-grid">`;

        if (parsed.especial_gana_mas) {
            const gm = parsed.especial_gana_mas;
            html += `<div class="ai-target-card ai-target-gana">
                <div class="ai-target-name">🟡 GANA MÁS</div>
                <div class="ai-target-row"><span class="ai-target-label">Quiniela:</span><span class="ai-pred-number">${gm.quiniela}</span></div>
                <div class="ai-target-row"><span class="ai-target-label">Palé:</span>${gm.pale.map(n => `<span class="ai-pred-number">${n}</span>`).join(' - ')}</div>
                <div class="ai-target-row"><span class="ai-target-label">Tripleta:</span>${gm.tripleta.map(n => `<span class="ai-pred-number">${n}</span>`).join(' - ')}</div>
                <div class="ai-target-consejo">💡 ${gm.consejo}</div>
            </div>`;
        }

        if (parsed.especial_nacional) {
            const na = parsed.especial_nacional;
            html += `<div class="ai-target-card ai-target-nacional">
                <div class="ai-target-name">🔵 LOTERÍA NACIONAL</div>
                <div class="ai-target-row"><span class="ai-target-label">Quiniela:</span><span class="ai-pred-number">${na.quiniela}</span></div>
                <div class="ai-target-row"><span class="ai-target-label">Palé:</span>${na.pale.map(n => `<span class="ai-pred-number">${n}</span>`).join(' - ')}</div>
                <div class="ai-target-row"><span class="ai-target-label">Tripleta:</span>${na.tripleta.map(n => `<span class="ai-pred-number">${n}</span>`).join(' - ')}</div>
                <div class="ai-target-consejo">💡 ${na.consejo}</div>
            </div>`;
        }

        html += `</div></div>`;
    }

    // General advice
    if (parsed.consejo_general) {
        html += `<div class="ai-card ai-card-advice">
            <h4>🧠 Consejo General de la IA</h4>
            <p>${parsed.consejo_general}</p>
        </div>`;
    }

    document.getElementById('aiAnalysisContent').innerHTML = html;
}

// Initialize key on load
document.addEventListener('DOMContentLoaded', () => {
    getAIKey();
});
