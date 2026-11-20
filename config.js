
// ============ Supabase কনফিগ ============
const SUPABASE_URL = 'https://ijixcsmhxpuvcwpiddhf.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_D97i1M-jPfNIao5NQuZGkQ_JjYsa61m';

// Supabase client (সব পেজে ব্যবহৃত)
const sb = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// ============ হেল্পার ============
const RH = {
  async getSession() {
    const { data, error } = await sb.auth.getSession();
    if (error) console.warn('getSession:', error);
    return data?.session || null;
  },

  async getProfile() {
    const s = await RH.getSession();
    if (!s) return null;

    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .eq('id', s.user.id)
      .single();

    if (error) console.warn('getProfile:', error);
    return data;
  },

  async requireAuth(roles = null, redirect = 'login.html') {
    const s = await RH.getSession();

    if (!s) {
      location.href = redirect;
      return null;
    }

    if (roles) {
      const p = await RH.getProfile();

      if (!p || !roles.includes(p.role) || !p.is_active) {
        location.href = 'login.html';
        return null;
      }

      return { session: s, profile: p };
    }

    return { session: s };
  },

  // ৬-সংখ্যার ইউনিক আইডি
  async generateBiodataCode(applicantType) {
    // সব ক্ষেত্রে RH প্রিফিক্স ব্যবহার করা হবে
    for (let i = 0; i < 20; i++) {
      const num = String(
        Math.floor(100000 + Math.random() * 900000)
      );

      const code = 'RH' + num;

      const { data, error } = await sb
        .from('biodata_records')
        .select('id')
        .eq('biodata_code', code)
        .maybeSingle();

      if (error) throw error;

      if (!data) return code;
    }

    throw new Error('আইডি তৈরি ব্যর্থ, আবার চেষ্টা করুন');
  },

  // ৬-ডিজিট অ্যাক্সেস কোড
  generateAccessCode() {
    return 'AC' + Math.floor(
      100000 + Math.random() * 900000
    );
  },

  // তারিখ বাংলা ফরম্যাটে দেখানো
  fmtDate(d) {
    if (!d) return '';

    try {
      return new Date(d).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return String(d);
    }
  },

  // অ্যারে বা সাধারণ মান দেখানো
  fmtVal(v) {
    if (v == null || v === '') return '';

    if (Array.isArray(v)) {
      return v
        .filter(Boolean)
        .map(x => RH.esc(x))
        .join(', ');
    }

    return RH.esc(v);
  },

  // HTML escape
  esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));
  },

  // নোটিফিকেশন
  toast(msg, ok = true) {
    const d = document.createElement('div');

    d.textContent = msg;

    d.style.cssText = `
      position:fixed;
      top:20px;
      right:20px;
      z-index:9999;
      padding:14px 22px;
      border-radius:12px;
      color:#fff;
      font-weight:600;
      box-shadow:0 8px 24px rgba(0,0,0,.2);
      background:${ok ? '#1e7e5e' : '#b42318'};
      transition:.3s;
      opacity:0;
    `;

    document.body.appendChild(d);

    requestAnimationFrame(() => {
      d.style.opacity = '1';
    });

    setTimeout(() => {
      d.style.opacity = '0';

      setTimeout(() => d.remove(), 400);
    }, 3200);
  },

  // লগআউট
  logout: async () => {
    await sb.auth.signOut();
    location.href = 'login.html';
  }
};


// ============ থানা → জেলা → বিভাগ ডেটা ============
const BD_GEO = {
  'ঢাকা': {
    'ঢাকা': [
      'ধামরাই', 'সাভার', 'কেরানীগঞ্জ', 'নবাবগঞ্জ', 'দোহার'
    ],
    'গাজীপুর': [
      'গাজীপুর সদর', 'কালিয়াকৈর', 'কাপাসিয়া', 'শ্রীপুর', 'কালীগঞ্জ'
    ],
    'নারায়ণগঞ্জ': [
      'নারায়ণগঞ্জ সদর', 'আড়াইহাজার', 'বন্দর', 'সোনারগাঁও', 'রূপগঞ্জ'
    ],
    'টাঙ্গাইল': [
      'টাঙ্গাইল সদর', 'মধুপুর', 'ঘাটাইল', 'কালিহাতী', 'সখীপুর'
    ]
  },

  'চট্টগ্রাম': {
    'চট্টগ্রাম': [
      'সিটি', 'হাটহাজারী', 'সীতাকুণ্ড', 'মিরসরাই', 'পটিয়া', 'রাউজান'
    ],
    'কক্সবাজার': [
      'কক্সবাজার সদর', 'চকরিয়া', 'টেকনাফ', 'উখিয়া', 'রামু'
    ],
    'কুমিল্লা': [
      'কুমিল্লা সদর', 'দেবীদ্বার', 'চান্দিনা', 'বুড়িচং', 'লাকসাম'
    ],
    'নোয়াখালী': [
      'নোয়াখালী সদর', 'বেগমগঞ্জ', 'চাটখিল', 'সেনবাগ', 'কোম্পানীগঞ্জ'
    ]
  },

  'রাজশাহী': {
    'রাজশাহী': [
      'বোয়ালিয়া', 'পবা', 'মোহনপুর', 'চারঘাট', 'বাগমারা'
    ],
    'বগুড়া': [
      'বগুড়া সদর', 'শেরপুর', 'শিবগঞ্জ', 'গাবতলী', 'সারিয়াকান্দি'
    ],
    'পাবনা': [
      'পাবনা সদর', 'ঈশ্বরদী', 'ভাঙ্গুড়া', 'সাঁথিয়া', 'আটঘরিয়া'
    ],
    'নাটোর': [
      'নাটোর সদর', 'সিংড়া', 'বড়াইগ্রাম', 'গুরুদাসপুর', 'লালপুর'
    ]
  },

  'খুলনা': {
    'খুলনা': [
      'খালিশপুর', 'সোনাডাঙ্গা', 'দৌলতপুর', 'ডুমুরিয়া', 'বটিয়াঘাটা'
    ],
    'যশোর': [
      'যশোর সদর', 'অভয়নগর', 'কেশবপুর', 'ঝিকরগাছা', 'মণিরামপুর'
    ],
    'কুষ্টিয়া': [
      'কুষ্টিয়া সদর', 'কুমারখালী', 'ভেড়ামারা', 'মিরপুর', 'দৌলতপুর'
    ],
    'সাতক্ষীরা': [
      'সাতক্ষীরা সদর', 'কলারোয়া', 'তালা', 'কালীগঞ্জ', 'শ্যামনগর'
    ]
  },

  'বরিশাল': {
    'বরিশাল': [
      'বরিশাল সদর', 'বাকেরগঞ্জ', 'গৌরনদী', 'বানারীপাড়া', 'উজিরপুর'
    ],
    'পটুয়াখালী': [
      'পটুয়াখালী সদর', 'বাউফল', 'গলাচিপা', 'কলাপাড়া', 'মির্জাগঞ্জ'
    ],
    'ভোলা': [
      'ভোলা সদর', 'বোরহানউদ্দিন', 'চরফ্যাশন', 'লালমোহন', 'তজুমদ্দিন'
    ],
    'পিরোজপুর': [
      'পিরোজপুর সদর', 'নাজিরপুর', 'কাউখালী', 'ভান্ডারিয়া', 'মঠবাড়ীয়া'
    ]
  },

  'সিলেট': {
    'সিলেট': [
      'সিলেট সদর', 'বিয়ানীবাজার', 'গোলাপগঞ্জ', 'জৈন্তাপুর', 'কানাইঘাট'
    ],
    'মৌলভীবাজার': [
      'মৌলভীবাজার সদর', 'শ্রীমঙ্গল', 'কমলগঞ্জ', 'কুলাউড়া', 'বড়লেখা'
    ],
    'হবিগঞ্জ': [
      'হবিগঞ্জ সদর', 'মাধবপুর', 'নবীগঞ্জ', 'বাহুবল', 'চুনারুঘাট'
    ],
    'সুনামগঞ্জ': [
      'সুনামগঞ্জ সদর', 'ছাতক', 'জগন্নাথপুর', 'দিরাই', 'শাল্লা'
    ]
  },

  'রংপুর': {
    'রংপুর': [
      'রংপুর সদর', 'গঙ্গাচড়া', 'বদরগঞ্জ', 'পীরগঞ্জ', 'মিঠাপুকুর'
    ],
    'দিনাজপুর': [
      'দিনাজপুর সদর', 'বিরামপুর', 'পার্বতীপুর', 'বোচাগঞ্জ', 'ফুলবাড়ী'
    ],
    'কুড়িগ্রাম': [
      'কুড়িগ্রাম সদর', 'উলিপুর', 'চিলমারী', 'রাজারহাট', 'নাগেশ্বরী'
    ],
    'নীলফামারী': [
      'নীলফামারী সদর', 'ডোমার', 'ডিমলা', 'জলঢাকা', 'সৈয়দপুর'
    ]
  },

  'ময়মনসিংহ': {
    'ময়মনসিংহ': [
      'ময়মনসিংহ সদর', 'ত্রিশাল', 'ভালুকা', 'মুক্তাগাছা', 'ফুলবাড়ীয়া'
    ],
    'জামালপুর': [
      'জামালপুর সদর', 'সরিষাবাড়ী', 'মাদারগঞ্জ', 'মেলান্দহ', 'দেওয়ানগঞ্জ'
    ],
    'নেত্রকোণা': [
      'নেত্রকোণা সদর', 'মোহনগঞ্জ', 'আটপাড়া', 'কেন্দুয়া', 'দুর্গাপুর'
    ],
    'শেরপুর': [
      'শেরপুর সদর', 'নালিতাবাড়ী', 'শ্রীবরদী', 'নকলা', 'ঝিনাইগাতী'
    ]
  }
};


// ============ থানা সিলেক্ট → জেলা/বিভাগ অটো ============
function bindGeoSelects(divisionId, districtId, thanaId) {
  const dSel = document.getElementById(divisionId);
  const distSel = document.getElementById(districtId);
  const tSel = document.getElementById(thanaId);

  if (!tSel) return;

  const allThanas = [];

  Object.entries(BD_GEO).forEach(([div, dists]) => {
    Object.entries(dists).forEach(([dist, thanas]) => {
      thanas.forEach(t => {
        allThanas.push({
          div,
          dist,
          thana: t
        });
      });
    });
  });

  allThanas.sort((a, b) =>
    a.thana.localeCompare(b.thana, 'bn')
  );

  tSel.innerHTML =
    '<option value="">-- থানা / উপজেলা --</option>' +
    allThanas.map(t =>
      `<option data-div="${t.div}" data-dist="${t.dist}">${t.thana}</option>`
    ).join('');

  tSel.addEventListener('change', () => {
    const opt = tSel.selectedOptions[0];

    if (!opt || !opt.dataset.div) {
      if (dSel) dSel.value = '';
      if (distSel) distSel.value = '';
      return;
    }

    if (dSel) {
      dSel.innerHTML = `<option>${opt.dataset.div}</option>`;
    }

    if (distSel) {
      distSel.innerHTML = `<option>${opt.dataset.dist}</option>`;
    }
  });
}
