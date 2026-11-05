const fs = require('fs');

let code = fs.readFileSync('js/admin-core.js', 'utf8');

// 1. In switchOperationsSubtab, ensure all tabs are included
code = code.replace(
    "const tabs = ['manifest', 'rooming', 'airport', 'trips'];",
    "const tabs = ['manifest', 'rooming', 'logistics', 'manasik', 'airport', 'trips'];"
);

// 2. In renderOperations, ensure logistics and manasik subtabs are handled
const renderOpSearch = "if (operationsSubtab === 'manifest') {\n            renderBusManifest();\n        } else if (operationsSubtab === 'rooming') {\n            renderRoomingList();";
const renderOpReplace = `if (operationsSubtab === 'manifest') {
            renderBusManifest();
        } else if (operationsSubtab === 'rooming') {
            renderRoomingList();
        } else if (operationsSubtab === 'logistics') {
            renderLogistics();
        } else if (operationsSubtab === 'manasik') {
            renderManasik();`;

if (code.includes(renderOpSearch)) {
    code = code.replace(renderOpSearch, renderOpReplace);
    console.log('Successfully updated renderOperations subtab switching');
} else {
    console.warn('Could not find renderOperations search block, searching alternate...');
    const altSearch = "if (operationsSubtab === 'manifest') {";
    const altIdx = code.indexOf(altSearch);
    if (altIdx !== -1) {
        console.log('Found altSearch at', altIdx);
    }
}

// 3. Insert getDefaultLogisticsData and getDefaultManasikData after getDefaultRoomsData()
const roomsEndSearch = "            { id: 'RM-MD-606', city: 'MADINAH', hotel: 'Concorde Dar Al Khair', roomNumber: '606', type: 'DOUBLE', capacity: 2, gender: 'FAMILY', occupants: ['Bpk. H. Zulkifli Lubis', 'Ibu Hj. Nurlela Siregar'] }\n        ];\n    }";

const defaultGenerators = `            { id: 'RM-MD-606', city: 'MADINAH', hotel: 'Concorde Dar Al Khair', roomNumber: '606', type: 'DOUBLE', capacity: 2, gender: 'FAMILY', occupants: ['Bpk. H. Zulkifli Lubis', 'Ibu Hj. Nurlela Siregar'] }
        ];
    }

    // ====================================================================
    // FASE 5: DEFAULT DATA GENERATORS (LOGISTIK & MANASIK)
    // ====================================================================
    function getDefaultLogisticsData() {
        const list = (manifestData && manifestData.length) ? manifestData : getDefaultManifestData();
        return list.map((m, idx) => {
            const isComplete = idx < 35;
            const isPartial = idx >= 35 && idx < 42;
            const koper = isComplete || (isPartial && idx % 2 === 0);
            const kabin = isComplete || (isPartial && idx % 3 === 0);
            const ihram = isComplete || isPartial;
            const batik = isComplete || (isPartial && idx % 2 !== 0);
            const doa = isComplete;
            const checkedCount = [koper, kabin, ihram, batik, doa].filter(Boolean).length;
            const status = checkedCount === 5 ? 'LENGKAP' : (checkedCount > 0 ? 'SEBAGIAN' : 'BELUM');

            return {
                id: 'PREP-' + String(idx + 1).padStart(3, '0'),
                regId: m.regId,
                name: m.name,
                gender: m.gender,
                phone: m.phone,
                busName: m.busName,
                koperBagasi: koper,
                tasKabin: kabin,
                kainIhram: ihram,
                batikSDW: batik,
                bukuDoa: doa,
                status: status,
                pickupDate: isComplete ? '2026-11-20' : (isPartial ? '2026-12-05' : null),
                notes: isComplete ? 'Telah diserahkan langsung di kantor pusat SDW' : (isPartial ? 'Menunggu penjahitan seragam batik' : 'Belum konfirmasi jadwal pengambilan')
            };
        });
    }

    function getDefaultManasikData() {
        const list = (manifestData && manifestData.length) ? manifestData : getDefaultManifestData();
        return list.map((m, idx) => {
            let s1 = 'HADIR';
            let s2 = 'HADIR';
            let notes = 'Memahami rukun, wajib, tata cara thawaf, sai dan tahallul dengan baik.';

            if (idx === 2 || idx === 15) {
                s1 = 'HADIR';
                s2 = 'IZIN';
                notes = 'Izin tugas kedinasan pada sesi 2, dijadwalkan bimbingan praktek susulan.';
            } else if (idx === 38 || idx === 43) {
                s1 = 'HADIR';
                s2 = 'BELUM';
                notes = 'Sesi 1 tuntas via Zoom, menunggu jadwal sesi 2 lapangan.';
            } else if (idx >= 44) {
                s1 = 'BELUM';
                s2 = 'BELUM';
                notes = 'Pendaftaran kuota tambahan, dijadwalkan manasik intensif privat.';
            }

            const readiness = (s1 === 'HADIR' && s2 === 'HADIR') ? 'SIAP' : ((s1 === 'HADIR' || s2 === 'HADIR') ? 'REMEDIAL' : 'BELUM_EVALUASI');

            return {
                id: 'MAN-' + String(idx + 1).padStart(3, '0'),
                regId: m.regId,
                name: m.name,
                gender: m.gender,
                phone: m.phone,
                busName: m.busName,
                sesi1Teori: s1,
                sesi2Praktek: s2,
                readiness: readiness,
                notes: notes
            };
        });
    }`;

if (code.includes(roomsEndSearch)) {
    code = code.replace(roomsEndSearch, defaultGenerators);
    console.log('Successfully inserted getDefaultLogisticsData and getDefaultManasikData');
} else {
    console.error('Could not find roomsEndSearch');
}

fs.writeFileSync('js/admin-core.js', code, 'utf8');
console.log('Partial update 1 complete');

