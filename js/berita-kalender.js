/**
 * SDW UMROH - Berita & Kalender Module
 * Mengadopsi Arsitektur Kalender & Editorial Warta dari Proyek Asnawiyyah
 */

(function () {
    'use strict';

    // ==========================================
    // 1. DATA & LOGIKA KALENDER 3-IN-1
    // (Masehi + Hijriah Umm al-Qura + Pasaran Jawa)
    // ==========================================

    const namaBulanIndo = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const namaHariIndo = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const pasaranJawa = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];

    const namaBulanHijriyah = [
        "", "Muharram", "Safar", "Rabi'ul Awwal", "Rabi'ul Akhir",
        "Jumadil Ula", "Jumadil Akhirah", "Rajab", "Sya'ban",
        "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah"
    ];

    // Hari Besar Islam (Format: "BulanHijri-HariHijri")
    const HARI_BESAR_ISLAM = {
        "1-1": { title: "Tahun Baru Islam", desc: "1 Muharram 1448 H", badgeColor: "amber", icon: "fa-star-and-crescent" },
        "1-9": { title: "Puasa Tasu'a", desc: "9 Muharram - Puasa Sunnah Tasu'a", badgeColor: "emerald", icon: "fa-moon" },
        "1-10": { title: "Hari & Puasa Asyura", desc: "10 Muharram - Puasa Sunnah Asyura", badgeColor: "emerald", icon: "fa-moon" },
        "3-12": { title: "Maulid Nabi Muhammad SAW", desc: "12 Rabi'ul Awwal - Peringatan Kelahiran Rasulullah SAW", badgeColor: "amber", icon: "fa-star-and-crescent" },
        "7-27": { title: "Isra' Mi'raj", desc: "27 Rajab - Peringatan Perjalanan Suci Rasulullah SAW", badgeColor: "amber", icon: "fa-mosque" },
        "8-15": { title: "Malam Nisfu Sya'ban", desc: "15 Sya'ban - Malam Pengampunan & Doa", badgeColor: "purple", icon: "fa-moon" },
        "9-1": { title: "Awal Ramadhan", desc: "1 Ramadhan - Hari Pertama Ibadah Puasa Wajib", badgeColor: "emerald", icon: "fa-star-and-crescent" },
        "9-17": { title: "Nuzulul Qur'an", desc: "17 Ramadhan - Malam Turunnya Al-Qur'an", badgeColor: "amber", icon: "fa-book-quran" },
        "9-21": { title: "Malam Lailatul Qadar", desc: "Malam 10 Hari Terakhir Ramadhan", badgeColor: "amber", icon: "fa-moon" },
        "10-1": { title: "Hari Raya Idul Fitri", desc: "1 Syawal 1448 H - Sholat Idul Fitri", badgeColor: "amber", icon: "fa-hands-praying" },
        "12-9": { title: "Hari Arafah & Puasa Arafah", desc: "9 Dzulhijjah - Puncak Ibadah Wukuf Jamaah Haji", badgeColor: "emerald", icon: "fa-kaaba" },
        "12-10": { title: "Hari Raya Idul Adha", desc: "10 Dzulhijjah - Sholat Idul Adha & Qurban", badgeColor: "amber", icon: "fa-kaaba" },
        "12-11": { title: "Hari Tasyrik 1", desc: "11 Dzulhijjah - Hari Tasyrik (Haram Puasa)", badgeColor: "rose", icon: "fa-ban" },
        "12-12": { title: "Hari Tasyrik 2", desc: "12 Dzulhijjah - Hari Tasyrik (Haram Puasa)", badgeColor: "rose", icon: "fa-ban" },
        "12-13": { title: "Hari Tasyrik 3", desc: "13 Dzulhijjah - Hari Tasyrik (Haram Puasa)", badgeColor: "rose", icon: "fa-ban" }
    };

    // Agenda Khusus SDW UMROH (Keberangkatan Kloter, Manasik Akbar & Briefing)
    const AGENDA_SDW_UMROH = {
        "10-28": { title: "Briefing Pra-Keberangkatan", desc: "Verifikasi Visa & Pembagian Perlengkapan Kloter Syawal", type: "briefing", icon: "fa-clipboard-check" },
        "11-5": { title: "Manasik Akbar Intensif", desc: "Simulasi Tawaf & Sa'i di Asrama Bersama Muthawwif", type: "manasik", icon: "fa-kaaba" },
        "11-15": { title: "Keberangkatan Kloter Syawal 01", desc: "Jakarta (CGK) -> Jeddah (JED) Direct Saudia Airlines", type: "departure", icon: "fa-plane-departure" },
        "11-24": { title: "Kepulangan Kloter Syawal 01", desc: "Madinah (MED) -> Jakarta (CGK) Tiba di Tanah Air", type: "arrival", icon: "fa-plane-arrival" },
        "12-10": { title: "Manasik Akbar Kloter Akhir Tahun", desc: "Bimbingan Fiqih Nusuk & Pelatihan Nusuk Pass", type: "manasik", icon: "fa-kaaba" },
        "12-22": { title: "Keberangkatan Kloter Libur Akhir Tahun", desc: "Program VIP 12 Hari Ring-1 Pelataran Ka'bah", type: "departure", icon: "fa-plane-departure" }
    };

    let currentCalDate = new Date();
    let selectedCalDateObj = new Date();

    // Perhitungan Pasaran Jawa (Asnawiyyah Algorithm)
    function getPasaranJawa(dateObj) {
        const timestamp = dateObj.getTime();
        const totalHari = Math.floor((timestamp + (7 * 3600 * 1000)) / 86400000);
        const pasaranIdx = (totalHari + 3) % 5;
        return pasaranJawa[(pasaranIdx + 5) % 5];
    }

    // Perhitungan Tanggal Hijriyah Umm al-Qura (Intl Standard)
    function getHijriDate(dateObj, offsetDays = 0) {
        if (!dateObj) dateObj = new Date();
        try {
            const targetTime = dateObj.getTime() + (offsetDays * 86400000);
            const adjustedDate = new Date(targetTime);

            let fmt;
            try {
                fmt = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric'
                });
            } catch (e) {
                fmt = new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric'
                });
            }

            const parts = fmt.formatToParts(adjustedDate);
            let day = 1, month = 1, year = 1448;
            for (const p of parts) {
                if (p.type === 'day') day = parseInt(p.value, 10);
                if (p.type === 'month') month = parseInt(p.value, 10);
                if (p.type === 'year') {
                    const parsedYear = parseInt(p.value, 10);
                    if (!isNaN(parsedYear)) year = parsedYear;
                }
            }
            return {
                day,
                month,
                year,
                monthName: namaBulanHijriyah[month] || `Bulan ${month}`
            };
        } catch (err) {
            return { day: 15, month: 5, year: 1448, monthName: "Jumadil Ula" };
        }
    }

    // Informasi Hari Besar, Puasa, & Agenda SDW
    function getIslamicCalendarInfo(dateObj) {
        const hijri = getHijriDate(dateObj);
        const dayOfWeek = dateObj.getDay();
        const masehiKey = `${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
        const hijriKey = `${hijri.month}-${hijri.day}`;

        const holiday = HARI_BESAR_ISLAM[hijriKey] || null;
        const sdwAgenda = AGENDA_SDW_UMROH[masehiKey] || null;

        const isHaramPuasa = (hijri.month === 10 && hijri.day === 1) ||
                             (hijri.month === 12 && [10, 11, 12, 13].includes(hijri.day));
        const isRamadhan = (hijri.month === 9);
        const isAyyamulBidh = !isRamadhan && !isHaramPuasa && [13, 14, 15].includes(hijri.day);
        const isSeninKamis = !isRamadhan && !isHaramPuasa && (dayOfWeek === 1 || dayOfWeek === 4);

        let fastingInfo = null;
        if (isRamadhan) {
            fastingInfo = { name: "Puasa Wajib Ramadhan", color: "emerald" };
        } else if (isAyyamulBidh) {
            fastingInfo = { name: "Puasa Sunnah Ayyamul Bidh", color: "emerald" };
        } else if (isSeninKamis) {
            fastingInfo = { name: dayOfWeek === 1 ? "Puasa Sunnah Senin" : "Puasa Sunnah Kamis", color: "emerald" };
        }

        return {
            hijri,
            holiday,
            sdwAgenda,
            fastingInfo,
            isHaramPuasa
        };
    }

    // Render Tampilan Kalender Bulanan
    function renderSdwCalendar() {
        const year = currentCalDate.getFullYear();
        const month = currentCalDate.getMonth();

        const monthYearText = document.getElementById('cal-month-year-text');
        if (monthYearText) monthYearText.innerText = `${namaBulanIndo[month]} ${year}`;

        const firstDateObj = new Date(year, month, 1);
        const lastDate = new Date(year, month + 1, 0).getDate();
        const lastDateObj = new Date(year, month, lastDate);

        // Subheader Rentang Bulan Hijriyah
        const hijriMonthText = document.getElementById('cal-hijri-month-text');
        if (hijriMonthText) {
            const hStart = getHijriDate(firstDateObj);
            const hEnd = getHijriDate(lastDateObj);
            if (hStart.month === hEnd.month) {
                hijriMonthText.innerText = `${hStart.monthName} ${hStart.year} H`;
            } else if (hStart.year === hEnd.year) {
                hijriMonthText.innerText = `${hStart.monthName} - ${hEnd.monthName} ${hEnd.year} H`;
            } else {
                hijriMonthText.innerText = `${hStart.monthName} ${hStart.year} - ${hEnd.monthName} ${hEnd.year} H`;
            }
        }

        const gridContainer = document.getElementById('calendar-days-grid');
        if (!gridContainer) return;
        gridContainer.innerHTML = "";

        const firstDayIndex = firstDateObj.getDay();

        // Sel kosong sebelum tanggal 1
        for (let i = 0; i < firstDayIndex; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = "p-1 min-h-[48px] sm:min-h-[56px] bg-slate-50/50 rounded-xl";
            gridContainer.appendChild(emptyCell);
        }

        const today = new Date();
        const eventsInMonth = [];

        for (let day = 1; day <= lastDate; day++) {
            const thisDate = new Date(year, month, day);
            const dayOfWeek = thisDate.getDay();
            const pasaran = getPasaranJawa(thisDate);
            const calInfo = getIslamicCalendarInfo(thisDate);
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isSelected = day === selectedCalDateObj.getDate() && month === selectedCalDateObj.getMonth() && year === selectedCalDateObj.getFullYear();

            // Kumpulkan agenda bulan ini
            if (calInfo.holiday) {
                eventsInMonth.push({
                    day,
                    title: calInfo.holiday.title,
                    desc: calInfo.holiday.desc,
                    badgeText: "Hari Besar Islam",
                    badgeClass: "bg-amber-100 text-amber-900 border border-amber-200",
                    icon: calInfo.holiday.icon || "fa-star-and-crescent"
                });
            }
            if (calInfo.sdwAgenda) {
                eventsInMonth.push({
                    day,
                    title: calInfo.sdwAgenda.title,
                    desc: calInfo.sdwAgenda.desc,
                    badgeText: "Agenda Jamaah SDW",
                    badgeClass: "bg-purple-100 text-sdw-pine border border-purple-200",
                    icon: calInfo.sdwAgenda.icon || "fa-kaaba"
                });
            }

            // Elemen Kotak Tanggal
            const dayCell = document.createElement('button');
            dayCell.type = "button";
            dayCell.onclick = () => selectCalDate(year, month, day, pasaran, dayOfWeek);

            let borderStyle = "border border-slate-200/60";
            let bgStyle = "bg-white hover:bg-slate-50";

            if (isSelected) {
                borderStyle = "border-2 border-sdw-pine shadow-sm";
                bgStyle = "bg-purple-50/80";
            } else if (isToday) {
                borderStyle = "border-2 border-amber-400";
                bgStyle = "bg-amber-50/40";
            }

            dayCell.className = `p-1 min-h-[48px] sm:min-h-[56px] rounded-xl flex flex-col justify-between transition-all duration-200 active:scale-95 text-left cursor-pointer ${bgStyle} ${borderStyle}`;

            // Baris Atas: Masehi (Kiri) & Hijriah (Kanan)
            let masehiColor = "text-slate-800";
            if (dayOfWeek === 0) masehiColor = "text-rose-600 font-extrabold";
            if (dayOfWeek === 5) masehiColor = "text-emerald-700 font-extrabold";

            let topHtml = `
                <div class="flex items-center justify-between w-full leading-none">
                    <span class="text-xs sm:text-sm font-black ${masehiColor}">${day}</span>
                    <span class="text-[9px] sm:text-[10px] font-bold text-emerald-600">${calInfo.hijri.day}</span>
                </div>
            `;

            // Baris Bawah: Pasaran Jawa & Dot Penanda
            let dotsHtml = "";
            if (calInfo.holiday) dotsHtml += `<span class="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" title="${calInfo.holiday.title}"></span>`;
            if (calInfo.fastingInfo) dotsHtml += `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" title="${calInfo.fastingInfo.name}"></span>`;
            if (calInfo.sdwAgenda) dotsHtml += `<span class="w-1.5 h-1.5 rounded-full bg-purple-600 inline-block" title="${calInfo.sdwAgenda.title}"></span>`;

            let bottomHtml = `
                <div class="flex items-center justify-between w-full leading-none mt-1">
                    <span class="text-[8.5px] sm:text-[9.5px] font-medium text-amber-700 truncate">${pasaran}</span>
                    <div class="flex items-center gap-0.5">${dotsHtml}</div>
                </div>
            `;

            dayCell.innerHTML = topHtml + bottomHtml;
            gridContainer.appendChild(dayCell);
        }

        // Render Daftar Agenda Bulan Ini
        renderCalendarEvents(eventsInMonth, month);
    }

    // Render Event & Agenda di Bawah Kalender
    function renderCalendarEvents(events, month) {
        const container = document.getElementById('calendar-events-container');
        const countBadge = document.getElementById('cal-events-count');
        if (!container) return;

        if (countBadge) countBadge.textContent = `${events.length} Agenda`;

        if (events.length === 0) {
            container.innerHTML = `
                <div class="col-span-full py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <i class="fa-regular fa-calendar-check text-2xl text-slate-300 mb-2 block"></i>
                    <p class="text-xs text-slate-500 font-medium">Tidak ada agenda khusus pada bulan ${namaBulanIndo[month]}.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = events.map(ev => `
            <div class="p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs flex items-start gap-3 hover:border-purple-200 transition">
                <div class="w-10 h-10 rounded-xl bg-purple-50 text-sdw-pine flex items-center justify-center text-sm shrink-0 border border-purple-100">
                    <i class="fa-solid ${ev.icon}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2 mb-1">
                        <span class="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${ev.badgeClass}">${ev.badgeText}</span>
                        <span class="text-[10px] font-bold text-slate-400">Tgl ${ev.day}</span>
                    </div>
                    <h5 class="text-xs font-bold text-slate-800 truncate">${ev.title}</h5>
                    <p class="text-[10.5px] text-slate-500 mt-0.5 line-clamp-1">${ev.desc}</p>
                </div>
            </div>
        `).join('');
    }

    // Navigasi Ganti Bulan
    function changeCalMonth(delta) {
        currentCalDate.setMonth(currentCalDate.getMonth() + delta);
        renderSdwCalendar();
    }

    // Pilih Tanggal Spesifik
    function selectCalDate(year, month, day, pasaran, dayOfWeek) {
        selectedCalDateObj = new Date(year, month, day);
        const info = getIslamicCalendarInfo(selectedCalDateObj);
        const today = new Date();
        const isToday = (day === today.getDate() && month === today.getMonth() && year === today.getFullYear());

        const statusBadge = document.getElementById('selected-date-status-badge');
        const tagEl = document.getElementById('selected-date-tag');
        const titleEl = document.getElementById('selected-date-title');
        const subtitleEl = document.getElementById('selected-date-subtitle');

        if (statusBadge) {
            statusBadge.innerText = isToday ? "Hari Ini" : "Terpilih";
            statusBadge.className = isToday
                ? "text-[9px] font-extrabold uppercase bg-amber-400/25 text-amber-300 px-2 py-0.5 rounded tracking-wider shrink-0"
                : "text-[9px] font-extrabold uppercase bg-white/20 text-white px-2 py-0.5 rounded tracking-wider shrink-0";
        }

        if (tagEl) {
            if (info.sdwAgenda) {
                tagEl.innerHTML = `<i class="fa-solid ${info.sdwAgenda.icon} text-amber-300 mr-1"></i> ${info.sdwAgenda.title}`;
                tagEl.classList.remove('hidden');
            } else if (info.holiday) {
                tagEl.innerHTML = `<i class="fa-solid fa-star-and-crescent text-amber-300 mr-1"></i> ${info.holiday.title}`;
                tagEl.classList.remove('hidden');
            } else if (info.fastingInfo) {
                tagEl.innerHTML = `<i class="fa-solid fa-moon text-emerald-300 mr-1"></i> ${info.fastingInfo.name}`;
                tagEl.classList.remove('hidden');
            } else {
                tagEl.classList.add('hidden');
            }
        }

        if (titleEl) {
            titleEl.innerText = `${namaHariIndo[dayOfWeek]} ${pasaran}, ${day} ${namaBulanIndo[month]} ${year}`;
        }

        if (subtitleEl) {
            subtitleEl.innerText = `${namaHariIndo[dayOfWeek]} ${pasaran}, ${info.hijri.day} ${info.hijri.monthName} ${info.hijri.year} H`;
        }

        renderSdwCalendar();
    }

    // Fitur Sinkronisasi Kalender HP
    function subscribeToGoogleCalendar() {
        const calUrl = "https://calendar.google.com/calendar/render?cid=" + encodeURIComponent("https://sdwumroh.com/events.ics");
        window.open(calUrl, '_blank');
    }

    function subscribeToAppleCalendar() {
        window.location.href = "webcal://sdwumroh.com/events.ics";
    }

    function downloadIcalFile() {
        const icsData = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SDW UMROH//ID\nX-WR-CALNAME:Jadwal & Agenda SDW Umroh\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nBEGIN:VEVENT\nSUMMARY:Manasik Akbar Intensif SDW Umroh\nDESCRIPTION:Simulasi Tawaf & Sa'i Bersama Muthawwif\nDTSTART:20261105T090000Z\nDTEND:20261105T120000Z\nLOCATION:Asrama Haji Jakarta\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR`;
        const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', 'jadwal-sdw-umroh.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function toggleCalendarSyncBar() {
        const box = document.getElementById('cal-sync-buttons-box');
        const pill = document.getElementById('cal-sync-collapsed-pill');
        if (box && pill) {
            box.classList.toggle('hidden');
            pill.classList.toggle('hidden');
        }
    }


    // ==========================================
    // 2. DATA & LOGIKA BERITA EDITORIAL TRI-COLUMN
    // (Mengadopsi Tampilan Editorial Asnawiyyah / NU Online)
    // ==========================================

    const SDW_NEWS_ARTICLES = [
        {
            id: 'nusuk-pass-1448',
            title: 'Aturan Baru Tasreh Masuk Raudhah Melalui Aplikasi Nusuk 1448H',
            category: 'Regulasi Saudi',
            date: '28 Oktober 2026',
            readTime: '4 menit baca',
            views: 1420,
            image: 'assets/hero-haram.png',
            summary: 'Kementerian Haji dan Umrah Kerajaan Arab Saudi memperbarui kuota penerbitan Tasreh Raudhah untuk jamaah umroh mandiri dan travel berizin.',
            content: `
                <p>Kementerian Haji dan Umrah Kerajaan Arab Saudi secara resmi mengumumkan kebijakan operasional terbaru terkait penerbitan izin (tasreh) ziarah ke Raudhah Syarifah di Masjid Nabawi untuk musim umroh 1448 H.</p>
                <h4 class="font-bold text-base text-slate-800 mt-4 mb-2">Poin Utama Regulasi:</h4>
                <ul class="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                    <li>Izin ziarah Raudhah wajib diajukan melalui aplikasi resmi <strong>Nusuk</strong> atau sistem portal mu’tamir.</li>
                    <li>Setiap jamaah hanya diberikan kesempatan 1 kali tasreh setiap 365 hari untuk menjaga keadilan antrean.</li>
                    <li>Jadwal khusus jamaah wanita dibuka pada waktu Dhuha dan setelah Sholat Isya.</li>
                </ul>
                <p class="mt-4">SDW UMROH memfasilitasi pengurusan seluruh tasreh Raudhah secara kolektif dengan pendampingan langsung dari Muthawwif di Madinah.</p>
            `
        },
        {
            id: 'manasik-miqat-yalamlam',
            title: 'Tata Cara Miqat Yalamlam di Udara: Niat, Doa & Larangan Ihram',
            category: 'Panduan Manasik',
            date: '25 Oktober 2026',
            readTime: '5 menit baca',
            views: 980,
            image: 'assets/hero-twilight.jpg',
            summary: 'Bimbingan praktis bagi jamaah yang mengambil rute penerbangan langsung menuju Bandara King Abdulaziz Jeddah melintasi titik Miqat Yalamlam.',
            content: `
                <p>Bagi jamaah umroh yang terbang langsung menuju Bandara Internasional King Abdulaziz (JED) Jeddah, titik Miqat akan dilintasi sekitar 30 menit sebelum mendarat.</p>
                <h4 class="font-bold text-base text-slate-800 mt-4 mb-2">Panduan Ihram di Pesawat:</h4>
                <ul class="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                    <li>Mengenakan pakaian ihram sejak di bandara keberangkatan (CGK/SUB).</li>
                    <li>Memperhatikan pengumuman awak kabin saat mendekati Qarnul Manazil atau Yalamlam.</li>
                    <li>Melafalkan niat umroh: <em>"Labbaika Allahumma 'Umratan"</em>.</li>
                </ul>
            `
        },
        {
            id: 'hotel-ring1-pelataran',
            title: 'Keunggulan Hotel Ring-1 Pelataran Ka\'bah bagi Jamaah Lansia & Keluarga',
            category: 'Warta Haramain',
            date: '22 Oktober 2026',
            readTime: '3 menit baca',
            views: 740,
            image: 'assets/pkg-vip-khidmat.png',
            summary: 'Akses tanpa shuttle bus dan lift langsung menuju pelataran Masjidil Haram memudahkan kekhusyukan ibadah 5 waktu di masjid suci.',
            content: `
                <p>Kenyamanan beribadah menjadi prioritas utama SDW UMROH. Memilih akomodasi di pelataran Masjidil Haram seperti Pullman Zamzam dan Swissotel memberikan kemudahan bagi jamaah lansia.</p>
            `
        },
        {
            id: 'tips-koper-packing',
            title: 'Panduan Packing Koper Umroh: Barang yang Wajib Dibawa & Dilarang',
            category: 'Tips Jamaah',
            date: '19 Oktober 2026',
            readTime: '4 menit baca',
            views: 610,
            image: 'assets/pkg-awal-musim.png',
            summary: 'Checklist efisien pakaian ihram, obat-obatan pribadi, colokan tiga kaki Saudi, hingga tata cara packing cairan kabin.',
            content: `
                <p>Mempersiapkan isi koper secara rapi menghindarkan jamaah dari kelebihan bagasi dan repot selama perjalanan di bandara.</p>
            `
        },
        {
            id: 'manasik-akbar-syawal',
            title: 'Jadwal Manasik Akbar Kloter Syawal Barakah 1448H di Asrama Haji',
            category: 'Jadwal & Kloter',
            date: '15 Oktober 2026',
            readTime: '3 menit baca',
            views: 890,
            image: 'assets/pkg-ramadhan.png',
            summary: 'Simulasi tawaf dan sa’i miniatur Ka’bah, pengenalan rute ziarah, dan pembagian paspor serta koper jamaah.',
            content: `
                <p>Seluruh calon jamaah kloter Syawal diundang untuk menghadiri bimbingan manasik intensif sesuai sunnah yang dipandu oleh asatidz alumni Universitas Islam Madinah.</p>
            `
        }
    ];

    let currentNewsCategory = 'Semua';
    let currentNewsSearch = '';

    // Render Editorial News (Tri-Column Layout)
    function renderSdwNews() {
        const centerCol = document.getElementById('sdw-news-hero-center');
        const leftCol = document.getElementById('sdw-news-hero-left');
        const rightCol = document.getElementById('sdw-news-hero-right');
        const gridCol = document.getElementById('sdw-news-grid');
        const emptyState = document.getElementById('sdw-news-empty');

        if (!centerCol || !gridCol) return;

        let filtered = SDW_NEWS_ARTICLES.filter(item => {
            const matchCat = (currentNewsCategory === 'Semua' || item.category.toLowerCase() === currentNewsCategory.toLowerCase());
            const matchSearch = (!currentNewsSearch || 
                item.title.toLowerCase().includes(currentNewsSearch.toLowerCase()) || 
                item.summary.toLowerCase().includes(currentNewsSearch.toLowerCase())
            );
            return matchCat && matchSearch;
        });

        if (filtered.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            if (centerCol) centerCol.innerHTML = '';
            if (leftCol) leftCol.innerHTML = '';
            if (rightCol) rightCol.innerHTML = '';
            gridCol.innerHTML = '';
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        // Artikel Utama (Center)
        const mainNews = filtered[0];
        centerCol.innerHTML = `
            <div onclick="openSdwNewsDetail('${mainNews.id}')" class="bg-white rounded-3xl overflow-hidden border border-purple-100 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full">
                <div class="relative h-60 sm:h-72 overflow-hidden bg-slate-900">
                    <img src="${mainNews.image}" alt="${mainNews.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
                    <span class="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-sdw-pine text-amber-300 text-[10px] font-extrabold uppercase tracking-wider border border-amber-400/30">
                        ${mainNews.category}
                    </span>
                    <div class="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                        <span class="text-[10px] text-purple-200 font-medium"><i class="fa-regular fa-clock mr-1"></i> ${mainNews.readTime} &bull; ${mainNews.date}</span>
                        <h3 class="text-base sm:text-xl font-extrabold leading-snug mt-1 group-hover:text-amber-300 transition-colors">${mainNews.title}</h3>
                    </div>
                </div>
                <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <p class="text-xs text-slate-600 line-clamp-3 leading-relaxed">${mainNews.summary}</p>
                    <div class="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[11px] font-bold text-sdw-pine">
                        <span>Baca Warta Lengkap</span>
                        <i class="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                    </div>
                </div>
            </div>
        `;

        // 2 Sub-Headline Kiri
        const leftItems = filtered.slice(1, 3);
        if (leftCol) {
            leftCol.innerHTML = leftItems.map(item => `
                <div onclick="openSdwNewsDetail('${item.id}')" class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs hover:border-purple-200 transition cursor-pointer group space-y-2">
                    <div class="relative h-28 rounded-xl overflow-hidden bg-slate-900">
                        <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                        <span class="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-amber-300 text-[9px] font-bold">${item.category}</span>
                    </div>
                    <div>
                        <span class="text-[9.5px] text-slate-400 font-medium">${item.date}</span>
                        <h4 class="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-sdw-pine transition-colors">${item.title}</h4>
                    </div>
                </div>
            `).join('');
        }

        // 2 Sub-Headline Kanan
        const rightItems = filtered.slice(3, 5);
        if (rightCol) {
            rightCol.innerHTML = rightItems.map(item => `
                <div onclick="openSdwNewsDetail('${item.id}')" class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs hover:border-purple-200 transition cursor-pointer group space-y-2">
                    <div class="relative h-28 rounded-xl overflow-hidden bg-slate-900">
                        <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                        <span class="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-amber-300 text-[9px] font-bold">${item.category}</span>
                    </div>
                    <div>
                        <span class="text-[9.5px] text-slate-400 font-medium">${item.date}</span>
                        <h4 class="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-sdw-pine transition-colors">${item.title}</h4>
                    </div>
                </div>
            `).join('');
        }

        // Arsip Grid Berita Tambahan
        gridCol.innerHTML = filtered.map(item => `
            <div onclick="openSdwNewsDetail('${item.id}')" class="bg-white rounded-2xl overflow-hidden border border-purple-100/70 shadow-xs hover:shadow-md transition cursor-pointer group flex flex-col">
                <div class="relative h-36 overflow-hidden bg-slate-900">
                    <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                    <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-sdw-pine text-amber-300 text-[9px] font-bold">${item.category}</span>
                </div>
                <div class="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                        <span class="text-[9.5px] text-slate-400 block mb-1">${item.date} &bull; ${item.readTime}</span>
                        <h4 class="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-sdw-pine transition-colors">${item.title}</h4>
                        <p class="text-[11px] text-slate-500 line-clamp-2 mt-1">${item.summary}</p>
                    </div>
                    <span class="text-[10px] font-bold text-sdw-pine flex items-center gap-1 pt-1">
                        Baca Selengkapnya <i class="fa-solid fa-chevron-right text-[8px]"></i>
                    </span>
                </div>
            </div>
        `).join('');
    }

    // Filter Kategori Berita
    function filterSdwNewsByCategory(category, btnEl) {
        currentNewsCategory = category;
        const allBtns = document.querySelectorAll('.filter-sdw-news-btn');
        allBtns.forEach(btn => {
            btn.classList.remove('bg-white', 'text-sdw-pine', 'shadow-xs');
            btn.classList.add('text-white/90', 'hover:bg-purple-800');
        });
        if (btnEl) {
            btnEl.classList.add('bg-white', 'text-sdw-pine', 'shadow-xs');
            btnEl.classList.remove('text-white/90', 'hover:bg-purple-800');
        }
        renderSdwNews();
    }

    // Pencarian Berita
    function handleSdwNewsSearch(query) {
        currentNewsSearch = query.trim();
        const clearBtn = document.getElementById('sdw-news-search-clear');
        if (clearBtn) {
            if (currentNewsSearch) clearBtn.classList.remove('hidden');
            else clearBtn.classList.add('hidden');
        }
        renderSdwNews();
    }

    function clearSdwNewsSearch() {
        const input = document.getElementById('sdw-news-search-input');
        if (input) input.value = '';
        currentNewsSearch = '';
        const clearBtn = document.getElementById('sdw-news-search-clear');
        if (clearBtn) clearBtn.classList.add('hidden');
        renderSdwNews();
    }

    // Modal Pembaca Berita Lengkap
    function openSdwNewsDetail(articleId) {
        const article = SDW_NEWS_ARTICLES.find(a => a.id === articleId);
        if (!article) return;

        let modal = document.getElementById('modalSdwNewsDetail');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalSdwNewsDetail';
            modal.className = 'fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 hidden animate-in fade-in duration-200';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-100 flex flex-col">
                <!-- Modal Header -->
                <div class="sticky top-0 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between z-10">
                    <span class="px-2.5 py-0.5 rounded-full bg-purple-50 text-sdw-pine text-[10px] font-extrabold uppercase border border-purple-100">
                        ${article.category}
                    </span>
                    <button type="button" onclick="closeSdwNewsDetail()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition active:scale-90">
                        <i class="fa-solid fa-xmark text-sm"></i>
                    </button>
                </div>

                <!-- Modal Body -->
                <div class="p-4 sm:p-6 space-y-4">
                    <h2 class="text-lg sm:text-2xl font-black text-slate-900 leading-tight">${article.title}</h2>
                    <div class="flex items-center gap-3 text-xs text-slate-400 border-b border-slate-100 pb-3">
                        <span><i class="fa-regular fa-calendar mr-1"></i> ${article.date}</span>
                        <span>&bull;</span>
                        <span><i class="fa-regular fa-clock mr-1"></i> ${article.readTime}</span>
                    </div>

                    <div class="rounded-2xl overflow-hidden aspect-video bg-slate-900 shadow-sm">
                        <img src="${article.image}" alt="${article.title}" class="w-full h-full object-cover">
                    </div>

                    <div class="p-3.5 bg-purple-50/60 rounded-2xl border-l-4 border-sdw-pine text-xs text-slate-700 italic leading-relaxed">
                        ${article.summary}
                    </div>

                    <div id="sdw-article-content" class="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
                        ${article.content}
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <button type="button" onclick="navigator.clipboard.writeText(window.location.href); alert('Tautan warta disalin!');" class="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center gap-2">
                        <i class="fa-solid fa-share-nodes text-sdw-pine"></i> Bagikan
                    </button>
                    <button type="button" onclick="closeSdwNewsDetail()" class="px-5 py-2 rounded-xl bg-sdw-pine text-white text-xs font-bold hover:bg-sdw-pineLight transition">
                        Tutup Warta
                    </button>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeSdwNewsDetail() {
        const modal = document.getElementById('modalSdwNewsDetail');
        if (modal) modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Window Global Exports
    window.renderSdwCalendar = renderSdwCalendar;
    window.changeCalMonth = changeCalMonth;
    window.selectCalDate = selectCalDate;
    window.subscribeToGoogleCalendar = subscribeToGoogleCalendar;
    window.subscribeToAppleCalendar = subscribeToAppleCalendar;
    window.downloadIcalFile = downloadIcalFile;
    window.toggleCalendarSyncBar = toggleCalendarSyncBar;

    window.renderSdwNews = renderSdwNews;
    window.filterSdwNewsByCategory = filterSdwNewsByCategory;
    window.handleSdwNewsSearch = handleSdwNewsSearch;
    window.clearSdwNewsSearch = clearSdwNewsSearch;
    window.openSdwNewsDetail = openSdwNewsDetail;
    window.closeSdwNewsDetail = closeSdwNewsDetail;

    // Inisialisasi saat DOM siap
    document.addEventListener('DOMContentLoaded', () => {
        renderSdwCalendar();
        renderSdwNews();
    });

})();

