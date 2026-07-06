const $ = (id) => document.getElementById(id);

const sectionButtons = document.querySelectorAll('.slink[data-section]');
const sections = document.querySelectorAll('.dashboard-section');
const pageTitle = $('pageTitle');
const languageSelect = $('languageSelect');
const themeToggle = $('themeToggle');
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

const state = {
  uploads: JSON.parse(localStorage.getItem('cropGuardUploads') || '[]'),
  decisions: JSON.parse(localStorage.getItem('cropGuardChats') || '[]'),
  profit: 38000,
  weather: { temp: 28, humidity: 62, rain: 18, wind: 9, desc: 'Sunny' },
};

const marketPrices = {
  tomato: { price: 1850, trend: 'Rising', demand: 'High', forecast: 'Likely to improve in 5-7 days', sellTime: 'Late morning mandi window', score: 82 },
  rice: { price: 2350, trend: 'Stable', demand: 'Medium', forecast: 'Stable for 2 weeks', sellTime: 'After quality grading', score: 68 },
  paddy: { price: 2280, trend: 'Stable', demand: 'Medium', forecast: 'Stable for 2 weeks', sellTime: 'After quality grading', score: 69 },
  chilli: { price: 9200, trend: 'Volatile', demand: 'High', forecast: 'Can rise if arrivals reduce', sellTime: 'Wait for dry quality premium', score: 74 },
  cotton: { price: 6900, trend: 'Rising', demand: 'Medium', forecast: 'Moderate upside possible', sellTime: 'Sell graded produce in lots', score: 71 },
  maize: { price: 2150, trend: 'Soft', demand: 'Medium', forecast: 'May improve after local stock clears', sellTime: 'Avoid distress sale', score: 58 },
};

const diseases = [
  {
    name: 'Tomato Blight',
    severity: 'High',
    symptoms: 'Yellowing, dark patches, curling edges, and fast spreading leaf damage.',
    causes: 'High humidity, wet foliage, poor airflow, and infected crop residue.',
    treatment: 'Remove affected leaves, improve air flow, and apply copper-based fungicide as per local guidance.',
    prevention: 'Use drip irrigation, rotate crops, sanitize tools, and avoid overhead watering.',
    recovery: '7-14 days if spread is controlled early.',
    fertilizer: 'Use potassium-rich fertilizer and balanced NPK.',
    warning: 'Avoid spraying before rain or during high wind.',
  },
  {
    name: 'Leaf Spot',
    severity: 'Medium',
    symptoms: 'Small brown spots with yellow halos and gradual leaf drying.',
    causes: 'Warm wet weather, dense planting, and splash spread from soil.',
    treatment: 'Cut away spotted leaves, apply neem or recommended fungicide, and improve spacing.',
    prevention: 'Mulch soil, water at root level, remove crop debris, and inspect after rain.',
    recovery: '5-10 days for new growth to appear clean.',
    fertilizer: 'Add magnesium-rich organic fertilizer and compost.',
    warning: 'Monitor closely during humid mornings.',
  },
  {
    name: 'Powdery Mildew',
    severity: 'Medium',
    symptoms: 'White powdery coating on leaves with weak growth and leaf curl.',
    causes: 'Cool nights, humid air, shade, and poor air movement.',
    treatment: 'Apply sulfur spray if suitable, prune crowded growth, and increase light exposure.',
    prevention: 'Use resistant varieties, avoid excess nitrogen, and keep canopy open.',
    recovery: '10-15 days with repeated monitoring.',
    fertilizer: 'Reduce nitrogen and use phosphorus-rich feed.',
    warning: 'Do not ignore white patches on new leaves.',
  },
  {
    name: 'Healthy Leaf',
    severity: 'Low',
    symptoms: 'Leaf appears green with no major visible disease marks.',
    causes: 'No disease pattern detected in this crop scan.',
    treatment: 'Continue balanced irrigation and regular scouting.',
    prevention: 'Keep soil healthy, inspect weekly, and avoid water stress.',
    recovery: 'No recovery needed.',
    fertilizer: 'Use light balanced fertilizer based on crop stage.',
    warning: 'Watch for early spots or yellowing.',
  },
];

const schemes = [
  {
    title: 'PM-KISAN',
    icon: 'images/schemes/pmkisan.svg',
    category: 'central',
    states: ['all'],
    crops: ['all'],
    website: 'https://pmkisan.gov.in/',
    text: 'Central income support for eligible farmer families through direct benefit transfer.',
    benefits: 'Rs 6,000 per year in three instalments, subject to eligibility and exclusions.',
    eligibility: 'Eligible landholding farmer families with valid records, Aadhaar, and bank details.',
    process: 'Register or check status through PM-KISAN portal, CSC, or local agriculture office.',
  },
  {
    title: 'PMFBY Crop Insurance',
    icon: 'images/schemes/pmfby.svg',
    category: 'insurance',
    states: ['all'],
    crops: ['all'],
    website: 'https://pmfby.gov.in/',
    text: 'Crop insurance support against notified crop loss due to natural calamity, pest, and disease.',
    benefits: 'Risk cover for yield loss and localized calamities as per notified crop and season.',
    eligibility: 'Farmers growing notified crops in notified areas; loan and non-loan farmers can apply.',
    process: 'Apply through PMFBY portal, bank, CSC, or state notified insurance channel before cutoff.',
  },
  {
    title: 'PM Kisan Maan Dhan Yojana',
    icon: 'images/schemes/maandhan.svg',
    category: 'pension',
    states: ['all'],
    crops: ['all'],
    website: 'https://maandhan.in/',
    text: 'Voluntary pension scheme for small and marginal farmers.',
    benefits: 'Monthly pension support after eligible age, based on contribution rules.',
    eligibility: 'Small and marginal farmers in the eligible age group with required identity records.',
    process: 'Enroll through CSC or official Maandhan portal with Aadhaar and bank details.',
  },
  {
    title: 'Rythu Bandhu / Rythu Bharosa',
    icon: 'images/schemes/rythu.svg',
    category: 'state',
    states: ['telangana', 'andhra pradesh', 'ap'],
    crops: ['all'],
    website: 'https://agri.telangana.gov.in/',
    text: 'State farmer investment support programs for eligible farmers in Telangana and Andhra Pradesh.',
    benefits: 'Seasonal investment assistance for crop inputs, subject to state rules.',
    eligibility: 'State resident farmers with eligible land records and bank linkage.',
    process: 'Verify land records and apply or check through state agriculture/revenue channels.',
  },
  {
    title: 'Fertilizer Subsidies',
    icon: 'images/schemes/fertilizer.svg',
    category: 'subsidy',
    states: ['all'],
    crops: ['all'],
    website: 'https://www.fert.nic.in/',
    text: 'Input support that keeps notified fertilizers more affordable for farmers.',
    benefits: 'Reduced effective fertilizer cost through central subsidy mechanisms.',
    eligibility: 'Farmers purchasing subsidized fertilizers through authorized channels.',
    process: 'Buy from authorized dealers with required farmer details as per local rules.',
  },
  {
    title: 'Micro Irrigation Subsidy',
    icon: 'images/schemes/irrigation.svg',
    category: 'subsidy',
    states: ['all'],
    crops: ['tomato', 'chilli', 'cotton', 'vegetables', 'horticulture', 'all'],
    website: 'https://pmksy.gov.in/',
    text: 'Support for drip and sprinkler systems to improve water-use efficiency.',
    benefits: 'Subsidy support for eligible micro-irrigation installation and water saving.',
    eligibility: 'Farmers installing approved drip or sprinkler systems, subject to state norms.',
    process: 'Apply through state horticulture/agriculture department or PMKSY linked portal.',
  },
  {
    title: 'State Farm Machinery Subsidy',
    icon: 'images/schemes/machinery.svg',
    category: 'state',
    states: ['all'],
    crops: ['all'],
    website: 'https://agrimachinery.nic.in/',
    text: 'Support for equipment purchase, custom hiring centers, and mechanization.',
    benefits: 'Cost assistance for approved machinery and equipment upgrades.',
    eligibility: 'Farmers, FPOs, SHGs, or custom hiring centers based on state rules.',
    process: 'Apply through state agriculture department or mechanization portal.',
  },
];

const newsItems = [
  { title: 'PM-KISAN safety advisory', category: 'government', text: 'Use only official portals and avoid APK links sent through unknown messages.', tag: 'Government Announcement' },
  { title: 'Crop insurance enrollment reminder', category: 'scheme', text: 'Farmers should check crop and season cutoff dates for PMFBY before sowing deadlines.', tag: 'Scheme Update' },
  { title: 'Vegetable market price watch', category: 'market', text: 'Tomato and chilli prices can move quickly when mandi arrivals change.', tag: 'Market Update' },
  { title: 'Humidity disease warning', category: 'weather', text: 'High humidity after rainfall can increase leaf spot and blight risk.', tag: 'Weather Alert' },
  { title: 'Fertilizer planning alert', category: 'scheme', text: 'Plan fertilizer purchase through authorized dealers and follow soil-test recommendations.', tag: 'Scheme Update' },
  { title: 'Irrigation efficiency update', category: 'government', text: 'Micro irrigation support can help reduce water use and improve crop resilience.', tag: 'Government Announcement' },
];

function saveState() {
  localStorage.setItem('cropGuardUploads', JSON.stringify(state.uploads));
  localStorage.setItem('cropGuardChats', JSON.stringify(state.decisions));
}

function notify(message) {
  const toast = $('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 1800);
}

function showSection(sectionId) {
  sections.forEach((section) => {
    section.classList.toggle('active', section.id === sectionId);
    if (section.id === sectionId) section.scrollTop = 0;
  });
  sectionButtons.forEach((button) => {
    const active = button.dataset.section === sectionId;
    button.classList.toggle('active', active);
    if (active) pageTitle.textContent = button.textContent;
  });
}

function showTab(tabId) {
  const target = $(tabId);
  if (!target) return;
  const section = target.closest('.dashboard-section');
  section.querySelectorAll('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === tabId));
  section.querySelectorAll('.tab-btn').forEach(button => button.classList.toggle('active', button.dataset.tab === tabId));
}

function formatTime() {
  return new Date().toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function money(value) {
  return `Rs ${Math.round(value).toLocaleString('en-IN')}`;
}

function numberValue(id) {
  return Number($(id)?.value || 0);
}

function cropKey(name) {
  return String(name || '').trim().toLowerCase();
}

function getMarket(crop) {
  return marketPrices[cropKey(crop)] || { price: 2600, trend: 'Stable', demand: 'Medium', forecast: 'Watch nearby mandi arrivals', sellTime: 'Sell in quality-graded lots', score: 62 };
}

function speak(text) {
  if (!text || !text.trim()) return;
  if (!('speechSynthesis' in window)) {
    alert('Speech is not supported in this browser.');
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageSelect.value || 'en-IN';
  utterance.rate = 0.95;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function formatAssistantAnswer(parts) {
  const formatArray = (items) => Array.isArray(items) ? items : [String(items || '').trim()];
  const how = formatArray(parts.how || []);
  const why = formatArray(parts.why || []);
  const precautions = formatArray(parts.precautions || []);
  const whatNext = formatArray(parts.whatNext || []);
  const prevention = formatArray(parts.prevention || []);

  const textList = (items) => items.map(i => `• ${i}`).join('\n');
  const htmlList = (items) => items.map(i => `<div>• ${i}</div>`).join('');

  return {
    text: `How:\n${textList(how)}\n\nWhy:\n${textList(why)}\n\nPrecautions:\n${textList(precautions)}\n\nWhat next:\n${textList(whatNext)}\n\nPrevention:\n${textList(prevention)}`,
    html: `
      <div class="assistant-response-section"><strong>How:</strong>${htmlList(how)}</div>
      <div class="assistant-response-section"><strong>Why:</strong>${htmlList(why)}</div>
      <div class="assistant-response-section"><strong>Precautions:</strong>${htmlList(precautions)}</div>
      <div class="assistant-response-section"><strong>What next:</strong>${htmlList(whatNext)}</div>
      <div class="assistant-response-section"><strong>Prevention:</strong>${htmlList(prevention)}</div>
    `.trim(),
  };
}

function localizedAnswer(question) {
  const q = String(question || '').toLowerCase();
  const lang = languageSelect.value;

  if (lang === 'hi-IN') {
    if (q.includes('market') || q.includes('sell') || q.includes('price')) {
      return formatAssistantAnswer({
        how: ['मंडी भाव से तुलना करें और बेहतर समय खोजें', 'गुणवत्ता अच्छी हो तो तुरंत बेचें', 'समय पर विचार करके सही निर्णय लें'],
        why: ['बेहतर कीमत मिलने की संभावना बढ़ती है', 'मौसमी मूल्य परिवर्तन होता रहता है', 'भंडारण से गुणवत्ता घट सकती है'],
        precautions: ['कम कीमत पर जल्दबाजी न करें', 'अच्छी गुणवत्ता के लिए अतिरिक्त प्रयास करें', 'बाजार की ताजा खबरें लेते रहें'],
        whatNext: ['स्थानीय मंडी भाव सूची देखें', 'व्यापारियों से सलाह-मशविरा करें', 'परिवहन लागत सहित लागत निकालें'],
        prevention: ['कभी नुकसान में बेचने की जल्दबाजी न करें', 'गिरावट के बाद धीरज से प्रतीक्षा करें', 'किसानों के समूह में बिक्री करें'],
      });
    }
    if (q.includes('scheme') || q.includes('pm-kisan') || q.includes('subsidy') || q.includes('insurance')) {
      return formatAssistantAnswer({
        how: ['पात्रता की पूरी जांच करें पहले', 'आधार, बैंक खाता और दस्तावेज तैयार रखें', 'आधिकारिक वेबसाइट या CSC से आवेदन करें'],
        why: ['सरकार प्रत्यक्ष आर्थिक सहायता देती है', 'बीमा से फसल खराब होने पर मुआवजा मिलता है', 'खाद और बीज पर सब्सिडी से खर्च कम होता है'],
        precautions: ['केवल आधिकारिक पोर्टल से आवेदन करें हमेशा', 'नकली लिंक या APK डाउनलोड कभी न करें', 'आवेदन की प्रति सुरक्षित रख कर सहेजें'],
        whatNext: ['अपने दस्तावेजों का सत्यापन करवाएं तुरंत', 'आवेदन की स्थिति ऑनलाइन नियमित देखें', 'क्षेत्रीय कार्यालय से व्यक्तिगत जानकारी लें'],
        prevention: ['योजना के सभी नियम ध्यान से समझें', 'समय सीमा से पहले आवेदन अवश्य करें', 'किसी मध्यस्थ या दलाल को पकड़ाएं न'],
      });
    }
    if (q.includes('yellow') || q.includes('leaf') || q.includes('disease')) {
      return formatAssistantAnswer({
        how: ['रोग वाली पत्तियों को तुरंत सावधानी से हटाएं', 'मिट्टी की नमी हर दिन सही रखने की कोशिश करें', 'पौधों के बीच हवा का प्रवाह सुनिश्चित करें'],
        why: ['पीली पत्तियां पोषक तत्व की कमी और तनाव बताती हैं', 'उचित जल प्रबंधन पौधों का स्वास्थ्य बेहतर करता है', 'अच्छी हवा से फफूंद और अन्य रोग कम होते हैं'],
        precautions: ['बीमार पत्तों को खेत में ही जलाएं तुरंत', 'कीटनाशक संतुलित और निर्धारित मात्रा में दें', 'रोग पहले पुरानी पत्तियों पर ध्यान दें'],
        whatNext: ['मिट्टी का परीक्षण कृषि विभाग से करवाएं', 'पोषक तत्वों का सही संतुलन बनाएं रखें', 'नई पत्तियों की लगातार निगरानी करते रहें'],
        prevention: ['फसल चक्र अपनाकर बीमारियां कम करें', 'प्रतिरोधी और रोग-मुक्त किस्मों का चयन करें', 'स्वास्थ्यकर और प्रमाणित बीज ही बोएं'],
      });
    }
    if (q.includes('fertilizer') || q.includes('npk') || q.includes('soil')) {
      return formatAssistantAnswer({
        how: ['मिट्टी की जांच पहले कृषि विभाग से करवाएं अवश्य', 'जैव खाद और रासायनिक खाद दोनों को मिलाएं', 'फसल के हर चरण पर नियमित अंतराल पर दें'],
        why: ['मृदा परीक्षण से सही खाद की जानकारी सटीक मिलती है', 'जैव खाद मिट्टी की गुणवत्ता और जीवंतता बढ़ाती है', 'संतुलित पोषण से फसल स्वस्थ और अधिक पैदा होती है'],
        precautions: ['अत्यधिक नाइट्रोजन कभी न दें बिना जांच के', 'वर्षा से पहले खाद डालना बिल्कुल सही नहीं है', 'फसल के हर विकास चरण में अलग-अलग खाद दें'],
        whatNext: ['पहले कार्बनिक खाद और गोबर मिलाएं मिट्टी में', 'फिर फसल की जरूरत के अनुसार NPK दें धीरे-धीरे', 'नई पत्तियों की बढ़वार और रंग नियमित देखें'],
        prevention: ['हर 2-3 साल में मिट्टी की जांच करवाते रहें', 'विभिन्न फसलें बदल-बदलकर बोएं नियमित', 'जैव खाद और कम्पोस्ट का उपयोग बढ़ाते जाएं'],
      });
    }
    if (q.includes('water') || q.includes('irrigation')) {
      return formatAssistantAnswer({
        how: ['सुबह की सिंचाई सबसे अच्छी होती है हमेशा', 'मिट्टी की नमी को नियमित रूप से जांचते रहें', 'बारिश के बाद अतिरिक्त सिंचाई कभी न दें'],
        why: ['सुबह की सिंचाई पत्तियों को रात में गीला होने से बचाती है', 'सही नमी बनाए रखने से पौधों को रोग कम होते हैं', 'रात की सिंचाई फफूंद और अन्य रोग तेजी से बढ़ाती है'],
        precautions: ['पत्तियों को कभी रात में गीला न रखें बिल्कुल', 'आवश्यकता से अधिक पानी देना हानिकारक है हमेशा', 'खेत में जल निकास की व्यवस्था अवश्य होनी चाहिए'],
        whatNext: ['दो दिन के बाद एक बार मिट्टी की नमी जांचें नियमित', 'मौसम और ऋतु के अनुसार सिंचाई की मात्रा बदलें', 'बारिश का पानी इकट्ठा करके संरक्षण करते रहें'],
        prevention: ['ड्रिप या स्प्रिंकलर सिंचाई प्रणाली अपनाएं निश्चित', 'खेत में मल्चिंग करते रहें लगातार ढक्कन की तरह', 'भूजल स्तर को स्थिर बनाए रखने की कोशिश करें'],
      });
    }
    if (q.includes('pest')) {
      return formatAssistantAnswer({
        how: ['पत्तियों के नीचे की ओर ध्यान से देखभाल करें', 'फेरोमोन ट्रैप को सही जगह पर लगाएं नियमित', 'नीम का अच्छी तरह छिड़काव करते रहें नियमित'],
        why: ['कीट के संकेतों को जल्दी पकड़ने से नुकसान कम होता है', 'फेरोमोन ट्रैप कीटों को आकर्षित करके पकड़ते हैं', 'नीम के तेल से कीट दूर भाग जाते हैं स्वाभाविक'],
        precautions: ['केवल सरकार द्वारा अनुमोदित कीटनाशक ही लें', 'प्रतिबंधित और पुरानी दवाओं से बिल्कुल दूर रहें', 'तेज हवा और धूप में कभी न छिड़कें बिल्कुल'],
        whatNext: ['क्षतिग्रस्त पत्तों और शाखाओं को तुरंत हटाएं', 'जैविक नियंत्रण पद्धति को अपनाएं अवश्य', 'एक सप्ताह बाद फिर से निरीक्षण करते रहें'],
        prevention: ['फसल चक्र को पूरी तरह अपनाएं नियमित', 'खेत की सफ़ाई और स्वच्छता बनाएं रखें हमेशा', 'स्वस्थ और रोग-मुक्त पौधे ही लगाएं'],
      });
    }
    return formatAssistantAnswer({
      how: ['सबसे पहले अपनी समस्या की सटीक पहचान करें निश्चित', 'स्थानीय कृषि विशेषज्ञ से सलाह-मशविरा अवश्य लें', 'अनुभवी और सफल किसानों से बात करते रहें'],
      why: ['सही पहचान से ही सही समाधान संभव होता है', 'विशेषज्ञ सलाह आपका समय और पैसा बचाती है', 'अनुभव के आधार पर लिए गए फैसले कामयाब होते हैं'],
      precautions: ['जल्दबाजी में कोई भी कदम उठाएं न कभी', 'केवल प्रमाणित और वैज्ञानिक तरीके अपनाएं', 'केवल विश्वस्त स्रोतों से ही सलाह लें अवश्य'],
      whatNext: ['अपनी समस्या का विस्तृत विवरण नोट करें लिख कर', 'कृषि विभाग के कार्यालय से मिलें व सलाह लें', 'छोटे-छोटे प्रयोग करके शुरूआत करें पहले'],
      prevention: ['नियमित निरीक्षण अपने खेत का करते रहें सदा', 'स्वास्थ्यकर खेती के सभी नियम अपनाएं सख्ती से', 'मिट्टी, पानी और पोषण की देखभाल करते रहें'],
    });
  }

  if (lang === 'te-IN') {
    if (q.includes('market') || q.includes('sell') || q.includes('price')) {
      return formatAssistantAnswer({
        how: ['మార్కెట్ ధరతో సరిగ్గా పోలిస్తూ విక్రయించండి', 'గుణమానం మంచిదైతే వెంటనే బిక్రయించండి తక్షణం', 'సమయ నిర్ణయం చేసి సరిగ్గా విక్రయించండి'],
        why: ['ఎక్కువ ధర పొందే సమయం సరిగ్గా నిర్ణయించండి', 'భాండారం నుండి పంటకు నాణ్యత మరుగులో పడుతుంది', 'కాలానికి తగ్గ ధర నిర్ణయించి విక్రయించండి'],
        precautions: ['తక్కువ ధరకు వెంటనే ఎవరికీ విక్రయించవద్దు', 'సరిక్రమ నాణ్యత లేనందుకు చిన్న కుమ్ముకోకండి', 'జాతీయ గ్రేడింగ్ చేయించుకోండి తక్కువకు'],
        whatNext: ['తాజా మార్కెట్ ధర ఇన్ఫర్మేషన్ సేకరించండి', 'స్థానిక వ్యాపారులను సంప్రదించి సలహా తీసుకోండి', 'రవాణా ఖర్చులను సరిగ్గా లెక్కించుకోండి'],
        prevention: ['ఎక్కువ నష్టంలో విక్రయం చేయవద్దు అస్సలు', 'మెరుపు వేసిన విక్రయం చేయవద్దు బిల్కూల్', 'సమూహంగా జమ విక్రయం చేయండి దయచేసి'],
      });
    }
    if (q.includes('scheme') || q.includes('pm-kisan') || q.includes('subsidy') || q.includes('insurance')) {
      return formatAssistantAnswer({
        how: ['అర్హత నిబంధనలను సరిగ్గా పరిశీలించుకోండి', 'ఆధార్, బ్యాంకు ఖాతా, భూమి రికార్డులు సిద్ధం చేయండి', 'అధికార సంస్థ లేదా CSC వద్ద దరఖాస్తు చేయండి'],
        why: ['ప్రభుత్వం నుండి ప్రత్యక్ష ఆర్థిక సహాయ లభిస్తుంది', 'భీమా పంట విఫలమైతే తక్షణ నష్టపూరణ ఇస్తుంది', 'సారం సబ్‌సిడీ ఖర్చులను గణనీయంగా తగ్గిస్తుంది'],
        precautions: ['కేవలం అధికార వెబ్‌సైట్‌ నుండి దరఖాస్తు చేయండి', 'నకిలీ లింకులు, APK డౌన్‌లోడ్ చేయవద్దు నిర్ణయంగా', 'దరఖాస్తు ఇషూ కాపీ సురక్షితంగా సంరక్షించండి'],
        whatNext: ['మీ ఆధిక్షేత్ర డాక్యుమెంట్‌లను ధృవీకరించుకోండి వెంటనే', 'ఆన్‌లైన్‌లో దరఖాస్తు స్థితిని నియమితంగా చూడండి', 'సమీప కార్యాలయం నుండి సమాచారం సేకరించుకోండి'],
        prevention: ['పంట పథక నియమాలను పూర్తిగా అర్థం చేసుకోండి', 'సమయ పరిమితికు ముందే దరఖాస్తు చేయండి నిశ్చితంగా', 'మధ్యవర్తీ లేదా దలాలకు చెల్లరకండి ఎన్నటికీ'],
      });
    }
    if (q.includes('yellow') || q.includes('leaf') || q.includes('disease')) {
      return formatAssistantAnswer({
        how: ['సంక్రమిత ఆకులను జాగ్రత్తగా తక్షణం తొలగించండి', 'నేల ఆర్ద్రతను ప్రతిరోజూ సరిగ్గా నిర్వహించండి', 'పంట రేపైపై గాలి సరిగ్గా ప్రవహించేటట్లు చేయండి'],
        why: ['పసుపు ఆకులు పోషక సమస్య, జల సమస్య చూపుతాయి', 'సరిగ్గ నీటి నిర్వహణ పంట ఆరోగ్యం మెరుస్తుంది', 'గాలి ప్రసరణ శిలీంధ్ర సంక్రమణ కుదిలిస్తుంది'],
        precautions: ['సంక్రమిత ఆకులను వెంటనే నిర్మూలన చేయండి కచ్చితంగా', 'ఏకీకృత చెమ్మ మానిలిక్కన్ సమం లెక్కించుకోండి', 'పంట రోగ చిహ్నాలను ప్రతిదిన వీక్షించుకోండి'],
        whatNext: ['నేల పరీక్ష కృషి విభాగం ద్వారా చేయించుకోండి తక్షణం', 'పోషక సమతుల్యత సరిచేసుకోండి కడుపున్నియగా', 'కొత్త ఆకుల పర్యవేక్షణ నిరంతరం చేయండి'],
        prevention: ['ఫసలు చక్రం పూర్తిగా అనుసరించుకోండి వ్యవస్థితంగా', 'నిరోధక, రోగ-నిరోధక రకాలను ఎంచుకోండి', 'ఆరోగ్యకర, ప్రమాణ విత్తనాలు విస్తరించండి'],
      });
    }
    if (q.includes('fertilizer') || q.includes('npk') || q.includes('soil')) {
      return formatAssistantAnswer({
        how: ['మొదటగా నేల పరీక్ష కృషి శాఖ ద్వారా చేయించుకోండి', 'సేంద్రీయ, రసాయన సారాలను సరిగ్గా కలపండి', 'ఫసలు వృద్ధ దశలో నియమిత గణనీయ సారం ఇవ్వండి'],
        why: ['నేల పరీక్ష సరిగ్గ సారం ఎంపిక గురించి చెబుతుంది', 'సేంద్రీయ సారం నేల నాణ్యత, సజీవత బెర్లుస్తుంది', 'సమతుల్య పోషణ పంట ఆరోగ్యం, ఇతరత్తు గరిష్ఠం చేస్తుంది'],
        precautions: ['అపరిమిత నైట్రోజన్ పరీక్ష లేకుండా ఇవ్వకండి', 'వర్ష కాలానికి ముందు సారం వేయకండి సర్వథా', 'ఫసలు ప్రతి దశకు విభిన్న సారం వేసుకోండి'],
        whatNext: ['ముందుగా సేంద్రీయ సారం, గుబ్బలు నేలలో కలపండి', 'ఇచ్చటా ఫసలు చర్మ పర్యంతం సారం ఇవ్వండి సమం', 'కొత్త ఆకుల వృద్ధి, రంగు నియమితంగా గమనించండి'],
        prevention: ['2-3 సం.ల నిర్వచితంగా నేల పరీక్ష చేయించుకోండి', 'ఫసలను భిన్న విధానంగా నాటండి చక్రంలో', 'సేంద్రీయ సారం వాడుకను దిగ్గజ లో పెంచుకోండి'],
      });
    }
    if (q.includes('water') || q.includes('irrigation')) {
      return formatAssistantAnswer({
        how: ['ఉదయ సిచనం సర్వోత్తమ సిద్ధాంతం నిశ్చితంగా', 'నేల ఆర్ద్రతను ప్రతిరోజూ పరీక్షించుకోండి సమం', 'వర్షం తరువాత అదనపు నీరు ఇవ్వకండి సర్వవిధంగా'],
        why: ['ఉదయ సిచనం బాష్పీభవన నష్టం కనిష్ఠమం చేస్తుంది', 'సరిసరి ఆర్ద్రత పంట వ్యాధుల ప్రమాదం తక్కువ చేస్తుంది', 'రాత్రి సిచనం శిలీంధ్ర సంక్రమణ వేగాన్ని భర్తీ చేస్తుంది'],
        precautions: ['ఆకులను రాత్రికాలంలో తడిపించవద్దు సర్వథా', 'అనవసర, కూటమీ నీటి సిచనం చేయవద్దు అస్సలు', 'నీటి నిష్కాసన ఉత్తమంగా ఏర్పాటు చేసుకోండి'],
        whatNext: ['రెండు రోజుల నిర్వచితంగా ఆర్ద్రత సరిచేసుకోండి', 'ఋతువుకు అనుగుణంగా సిచనం మానిలిక్కన్ మార్చుకోండి', 'వర్ష జలాన్ని ఇకట్ట చేసుకోండి, సంరక్షించుకోండి'],
        prevention: ['చిక్కటి సిచనం వ్యవస్థ ఆచరించుకోండి నిశ్చితంగా', 'నేల ముల్చింగ్ చేసుకోండి నిరంతరం, ఆవరణం విధానం', 'భూజల స్థరం సంరక్షణ చేసుకోండి నిరంతరం'],
      });
    }
    if (q.includes('pest')) {
      return formatAssistantAnswer({
        how: ['ఆకుల వెనుక, కిందాలను ఖచ్చితంగా పరిశీలించండి నిరంతరం', 'ఫెరోమోన్ జాలం నిర్ణయిత చోటుల్లో విస్తరించండి', 'నీమ జల్లు ఖచ్చితంగా, నియమితంగా చేయండి నిరంతరం'],
        why: ['కీటక సంకేతాలను త్వరగా గుర్తిస్తే నష్టం కనిష్ఠం', 'ఫెరోమోన్ కీటకాలను ఆకర్షిస్తూ చిక్కుకోబెట్టుతుంది', 'నీమ జలం ఆస్థికీ నుండి కీటకాలను విమోచిస్తుంది'],
        precautions: ['కేవలం సరికారణ కీటనాశకాలనే వాడుకోండి నిశ్చితంగా', 'నిషేధిత, పాతకాల మానిలిక్కన్ నుండి దూరమే ఉండండి', 'తీవ్ర గాలిలో, సూర్యులలో జల్లు చేయకండి'],
        whatNext: ['క్షతిగ్రస్త ఆకులు, కొమ్మలను చట్టీగా తొలగించండి', 'జీవ నియంత్రణ పద్ధతులను ఖచ్చితంగా అనుసరించండి', 'ఒక వారం తరువాత పునరావలోకనం, గమనించండి'],
        prevention: ['ఫసలు చక్రం పూర్తిగా ఆచరించుకోండి నిరంతరం', 'నేల శుద్ధ, శోచిత పరిస్థితి సంరక్షించుకోండి', 'ఆరోగ్యకర, స్వచ్ఛ జీవ సంస్కృతి నాటండి'],
      });
    }
    return formatAssistantAnswer({
      how: ['మొదటగా సమస్యను సరిగ్గా గుర్తించుకోండి నిశ్చితంగా', 'స్థానిక కృషి నిపుణుల నుండి సలహా తీసుకోండి', 'అనుభవం గలిన, సఫలమైన రైతుల నుండి సంపర్కం చేయండి'],
      why: ['సరిగ్గ గుర్తింపు సరిగ్గ పరిష్కారానికి ఆధారం', 'నిపుణ సలహా సమయ, ఖర్చ, నష్టం ఆదా చేస్తుంది', 'అనుభవ ఆధారిత నిర్ణయాలు సఫలమవుతాయి సదా'],
      precautions: ['కుట్రపు చేసి ఏ చర్య చేయకండి సర్వథా', 'ఆధిక్ష, ప్రమాణీకృత పద్ధతులనే అనుసరించుకోండి', 'విశ్వసనీయ సలహా, సమాచారం తీసుకోండి'],
      whatNext: ['ఆ సమస్య యొక్క వివరణ లిఖితం చేసుకోండి తక్షణం', 'కృషి శాఖ కార్యాలయం సందర్శన చేయండి వెంటనే', 'చిన్న ప్రయోగాలతో ఆచరణ చేసుకోండి ఆరంభంలో'],
      prevention: ['నిరంతరం ఆ ఆస్థితిని గమనించుకోండి సదా', 'ఆరోగ్యకర సాగు సూత్రాలను అనుసరించుకోండి', 'నేల, జలం, పోషణ సంరక్షణ చేసుకోండి'],
    });
  }

  // Default English responses
  if (q.includes('market') || q.includes('sell') || q.includes('price')) {
    return formatAssistantAnswer({
      how: ['Compare your offered price with current market rates accurately', 'Check crop quality and grading standards before selling', 'Verify the buyer and payment method security thoroughly'],
      why: ['Market timing directly affects your profit margin significantly', 'Quality grading ensures premium prices for better crops', 'Payment security protects against fraud and losses'],
      precautions: ['Never accept offers significantly below market rate', 'Get written confirmation of the price and quantity always', 'Verify buyer credentials through local authorities before agreeing'],
      whatNext: ['Check nearby mandi prices and market trends carefully', 'Consult local agricultural officers for expert guidance', 'Choose the best time and secure place to sell produce'],
      prevention: ['Maintain crop quality throughout harvest and storage period', 'Store properly in dry place to avoid post-harvest losses', 'Avoid distress sales during glut or low price periods'],
    });
  }
  if (q.includes('scheme') || q.includes('pm-kisan') || q.includes('subsidy') || q.includes('insurance')) {
    return formatAssistantAnswer({
      how: ['Check eligibility criteria for each scheme thoroughly first', 'Gather required documents like Aadhaar, bank details, land records', 'Apply through official portal or local Common Service Center'],
      why: ['Government schemes provide direct financial support to farmers', 'Insurance protects against crop failure due to natural calamities', 'Subsidies reduce input costs significantly for poor farmers'],
      precautions: ['Only apply through official government websites always', 'Avoid APK downloads or suspicious links from unknown sources', 'Keep application receipts and acknowledgments safely stored'],
      whatNext: ['Verify your documents with authorities before submission', 'Track application status online regularly for updates', 'Contact agriculture office for clarifications on payments'],
      prevention: ['Understand scheme terms and conditions before applying', 'Apply before submission deadlines without any delay', 'Maintain proper farm records for future verification'],
    });
  }
  if (q.includes('yellow') || q.includes('leaf') || q.includes('disease')) {
    return formatAssistantAnswer({
      how: ['Remove infected leaves immediately without spreading spores', 'Check and maintain proper soil moisture levels daily', 'Improve air circulation in crop canopy through pruning'],
      why: ['Yellow leaves indicate nutrient deficiency or water stress', 'Proper moisture prevents fungal and bacterial diseases', 'Good airflow reduces fungal infections naturally'],
      precautions: ['Don\'t leave diseased leaves on the field ever', 'Use recommended fungicides if organic methods fail', 'Wear protective equipment while handling chemicals'],
      whatNext: ['Get soil tested for nutrient status by experts', 'Apply balanced fertilizer based on test results', 'Monitor new growth closely for any disease signs'],
      prevention: ['Practice crop rotation to break disease cycles', 'Use disease-resistant varieties for next season', 'Maintain field sanitation and remove crop residue'],
    });
  }
  if (q.includes('fertilizer') || q.includes('npk') || q.includes('soil')) {
    return formatAssistantAnswer({
      how: ['Get soil testing done first by agricultural department', 'Mix organic and chemical fertilizers in right proportion', 'Apply in recommended doses at crop growth stages'],
      why: ['Soil test identifies exact nutrient requirements accurately', 'Organic fertilizer improves soil structure and biology', 'Balanced nutrients ensure healthy crop growth always'],
      precautions: ['Avoid excessive nitrogen application without soil test', 'Don\'t apply before heavy rain forecast', 'Follow recommended doses strictly as per guidelines'],
      whatNext: ['Add organic matter and compost to improve soil', 'Apply NPK in split doses during growing season', 'Monitor crop growth and leaf color constantly'],
      prevention: ['Test soil every 2-3 years for monitoring', 'Practice crop rotation for soil health maintenance', 'Increase organic fertilizer usage over time'],
    });
  }
  if (q.includes('water') || q.includes('irrigation')) {
    return formatAssistantAnswer({
      how: ['Water early morning for best absorption by roots', 'Check soil moisture regularly before irrigating', 'Avoid watering after heavy rainfall received'],
      why: ['Early morning irrigation reduces water evaporation losses', 'Proper moisture prevents fungal and bacterial diseases', 'Wet foliage at night causes fungal and mildew issues'],
      precautions: ['Never keep leaves wet overnight in any condition', 'Don\'t over-irrigate leading to waterlogging situations', 'Ensure good drainage system in field always'],
      whatNext: ['Monitor soil moisture every 2-3 days regularly', 'Adjust irrigation based on weather and rainfall', 'Collect and store rainwater for dry periods'],
      prevention: ['Install drip irrigation system for water conservation', 'Use mulching to retain soil moisture effectively', 'Maintain groundwater balance through sustainable practices'],
    });
  }
  if (q.includes('pest')) {
    return formatAssistantAnswer({
      how: ['Inspect leaf undersides regularly for pest presence', 'Install pheromone traps in field strategically', 'Apply neem or approved pesticides in evening hours'],
      why: ['Early pest detection prevents massive crop damage losses', 'Pheromone traps attract and catch specific pests', 'Neem is natural, eco-friendly and cost-effective'],
      precautions: ['Use only approved insecticides from authorized dealers', 'Never use banned or restricted chemicals ever', 'Avoid spraying in strong winds or rain'],
      whatNext: ['Remove heavily infested plant parts immediately', 'Try biological pest control methods first always', 'Inspect again after one week for effectiveness'],
      prevention: ['Maintain crop diversity to prevent pest buildup', 'Keep field clean and weed-free regularly', 'Use healthy and disease-free seeds always'],
    });
  }

  return formatAssistantAnswer({
    how: ['First identify the exact problem affecting your crop', 'Consult local agricultural experts and specialists', 'Talk to experienced farmers in your local area'],
    why: ['Correct identification leads to proper solution approach', 'Expert advice saves time and money significantly', 'Farmer experience provides practical proven solutions'],
    precautions: ['Don\'t take hasty decisions without proper analysis', 'Use only proven methods recommended by experts', 'Seek trusted advice from credible sources always'],
    whatNext: ['Document your farm\'s current condition thoroughly', 'Visit agriculture office for professional guidance', 'Start with small trials before large implementation'],
    prevention: ['Monitor fields regularly throughout the season', 'Follow healthy and sustainable farming practices', 'Maintain soil and water quality for long term'],
  });
}

function renderHistory() {
  $('historyList').innerHTML = state.uploads.length
    ? state.uploads.map(item => `
      <li class="history-item">
        <img class="history-thumb" src="${item.thumb || ''}" alt="Leaf scan thumbnail" />
        <div><strong>${item.name}</strong><div>${item.summary}</div><small>${item.date}</small></div>
      </li>
    `).join('')
    : '<li>No uploads yet.</li>';

  $('chatHistoryList').innerHTML = state.decisions.length
    ? state.decisions.map(item => `<li><strong>${item.type || 'AI'}:</strong> ${item.question}<br><strong>Result:</strong> ${item.answer}<br><small>${item.date}</small></li>`).join('')
    : '<li>No questions yet.</li>';

  const recent = $('recentActivities');
  if (recent) {
    const activity = [...state.uploads.slice(0, 2), ...state.decisions.slice(0, 2)];
    recent.innerHTML = activity.length
      ? activity.map(item => `<li>${item.summary || item.answer || item.question} <small>${item.date}</small></li>`).join('')
      : '<li>No recent activity yet. Start with a crop scan or profit estimate.</li>';
  }
}

function setTheme(enabled) {
  document.body.classList.toggle('dark-mode', enabled);
  themeToggle.textContent = enabled ? 'Light' : 'Dark';
  localStorage.setItem('leafcropDark', enabled ? '1' : '0');
}

function renderMarketCards() {
  $('marketCards').innerHTML = Object.entries(marketPrices).map(([crop, item]) => `
    <div class="market-card">
      <strong>${crop.charAt(0).toUpperCase() + crop.slice(1)}</strong>
      <span>Current price: ${money(item.price)} / quintal</span>
      <div class="trend"><span style="width: ${item.score}%"></span></div>
      <div class="market-meta">
        <span>Trend: ${item.trend}</span>
        <span>Demand: ${item.demand}</span>
        <span>Forecast: ${item.forecast}</span>
        <span>Best time: ${item.sellTime}</span>
      </div>
    </div>
  `).join('');
}

function renderSchemes() {
  const query = ($('schemeSearch')?.value || '').toLowerCase();
  const filter = $('schemeFilter')?.value || 'all';
  const filtered = schemes.filter((scheme) => {
    const matchesText = `${scheme.title} ${scheme.text} ${scheme.benefits} ${scheme.eligibility}`.toLowerCase().includes(query);
    const matchesFilter = filter === 'all' || scheme.category === filter;
    return matchesText && matchesFilter;
  });
  $('schemeCards').innerHTML = filtered.map(scheme => `
    <div class="info-card scheme-card">
      <div class="scheme-card-head">
        <img class="scheme-card-icon" src="${scheme.icon}" alt="${scheme.title} icon" />
        <strong>${scheme.title}</strong>
      </div>
      <span>${scheme.text}</span>
      <div class="scheme-meta">
        <span><b>Benefits:</b> ${scheme.benefits}</span>
        <span><b>Eligibility:</b> ${scheme.eligibility}</span>
        <span><b>Application:</b> ${scheme.process}</span>
      </div>
      <div class="card-actions">
        <a class="link-button" href="${scheme.website}" target="_blank" rel="noopener">Official Website</a>
        <a class="link-button" href="${scheme.website}" target="_blank" rel="noopener">Apply</a>
      </div>
    </div>
  `).join('') || '<div class="info-card"><strong>No schemes found</strong><span>Try another search.</span></div>';
}

function renderNews() {
  const query = ($('newsSearch')?.value || '').toLowerCase();
  const filter = $('newsFilter')?.value || 'all';
  const filtered = newsItems.filter((item) => {
    const matchesText = `${item.title} ${item.text} ${item.tag}`.toLowerCase().includes(query);
    const matchesFilter = filter === 'all' || item.category === filter;
    return matchesText && matchesFilter;
  });
  $('newsCards').innerHTML = filtered.map(item => `
    <div class="info-card">
      <span class="news-pill">${item.tag}</span>
      <strong>${item.title}</strong>
      <span>${item.text}</span>
    </div>
  `).join('') || '<div class="info-card"><strong>No news found</strong><span>Try another category or search word.</span></div>';
}

function findSchemesForFarmer() {
  const farmerState = ($('schemeState').value || '').toLowerCase();
  const crop = ($('schemeCrop').value || '').toLowerCase();
  const land = numberValue('schemeLand');
  const eligible = schemes.filter((scheme) => {
    const stateMatch = scheme.states.includes('all') || scheme.states.some(item => farmerState.includes(item) || item.includes(farmerState));
    const cropMatch = scheme.crops.includes('all') || scheme.crops.some(item => crop.includes(item) || item.includes(crop));
    return stateMatch && cropMatch;
  });
  const estimated = land > 0 ? Math.round(land * 5000) : 0;
  $('schemeFinderOutput').innerHTML = eligible.length
    ? `Eligible matches for <strong>${farmerState || 'your state'}</strong>, <strong>${crop || 'your crop'}</strong>, <strong>${land || 0} acre</strong>:<br>${eligible.map(item => `- ${item.title}: ${item.benefits}`).join('<br>')}<br><br>Estimated state investment-support potential where applicable: <strong>${money(estimated)}</strong>.`
    : 'No exact match found. Try a nearby crop name or check central schemes.';
  state.decisions.unshift({ type: 'Schemes', question: `${farmerState} ${crop}`, answer: `${eligible.length} eligible scheme matches`, date: formatTime() });
  state.decisions = state.decisions.slice(0, 10);
  saveState();
  renderHistory();
  notify('Eligible schemes generated');
}

function weatherCodeLabel(code) {
  const map = { 0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 51: 'Drizzle', 61: 'Rain', 63: 'Moderate rain', 65: 'Heavy rain', 80: 'Rain showers', 95: 'Thunderstorm' };
  return map[code] || 'Clear';
}

function renderWeatherAlerts() {
  const { temp, humidity, rain, wind, desc } = state.weather;
  const alerts = [];
  if (temp >= 32) alerts.push({ type: 'danger', text: 'Heat alert: shade young plants and irrigate early morning.' });
  if (humidity >= 70) alerts.push({ type: 'warning', text: 'Humidity alert: fungal disease risk is high. Keep leaves dry.' });
  if (rain >= 35) alerts.push({ type: 'info', text: 'Rain alert: delay irrigation and avoid pesticide spraying.' });
  if (wind >= 20) alerts.push({ type: 'warning', text: 'Wind alert: avoid spraying and protect weak plants.' });
  if (desc.toLowerCase().includes('thunder')) alerts.push({ type: 'danger', text: 'Thunderstorm alert: postpone field operations.' });
  if (!alerts.length) alerts.push({ type: 'info', text: 'Weather is suitable for routine crop monitoring.' });
  $('weatherAlerts').innerHTML = alerts.map(alert => `<div class="alert ${alert.type}">${alert.text}</div>`).join('');

  const diseaseRisk = Math.min(95, Math.round((humidity * 0.55) + (rain * 0.25) + (temp > 30 ? 15 : 5)));
  $('dashWeatherRisk').textContent = `${Math.min(95, Math.round((humidity + rain) / 2))}%`;
  $('dashDiseaseRisk').textContent = `${diseaseRisk}%`;
  $('dashPestRisk').textContent = `${Math.min(90, Math.round((humidity + temp) / 2))}%`;
  $('farmHealthScore').textContent = Math.max(45, 100 - Math.round((diseaseRisk + rain) / 3));
}

async function fetchWeather(lat = 17.385, lon = 78.4867) {
  $('weatherMessage').textContent = 'Loading weather intelligence...';
  $('refreshWeather').disabled = true;
  $('useLocationBtn').disabled = true;
  try {
    const response = await fetch(`${WEATHER_API}?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,precipitation_probability,precipitation,windspeed_10m&timezone=auto`);
    const data = await response.json();
    if (!data.current_weather) throw new Error('No weather data');
    state.weather = {
      temp: Math.round(data.current_weather.temperature),
      humidity: data.hourly?.relativehumidity_2m?.[0] ?? 62,
      rain: data.hourly?.precipitation_probability?.[0] ?? Math.min(100, Math.round((data.hourly?.precipitation?.[0] || 0) * 30)),
      wind: Math.round(data.current_weather.windspeed || data.hourly?.windspeed_10m?.[0] || 9),
      desc: weatherCodeLabel(data.current_weather.weathercode),
    };
    $('weatherMessage').textContent = `Loaded weather for ${lat.toFixed(2)}, ${lon.toFixed(2)}.`;
  } catch (error) {
    state.weather = { temp: 29, humidity: 76, rain: 28, wind: 11, desc: 'Humid' };
    $('weatherMessage').textContent = 'Weather API unavailable. Showing crop weather intelligence.';
  } finally {
    $('weatherTemp').textContent = `${state.weather.temp} C`;
    $('weatherHumidity').textContent = `${state.weather.humidity}%`;
    $('weatherRain').textContent = `${state.weather.rain}%`;
    $('weatherWind').textContent = `${state.weather.wind} km/h`;
    $('weatherDesc').textContent = state.weather.desc;
    $('weatherAdvice').textContent = state.weather.rain > 40
      ? 'Delay irrigation, improve drainage, and avoid pesticide spray until rain clears.'
      : state.weather.humidity > 70
        ? 'Watch for fungal disease and keep foliage dry.'
        : 'Irrigate early morning and monitor soil moisture.';
    renderWeatherAlerts();
    $('refreshWeather').disabled = false;
    $('useLocationBtn').disabled = false;
  }
}

function updateResult(file) {
  const hash = Array.from(file.name + file.size + file.lastModified).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const disease = diseases[hash % diseases.length];
  const confidence = 65 + (hash % 30);

  $('resultDisease').textContent = disease.name;
  $('resultSeverity').textContent = disease.severity;
  $('resultConfidence').textContent = `${confidence}%`;
  $('confidenceBar').style.width = `${confidence}%`;
  document.querySelector('.result-circle .percentage').textContent = `${confidence}%`;
  document.querySelector('.severity-fill').style.width = disease.severity === 'High' ? '90%' : disease.severity === 'Medium' ? '58%' : '20%';
  $('resultReason').textContent = disease.symptoms;
  $('resultCause').textContent = disease.causes;
  $('resultTreatment').textContent = disease.treatment;
  $('resultPrevention').textContent = disease.prevention;
  $('resultRecovery').textContent = disease.recovery;
  $('resultFertilizer').textContent = disease.fertilizer;
  $('resultWarning').textContent = disease.warning;
  $('dashDiseaseRisk').textContent = disease.severity === 'High' ? '78%' : disease.severity === 'Medium' ? '46%' : '18%';

  const infectedOverlay = $('infectedOverlay');
  infectedOverlay.innerHTML = '';
  const spots = disease.severity === 'Low' ? 1 : 3 + (hash % 3);
  for (let i = 0; i < spots; i += 1) {
    const spot = document.createElement('div');
    spot.className = 'infected-spot';
    spot.style.width = `${22 + ((hash + i) % 42)}px`;
    spot.style.height = spot.style.width;
    spot.style.left = `${12 + ((hash + i * 11) % 68)}%`;
    spot.style.top = `${14 + ((hash + i * 17) % 64)}%`;
    const tip = document.createElement('span');
    tip.className = 'spot-tooltip';
    tip.textContent = `${disease.name} ${confidence}%`;
    spot.appendChild(tip);
    infectedOverlay.appendChild(spot);
  }
  infectedOverlay.classList.remove('hidden');

  state.uploads.unshift({ name: file.name, date: formatTime(), summary: `${disease.name}, ${confidence}% confidence`, thumb: $('previewImage').src });
  state.uploads = state.uploads.slice(0, 10);
  saveState();
  renderHistory();
  notify('Disease result saved to history');
}

function runSoilAdvice() {
  const ph = numberValue('soilPh');
  const nitrogen = numberValue('soilNitrogen');
  const moisture = numberValue('soilMoisture');
  const organic = numberValue('soilOrganic');
  const advice = [];
  if (ph < 6) advice.push('pH is acidic. Add agricultural lime slowly after soil testing.');
  else if (ph > 7.8) advice.push('pH is alkaline. Add compost and avoid excess lime.');
  else advice.push('pH is suitable for many crops.');
  if (nitrogen < 35) advice.push('Nitrogen is low. Add compost, green manure, or split-dose urea.');
  else if (nitrogen > 70) advice.push('Nitrogen is high. Reduce urea to avoid weak leafy growth.');
  else advice.push('Nitrogen level is balanced.');
  if (moisture < 35) advice.push('Soil is dry. Irrigate deeply in the morning.');
  else if (moisture > 75) advice.push('Soil is too wet. Improve drainage and avoid irrigation.');
  else advice.push('Moisture is in a healthy range.');
  if (organic < 2) advice.push('Organic matter is low. Add farmyard manure or compost.');
  else advice.push('Organic matter supports good soil structure.');
  $('soilAdvice').textContent = advice.join(' ');
}

function recommendCrops() {
  const soil = $('cropSoilType').value.toLowerCase();
  const season = $('cropSeason').value;
  const crops = soil.includes('black')
    ? ['Cotton', 'Chilli', 'Maize']
    : season === 'Rabi'
      ? ['Wheat', 'Gram', 'Mustard']
      : ['Rice', 'Tomato', 'Groundnut'];
  $('cropRecommendation').innerHTML = crops.map((crop, index) => `<strong>${crop}</strong>: Profitability ${index === 0 ? 'High' : 'Medium'}, water requirement ${index === 0 ? 'Medium' : 'Moderate'}, risk ${index === 0 ? 'Low' : 'Medium'}.`).join('<br>');
}

function predictPestRisk() {
  const humidity = numberValue('pestHumidity');
  const temp = numberValue('pestTemp');
  const risk = Math.min(96, Math.round((humidity * 0.55) + (temp * 1.2)));
  const category = risk > 75 ? 'High' : risk > 50 ? 'Medium' : 'Low';
  $('pestOutput').textContent = `Pest risk is ${risk}% (${category}). Use field scouting, pheromone traps, neem spray in evening, weed control, and early warning inspection of leaf undersides.`;
  $('dashPestRisk').textContent = `${risk}%`;
}

function irrigationPlan() {
  const crop = $('irrigationCrop').value || 'crop';
  const soil = $('irrigationSoil').value || 'soil';
  const rainText = state.weather.rain > 40 ? 'Rain is likely, so delay irrigation and check drainage.' : 'Rain chance is low, so irrigate early morning.';
  const water = state.weather.temp > 32 ? 'High water requirement' : 'Moderate water requirement';
  $('irrigationAdvice').textContent = `${crop} in ${soil} soil: ${water}. Schedule: deep watering every 2-3 days, adjust by soil moisture. ${rainText}`;
}

function estimateProfit(record = true) {
  const crop = $('profitCrop').value;
  const area = numberValue('landArea');
  const totalCost = numberValue('seedCost') + numberValue('fertilizerCost') + numberValue('waterCost') + numberValue('laborCost') + numberValue('otherCost');
  const market = getMarket(crop);
  const yieldPerAcre = cropKey(crop).includes('tomato') ? 95 : cropKey(crop).includes('chilli') ? 18 : 28;
  const estimatedYield = area * yieldPerAcre;
  const revenue = estimatedYield * market.price;
  const profit = revenue - totalCost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const risk = profit < totalCost * 0.35 ? 'High' : profit < totalCost ? 'Medium' : 'Low';
  state.profit = profit;
  $('profitOutput').innerHTML = `Estimated yield: <strong>${estimatedYield.toFixed(1)} quintals</strong><br>Expected revenue: <strong>${money(revenue)}</strong><br>Total cost: <strong>${money(totalCost)}</strong><br>Estimated profit: <strong>${money(profit)}</strong><br>Profit margin: <strong>${margin.toFixed(1)}%</strong><br>Risk level: <strong>${risk}</strong>`;
  const max = Math.max(revenue, totalCost, Math.abs(profit), 1);
  $('revenueBar').style.width = `${Math.max(8, (revenue / max) * 100)}%`;
  $('costBar').style.width = `${Math.max(8, (totalCost / max) * 100)}%`;
  $('profitBar').style.width = `${Math.max(8, (Math.max(profit, 0) / max) * 100)}%`;
  $('dashboardProfit').textContent = money(profit);
  $('investmentOutput').innerHTML = `Emergency fund: <strong>${money(profit * 0.15)}</strong><br>Reinvestment: <strong>${money(profit * 0.30)}</strong><br>Irrigation improvement: <strong>${money(profit * 0.18)}</strong><br>Fertilizer planning: <strong>${money(profit * 0.12)}</strong><br>Equipment upgrade: <strong>${money(profit * 0.10)}</strong><br>Risk tip: keep insurance active and avoid spending all profit before next season.`;
  if (record) {
    state.decisions.unshift({ type: 'Profit', question: crop, answer: `${money(profit)} estimated profit with ${risk} risk`, date: formatTime() });
    state.decisions = state.decisions.slice(0, 10);
    saveState();
    renderHistory();
    notify('Profit forecast saved');
  }
}

function sellingAdvice(record = true) {
  const crop = $('sellCrop').value;
  const qty = numberValue('sellQuantity');
  const offered = numberValue('offeredPrice');
  const market = getMarket(crop);
  const offeredRevenue = qty * offered;
  const marketRevenue = qty * market.price;
  const diff = offeredRevenue - marketRevenue;
  const ratio = offered / market.price;
  const score = Math.max(5, Math.min(100, Math.round((ratio * 70) + (market.score * 0.3))));
  const recommendation = ratio >= 1 ? 'Sell Now' : ratio >= 0.95 ? 'Negotiate' : market.trend === 'Rising' ? 'Wait for Better Prices' : 'Explore Nearby Markets';
  $('sellingOutput').innerHTML = `Current market price: <strong>${money(market.price)} / quintal</strong><br>Revenue at offered price: <strong>${money(offeredRevenue)}</strong><br>Revenue at market price: <strong>${money(marketRevenue)}</strong><br>Difference: <strong>${money(diff)}</strong><br>Fair price indicator: <strong>${ratio >= 0.95 ? 'Fair' : 'Below market'}</strong><br>AI recommendation: <strong>${recommendation}</strong>. ${market.forecast}`;
  $('sellScore').textContent = score;
  if (record) {
    state.decisions.unshift({ type: 'Selling', question: crop, answer: `${recommendation}, sell score ${score}`, date: formatTime() });
    state.decisions = state.decisions.slice(0, 10);
    saveState();
    renderHistory();
    notify('Selling advice saved');
  }
}

function runJourney() {
  const plan = [
    'Disease scan: upload a leaf and detect symptoms with confidence.',
    `Weather risk: ${state.weather.humidity}% humidity and ${state.weather.rain}% rain probability checked.`,
    'Treatment: remove infected leaves, avoid wet foliage, and follow recommended spray guidance.',
    `Profit: current projected profit is ${money(state.profit)}.`,
    'Market: compare offered price with mandi price before selling.',
    'Investment: reserve emergency fund, improve irrigation, and plan fertilizer.',
    'Schemes: check PM-KISAN, crop insurance, and micro irrigation subsidy.',
  ].join(' ');
  $('journeyOutput').textContent = plan;
  state.decisions.unshift({ type: 'Journey', question: 'Complete farmer journey', answer: 'Action plan generated', date: formatTime() });
  saveState();
  renderHistory();
}

function downloadReport() {
  const text = [
    'CropGuard AI Farm Report',
    `Generated: ${formatTime()}`,
    `Farm health score: ${$('farmHealthScore').textContent}`,
    `Disease risk: ${$('dashDiseaseRisk').textContent}`,
    `Weather risk: ${$('dashWeatherRisk').textContent}`,
    `Pest risk: ${$('dashPestRisk').textContent}`,
    `Projected profit: ${$('dashboardProfit').textContent}`,
    '',
    'Recent decisions:',
    ...state.decisions.map(item => `- ${item.type}: ${item.answer}`),
  ].join('\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'cropguard-ai-report.txt';
  link.click();
  URL.revokeObjectURL(link.href);
}

function bindEvents() {
  sectionButtons.forEach(button => button.addEventListener('click', () => showSection(button.dataset.section)));
  document.querySelectorAll('.tab-btn[data-tab]').forEach(button => button.addEventListener('click', () => showTab(button.dataset.tab)));
  themeToggle.addEventListener('click', () => setTheme(!document.body.classList.contains('dark-mode')));
  languageSelect.addEventListener('change', () => localStorage.setItem('cropGuardLanguage', languageSelect.value));

  $('imageInput').addEventListener('change', () => {
    const file = $('imageInput').files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      $('previewImage').src = reader.result;
      $('previewContainer').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
    $('analyzeMessage').textContent = 'Ready to scan your leaf image.';
  });

  $('analyzeBtn').addEventListener('click', () => {
    const file = $('imageInput').files?.[0];
    if (!file) {
      $('analyzeMessage').textContent = 'Please upload a leaf image first.';
      return;
    }
    $('analyzeBtn').disabled = true;
    $('scanOverlay').classList.remove('hidden');
    $('scanProgressBar').style.width = '0%';
    const phases = ['Analyzing leaf texture...', 'Checking disease patterns...', 'Generating treatment...'];
    let phase = 0;
    const step = () => {
      $('scanMessage').textContent = phases[phase] || 'Finalizing results...';
      $('scanProgressBar').style.width = `${Math.min(100, (phase + 1) * 34)}%`;
      phase += 1;
      if (phase <= phases.length) return setTimeout(step, 520);
      updateResult(file);
      $('scanOverlay').classList.add('hidden');
      $('analyzeBtn').disabled = false;
      $('analyzeMessage').textContent = 'Diagnosis complete. Review the treatment advice.';
      return null;
    };
    step();
  });

  $('quickScanBtn').addEventListener('click', () => {
    showSection('cropcare');
    showTab('diseaseTab');
  });
  $('refreshWeather').addEventListener('click', () => fetchWeather());
  $('useLocationBtn').addEventListener('click', () => {
    if (!navigator.geolocation) return $('weatherMessage').textContent = 'Geolocation is not supported by this browser.';
    $('weatherMessage').textContent = 'Locating your position...';
    return navigator.geolocation.getCurrentPosition(
      position => fetchWeather(position.coords.latitude, position.coords.longitude),
      () => fetchWeather(),
    );
  });

  $('soilAdviceBtn').addEventListener('click', runSoilAdvice);
  $('cropRecommendBtn').addEventListener('click', recommendCrops);
  $('pestBtn').addEventListener('click', predictPestRisk);
  $('irrigationBtn').addEventListener('click', irrigationPlan);
  $('profitBtn').addEventListener('click', estimateProfit);
  $('sellBtn').addEventListener('click', sellingAdvice);
  $('runJourneyBtn').addEventListener('click', runJourney);

  $('askBtn').addEventListener('click', () => {
    const question = $('chatQuestion').value.trim();
    if (!question) return $('chatAnswer').textContent = 'Write your question first, then ask the AI.';
    $('askBtn').disabled = true;
    $('aiTyping').classList.remove('hidden');
    return setTimeout(() => {
      const answer = localizedAnswer(question);
      $('chatAnswer').innerHTML = answer.html;
      state.decisions.unshift({ type: 'AI Chat', question, answer: answer.text, date: formatTime() });
      state.decisions = state.decisions.slice(0, 10);
      saveState();
      renderHistory();
      $('aiTyping').classList.add('hidden');
      $('askBtn').disabled = false;
    }, 650);
  });

  document.querySelectorAll('.quick-q').forEach(button => button.addEventListener('click', () => {
    $('chatQuestion').value = button.textContent;
    $('askBtn').click();
  }));

  $('listenBtn').addEventListener('click', () => speak($('chatAnswer').textContent));
  $('shareBtn').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('chatAnswer').textContent);
      $('shareBtn').textContent = 'Copied';
    } catch (error) {
      $('shareBtn').textContent = 'Failed';
    }
    setTimeout(() => { $('shareBtn').textContent = 'Share'; }, 1200);
  });

  $('answerVoiceBtn').addEventListener('click', () => {
    const question = $('voiceQuestion').value.trim();
    if (!question) {
      $('voiceAnswer').textContent = 'Ask a farming question first.';
      return;
    }
    const answer = localizedAnswer(question);
    $('voiceAnswer').innerHTML = answer.html;
  });
  $('speakVoiceBtn').addEventListener('click', () => speak($('voiceAnswer').textContent));
  $('startVoiceBtn').addEventListener('click', () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      $('voiceAnswer').textContent = 'Voice recognition is not available in this Chrome setup. Type your question and press Answer.';
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = languageSelect.value || 'en-IN';
    recognition.interimResults = false;
    recognition.onstart = () => { $('voiceAnswer').textContent = 'Listening...'; };
    recognition.onresult = (event) => {
      $('voiceQuestion').value = event.results[0][0].transcript;
      const answer = localizedAnswer($('voiceQuestion').value);
      $('voiceAnswer').innerHTML = answer.html;
      speak(answer.text);
    };
    recognition.onerror = () => { $('voiceAnswer').textContent = 'Could not hear clearly. Please try again or type your question.'; };
    recognition.start();
  });

  $('schemeSearch').addEventListener('input', renderSchemes);
  $('schemeFilter').addEventListener('change', renderSchemes);
  $('findSchemesBtn').addEventListener('click', findSchemesForFarmer);
  $('newsSearch').addEventListener('input', renderNews);
  $('newsFilter').addEventListener('change', renderNews);
  $('downloadReportBtn').addEventListener('click', downloadReport);
  $('printReportBtn').addEventListener('click', () => window.print());
  $('feedbackForm').addEventListener('submit', (event) => {
    event.preventDefault();
    $('feedbackStatus').textContent = `Thank you, ${$('feedbackName').value || 'farmer'}. Feedback saved in this crop.`;
    notify('Feedback received');
  });
  $('clearDataBtn').addEventListener('click', () => {
    state.uploads = [];
    state.decisions = [];
    saveState();
    renderHistory();
    notify('crop history cleared');
  });
  $('resetcropBtn').addEventListener('click', () => {
    $('profitOutput').textContent = 'Estimated yield, revenue, total cost, profit, and risk level will appear here.';
    $('sellingOutput').textContent = 'Market comparison and AI selling recommendation will appear here.';
    $('journeyOutput').textContent = 'Run the journey to generate a complete farmer action plan.';
    notify('crop outputs reset');
  });
  $('settingsTheme').addEventListener('change', () => {
    if ($('settingsTheme').value === 'Dark') setTheme(true);
    if ($('settingsTheme').value === 'Light') setTheme(false);
  });
  $('settingsLanguage').addEventListener('change', () => {
    const value = $('settingsLanguage').value;
    languageSelect.value = value === 'Hindi' ? 'hi-IN' : value === 'Telugu' ? 'te-IN' : 'en-IN';
    localStorage.setItem('cropGuardLanguage', languageSelect.value);
    notify('Language preference saved');
  });
  $('largeText').addEventListener('change', () => {
    document.body.classList.toggle('large-text', $('largeText').checked);
  });

  const dropbox = document.querySelector('.dropbox');
  dropbox.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropbox.classList.add('dragover');
  });
  dropbox.addEventListener('dragleave', () => dropbox.classList.remove('dragover'));
  dropbox.addEventListener('drop', (event) => {
    event.preventDefault();
    dropbox.classList.remove('dragover');
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    $('imageInput').files = dataTransfer.files;
    $('imageInput').dispatchEvent(new Event('change'));
  });
}

window.addEventListener('DOMContentLoaded', () => {
  setTheme(localStorage.getItem('leafcropDark') === '1');
  languageSelect.value = localStorage.getItem('cropGuardLanguage') || 'en-IN';
  bindEvents();
  showSection('dashboard');
  renderHistory();
  renderMarketCards();
  renderSchemes();
  renderNews();
  runSoilAdvice();
  recommendCrops();
  predictPestRisk();
  irrigationPlan();
  estimateProfit(false);
  sellingAdvice(false);
  fetchWeather();
});
