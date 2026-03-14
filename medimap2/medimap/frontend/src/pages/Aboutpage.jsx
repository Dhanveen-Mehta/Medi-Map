// src/pages/AboutPage.jsx
import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

const TEAM = [
  {
    name: 'Amit Bhushan',
    role: 'Frontend Developer',
    roleHi: 'फ्रंटएंड डेवलपर',
    emoji: '🎨',
    desc: 'Designed the user experience, wireframes, and visual identity of MediMap.',
    descHi: 'MediMap का यूज़र एक्सपीरियंस, वायरफ्रेम और विज़ुअल आइडेंटिटी डिज़ाइन की।',
    color: 'from-[#2E7DFF] to-[#00C2A8]',
},
{
    name: 'Dhanveen Mehta',
    role: 'Backend Developer',
    roleHi: 'बैकएंड डेवलपर',
    emoji: '👨‍💻',
    desc: 'Built the entire MediMap platform including backend APIs, database, and frontend UI.',
    descHi: 'MediMap का पूरा प्लेटफ़ॉर्म बनाया — बैकएंड, डेटाबेस और फ्रंटएंड।',
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Parul Singh',
    role: 'Data & Research',
    roleHi: 'डेटा और रिसर्च',
    emoji: '📊',
    desc: 'Researched pharmacy pricing data, medicine databases, and market analysis.',
    descHi: 'फार्मेसी कीमत डेटा, दवाई डेटाबेस और मार्केट एनालिसिस की रिसर्च की।',
    color: 'from-orange-500 to-yellow-500',
  },
  {
    name: 'Mayank Bedi',
    role: 'Business & Strategy',
    roleHi: 'बिज़नेस और रणनीति',
    emoji: '🚀',
    desc: 'Developed the business model, go-to-market strategy, and partnerships.',
    descHi: 'बिज़नेस मॉडल, मार्केट स्ट्रैटेजी और पार्टनरशिप विकसित की।',
    color: 'from-emerald-500 to-teal-500',
  },
];

const STATS = [
  { value: '500+', labelEn: 'Pharmacies', labelHi: 'फार्मेसियां' },
  { value: '2000+', labelEn: 'Medicines', labelHi: 'दवाइयां' },
  { value: '₹340', labelEn: 'Avg Savings', labelHi: 'औसत बचत' },
  { value: '10K+', labelEn: 'Users Helped', labelHi: 'लोगों की मदद' },
];

const FEATURES = [
  { icon: '🔍', titleEn: 'Real-time Price Search', titleHi: 'रियल-टाइम कीमत खोज', descEn: 'Search and compare medicine prices across hundreds of pharmacies instantly.', descHi: 'सैकड़ों फार्मेसियों में दवाई की कीमतें तुरंत खोजें और तुलना करें।' },
  { icon: '🗺️', titleEn: 'Live Pharmacy Map', titleHi: 'लाइव फार्मेसी मैप', descEn: 'Find the nearest pharmacy with the best price using our interactive map.', descHi: 'इंटरएक्टिव मैप से सबसे नज़दीक और सस्ती फार्मेसी खोजें।' },
  { icon: '📋', titleEn: 'Prescription Scanner', titleHi: 'पर्ची स्कैनर', descEn: 'Upload your prescription and our AI extracts all medicines automatically.', descHi: 'पर्ची अपलोड करें और हमारी AI सभी दवाइयां अपने आप निकाल लेती है।' },
  { icon: '💊', titleEn: 'Generic Alternatives', titleHi: 'जेनेरिक विकल्प', descEn: 'AI-powered suggestions for affordable generic medicine alternatives.', descHi: 'सस्ती जेनेरिक दवाइयों के लिए AI-संचालित सुझाव।' },
  { icon: '🎙️', titleEn: 'Voice Assistant', titleHi: 'वॉयस असिस्टेंट', descEn: 'Navigate the app hands-free using voice commands in English and Hindi.', descHi: 'हिंदी और अंग्रेज़ी में वॉयस कमांड से ऐप चलाएं।' },
  { icon: '🌐', titleEn: 'Bilingual Support', titleHi: 'द्विभाषी सहायता', descEn: 'Full English and Hindi language support for all users across India.', descHi: 'पूरे भारत के उपयोगकर्ताओं के लिए पूर्ण हिंदी और अंग्रेज़ी समर्थन।' },
];

export default function AboutPage() {
  const { lang } = useLang();
  const t = (en, hi) => lang === 'hi' ? hi : en;

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }}>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2E7DFF] via-blue-600 to-[#00C2A8] text-white py-24 px-4">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>
        </div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6 border border-white/20">
            🏥 {t('Our Mission', 'हमारा मिशन')}
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight">
            {t('Making Healthcare', 'स्वास्थ्य सेवा को')} <br/>
            <span className="text-[#7FFFD4]">{t('Affordable for All', 'सभी के लिए सस्ता बनाना')}</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            {t(
              'MediMap was built to solve a real problem — medicine prices vary wildly across pharmacies. We help every Indian find the most affordable medicine near them.',
              'MediMap एक असली समस्या हल करने के लिए बनाया गया — अलग-अलग फार्मेसियों में दवाई की कीमतें बहुत अलग होती हैं। हम हर भारतीय को पास में सबसे सस्ती दवाई खोजने में मदद करते हैं।'
            )}
          </p>
          <Link to="/" className="inline-flex items-center gap-2 bg-white text-[#2E7DFF] font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-all">
            🔍 {t('Try MediMap', 'MediMap आज़माएं')}
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map(stat => (
            <div key={stat.value} className="text-center">
              <div className="text-3xl font-bold text-[#2E7DFF]">{stat.value}</div>
              <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {t(stat.labelEn, stat.labelHi)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Problem we solve */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {t('The Problem We Solve', 'हम क्या समस्या हल करते हैं')}
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {t(
              'In India, the same medicine can cost 3x more at one pharmacy vs another just 500 meters away.',
              'भारत में, एक ही दवाई 500 मीटर दूर एक फार्मेसी में 3 गुना ज़्यादा महंगी हो सकती है।'
            )}
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {[
            { icon: '😟', titleEn: 'The Problem', titleHi: 'समस्या', descEn: 'Patients overpay for medicines because they don\'t know where to find the best prices nearby.', descHi: 'मरीज़ दवाइयों के लिए ज़्यादा पैसे देते हैं क्योंकि उन्हें पास में सबसे अच्छी कीमत नहीं पता।', color: 'bg-red-50 border-red-100' },
            { icon: '💡', titleEn: 'Our Solution', titleHi: 'हमारा समाधान', descEn: 'MediMap shows real-time prices from all nearby pharmacies so you always get the best deal.', descHi: 'MediMap पास की सभी फार्मेसियों की रियल-टाइम कीमतें दिखाता है।', color: 'bg-blue-50 border-blue-100' },
            { icon: '🎯', titleEn: 'Our Impact', titleHi: 'हमारा असर', descEn: 'Users save an average of ₹340 per month on medicines using MediMap.', descHi: 'उपयोगकर्ता MediMap से दवाइयों पर औसतन ₹340 प्रति माह बचाते हैं।', color: 'bg-emerald-50 border-emerald-100' },
          ].map((item, i) => (
            <div key={i} className={`card p-6 text-center ${item.color}`}>
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{t(item.titleEn, item.titleHi)}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t(item.descEn, item.descHi)}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <h2 className="text-3xl font-bold text-center mb-3" style={{ color: 'var(--text-primary)' }}>
          {t('What MediMap Offers', 'MediMap क्या देता है')}
        </h2>
        <p className="text-center mb-10" style={{ color: 'var(--text-secondary)' }}>
          {t('Built with cutting-edge technology for every Indian', 'हर भारतीय के लिए आधुनिक तकनीक से बनाया गया')}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {FEATURES.map((f, i) => (
            <div key={i} className="card p-5 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{t(f.titleEn, f.titleHi)}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t(f.descEn, f.descHi)}</p>
            </div>
          ))}
        </div>

        {/* Team */}
        <h2 className="text-3xl font-bold text-center mb-3" style={{ color: 'var(--text-primary)' }}>
          {t('Meet the Team', 'हमारी टीम')}
        </h2>
        <p className="text-center mb-10" style={{ color: 'var(--text-secondary)' }}>
          {t('The passionate people behind MediMap', 'MediMap के पीछे के जुनूनी लोग')}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {TEAM.map((member, i) => (
            <div key={i} className="card p-6 text-center hover:shadow-md transition-all hover:-translate-y-1">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg`}>
                {member.emoji}
              </div>
              <h3 className="font-bold text-base mb-0.5" style={{ color: 'var(--text-primary)' }}>{member.name}</h3>
              <p className="text-xs font-semibold text-[#2E7DFF] mb-3">{t(member.role, member.roleHi)}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t(member.desc, member.descHi)}</p>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div className="card p-8 mb-16 text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('Built With', 'किससे बनाया')}
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            {t('Modern technology stack for performance and scale', 'परफॉर्मेंस और स्केल के लिए आधुनिक तकनीक')}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: 'React', color: 'bg-blue-100 text-blue-700' },
              { name: 'Node.js', color: 'bg-green-100 text-green-700' },
              { name: 'MongoDB', color: 'bg-emerald-100 text-emerald-700' },
              { name: 'Tailwind CSS', color: 'bg-cyan-100 text-cyan-700' },
              { name: 'Leaflet Maps', color: 'bg-orange-100 text-orange-700' },
              { name: 'Gemini AI', color: 'bg-purple-100 text-purple-700' },
              { name: 'Tesseract OCR', color: 'bg-red-100 text-red-700' },
              { name: 'Web Speech API', color: 'bg-pink-100 text-pink-700' },
              { name: 'Vite', color: 'bg-yellow-100 text-yellow-700' },
              { name: 'Express.js', color: 'bg-gray-100 text-gray-700' },
            ].map(tech => (
              <span key={tech.name} className={`px-4 py-2 rounded-full text-sm font-semibold ${tech.color}`}>
                {tech.name}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#2E7DFF] to-[#00C2A8] rounded-2xl p-10 text-white text-center">
          <h3 className="text-2xl font-bold mb-3">
            {t('Ready to Save on Medicines?', 'दवाइयों पर बचत के लिए तैयार हैं?')}
          </h3>
          <p className="text-white/80 mb-6">
            {t('Join thousands of Indians who save money every month with MediMap.', 'हज़ारों भारतीयों से जुड़ें जो MediMap से हर महीने पैसे बचाते हैं।')}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/signup" className="bg-white text-[#2E7DFF] font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-all">
              {t('Get Started Free', 'मुफ़्त शुरू करें')}
            </Link>
            <Link to="/" className="bg-white/20 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/30 transition-all border border-white/30">
              {t('Search Medicines', 'दवाई खोजें')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}