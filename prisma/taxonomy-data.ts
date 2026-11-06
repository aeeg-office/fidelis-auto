/* WS1b taxonomy data — Egyptian-market car + motorcycle makes and models.
 * Source: research cross-checked against Hatla2ee, Yallamotor (eg.arabam.com), CarSwitch Egypt,
 * official importer lineups (Al-Mansour, GB Auto/Bishay, Auto Trade, Al-Futtaim, Ezz El Arab,
 * General Motors Egypt, Nile Motors, Abu Ghaly), Wikipedia Egypt auto-market lists, and
 * CNBC Arabia / Arabian Business launch coverage. Only real models sold/configured in Egypt.
 * No invented makes/models. Origins are ISO country-of-brand-origin codes.
 *
 * NOTE on factual correctness: "Range Rover" is a Land Rover model line (JLR), so its models are
 * grouped under Land Rover — it is NOT a separate make. Likewise Sehol/Geely etc. are real makes.
 */

export interface ModelName { en: string; ar: string }
export interface MakeTaxonomy {
  nameEn: string;
  nameAr: string;
  origin?: string; // optional (motorcycle makes carry it on the car side where applicable)
  models: ModelName[];
}

export const CAR_TAXONOMY: MakeTaxonomy[] = [
  {
    nameEn: "Chery", nameAr: "شيري", origin: "CN",
    models: [
      { en: "Arrizo 5", ar: "أريزو 5" }, { en: "Arrizo 6", ar: "أريزو 6" },
      { en: "Arrizo 7", ar: "أريزو 7" }, { en: "Tiggo 2", ar: "تيجو 2" },
      { en: "Tiggo 3x", ar: "تيجو 3" }, { en: "Tiggo 4", ar: "تيجو 4" },
      { en: "Tiggo 5x", ar: "تيجو 5" }, { en: "Tiggo 6", ar: "تيجو 6" },
      { en: "Tiggo 7 Pro", ar: "تيجو 7" }, { en: "Tiggo 8 Pro", ar: "تيجو 8" },
      { en: "QQ", ar: "كيوكيو" },
    ],
  },
  {
    nameEn: "BYD", nameAr: "بي واي دي", origin: "CN",
    models: [
      { en: "F3", ar: "F3" }, { en: "Atto 3", ar: "أتتو 3" }, { en: "Han", ar: "هان" },
      { en: "Seal", ar: "سيل" }, { en: "Dolphin", ar: "دولفين" }, { en: "Seagull", ar: "سيجل" },
      { en: "Tang", ar: "تانج" },
    ],
  },
  {
    nameEn: "Geely", nameAr: "جيلي", origin: "CN",
    models: [
      { en: "Coolray", ar: "كولراي" }, { en: "Emgrand", ar: "إمجراند" },
      { en: "Tugella", ar: "توجيلا" }, { en: "Okavango", ar: "أوكافانجو" },
    ],
  },
  {
    nameEn: "Jetour", nameAr: "جيتور", origin: "CN",
    models: [
      { en: "X70", ar: "X70" }, { en: "X90", ar: "X90" }, { en: "Dashing", ar: "داشينج" },
      { en: "Traveler", ar: "ترافيلر" },
    ],
  },
  {
    nameEn: "Haval", nameAr: "هافال", origin: "CN",
    models: [
      { en: "H6", ar: "H6" }, { en: "Jolion", ar: "جوليون" }, { en: "H2", ar: "H2" },
      { en: "H9", ar: "H9" },
    ],
  },
  {
    nameEn: "Changan", nameAr: "تشانجان", origin: "CN",
    models: [
      { en: "CS15", ar: "CS15" }, { en: "CS35 Plus", ar: "CS35 بلس" }, { en: "CS55", ar: "CS55" },
      { en: "CS75 Plus", ar: "CS75 بلس" }, { en: "CS95", ar: "CS95" },
      { en: "UNI-T", ar: "يوني تي" }, { en: "UNI-V", ar: "يوني في" },
    ],
  },
  {
    nameEn: "MG", nameAr: "إم جي", origin: "GB", // MG brand origin = Great Britain (British heritage)
    models: [
      { en: "ZS", ar: "ZS" }, { en: "HS", ar: "HS" }, { en: "RX5", ar: "RX5" },
      { en: "GT", ar: "GT" }, { en: "MG5", ar: "MG5" }, { en: "MG4", ar: "MG4" },
    ],
  },
  {
    nameEn: "Tank", nameAr: "تانك", origin: "CN",
    models: [{ en: "Tank 300", ar: "تانك 300" }, { en: "Tank 500", ar: "تانك 500" }],
  },
  {
    nameEn: "Sehol", nameAr: "سي هول", origin: "CN",
    models: [{ en: "X7", ar: "X7" }, { en: "X8", ar: "X8" }, { en: "E10X", ar: "إي 10 إكس" }],
  },
  {
    nameEn: "Great Wall", nameAr: "جريت وول", origin: "CN",
    models: [{ en: "Hover H3", ar: "هافر" }, { en: "Wingle", ar: "وينجل" }, { en: "Steed", ar: "ستيد" }],
  },
  {
    nameEn: "Proton", nameAr: "بروتون", origin: "MY",
    models: [{ en: "Saga", ar: "ساجا" }, { en: "Persona", ar: "بيرسونا" }],
  },
  {
    nameEn: "Toyota", nameAr: "تويوتا", origin: "JP",
    models: [
      { en: "Corolla", ar: "كورولا" }, { en: "Corolla Cross", ar: "كورولا كروس" },
      { en: "Camry", ar: "كامري" }, { en: "RAV4", ar: "راف فور" },
      { en: "Land Cruiser", ar: "لاند كروزر" }, { en: "Land Cruiser Prado", ar: "لاند كروزر برادو" },
      { en: "Fortuner", ar: "فورتشنر" }, { en: "Yaris", ar: "ياريس" }, { en: "Hilux", ar: "هايلكس" },
      { en: "Highlander", ar: "هايلاندر" }, { en: "Avanza", ar: "أفانزا" },
    ],
  },
  {
    nameEn: "Nissan", nameAr: "نيسان", origin: "JP",
    models: [
      { en: "Sunny", ar: "صني" }, { en: "Sentra", ar: "سينترا" }, { en: "Kicks", ar: "كيكس" },
      { en: "Qashqai", ar: "قشقاي" }, { en: "X-Trail", ar: "إكس تريل" }, { en: "Patrol", ar: "باترول" },
      { en: "Patrol Platinum", ar: "باترول بلاتينيوم" }, { en: "Navara", ar: "نافارا" },
      { en: "Micra", ar: "ميكرا" },
    ],
  },
  {
    nameEn: "Honda", nameAr: "هوندا", origin: "JP",
    models: [
      { en: "Civic", ar: "سيفيك" }, { en: "Accord", ar: "أكورد" }, { en: "CR-V", ar: "سي آر في" },
      { en: "HR-V", ar: "إتش آر في" }, { en: "City", ar: "سيتي" },
    ],
  },
  {
    nameEn: "Mitsubishi", nameAr: "ميتسوبيشي", origin: "JP",
    models: [
      { en: "Lancer", ar: "لانسر" }, { en: "ASX", ar: "إيه أس إكس" }, { en: "Outlander", ar: "أوتلاندر" },
      { en: "Eclipse Cross", ar: "إكليبس كروس" }, { en: "Pajero", ar: "باجيرو" },
      { en: "Attrage", ar: "أتراج" }, { en: "L200", ar: "L200" },
    ],
  },
  {
    nameEn: "Suzuki", nameAr: "سوزوكي", origin: "JP",
    models: [
      { en: "Swift", ar: "سويفت" }, { en: "Baleno", ar: "بالينو" }, { en: "Dzire", ar: "دزير" },
      { en: "Vitara", ar: "فيتارا" }, { en: "Fronx", ar: "فرونكس" }, { en: "Jimny", ar: "جيمني" },
      { en: "Alto", ar: "ألتو" }, { en: "Ertiga", ar: "إرتيجا" },
    ],
  },
  {
    nameEn: "Hyundai", nameAr: "هيونداي", origin: "KR",
    models: [
      { en: "Elantra", ar: "إلنترا" }, { en: "Accent", ar: "أكسنت" }, { en: "Tucson", ar: "توسان" },
      { en: "Santa Fe", ar: "سانتا في" }, { en: "Sonata", ar: "سوناتا" }, { en: "Creta", ar: "كريتا" },
      { en: "Kona", ar: "كونا" }, { en: "Grand i10", ar: "جراند i10" }, { en: "i10", ar: "i10" },
      { en: "i20", ar: "i20" }, { en: "H-1", ar: "H-1" },
    ],
  },
  {
    nameEn: "Kia", nameAr: "كيا", origin: "KR",
    models: [
      { en: "Picanto", ar: "بيكانتو" }, { en: "Rio", ar: "ريو" }, { en: "Cerato", ar: "سيراتو" },
      { en: "K3", ar: "K3" }, { en: "Sportage", ar: "سبورتاج" }, { en: "Sorento", ar: "سورينتو" },
      { en: "Stonic", ar: "ستونيك" }, { en: "Seltos", ar: "سيلتوس" }, { en: "Sonet", ar: "سونيت" },
    ],
  },
  {
    nameEn: "Chevrolet", nameAr: "شيفروليه", origin: "US",
    models: [
      { en: "Spark", ar: "سبارك" }, { en: "Cruze", ar: "كروز" }, { en: "Optra", ar: "أوبترا" },
      { en: "Lanos", ar: "لانوس" }, { en: "Aveo", ar: "أفيو" }, { en: "Malibu", ar: "ماليبو" },
      { en: "Captiva", ar: "كابتيفا" }, { en: "Tahoe", ar: "تاهو" }, { en: "Suburban", ar: "سبربان" },
      { en: "Silverado", ar: "سيلفرادو" },
    ],
  },
  {
    nameEn: "Ford", nameAr: "فورد", origin: "US",
    models: [
      { en: "Focus", ar: "فوكس" }, { en: "Fusion", ar: "فيوجن" }, { en: "Fiesta", ar: "فييستا" },
      { en: "Explorer", ar: "إكسبلورر" }, { en: "Everest", ar: "إيفرست" }, { en: "Escape", ar: "إسكيب" },
      { en: "Edge", ar: "إيدج" }, { en: "Mustang", ar: "موستانج" }, { en: "Ranger", ar: "رانجر" },
    ],
  },
  {
    nameEn: "Jeep", nameAr: "جيب", origin: "US",
    models: [
      { en: "Wrangler", ar: "رانجلر" }, { en: "Grand Cherokee", ar: "جراند شيروكي" },
      { en: "Cherokee", ar: "شيروكي" }, { en: "Compass", ar: "كومباس" },
      { en: "Renegade", ar: "رينيجيد" }, { en: "Gladiator", ar: "جلادياتور" },
    ],
  },
  {
    nameEn: "Opel", nameAr: "أوبل", origin: "DE",
    models: [
      { en: "Astra", ar: "أسترا" }, { en: "Corsa", ar: "كورسا" }, { en: "Insignia", ar: "إنسيغينا" },
      { en: "Grandland", ar: "جراند لاند" }, { en: "Mokka", ar: "موكا" }, { en: "Crossland", ar: "كروسلاند" },
    ],
  },
  {
    nameEn: "Volkswagen", nameAr: "فولكس فاجن", origin: "DE",
    models: [
      { en: "Golf", ar: "جولف" }, { en: "Jetta", ar: "جيتا" }, { en: "Passat", ar: "باسات" },
      { en: "Polo", ar: "بولو" }, { en: "Tiguan", ar: "تيجوان" }, { en: "Touran", ar: "توران" },
      { en: "T-Cross", ar: "تي كروس" }, { en: "Multivan", ar: "ملتي فان" },
    ],
  },
  {
    nameEn: "BMW", nameAr: "بي إم دبليو", origin: "DE",
    models: [
      { en: "2 Series Gran Coupe", ar: "السلسلة 2" }, { en: "3 Series", ar: "السلسلة 3" },
      { en: "5 Series", ar: "السلسلة 5" }, { en: "7 Series", ar: "السلسلة 7" },
      { en: "X1", ar: "X1" }, { en: "X2", ar: "X2" }, { en: "X3", ar: "X3" }, { en: "X4", ar: "X4" },
      { en: "X5", ar: "X5" }, { en: "X6", ar: "X6" }, { en: "X7", ar: "X7" },
    ],
  },
  {
    nameEn: "Mercedes-Benz", nameAr: "مرسيدس بنز", origin: "DE",
    models: [
      { en: "A-Class", ar: "إيه كلاس" }, { en: "C-Class", ar: "سي كلاس" }, { en: "E-Class", ar: "إي كلاس" },
      { en: "S-Class", ar: "إس كلاس" }, { en: "CLA", ar: "سي إل إيه" }, { en: "GLA", ar: "جي إل إيه" },
      { en: "GLB", ar: "جي إل بي" }, { en: "GLC", ar: "جي إل سي" }, { en: "GLE", ar: "جي إل إي" },
      { en: "G-Class", ar: "جي كلاس" },
    ],
  },
  {
    nameEn: "Audi", nameAr: "أودي", origin: "DE",
    models: [
      { en: "A3", ar: "A3" }, { en: "A4", ar: "A4" }, { en: "A5", ar: "A5" }, { en: "A6", ar: "A6" },
      { en: "A8", ar: "A8" }, { en: "Q2", ar: "Q2" }, { en: "Q3", ar: "Q3" }, { en: "Q5", ar: "Q5" },
      { en: "Q7", ar: "Q7" }, { en: "Q8", ar: "Q8" }, { en: "e-tron", ar: "إي ترون" },
    ],
  },
  {
    nameEn: "Peugeot", nameAr: "بيجو", origin: "FR",
    models: [
      { en: "208", ar: "208" }, { en: "2008", ar: "2008" }, { en: "301", ar: "301" },
      { en: "3008", ar: "3008" }, { en: "5008", ar: "5008" }, { en: "508", ar: "508" },
    ],
  },
  {
    // nameEn "Citroen" (no ë) to match the WS1-seeded Make row — keeps the unique (nameEn, vehicleType) consistent.
    nameEn: "Citroen", nameAr: "سيتروين", origin: "FR",
    models: [
      { en: "C3", ar: "C3" }, { en: "C3 Aircross", ar: "C3 إيركروس" }, { en: "C4", ar: "C4" },
      { en: "C4 Cactus", ar: "C4 كاكتس" }, { en: "C5 Aircross", ar: "C5 إيركروس" },
    ],
  },
  {
    nameEn: "Renault", nameAr: "رينو", origin: "FR",
    models: [
      { en: "Kwid", ar: "كويد" }, { en: "Duster", ar: "داستر" }, { en: "Logan", ar: "لوجان" },
      { en: "Sandero", ar: "سانتيرو" }, { en: "Symbol", ar: "سمبول" }, { en: "Clio", ar: "كليو" },
      { en: "Megane", ar: "ميجان" }, { en: "Captur", ar: "كابتور" }, { en: "Koleos", ar: "كوليوس" },
      { en: "Talisman", ar: "تاليزمان" },
    ],
  },
  {
    nameEn: "Fiat", nameAr: "فيات", origin: "IT",
    models: [
      { en: "500", ar: "500" }, { en: "500X", ar: "500X" }, { en: "Tipo", ar: "تيبو" },
      { en: "Panda", ar: "باندا" },
    ],
  },
  {
    // nameEn "Skoda" (no š) to match the WS1-seeded Make row — keeps the unique (nameEn, vehicleType) consistent.
    nameEn: "Skoda", nameAr: "سكودا", origin: "CZ",
    models: [
      { en: "Octavia", ar: "أوكتافيا" }, { en: "Rapid", ar: "رابيد" }, { en: "Superb", ar: "سوبرب" },
      { en: "Kodiaq", ar: "كودياك" }, { en: "Karoq", ar: "كاروك" }, { en: "Scala", ar: "سكالا" },
      { en: "Kamiq", ar: "كاميك" },
    ],
  },
  {
    nameEn: "Volvo", nameAr: "فولفو", origin: "SE",
    models: [
      { en: "XC40", ar: "XC40" }, { en: "XC60", ar: "XC60" }, { en: "XC90", ar: "XC90" },
      { en: "S60", ar: "S60" }, { en: "S90", ar: "S90" },
    ],
  },
  {
    nameEn: "Lexus", nameAr: "لكزس", origin: "JP",
    models: [{ en: "ES", ar: "ES" }, { en: "IS", ar: "IS" }, { en: "NX", ar: "NX" }, { en: "RX", ar: "RX" }, { en: "LX", ar: "LX" }],
  },
  {
    nameEn: "Mazda", nameAr: "مازدا", origin: "JP",
    models: [
      { en: "Mazda 2", ar: "مازدا 2" }, { en: "Mazda 3", ar: "مازدا 3" }, { en: "Mazda 6", ar: "مازدا 6" },
      { en: "CX-3", ar: "CX-3" }, { en: "CX-5", ar: "CX-5" }, { en: "CX-30", ar: "CX-30" },
    ],
  },
  {
    nameEn: "Daihatsu", nameAr: "دايهاتسو", origin: "JP",
    models: [{ en: "Terios", ar: "تيريوس" }, { en: "Mira", ar: "ميرا" }],
  },
  {
    nameEn: "Lada", nameAr: "لادا", origin: "RU",
    models: [{ en: "Granta", ar: "جرانتا" }, { en: "Vesta", ar: "فيستا" }, { en: "Niva", ar: "نيفا" }],
  },
  {
    nameEn: "Land Rover", nameAr: "لاند روفر", origin: "GB", // Range Rover is a Land Rover model line per JLR
    models: [
      { en: "Defender", ar: "ديفندر" }, { en: "Discovery", ar: "ديسكفري" },
      { en: "Discovery Sport", ar: "ديسكفري سبورت" }, { en: "Range Rover Evoque", ar: "إيفوك" },
      { en: "Range Rover", ar: "رانج روفر" }, { en: "Range Rover Sport", ar: "رانج روفر سبورت" },
      { en: "Range Rover Velar", ar: "فيلار" },
    ],
  },
  {
    nameEn: "Jaguar", nameAr: "جاكوار", origin: "GB",
    models: [
      { en: "XE", ar: "XE" }, { en: "XF", ar: "XF" }, { en: "F-Pace", ar: "إف بيس" },
      { en: "E-Pace", ar: "إي بيس" }, { en: "F-Type", ar: "إف تايب" },
    ],
  },
];

export const MOTORCYCLE_TAXONOMY: MakeTaxonomy[] = [
  {
    nameEn: "Honda", nameAr: "هوندا",
    models: [
      { en: "PCX160", ar: "بيسي إكس" }, { en: "Dio", ar: "ديو" }, { en: "Click 125", ar: "كليك" },
      { en: "CB125F", ar: "سي بي 125" }, { en: "CB150R", ar: "سي بي 150" },
      { en: "CBR125", ar: "سي بي آر 125" }, { en: "CBR150", ar: "سي بي آر 150" },
      { en: "CBR500R", ar: "سي بي آر 500" }, { en: "CB500F", ar: "سي بي 500" },
      { en: "Forza 350", ar: "فورزا" }, { en: "ADV160", ar: "إيه دي في" },
    ],
  },
  {
    nameEn: "Yamaha", nameAr: "ياماها",
    models: [
      { en: "YBR125", ar: "واي بي آر 125" }, { en: "MT-15", ar: "إم تي 15" },
      { en: "MT-07", ar: "إم تي 07" }, { en: "MT-09", ar: "إم تي 09" },
      { en: "R15", ar: "آر 15" }, { en: "R25", ar: "آر 25" }, { en: "R3", ar: "آر 3" },
      { en: "NMAX 125", ar: "إن ماكس" }, { en: "Cygnus", ar: "سيجنس" },
    ],
  },
  {
    nameEn: "Suzuki", nameAr: "سوزوكي",
    models: [
      { en: "Gixxer 150", ar: "جيكسر" }, { en: "GSX-S750", ar: "جي إس إكس 750" },
      { en: "GSX-8R", ar: "جي إس إكس 8 آر" }, { en: "GSX-R1000", ar: "جي إس إكس آر 1000" },
      { en: "V-Strom 650", ar: "في ستروم" }, { en: "Hayabusa", ar: "هايابوسا" },
      { en: "Address", ar: "أدريس" }, { en: "Burgman", ar: "بيرجمان" },
    ],
  },
  {
    nameEn: "Kawasaki", nameAr: "كاواساكي",
    models: [
      { en: "Ninja 400", ar: "نينجا 400" }, { en: "Ninja 650", ar: "نينجا 650" },
      { en: "Ninja ZX-6R", ar: "زي إكس 6 آر" }, { en: "Z400", ar: "Z400" }, { en: "Z650", ar: "Z650" },
      { en: "Z900", ar: "Z900" }, { en: "Versys 650", ar: "فيرسيس" }, { en: "KLX", ar: "كيه إل إكس" },
    ],
  },
  {
    nameEn: "KTM", nameAr: "كيه تي إم",
    models: [
      { en: "Duke 200", ar: "دوك 200" }, { en: "Duke 250", ar: "دوك 250" },
      { en: "Duke 390", ar: "دوك 390" }, { en: "RC390", ar: "آر سي 390" },
      { en: "Adventure 390", ar: "أدفانتشر 390" },
    ],
  },
  {
    nameEn: "BMW Motorrad", nameAr: "بي إم دبليو موتوردراد",
    models: [
      { en: "G310R", ar: "G310R" }, { en: "G310GS", ar: "G310GS" }, { en: "F750GS", ar: "F750" },
      { en: "F850GS", ar: "F850" }, { en: "R1250GS", ar: "R1250 GS" }, { en: "S1000RR", ar: "S1000 RR" },
      { en: "R nineT", ar: "R nineT" },
    ],
  },
  {
    nameEn: "Sym", nameAr: "سيم",
    models: [
      { en: "Symphony", ar: "سيمفوني" }, { en: "Jet", ar: "جيت" }, { en: "Cruisym", ar: "كرويسيم" },
      { en: "Maxsym", ar: "ماكسيم" },
    ],
  },
  {
    nameEn: "Zontes", nameAr: "زونتس",
    models: [
      { en: "310R", ar: "310R" }, { en: "310X", ar: "310X" }, { en: "350D", ar: "350D" },
      { en: "350G", ar: "350G" }, { en: "350T", ar: "350T" },
    ],
  },
  {
    nameEn: "Benelli", nameAr: "بينيللي",
    models: [
      { en: "TNT 25", ar: "TNT25" }, { en: "TNT 300", ar: "TNT300" },
      { en: "Leoncino 500", ar: "ليونسينو" }, { en: "TRK 502", ar: "TRK502" }, { en: "TNT600", ar: "TNT600" },
    ],
  },
  {
    nameEn: "Vespa", nameAr: "فيس با",
    models: [
      { en: "Primavera", ar: "بريمافيرا" }, { en: "Sprint", ar: "سبرينت" },
      { en: "GTS 300", ar: "جي تي إس" }, { en: "GTV 300", ar: "جي تي في" },
    ],
  },
  {
    nameEn: "Piaggio", nameAr: "بياجيو",
    models: [
      { en: "Beverly", ar: "بيفرلي" }, { en: "Liberty", ar: "ليبرتي" }, { en: "MP3", ar: "إم بي 3" },
    ],
  },
  {
    nameEn: "Aprilia", nameAr: "أبريليا",
    models: [
      { en: "RS 125", ar: "آر إس 125" }, { en: "RS 660", ar: "آر إس 660" },
      { en: "Tuono 660", ar: "توونو 660" }, { en: "SR 150", ar: "إس آر 150" },
    ],
  },
  {
    nameEn: "CFMoto", nameAr: "سي إف موتو",
    models: [
      { en: "250SR", ar: "250SR" }, { en: "300SR", ar: "300SR" }, { en: "450SR", ar: "450SR" },
      { en: "650NK", ar: "650NK" }, { en: "800MT", ar: "800MT" },
    ],
  },
  {
    nameEn: "Bajaj", nameAr: "باجاج",
    models: [
      { en: "Pulsar 180", ar: "بولسار" }, { en: "Pulsar 220", ar: "بولسار 220" },
      { en: "Boxer", ar: "بوكسر" }, { en: "Platina", ar: "بلاتينا" },
    ],
  },
  {
    nameEn: "Royal Enfield", nameAr: "رويال إنفيلد",
    models: [
      { en: "Classic 350", ar: "كلاسيك 350" }, { en: "Meteor 350", ar: "ميتيور 350" },
      { en: "Himalayan 450", ar: "هيمالايا" }, { en: "Interceptor 650", ar: "إنترسبتور 650" },
    ],
  },
];