/* =============================================
   LOTTERIES DATABASE — All Dominican Lotteries
   ============================================= */

const LOTTERIES = {
    manana: [
        { id: 'anguila_10am', name: 'Anguila 10:00 AM', time: '10:00 AM', aliases: ['Anguila 10:00 AM', 'Anguila 10 AM', 'Anguila 10:00', 'Anguilla 10'] },
        { id: 'king_1230', name: 'King Lottery 12:30', time: '12:30 PM', aliases: ['King Lottery 12:30', 'King 12:30', 'King Lottery 12:30 PM'] },
        { id: 'suerte_1230', name: 'La Suerte 12:30 PM', time: '12:30 PM', aliases: ['La Suerte 12:30 PM', 'La Suerte 12:30', 'Suerte 12:30', 'La Suerte MD', 'La Suerte 12:30PM'] }
    ],
    dia: [
        { id: 'primera_dia', name: 'Primera Día', time: '12:00 PM', aliases: ['Primera Día', 'La Primera Día', 'Primera Dia', 'La Primera Dia'] },
        { id: 'lotedom', name: 'LoteDom', time: '12:55 PM', aliases: ['LoteDom', 'Lotedom', 'LOTEDOM'] },
        { id: 'anguila_1pm', name: 'Anguila 1:00 PM', time: '1:00 PM', aliases: ['Anguila 1:00 PM', 'Anguila 1 PM', 'Anguila 1:00', 'Anguilla 1'] },
        { id: 'real', name: 'Lotería Real', time: '12:55 PM', aliases: ['Lotería Real', 'Loteria Real', 'Real', 'Quiniela Real'] },
        { id: 'florida_dia', name: 'Florida Día', time: '1:30 PM', aliases: ['Florida Día', 'Florida Dia', 'Florida Tarde'] }
    ],
    tarde: [
        { id: 'gana_mas', name: 'Gana Más', time: '2:30 PM', aliases: ['Gana Más', 'Gana Mas', 'Ganá Más', 'GANA MAS'], isTarget: true },
        { id: 'ny_330', name: 'New York 3:30', time: '3:30 PM', aliases: ['New York 3:30', 'NY 3:30', 'Nueva York 3:30', 'New York 3:30 PM'] },
        { id: 'suerte_tarde', name: 'La Suerte Tarde', time: '6:00 PM', aliases: ['La Suerte Tarde', 'La Suerte 6PM', 'Suerte 6PM', 'Suerte Tarde', 'La Suerte 6:00'] },
        { id: 'anguila_6pm', name: 'Anguila 6:00 PM', time: '6:00 PM', aliases: ['Anguila 6:00 PM', 'Anguila 6 PM', 'Anguila 6:00', 'Anguilla 6'] }
    ],
    noche: [
        { id: 'king_730', name: 'King Lottery 7:30', time: '7:30 PM', aliases: ['King Lottery 7:30', 'King 7:30', 'King Lottery 7:30 PM'] },
        { id: 'primera_noche', name: 'La Primera Noche', time: '8:00 PM', aliases: ['La Primera Noche', 'Primera Noche'] },
        { id: 'loteka', name: 'Loteka', time: '8:00 PM', aliases: ['Loteka', 'Quiniela Loteka', 'LOTEKA'] },
        { id: 'nacional', name: 'Lotería Nacional', time: '9:00 PM', aliases: ['Lotería Nacional', 'Loteria Nacional', 'Nacional', 'LOTERIA NACIONAL'], isTarget: true },
        { id: 'leidsa', name: 'Leidsa', time: '9:00 PM', aliases: ['Leidsa', 'Quiniela Leidsa', 'LEIDSA'] },
        { id: 'anguila_9pm', name: 'Anguila 9:00 PM', time: '9:00 PM', aliases: ['Anguila 9:00 PM', 'Anguila 9 PM', 'Anguila 9:00', 'Anguilla 9'] },
        { id: 'ny_1030', name: 'New York 10:30 PM', time: '10:30 PM', aliases: ['New York 10:30 PM', 'NY 10:30', 'New York 10:30', 'New York 11:30', 'NY 10:30 PM'] },
        { id: 'florida_noche', name: 'Florida Noche', time: '11:15 PM', aliases: ['Florida Noche', 'FLORIDA NOCHE'] }
    ]
};

// Flat list of all lotteries
const ALL_LOTTERIES = [
    ...LOTTERIES.manana,
    ...LOTTERIES.dia,
    ...LOTTERIES.tarde,
    ...LOTTERIES.noche
];

// Target lotteries (user plays these)
const TARGET_LOTTERIES = ALL_LOTTERIES.filter(l => l.isTarget);
