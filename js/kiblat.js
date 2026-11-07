/**
 * ====================================================================
 * SDW UMROH — FALAKIYAH & GEODESIC QIBLA COMPASS ENGINE (v2.0)
 * Standar Presisi Lembaga Falakiyah & Spherical Trigonometry Geodesi
 * --------------------------------------------------------------------
 * Sensor: DeviceOrientationAbsolute (Android) & WebkitCompassHeading (iOS)
 * Fitur: 3D Tilt-Compensation, Low-Pass Jitter Filter, GPS Presisi Tinggi,
 *        Database Kota Umroh & Indonesia, Haptic Vibration Feedback (±2.5°).
 * Koordinat Ka'bah: 21° 25' 20.95" N, 39° 49' 34.34" E (21.422487, 39.826206)
 * ====================================================================
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        const instance = factory();
        root.SDW_KIBLAT = instance;
        root.ASNKiblat = instance; // Backward-compatibility
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // 1. KOORDINAT TITIK PUSAT KA'BAH MAKKAH AL-MUKARRAMAH
    const KAABA_COORDS = {
        lat: 21.422487,
        lng: 39.826206
    };

    // 2. DATABASE KOORDINAT KOTA UTAMA (ARAB SAUDI, INDONESIA, TURKI)
    const CITIES = {
        // --- ARAB SAUDI & RUTE UMROH ---
        makkah: { name: "Makkah Al-Mukarramah", lat: 21.4225, lng: 39.8262, group: "Tanah Suci" },
        madinah: { name: "Madinah Al-Munawwarah", lat: 24.4672, lng: 39.6111, group: "Tanah Suci" },
        jeddah: { name: "Kota Jeddah (Bandara KAIA)", lat: 21.5433, lng: 39.1728, group: "Tanah Suci" },
        riyadh: { name: "Riyadh", lat: 24.7136, lng: 46.6753, group: "Tanah Suci" },

        // --- PULAU JAWA & KANTOR PUSAT SDW ---
        demak: { name: "Kab. Demak (PPTQ Asnawiyyah)", lat: -6.9535, lng: 110.6402, group: "Jawa" },
        semarang: { name: "Kota Semarang", lat: -6.9667, lng: 110.4167, group: "Jawa" },
        kudus: { name: "Kab. Kudus", lat: -6.8048, lng: 110.8405, group: "Jawa" },
        jepara: { name: "Kab. Jepara", lat: -6.5936, lng: 110.6783, group: "Jawa" },
        surakarta: { name: "Kota Surakarta (Solo)", lat: -7.5755, lng: 110.8243, group: "Jawa" },
        surabaya: { name: "Kota Surabaya", lat: -7.2575, lng: 112.7521, group: "Jawa" },
        yogyakarta: { name: "DI Yogyakarta", lat: -7.7956, lng: 110.3695, group: "Jawa" },
        jakarta: { name: "DKI Jakarta", lat: -6.2088, lng: 106.8456, group: "Jawa" },
        bandung: { name: "Kota Bandung", lat: -6.9175, lng: 107.6191, group: "Jawa" },

        // --- LUAR JAWA ---
        medan: { name: "Kota Medan", lat: 3.5952, lng: 98.6722, group: "Luar Jawa" },
        aceh: { name: "Banda Aceh", lat: 5.5483, lng: 95.3238, group: "Luar Jawa" },
        palembang: { name: "Kota Palembang", lat: -2.9761, lng: 104.7754, group: "Luar Jawa" },
        makassar: { name: "Kota Makassar", lat: -5.1477, lng: 119.4327, group: "Luar Jawa" },
        balikpapan: { name: "Kota Balikpapan", lat: -1.2379, lng: 116.8289, group: "Luar Jawa" },
        denpasar: { name: "Kota Denpasar (Bali)", lat: -8.6705, lng: 115.2126, group: "Luar Jawa" },
        jayapura: { name: "Kota Jayapura (Papua)", lat: -2.5489, lng: 140.7181, group: "Luar Jawa" },

        // --- PAKET PLUS ---
        istanbul: { name: "Istanbul (Plus Turki)", lat: 41.0082, lng: 28.9784, group: "Internasional" }
    };

    // 3. STATE INTERNAL
    let userCoords = {
        lat: -6.2088,
        lng: 106.8456,
        accuracy: null,
        locationName: "DKI Jakarta",
        isGps: false,
        sourceType: "default"
    };

    let qiblaBearing = 295.15;
    let qiblaDistance = 7918;
    let currentHeading = 0;
    let smoothedHeading = null;
    let isCompassListening = false;
    let hasSensorSupport = false;
    let lastVibratedState = false;
    let isRequestingLocation = false;
    let hasAbsoluteOrientation = false;
    let sensorCheckTimer = null;

    // Load saved coords from localStorage
    try {
        const savedLat = localStorage.getItem("sdw_qibla_lat");
        const savedLng = localStorage.getItem("sdw_qibla_lng");
        const savedLocName = localStorage.getItem("sdw_qibla_loc_name");
        const savedAcc = localStorage.getItem("sdw_qibla_acc");

        if (savedLat && savedLng) {
            userCoords.lat = parseFloat(savedLat);
            userCoords.lng = parseFloat(savedLng);
            userCoords.accuracy = savedAcc ? parseFloat(savedAcc) : null;
            userCoords.locationName = savedLocName || "Lokasi Presisi Tersimpan";
            userCoords.isGps = true;
            userCoords.sourceType = "saved_gps";
        }
    } catch (e) {}

    // Initial calculation
    const initCalc = calculateQibla(userCoords.lat, userCoords.lng);
    qiblaBearing = initCalc.bearing;
    qiblaDistance = initCalc.distanceKm;

    // 4. FORMULA FALAKIYAH GEODESI (SPHERICAL TRIGONOMETRY GREAT-CIRCLE)
    function calculateQibla(lat, lng) {
        const toRad = deg => (deg * Math.PI) / 180;
        const toDeg = rad => (rad * 180) / Math.PI;

        const phi1 = toRad(lat);
        const phi2 = toRad(KAABA_COORDS.lat);
        const deltaLambda = toRad(KAABA_COORDS.lng - lng);

        const y = Math.sin(deltaLambda);
        const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

        let qiblaRad = Math.atan2(y, x);
        let qiblaDeg = toDeg(qiblaRad);

        // Normalisasi ke rentang 0° - 360°
        qiblaDeg = (qiblaDeg + 360) % 360;

        // Jarak Great Circle Haversine (Radius Bumi = 6371 km)
        const R = 6371;
        const dLat = phi2 - phi1;
        const dLng = deltaLambda;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = Math.round(R * c);

        return {
            bearing: Number(qiblaDeg.toFixed(2)),
            distanceKm: distanceKm
        };
    }

    // 5. KALKULASI SENSOR 3D TILT-COMPENSATION & HEADING
    function extractCompassHeading(event) {
        if (!event) return null;

        // A. iOS Safari: WebkitCompassHeading (True/Magnetic Heading 0 - 360°)
        if (typeof event.webkitCompassHeading === "number" && !isNaN(event.webkitCompassHeading)) {
            return event.webkitCompassHeading;
        }

        // B. Android Chrome Absolute / Relative Orientation
        if (typeof event.alpha === "number" && !isNaN(event.alpha)) {
            const beta = event.beta || 0;   // Kemiringan maju/mundur (-180° hingga 180°)
            const gamma = event.gamma || 0; // Kemiringan kiri/kanan (-90° hingga 90°)

            // Jika perangkat diletakkan datar (pitch & roll < 20°): rumus planar standar
            if (Math.abs(beta) < 20 && Math.abs(gamma) < 20) {
                return (360 - event.alpha + 360) % 360;
            }

            // Jika perangkat dipegang miring di tangan: 3D Tilt-Compensated W3C Euler Projection
            const degToRad = Math.PI / 180;
            const a = event.alpha * degToRad;
            const b = beta * degToRad;
            const g = gamma * degToRad;

            const cA = Math.cos(a), sA = Math.sin(a);
            const cB = Math.cos(b), sB = Math.sin(b);
            const cG = Math.cos(g), sG = Math.sin(g);

            // Proyeksikan vektor unit Y-axis perangkat ke bidang datar horizontal permukaan bumi
            const vx = -cA * sG - sA * sB * cG;
            const vy = -sA * sG + cA * sB * cG;

            let h = Math.atan2(vx, vy) * (180 / Math.PI);
            return (h + 360) % 360;
        }

        return null;
    }

    // Shortest angular distance low-pass filter (menghilangkan jittering sensor)
    function filterHeading(rawHeading) {
        if (smoothedHeading === null) {
            smoothedHeading = rawHeading;
            return smoothedHeading;
        }
        const diff = ((rawHeading - smoothedHeading + 540) % 360) - 180;
        smoothedHeading = (smoothedHeading + diff * 0.35 + 360) % 360;
        return smoothedHeading;
    }

    function onAbsoluteOrientationEvent(event) {
        hasSensorSupport = true;
        hasAbsoluteOrientation = true;
        const raw = extractCompassHeading(event);
        if (raw !== null) {
            currentHeading = filterHeading((raw + 360) % 360);
            updateCompassUI(currentHeading);
        }
    }

    function onRelativeOrientationEvent(event) {
        if (hasAbsoluteOrientation) return; // Prioritaskan absolute jika tersedia
        hasSensorSupport = true;
        const raw = extractCompassHeading(event);
        if (raw !== null) {
            currentHeading = filterHeading((raw + 360) % 360);
            updateCompassUI(currentHeading);
        }
    }

    // 6. UPDATE TAMPILAN KOMPAS REAL-TIME (Sinkronisasi Semua Dial & Needle)
    function updateCompassUI(heading) {
        // Seleksi elemen yang ada di kiblat.html dan app.html
        const dials = [
            document.getElementById("qibla-compass-dial"),
            document.getElementById("app-qibla-compass-dial")
        ].filter(Boolean);

        const needles = [
            document.getElementById("qibla-compass-needle"),
            document.getElementById("app-qibla-compass-needle"),
            document.getElementById("compassNeedleInIbadah"),
            document.getElementById("compassNeedle")
        ].filter(Boolean);

        const badges = [
            document.getElementById("qibla-status-badge"),
            document.getElementById("app-qibla-status-badge")
        ].filter(Boolean);

        const halos = [
            document.getElementById("qibla-glow-halo"),
            document.getElementById("app-qibla-glow-halo")
        ].filter(Boolean);

        const headingDisplays = [
            document.getElementById("app-qibla-heading-deg")
        ].filter(Boolean);

        // Putar piringan mata angin kompas sebesar -heading
        dials.forEach(d => {
            d.style.transform = `rotate(${-heading}deg)`;
        });

        // Putar jarum Ka'bah: needleAngle = (qiblaBearing - heading)
        const diff = (qiblaBearing - heading + 360) % 360;
        const needleAngle = diff;

        needles.forEach(n => {
            n.style.transform = `rotate(${needleAngle}deg)`;
        });

        headingDisplays.forEach(h => {
            h.innerText = `${Math.round(heading)}°`;
        });

        // Toleransi presisi menghadap kiblat (±2.5°)
        const isFacingQibla = diff <= 2.5 || diff >= 357.5;

        badges.forEach(badge => {
            if (isFacingQibla) {
                badge.className = "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-emerald-500 text-white shadow-lg animate-pulse border border-emerald-300 transition-all";
                badge.innerHTML = `<i class="fa-solid fa-kaaba text-amber-300"></i> Tepat Menghadap Kiblat`;
            } else {
                let turnDirection = "";
                if (diff > 180) {
                    const toTurn = (360 - diff).toFixed(0);
                    turnDirection = `Putar ponsel ke kiri ${toTurn}°`;
                } else {
                    const toTurn = diff.toFixed(0);
                    turnDirection = `Putar ponsel ke kanan ${toTurn}°`;
                }

                badge.className = "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-900/40 text-amber-300 border border-purple-500/30 transition-all";
                badge.innerHTML = `<i class="fa-solid fa-compass text-amber-300"></i> ${turnDirection}`;
            }
        });

        halos.forEach(halo => {
            if (isFacingQibla) {
                halo.classList.remove("opacity-0");
                halo.classList.add("opacity-100");
            } else {
                halo.classList.remove("opacity-100");
                halo.classList.add("opacity-0");
            }
        });

        // Haptic feedback getaran saat posisi kiblat terkunci
        if (isFacingQibla) {
            if (!lastVibratedState) {
                lastVibratedState = true;
                if (typeof navigator !== "undefined" && navigator.vibrate) {
                    try {
                        navigator.vibrate([40, 60, 40]);
                    } catch (e) {}
                }
            }
        } else {
            lastVibratedState = false;
        }
    }

    // 7. SIKLUS HIDUP SENSOR LISTENER
    function startCompassListener() {
        if (isCompassListening) return;

        try {
            window.addEventListener("deviceorientationabsolute", onAbsoluteOrientationEvent, true);
        } catch (e) {}

        try {
            window.addEventListener("deviceorientation", onRelativeOrientationEvent, true);
        } catch (e) {}

        isCompassListening = true;

        // Cek izin sensor khusus iOS Safari 13+
        const needsIos = typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function";
        const iosBtns = [
            document.getElementById("btn-qibla-request-sensor"),
            document.getElementById("btn-app-qibla-ios-sensor")
        ].filter(Boolean);

        if (needsIos) {
            iosBtns.forEach(btn => btn.classList.remove("hidden"));
        }

        // Cek fallback jika magnetometer tidak ada (misal di PC desktop/laptop)
        clearTimeout(sensorCheckTimer);
        sensorCheckTimer = setTimeout(() => {
            const notices = [
                document.getElementById("qibla-sensor-notice"),
                document.getElementById("app-qibla-sensor-notice")
            ].filter(Boolean);

            if (!hasSensorSupport) {
                const isWaitingIos = iosBtns.some(b => !b.classList.contains("hidden"));
                if (!isWaitingIos) {
                    notices.forEach(n => n.classList.remove("hidden"));
                }
            }
        }, 2500);
    }

    function stopCompassListener() {
        if (!isCompassListening) return;

        try {
            window.removeEventListener("deviceorientationabsolute", onAbsoluteOrientationEvent, true);
        } catch (e) {}

        try {
            window.removeEventListener("deviceorientation", onRelativeOrientationEvent, true);
        } catch (e) {}

        isCompassListening = false;
        clearTimeout(sensorCheckTimer);
    }

    function requestIosSensorPermission(onSuccess) {
        if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
            DeviceOrientationEvent.requestPermission()
                .then(res => {
                    if (res === "granted") {
                        const iosBtns = [
                            document.getElementById("btn-qibla-request-sensor"),
                            document.getElementById("btn-app-qibla-ios-sensor")
                        ].filter(Boolean);
                        iosBtns.forEach(btn => btn.classList.add("hidden"));

                        const notices = [
                            document.getElementById("qibla-sensor-notice"),
                            document.getElementById("app-qibla-sensor-notice")
                        ].filter(Boolean);
                        notices.forEach(n => n.classList.add("hidden"));

                        startCompassListener();
                        hasSensorSupport = true;
                        if (typeof onSuccess === "function") onSuccess();
                    } else {
                        alert("Izin sensor orientasi tidak diberikan. Safari memerlukan izin kompas agar jarum berputar otomatis.");
                    }
                })
                .catch(err => {
                    console.warn("Gagal meminta izin sensor iOS:", err);
                });
        } else if (typeof onSuccess === "function") {
            onSuccess();
        }
    }

    // 8. GEOLOCATION GPS REAL-TIME & REVERSE GEOCODING
    function requestDeviceLocation(forceGps = false) {
        if (isRequestingLocation) return;
        isRequestingLocation = true;

        const locEls = [
            document.getElementById("qibla-current-location"),
            document.getElementById("app-qibla-location")
        ].filter(Boolean);

        locEls.forEach(el => {
            el.innerText = "Mencari Koordinat GPS Presisi...";
        });

        if (typeof navigator === "undefined" || !navigator.geolocation) {
            fallbackToDefaultCity("jakarta", "GPS tidak didukung perangkat");
            isRequestingLocation = false;
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const acc = position.coords.accuracy || 10;

                userCoords.lat = lat;
                userCoords.lng = lng;
                userCoords.accuracy = acc;
                userCoords.isGps = true;
                userCoords.sourceType = "live_gps";

                // Hitung arah kiblat presisi
                const res = calculateQibla(lat, lng);
                qiblaBearing = res.bearing;
                qiblaDistance = res.distanceKm;

                updateQiblaValuesUI();
                reverseGeocodeCoords(lat, lng);

                try {
                    localStorage.setItem("sdw_qibla_lat", lat.toString());
                    localStorage.setItem("sdw_qibla_lng", lng.toString());
                    localStorage.setItem("sdw_qibla_acc", acc.toString());
                } catch (e) {}

                isRequestingLocation = false;
            },
            error => {
                console.warn("[SDW_KIBLAT] GPS gagal/ditolak:", error);
                if (!userCoords.isGps) {
                    fallbackToDefaultCity("jakarta", "Izin GPS ditolak / sensor mati");
                } else {
                    locEls.forEach(el => {
                        el.innerText = userCoords.locationName || "Lokasi Tersimpan";
                    });
                }
                isRequestingLocation = false;
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    }

    function fallbackToDefaultCity(cityKey = "jakarta", reason = "") {
        const city = CITIES[cityKey] || CITIES.jakarta;
        userCoords.lat = city.lat;
        userCoords.lng = city.lng;
        userCoords.accuracy = null;
        userCoords.locationName = city.name;
        userCoords.isGps = false;
        userCoords.sourceType = "city_fallback";

        const res = calculateQibla(city.lat, city.lng);
        qiblaBearing = res.bearing;
        qiblaDistance = res.distanceKm;

        updateQiblaValuesUI();

        const locEls = [
            document.getElementById("qibla-current-location"),
            document.getElementById("app-qibla-location")
        ].filter(Boolean);

        locEls.forEach(el => {
            el.innerText = city.name + (reason ? ` (${reason})` : "");
        });

        // Set value on select dropdowns
        const selects = [
            document.getElementById("qibla-city-select"),
            document.getElementById("app-qibla-city-select")
        ].filter(Boolean);

        selects.forEach(sel => {
            sel.value = cityKey;
        });
    }

    function changeCity(cityKey) {
        if (!cityKey || !CITIES[cityKey]) return;
        const city = CITIES[cityKey];

        userCoords.lat = city.lat;
        userCoords.lng = city.lng;
        userCoords.accuracy = null;
        userCoords.locationName = city.name;
        userCoords.isGps = false;
        userCoords.sourceType = "manual_city";

        const res = calculateQibla(city.lat, city.lng);
        qiblaBearing = res.bearing;
        qiblaDistance = res.distanceKm;

        try {
            localStorage.setItem("sdw_qibla_lat", city.lat.toString());
            localStorage.setItem("sdw_qibla_lng", city.lng.toString());
            localStorage.setItem("sdw_qibla_loc_name", city.name);
            localStorage.removeItem("sdw_qibla_acc");
        } catch (e) {}

        updateQiblaValuesUI();

        const locEls = [
            document.getElementById("qibla-current-location"),
            document.getElementById("app-qibla-location")
        ].filter(Boolean);

        locEls.forEach(el => {
            el.innerText = city.name;
        });

        // Synchronize all city select dropdowns
        const selects = [
            document.getElementById("qibla-city-select"),
            document.getElementById("app-qibla-city-select")
        ].filter(Boolean);

        selects.forEach(sel => {
            sel.value = cityKey;
        });

        if (currentHeading !== null) {
            updateCompassUI(currentHeading);
        }
    }

    function reverseGeocodeCoords(lat, lng) {
        // Cek apakah dekat dengan kota terdaftar (< 15 km)
        let closestCity = null;
        let minDistance = Infinity;

        Object.keys(CITIES).forEach(key => {
            const c = CITIES[key];
            const dLat = lat - c.lat;
            const dLng = lng - c.lng;
            const dist = Math.sqrt(dLat * dLat + dLng * dLng);
            if (dist < minDistance) {
                minDistance = dist;
                closestCity = c;
            }
        });

        // 0.15 derajat ≈ 16 km
        if (closestCity && minDistance < 0.15) {
            userCoords.locationName = closestCity.name;
            saveAndDisplayLocationName(closestCity.name);
            return;
        }

        // Cek Geocoding Online Gratis via BigDataCloud
        const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                let name = "";
                if (data.locality) name += data.locality + ", ";
                if (data.city && data.city !== data.locality) name += data.city + ", ";
                if (data.countryName) name += data.countryName;
                name = name.replace(/,\s*$/, "");

                if (!name) {
                    name = `GPS: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
                }

                userCoords.locationName = name;
                saveAndDisplayLocationName(name);
            })
            .catch(() => {
                const fallbackName = `GPS: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
                userCoords.locationName = fallbackName;
                saveAndDisplayLocationName(fallbackName);
            });
    }

    function saveAndDisplayLocationName(name) {
        try {
            localStorage.setItem("sdw_qibla_loc_name", name);
        } catch (e) {}

        const locEls = [
            document.getElementById("qibla-current-location"),
            document.getElementById("app-qibla-location")
        ].filter(Boolean);

        locEls.forEach(el => {
            el.innerText = name;
        });
    }

    // 9. UPDATE SELURUH INDIKATOR ANGKA DERAJAT & JARAK
    function updateQiblaValuesUI() {
        const targetDegEls = [
            document.getElementById("qibla-target-deg"),
            document.getElementById("app-qibla-target-deg")
        ].filter(Boolean);

        const distanceEls = [
            document.getElementById("qibla-distance-km"),
            document.getElementById("app-qibla-distance")
        ].filter(Boolean);

        const coordsEls = [
            document.getElementById("qibla-coords-display"),
            document.getElementById("app-qibla-coords")
        ].filter(Boolean);

        const accBadges = [
            document.getElementById("qibla-accuracy-badge"),
            document.getElementById("app-qibla-accuracy")
        ].filter(Boolean);

        targetDegEls.forEach(el => {
            el.innerText = `${qiblaBearing.toFixed(2)}°`;
        });

        distanceEls.forEach(el => {
            el.innerText = `${qiblaDistance.toLocaleString('id-ID')} km`;
        });

        coordsEls.forEach(el => {
            el.innerText = `${userCoords.lat.toFixed(4)}°, ${userCoords.lng.toFixed(4)}°`;
        });

        accBadges.forEach(el => {
            if (userCoords.accuracy) {
                el.innerText = `±${Math.round(userCoords.accuracy)}m`;
                el.classList.remove('hidden');
            } else {
                el.innerText = `Preset Kota`;
            }
        });
    }

    // 10. POPULASI OPSI KOTA KE SEMUA DROPDOWN SELECT
    function populateCitySelects() {
        const selects = [
            document.getElementById("qibla-city-select"),
            document.getElementById("app-qibla-city-select")
        ].filter(Boolean);

        selects.forEach(select => {
            if (select.children.length > 2) return; // Sudah terisi

            let html = '<option value="">Pilih Kota / Lokasi...</option>';
            const groups = ["Tanah Suci", "Jawa", "Luar Jawa", "Internasional"];

            groups.forEach(groupName => {
                html += `<optgroup label="--- ${groupName} ---">`;
                Object.keys(CITIES).forEach(key => {
                    const c = CITIES[key];
                    if (c.group === groupName) {
                        html += `<option value="${key}">${c.name}</option>`;
                    }
                });
                html += `</optgroup>`;
            });

            select.innerHTML = html;
        });
    }

    // 11. INITIALISASI OTOMATIS
    function init() {
        populateCitySelects();
        updateQiblaValuesUI();

        // Tampilkan lokasi tersimpan atau minta GPS pertama kali
        const locEls = [
            document.getElementById("qibla-current-location"),
            document.getElementById("app-qibla-location")
        ].filter(Boolean);

        if (userCoords.isGps && userCoords.locationName) {
            locEls.forEach(el => el.innerText = userCoords.locationName);
        } else {
            // Coba ambil lokasi presisi otomatis jika izin sudah ada
            requestDeviceLocation(false);
        }

        // Mulai listener kompas jika sedang berada di halaman kompas
        startCompassListener();
    }

    // Jalankan init saat DOM siap
    if (typeof document !== "undefined") {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", init);
        } else {
            setTimeout(init, 50);
        }
    }

    // Public API
    return {
        KAABA_COORDS,
        CITIES,
        calculateQibla,
        extractCompassHeading,
        filterHeading,
        requestDeviceLocation,
        syncAllSensorAndLocation: requestDeviceLocation,
        changeCity,
        startCompassListener,
        stopCompassListener,
        requestIosSensorPermission,
        updateQiblaValuesUI,
        updateCompassUI,
        getUserCoords: () => ({ ...userCoords }),
        getQiblaBearing: () => qiblaBearing,
        getQiblaDistance: () => qiblaDistance,
        getCurrentHeading: () => currentHeading,
        init
    };
}));
