/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: KONTAK, ALAMAT & MEDIA SOSIAL
 * File: js/admin/admin-contact-social.js
 * Version: 2.8.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ====================================================================
 * Mengelola informasi kantor pusat, nomor WhatsApp resmi, telepon hotline,
 * email layanan, serta 4 saluran media sosial (Instagram, Facebook, YouTube, TikTok).
 * Terintegrasi penuh dengan dual-persistence sync engine dan Google Sheets DB_Contact_Social.
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.SDW_ADMIN = root.SDW_ADMIN || {};
        root.SDW_ADMIN_CONTACT_SOCIAL = factory(root.SDW_ADMIN);
    }
})(typeof self !== 'undefined' ? self : this, function (adminState) {
    'use strict';

    const admin = adminState || window.SDW_ADMIN || {};

    function getContactData() {
        if (!admin.contactSocialData) {
            try {
                if (typeof localStorage !== 'undefined') {
                    const raw = localStorage.getItem(admin.STORAGE_KEYS ? admin.STORAGE_KEYS.CONTACT_SOCIAL : 'sdw_admin_contact_social');
                    if (raw) admin.contactSocialData = JSON.parse(raw);
                }
            } catch (_) {}
        }
        if (!admin.contactSocialData && typeof admin.getDefaultContactSocialData === 'function') {
            admin.contactSocialData = admin.getDefaultContactSocialData();
        }
        return admin.contactSocialData || {};
    }

    function renderContactSocial() {
        if (typeof document === 'undefined') return;
        const container = document.getElementById('tab-contact-social');
        if (!container) return;

        const data = getContactData();

        // 1. Populate Input Fields
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val || '';
        };

        setVal('cntCompanyName', data.company_name || 'PT Sahabat Dhuha Wisata (SDW UMROH)');
        setVal('cntAddressLine', data.address_line || '');
        setVal('cntCityProvincePostal', data.city_province_postal || '');
        setVal('cntGoogleMapsUrl', data.google_maps_url || '');
        setVal('cntOperationalHours', data.operational_hours || '');
        setVal('cntWhatsappNumber', data.whatsapp_number || '');
        setVal('cntWhatsappClean', data.whatsapp_clean || '');
        setVal('cntWhatsappTemplate', data.whatsapp_template || '');
        setVal('cntPhoneOffice', data.phone_office || '');
        setVal('cntHotline24h', data.hotline_24h || '');
        setVal('cntEmailOfficial', data.email_official || '');
        setVal('cntInstagramUrl', data.instagram_url || '');
        setVal('cntInstagramHandle', data.instagram_handle || '');
        setVal('cntFacebookUrl', data.facebook_url || '');
        setVal('cntFacebookName', data.facebook_name || '');
        setVal('cntYoutubeUrl', data.youtube_url || '');
        setVal('cntYoutubeName', data.youtube_name || '');
        setVal('cntTiktokUrl', data.tiktok_url || '');
        setVal('cntTiktokHandle', data.tiktok_handle || '');

        // 2. Render Live Preview
        updateLivePreview();

        // 3. Attach Real-Time Listeners (hanya sekali)
        if (!container.dataset.listenersAttached) {
            const inputIds = [
                'cntCompanyName', 'cntAddressLine', 'cntCityProvincePostal', 'cntGoogleMapsUrl',
                'cntOperationalHours', 'cntWhatsappNumber', 'cntWhatsappTemplate', 'cntPhoneOffice',
                'cntHotline24h', 'cntEmailOfficial', 'cntInstagramUrl', 'cntInstagramHandle',
                'cntFacebookUrl', 'cntFacebookName', 'cntYoutubeUrl', 'cntYoutubeName',
                'cntTiktokUrl', 'cntTiktokHandle'
            ];

            inputIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.addEventListener('input', () => {
                        if (id === 'cntWhatsappNumber') {
                            const cleanEl = document.getElementById('cntWhatsappClean');
                            if (cleanEl) {
                                let clean = String(el.value).replace(/[^0-9]/g, '');
                                if (clean.startsWith('0')) clean = '62' + clean.slice(1);
                                else if (!clean.startsWith('62') && clean.length > 0) clean = '62' + clean;
                                cleanEl.value = clean;
                            }
                        }
                        updateLivePreview();
                    });
                }
            });
            container.dataset.listenersAttached = 'true';
        }
    }

    function updateLivePreview() {
        if (typeof document === 'undefined') return;

        const getVal = (id, fallback) => {
            const el = document.getElementById(id);
            return (el && el.value.trim()) ? el.value.trim() : (fallback || '');
        };

        const company = getVal('cntCompanyName', 'PT Sahabat Dhuha Wisata (SDW UMROH)');
        const address = getVal('cntAddressLine', 'Jl. Raya Kudus - Jepara KM 5');
        const cityPostal = getVal('cntCityProvincePostal', 'Kabupaten Kudus, Jawa Tengah 59333');
        const mapsUrl = getVal('cntGoogleMapsUrl', 'https://maps.google.com');
        const hours = getVal('cntOperationalHours', 'Senin – Jumat: 08:30 – 17:00 WIB');
        const waNum = getVal('cntWhatsappNumber', '+62 812-3456-7890');
        const waClean = getVal('cntWhatsappClean', '6281234567890');
        const waTpl = getVal('cntWhatsappTemplate', 'Assalamualaikum CS SDW UMROH, saya ingin konsultasi.');
        const phone = getVal('cntPhoneOffice', '(0291) 438-999');
        const email = getVal('cntEmailOfficial', 'layanan@sdwumroh.co.id');
        const igHandle = getVal('cntInstagramHandle', '@sdwumroh.official');
        const igUrl = getVal('cntInstagramUrl', 'https://instagram.com');
        const fbName = getVal('cntFacebookName', 'SDW Umroh Official');
        const fbUrl = getVal('cntFacebookUrl', 'https://facebook.com');
        const ytName = getVal('cntYoutubeName', 'SDW Umroh TV');
        const ytUrl = getVal('cntYoutubeUrl', 'https://youtube.com');
        const ttHandle = getVal('cntTiktokHandle', '@sdwumroh');
        const ttUrl = getVal('cntTiktokUrl', 'https://tiktok.com');

        // Update Preview Nodes
        const prevCompany = document.getElementById('prevCompany');
        if (prevCompany) prevCompany.innerText = company;

        const prevAddress = document.getElementById('prevAddress');
        if (prevAddress) prevAddress.innerText = `${address}, ${cityPostal}`;

        const prevPhone = document.getElementById('prevPhone');
        if (prevPhone) prevPhone.innerText = `${phone} / ${waNum}`;

        const prevEmail = document.getElementById('prevEmail');
        if (prevEmail) prevEmail.innerText = email;

        const prevHours = document.getElementById('prevHours');
        if (prevHours) prevHours.innerText = hours;

        const prevWaDisplay = document.getElementById('prevWaDisplay');
        if (prevWaDisplay) prevWaDisplay.innerText = waNum;

        const prevWaLink = document.getElementById('prevWaLink');
        if (prevWaLink) {
            const clean = waClean.replace(/[^0-9]/g, '');
            prevWaLink.href = `https://wa.me/${clean}?text=${encodeURIComponent(waTpl)}`;
        }

        const prevMapsBtn = document.getElementById('prevMapsBtn');
        if (prevMapsBtn) prevMapsBtn.href = mapsUrl;

        // Medsos links & tooltips
        const prevIg = document.getElementById('prevIg');
        if (prevIg) {
            prevIg.href = igUrl;
            prevIg.title = `Instagram: ${igHandle}`;
        }
        const prevFb = document.getElementById('prevFb');
        if (prevFb) {
            prevFb.href = fbUrl;
            prevFb.title = `Facebook: ${fbName}`;
        }
        const prevYt = document.getElementById('prevYt');
        if (prevYt) {
            prevYt.href = ytUrl;
            prevYt.title = `YouTube: ${ytName}`;
        }
        const prevTt = document.getElementById('prevTt');
        if (prevTt) {
            prevTt.href = ttUrl;
            prevTt.title = `TikTok: ${ttHandle}`;
        }

        // Medsos Handle Badges
        const prevIgHandle = document.getElementById('prevIgHandle');
        if (prevIgHandle) prevIgHandle.innerText = igHandle;
        const prevFbHandle = document.getElementById('prevFbHandle');
        if (prevFbHandle) prevFbHandle.innerText = fbName;
        const prevYtHandle = document.getElementById('prevYtHandle');
        if (prevYtHandle) prevYtHandle.innerText = ytName;
        const prevTtHandle = document.getElementById('prevTtHandle');
        if (prevTtHandle) prevTtHandle.innerText = ttHandle;
    }

    function saveContactSocial() {
        if (typeof document === 'undefined') return;

        const getVal = (id) => {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
        };

        const company = getVal('cntCompanyName') || 'PT Sahabat Dhuha Wisata (SDW UMROH)';
        const address = getVal('cntAddressLine');
        const cityPostal = getVal('cntCityProvincePostal');
        const mapsUrl = getVal('cntGoogleMapsUrl');
        const hours = getVal('cntOperationalHours');
        const waNum = getVal('cntWhatsappNumber');
        let waClean = getVal('cntWhatsappClean');
        const waTpl = getVal('cntWhatsappTemplate') || 'Assalamualaikum CS SDW UMROH, saya ingin konsultasi pendaftaran umroh.';
        const phone = getVal('cntPhoneOffice');
        const hotline = getVal('cntHotline24h') || waNum;
        const email = getVal('cntEmailOfficial');
        const igUrl = getVal('cntInstagramUrl');
        const igHandle = getVal('cntInstagramHandle');
        const fbUrl = getVal('cntFacebookUrl');
        const fbName = getVal('cntFacebookName');
        const ytUrl = getVal('cntYoutubeUrl');
        const ytName = getVal('cntYoutubeName');
        const ttUrl = getVal('cntTiktokUrl');
        const ttHandle = getVal('cntTiktokHandle');

        if (!address) {
            if (typeof admin.showToast === 'function') admin.showToast('⚠️ Mohon isi alamat kantor pusat.');
            return;
        }
        if (!waNum) {
            if (typeof admin.showToast === 'function') admin.showToast('⚠️ Mohon isi nomor WhatsApp resmi.');
            return;
        }

        if (!waClean) {
            waClean = waNum.replace(/[^0-9]/g, '');
            if (waClean.startsWith('0')) waClean = '62' + waClean.slice(1);
            else if (!waClean.startsWith('62') && waClean.length > 0) waClean = '62' + waClean;
        }

        const payload = {
            id: 'CNT-000001',
            company_name: company,
            address_line: address,
            city_province_postal: cityPostal,
            google_maps_url: mapsUrl,
            whatsapp_number: waNum,
            whatsapp_clean: waClean,
            whatsapp_template: waTpl,
            phone_office: phone,
            hotline_24h: hotline,
            email_official: email,
            operational_hours: hours,
            instagram_url: igUrl,
            instagram_handle: igHandle,
            facebook_url: fbUrl,
            facebook_name: fbName,
            youtube_url: ytUrl,
            youtube_name: ytName,
            tiktok_url: ttUrl,
            tiktok_handle: ttHandle,
            updated_at: new Date().toISOString()
        };

        admin.contactSocialData = payload;

        // 1. Dual-Persistence: LocalStorage
        if (typeof admin.persistStorage === 'function') {
            admin.persistStorage(admin.STORAGE_KEYS ? admin.STORAGE_KEYS.CONTACT_SOCIAL : 'sdw_admin_contact_social', payload);
        } else if (typeof localStorage !== 'undefined') {
            localStorage.setItem('sdw_admin_contact_social', JSON.stringify(payload));
        }

        // 2. Dual-Persistence: Enqueue Offline Sync Queue
        if (typeof admin.enqueueMutation === 'function') {
            admin.enqueueMutation('saveContactSocial', payload, 'DB_Contact_Social', payload.id);
        }

        // 3. Dual-Persistence: Background Direct API Call
        if (typeof SDW_API !== 'undefined' && typeof SDW_API.post === 'function') {
            SDW_API.post('saveContactSocial', payload)
                .then(res => {
                    console.info('[SDW_CONTACT] Cloud database save success:', res);
                })
                .catch(err => {
                    console.warn('[SDW_CONTACT] Background cloud save error (queued):', err);
                });
        }

        updateLivePreview();

        if (typeof admin.showToast === 'function') {
            admin.showToast('✅ Informasi alamat, nomor WA, dan 4 media sosial berhasil disimpan & disinkronkan!');
        }
    }

    function testWhatsappLink() {
        const el = document.getElementById('prevWaLink');
        if (el && el.href) {
            window.open(el.href, '_blank', 'noopener,noreferrer');
        } else {
            const num = (document.getElementById('cntWhatsappClean') || {}).value || '6281234567890';
            const tpl = (document.getElementById('cntWhatsappTemplate') || {}).value || 'Assalamualaikum';
            window.open(`https://wa.me/${num}?text=${encodeURIComponent(tpl)}`, '_blank', 'noopener,noreferrer');
        }
    }

    function testSocialLink(type) {
        let url = '';
        if (type === 'instagram') url = (document.getElementById('cntInstagramUrl') || {}).value;
        else if (type === 'facebook') url = (document.getElementById('cntFacebookUrl') || {}).value;
        else if (type === 'youtube') url = (document.getElementById('cntYoutubeUrl') || {}).value;
        else if (type === 'tiktok') url = (document.getElementById('cntTiktokUrl') || {}).value;
        else if (type === 'maps') url = (document.getElementById('cntGoogleMapsUrl') || {}).value;

        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            if (typeof admin.showToast === 'function') admin.showToast('⚠️ URL belum diisi.');
        }
    }

    // Attach to admin namespace
    admin.renderContactSocial = renderContactSocial;
    admin.saveContactSocial = saveContactSocial;
    admin.SDW_ADMIN_CONTACT_SOCIAL = {
        renderContactSocial,
        saveContactSocial,
        updateLivePreview,
        testWhatsappLink,
        testSocialLink,
        getContactData
    };

    return admin.SDW_ADMIN_CONTACT_SOCIAL;
});
