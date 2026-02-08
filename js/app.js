/* =============================================
   APP — Main application logic
   ============================================= */

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Set dates
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    document.getElementById('dateToday').value = formatDate(today);
    document.getElementById('dateYesterday').value = formatDate(yesterday);

    // Render lottery cards
    UI.renderLotteries();
});

function formatDate(d) {
    return d.toISOString().split('T')[0];
}

// ============ Tab Navigation ============

function showTab(tab, btn) {
    UI.currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.lottery-section').forEach(section => {
        section.style.display = (tab === 'all' || section.id === `section-${tab}`) ? 'block' : 'none';
    });
}

function switchDayView(day, btn) {
    UI.currentDay = day;
    document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Save current data before re-rendering
    const savedData = Parser.collectData();
    UI.renderLotteries();

    // Restore saved data
    savedData.forEach(d => {
        const prefix = `${d.day}_${d.id}`;
        for (let i = 0; i < 3; i++) {
            const input = document.getElementById(`${prefix}_${i + 1}`);
            if (input) {
                input.value = d.numbers[i];
                const card = input.closest('.lottery-card');
                if (card) card.classList.add('has-data');
            }
        }
    });
}

function switchPasteTab(tab, btn) {
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.getElementById('pasteAreaToday').style.display = tab === 'today' ? 'block' : 'none';
    document.getElementById('pasteAreaYesterday').style.display = tab === 'yesterday' ? 'block' : 'none';
}

// ============ Parse & Process ============

function parseResults() {
    const textToday = document.getElementById('pasteAreaToday').value;
    const textYesterday = document.getElementById('pasteAreaYesterday').value;

    if (!textToday.trim() && !textYesterday.trim()) {
        UI.showStatus('Pega los resultados primero (Hoy y/o Ayer)', 'error');
        return;
    }

    let totalFound = 0;

    // Parse today
    if (textToday.trim()) {
        const resultsToday = Parser.parse(textToday);
        resultsToday.forEach(r => {
            const prefix = `today_${r.lotteryId}`;
            for (let i = 0; i < 3; i++) {
                const input = document.getElementById(`${prefix}_${i + 1}`);
                if (input) {
                    input.value = r.numbers[i];
                    const card = input.closest('.lottery-card');
                    if (card) card.classList.add('has-data');
                }
            }
        });
        totalFound += resultsToday.length;
    }

    // Parse yesterday
    if (textYesterday.trim()) {
        const resultsYesterday = Parser.parse(textYesterday);
        resultsYesterday.forEach(r => {
            const prefix = `yesterday_${r.lotteryId}`;
            for (let i = 0; i < 3; i++) {
                const input = document.getElementById(`${prefix}_${i + 1}`);
                if (input) {
                    input.value = r.numbers[i];
                    const card = input.closest('.lottery-card');
                    if (card) card.classList.add('has-data');
                }
            }
        });
        totalFound += resultsYesterday.length;
    }

    if (totalFound > 0) {
        UI.showStatus(`✅ ${totalFound} sorteos detectados y cargados automáticamente`, 'success');
        // Switch to "both" view and "all" tab
        switchDayView('both', document.querySelectorAll('.day-btn')[2]);
        showTab('all', document.querySelectorAll('.tab-btn')[4]);
    } else {
        UI.showStatus('⚠️ No se encontraron sorteos. Verifica el formato del texto.', 'error');
    }
}

// ============ Analyze ============

function analyzeAll() {
    const data = Parser.collectData();

    if (data.length < 3) {
        UI.showStatus('⚠️ Necesitas al menos 3 sorteos para un análisis confiable. Agrega más datos.', 'error');
        return;
    }

    const analysis = Analyzer.analyze(data);

    if (analysis) {
        UI.renderResults(analysis);
        UI.showStatus(`🔬 Análisis completo: ${analysis.totalSorteos} sorteos, ${analysis.totalNumbers} números procesados`, 'success');
    } else {
        UI.showStatus('⚠️ Error al analizar. Verifica los datos ingresados.', 'error');
    }
}

// ============ Utilities ============

function clearAll() {
    document.querySelectorAll('.number-input').forEach(inp => inp.value = '');
    document.querySelectorAll('.lottery-card').forEach(card => card.classList.remove('has-data'));
    document.getElementById('pasteAreaToday').value = '';
    document.getElementById('pasteAreaYesterday').value = '';
    document.getElementById('resultsSection').classList.remove('active');
    UI.showStatus('🗑️ Todo limpiado', 'info');
}

function loadExample() {
    document.getElementById('pasteAreaYesterday').value = `SÁBADO 31 ENERO 2026
New York 10:30 PM: 32 - 19 - 77
Florida Noche: 50 - 83 - 55
Lotería Nacional: 78 - 26 - 03
Anguila 9:00 PM: 53 - 78 - 22
Leidsa: 91 - 45 - 85
Loteka: 18 - 30 - 50
La Primera Noche: 83 - 26 - 87
La Suerte Tarde: 75 - 38 - 78
Anguila 6:00 PM: 78 - 15 - 96
New York 3:30: 17 - 59 - 64
Gana Más: 22 - 41 - 07
Florida Tarde: 85 - 02 - 86
Lotería Real: 80 - 02 - 98
Anguila 1:00 PM: 14 - 42 - 02
La Suerte 12:30 PM: 18 - 57 - 74
Primera Día: 46 - 88 - 18
LoteDom: 37 - 74 - 17
Anguila 10:00 AM: 35 - 90 - 57`;

    document.getElementById('pasteAreaToday').value = `DOMINGO 1 FEBRERO 2026
La Suerte 12:30 PM: 24 - 87 - 34
Primera Día: 47 - 97 - 82
LoteDom: 26 - 90 - 33
Anguila 10:00 AM: 47 - 74 - 52`;

    UI.showStatus('📥 Ejemplo cargado con datos de Sábado (Ayer) y Domingo (Hoy). Presiona "Procesar Automático"', 'info');
}
