export interface MakeEntry {
  make: string;
  models: string[];
}

// ─── Years ────────────────────────────────────

export const YEARS = Array.from({ length: 2026 - 1920 + 1 }, (_, i) => (1920 + i).toString());

// ─── Colors ───────────────────────────────────

export const EXTERIOR_COLORS = [
  "Black", "White", "Silver", "Gray", "Charcoal",
  "Red", "Maroon", "Burgundy", "Candy Red",
  "Blue", "Navy", "Royal Blue", "Sky Blue", "Baby Blue", "Albert Blue",
  "Green", "British Racing Green", "Dark Green", "Olive", "Teal",
  "Yellow", "Gold", "Cream", "Beige",
  "Brown", "Tan", "Saddle", "Champagne",
  "Orange", "Copper", "Bronze",
  "Purple", "Plum", "Lavender",
  "Pink", "Rose",
  "Metallic", "Matte Black", "Matte Gray",
  "Two-Tone", "Other",
];

export const INTERIOR_COLORS = [
  "Black", "Charcoal", "Gray", "Silver",
  "Beige", "Tan", "Brown", "Saddle", "Cognac",
  "Red", "Burgundy", "Maroon", "Bordeaux",
  "Blue", "Navy", "Dark Blue",
  "Green", "Dark Green",
  "Cream", "Ivory", "White",
  "Yellow", "Gold",
  "Orange",
  "Two-Tone", "Other",
];

export const TRANSMISSIONS = ["Manual", "Automatic", "Other"];

// ─── Countries ────────────────────────────────

export const COUNTRIES = [
  "Egypt", "United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait",
  "Bahrain", "Oman", "Jordan", "Lebanon", "Palestine", "Iraq", "Syria", "Yemen",
  "United States", "Canada", "Mexico",
  "United Kingdom", "Germany", "France", "Italy", "Spain", "Portugal",
  "Netherlands", "Belgium", "Switzerland", "Austria", "Sweden", "Norway",
  "Denmark", "Finland", "Ireland", "Poland", "Czech Republic", "Greece",
  "Turkey", "Russia", "Ukraine", "Romania", "Hungary",
  "Japan", "South Korea", "China", "India", "Thailand", "Indonesia", "Philippines",
  "Australia", "New Zealand",
  "South Africa", "Morocco", "Algeria", "Tunisia", "Nigeria", "Kenya", "Ghana",
  "Brazil", "Argentina", "Chile", "Colombia", "Peru", "Venezuela",
  "Other",
];

// ─── Car Makes & Models ───────────────────────

export const MAKES: MakeEntry[] = [
  { make: "Acura", models: ["CL", "CSX", "EL", "ILX", "Integra", "MDX", "NSX", "RDX", "RL", "RLX", "RSX", "SLX", "TL", "TLX", "TSX", "ZDX"] },
  { make: "Alfa Romeo", models: ["4C", "8C", "Alfetta", "Brera", "Giulia", "Giulietta", "GTV", "MiTo", "Montreal", "Spider", "Stelvio", "Tonale"] },
  { make: "Aston Martin", models: ["DB11", "DB5", "DB7", "DB9", "DBS", "DBX", "Lagonda", "One-77", "Rapide", "V12 Vantage", "V8 Vantage", "Valkyrie", "Vanquish", "Vulcan"] },
  { make: "Audi", models: ["100", "200", "5000", "80", "90", "A1", "A3", "A4", "A5", "A6", "A7", "A8", "Allroad", "Cabriolet", "Coupe", "e-tron", "e-tron GT", "Q2", "Q3", "Q5", "Q7", "Q8", "R8", "RS3", "RS4", "RS5", "RS6", "RS7", "S3", "S4", "S5", "S6", "S7", "S8", "SQ5", "TT"] },
  { make: "Bentley", models: ["Arnage", "Azure", "Bentayga", "Brooklands", "Continental", "Continental GT", "Eight", "Flying Spur", "Mulsanne", "Turbo R"] },
  { make: "BMW", models: ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series", "2002", "Isetta", "i3", "i8", "iX", "M2", "M3", "M4", "M5", "M6", "M8", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z3", "Z4", "Z8"] },
  { make: "Buick", models: ["Cascada", "Century", "Electra", "Enclave", "Encore", "Envision", "LaCrosse", "LeSabre", "Lucerne", "Park Avenue", "Rainier", "Reatta", "Regal", "Riviera", "Roadmaster", "Skylark", "Verano", "Wildcat"] },
  { make: "Cadillac", models: ["ATS", "Brougham", "CT4", "CT5", "CT6", "CTS", "Catera", "DeVille", "DTS", "Eldorado", "Escalade", "Fleetwood", "Lyriq", "Seville", "SRX", "STS", "XT4", "XT5", "XT6", "XTS"] },
  { make: "Chevrolet", models: ["Avalanche", "Aveo", "Bel Air", "Blazer", "Bolt", "Camaro", "Caprice", "Cavalier", "Chevelle", "Colorado", "Corvair", "Corvette", "Cruze", "El Camino", "Equinox", "Express", "Impala", "Lumina", "Malibu", "Monte Carlo", "Nova", "S10", "Silverado", "Spark", "Suburban", "Tahoe", "TrailBlazer", "Traverse", "Volt"] },
  { make: "Chrysler", models: ["200", "300", "300C", "300M", "Aspen", "Cirrus", "Concorde", "Crossfire", "Imperial", "LeBaron", "LHS", "Neon", "New Yorker", "Pacifica", "Prowler", "PT Cruiser", "Sebring", "Town & Country", "Voyager"] },
  { make: "Citroen", models: ["2CV", "AX", "Berlingo", "BX", "C1", "C2", "C3", "C4", "C5", "C6", "CX", "DS", "DS3", "DS4", "DS5", "GS", "SAXO", "SM", "Xantia", "XM", "Xsara", "ZX"] },
  { make: "Dacia", models: ["Duster", "Jogger", "Lodgy", "Logan", "Sandero", "Sandero Stepway", "Spring"] },
  { make: "Daewoo", models: ["Espero", "Kalos", "Lacetti", "Lanos", "Leganza", "Matiz", "Nexia", "Nubira", "Tico"] },
  { make: "Daihatsu", models: ["Charade", "Copen", "Cuore", "Mira", "Move", "Rocky", "Sirion", "Terios"] },
  { make: "Dodge", models: ["Avenger", "Caliber", "Caravan", "Challenger", "Charger", "Colt", "Dakota", "Dart", "Durango", "Grand Caravan", "Intrepid", "Journey", "Magnum", "Neon", "Nitro", "Omni", "Ram", "Ram 1500", "Ram 2500", "Ram 3500", "Ramcharger", "Shadow", "Spirit", "Stealth", "Stratus", "Viper", "W150"] },
  { make: "Ferrari", models: ["250 GT", "288 GTO", "308", "328", "348", "360", "400", "412", "456", "458", "488", "512", "550", "575M", "599", "612", "812", "California", "Dino", "Enzo", "F12", "F40", "F430", "F50", "F8 Tributo", "FF", "GTC4Lusso", "LaFerrari", "Portofino", "Purosangue", "Roma", "SF90 Stradale", "Superfast", "Testarossa"] },
  { make: "Fiat", models: ["124 Spider", "126", "127", "128", "131", "500", "500C", "500L", "500X", "600", "850", "Barchetta", "Brava", "Bravo", "Cinquecento", "Coupe", "Croma", "Doblo", "Ducato", "Grande Punto", "Idea", "Linea", "Marea", "Multipla", "Panda", "Punto", "Qubo", "Regata", "Ritmo", "Sedici", "Seicento", "Stilo", "Tempra", "Tipo", "Uno", "X1/9"] },
  { make: "Ford", models: ["Bronco", "C-Max", "Contour", "Cortina", "Crown Victoria", "E-150", "E-250", "E-350", "Econoline", "Edge", "Escape", "Escort", "Expedition", "Explorer", "F-100", "F-150", "F-250", "F-350", "Fairlane", "Falcon", "Festiva", "Fiesta", "Five Hundred", "Flex", "Focus", "Fusion", "Galaxie", "Granada", "GT", "GT40", "Ka", "Kuga", "LTD", "Maverick", "Model A", "Model T", "Mondeo", "Mustang", "Mustang Mach-E", "Orion", "Pinto", "Probe", "Puma", "Ranger", "S-Max", "Scorpio", "Sierra", "Taurus", "Tempo", "Thunderbird", "Torino", "Transit", "Windstar", "Zephyr"] },
  { make: "Genesis", models: ["G70", "G80", "G90", "GV60", "GV70", "GV80"] },
  { make: "GMC", models: ["Acadia", "Canyon", "Envoy", "Jimmy", "Safari", "Savana", "Sierra 1500", "Sierra 2500", "Sierra 3500", "Sonoma", "Suburban", "Syclone", "Terrain", "Typhoon", "Yukon"] },
  { make: "Honda", models: ["Accord", "Amaze", "BR-V", "Civic", "Clarity", "CR-V", "CR-Z", "CRX", "Del Sol", "Element", "Fit", "HR-V", "Insight", "Integra", "Jazz", "Legend", "Odyssey", "Passport", "Pilot", "Prelude", "Ridgeline", "S2000"] },
  { make: "Hummer", models: ["H1", "H2", "H3"] },
  { make: "Hyundai", models: ["Accent", "Azera", "Elantra", "Entourage", "Equus", "Excel", "Genesis", "Getz", "Grandeur", "IONIQ", "IONIQ 5", "IONIQ 6", "Kona", "Palisade", "Santa Fe", "Sonata", "Staria", "Tiburon", "Tucson", "Veloster", "Venue", "Veracruz"] },
  { make: "Infiniti", models: ["EX35", "FX35", "FX45", "G20", "G35", "G37", "J30", "M30", "M35", "M45", "Q30", "Q40", "Q45", "Q50", "Q60", "Q70", "QX30", "QX4", "QX50", "QX56", "QX60", "QX70", "QX80"] },
  { make: "Isuzu", models: ["Amigo", "Ascender", "Axiom", "Hombre", "Impulse", "Oasis", "Rodeo", "Trooper", "VehiCross"] },
  { make: "Jaguar", models: ["E-Pace", "E-Type", "F-Pace", "F-Type", "I-Pace", "Mark 2", "S-Type", "X-Type", "XE", "XF", "XJ", "XJ6", "XJ8", "XJR", "XJS", "XK", "XK8", "XKR"] },
  { make: "Jeep", models: ["Cherokee", "CJ", "Comanche", "Commander", "Compass", "Gladiator", "Grand Cherokee", "Liberty", "Patriot", "Renegade", "Wagoneer", "Wrangler"] },
  { make: "Kia", models: ["Amanti", "Borrego", "Cadenza", "Carnival", "Cee'd", "Cerato", "EV6", "Forte", "K5", "K900", "Magentis", "Niro", "Optima", "Picanto", "Rio", "Sedona", "Seltos", "Sephia", "Sorento", "Soul", "Spectra", "Sportage", "Stinger", "Telluride"] },
  { make: "Lamborghini", models: ["350 GT", "400 GT", "Aventador", "Countach", "Diablo", "Espada", "Gallardo", "Huracan", "Islero", "Jalpa", "Jarama", "LM002", "Miura", "Murcielago", "Reventon", "Sian", "Urus", "Veneno"] },
  { make: "Lancia", models: ["Beta", "Dedra", "Delta", "Flaminia", "Fulvia", "Gamma", "Kappa", "Lybra", "Musa", "Phedra", "Stratos", "Thema", "Y10", "Ypsilon"] },
  { make: "Land Rover", models: ["Defender", "Discovery", "Discovery Sport", "Freelander", "LR2", "LR3", "LR4", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar"] },
  { make: "Lexus", models: ["CT 200h", "ES 250", "ES 300", "ES 330", "ES 350", "GS 300", "GS 350", "GS 400", "GS 430", "GS 450h", "GS 460", "GX 460", "GX 470", "IS 250", "IS 300", "IS 350", "IS 500", "LC 500", "LFA", "LS 400", "LS 430", "LS 460", "LS 500", "LS 600h", "LX 450", "LX 470", "LX 570", "NX 300", "NX 350h", "RC 350", "RC F", "RX 300", "RX 330", "RX 350", "RX 400h", "RX 450h", "SC 300", "SC 400", "SC 430", "UX 200", "UX 250h"] },
  { make: "Lincoln", models: ["Aviator", "Blackwood", "Continental", "Corsair", "LS", "Mark III", "Mark IV", "Mark V", "Mark VI", "Mark VII", "Mark VIII", "MKC", "MKS", "MKT", "MKX", "MKZ", "Nautilus", "Navigator", "Town Car", "Zephyr"] },
  { make: "Lotus", models: ["Elan", "Elise", "Elite", "Emira", "Esprit", "Europa", "Evija", "Evora", "Excel", "Exige", "Seven"] },
  { make: "Maserati", models: ["3200 GT", "Biturbo", "Coupe", "Ghibli", "GranCabrio", "GranTurismo", "Grecale", "Levante", "MC20", "Merak", "Quattroporte", "Shamal", "Spyder"] },
  { make: "Mazda", models: ["2", "3", "5", "6", "323", "626", "929", "B-Series", "BT-50", "CX-3", "CX-30", "CX-5", "CX-50", "CX-7", "CX-9", "CX-90", "Demio", "Familia", "Miata", "Millenia", "MPV", "MX-3", "MX-30", "MX-5", "MX-6", "Navajo", "Protege", "RX-7", "RX-8", "Tribute"] },
  { make: "McLaren", models: ["540C", "570GT", "570S", "600LT", "650S", "675LT", "720S", "750S", "765LT", "Artura", "F1", "GT", "MP4-12C", "P1", "Senna", "Speedtail"] },
  { make: "Mercedes-Benz", models: ["190", "190E", "200", "220", "230", "240D", "250", "260E", "280", "280SL", "300", "300D", "300E", "300SD", "300SE", "300SL", "350", "380", "380SL", "400E", "420", "450", "450SL", "500", "500E", "500SL", "560", "560SEC", "560SEL", "560SL", "600", "A-Class", "AMG GT", "B-Class", "C-Class", "CL-Class", "CLA-Class", "CLK", "CLS-Class", "E-Class", "EQA", "EQB", "EQC", "EQE", "EQS", "G-Class", "GL-Class", "GLA-Class", "GLB-Class", "GLC-Class", "GLE-Class", "GLK-Class", "GLS-Class", "M-Class", "Maybach", "R-Class", "S-Class", "SL-Class", "SLC-Class", "SLK-Class", "SLS AMG", "Sprinter", "V-Class", "Vito", "X-Class"] },
  { make: "Mercury", models: ["Capri", "Cougar", "Grand Marquis", "Lynx", "Marauder", "Mariner", "Marquis", "Milan", "Montego", "Monterey", "Mountaineer", "Mystique", "Sable", "Topaz", "Tracer", "Villager", "Zephyr"] },
  { make: "MG", models: ["MGA", "MGB", "Midget", "TF", "3", "4", "5", "6", "GS", "HS", "ZS"] },
  { make: "Mini", models: ["Clubman", "Cooper", "Cooper S", "Countryman", "GP", "Hatch", "John Cooper Works", "One", "Paceman", "Roadster"] },
  { make: "Mitsubishi", models: ["3000GT", "ASX", "Carisma", "Colt", "Diamante", "Eclipse", "Eclipse Cross", "Endeavor", "Galant", "L200", "Lancer", "Lancer Evolution", "Mirage", "Montero", "Montero Sport", "Outlander", "Pajero", "Raider", "Shogun", "Starion"] },
  { make: "Nissan", models: ["200SX", "240SX", "280Z", "280ZX", "300ZX", "350Z", "370Z", "Altima", "Armada", "Cefiro", "Cube", "Datsun", "Frontier", "GT-R", "Juke", "Kicks", "Leaf", "Maxima", "Micra", "Murano", "Navara", "Note", "NV200", "Pathfinder", "Patrol", "Primera", "Pulsar", "Qashqai", "Quest", "Rogue", "Sentra", "Serena", "Silvia", "Skyline", "Sunny", "Terra", "Titan", "Versa", "X-Terra", "X-Trail", "Z"] },
  { make: "Oldsmobile", models: ["98", "Achieva", "Alero", "Aurora", "Bravada", "Calais", "Ciera", "Cutlass", "Cutlass Supreme", "Delta 88", "Eighty-Eight", "Firenza", "Intrigue", "Ninety-Eight", "Omega", "Silhouette", "Starfire", "Toronado", "Vista Cruiser"] },
  { make: "Opel", models: ["Adam", "Agila", "Ampera", "Antara", "Astra", "Calibra", "Cascada", "Combo", "Corsa", "Crossland", "Frontera", "Grandland", "GT", "Insignia", "Kadett", "Karl", "Manta", "Meriva", "Mokka", "Monza", "Omega", "Rekord", "Senator", "Signum", "Speedster", "Tigra", "Vectra", "Vivaro", "Zafira"] },
  { make: "Peugeot", models: ["1007", "104", "106", "107", "108", "2008", "205", "205 GTI", "206", "207", "208", "3008", "301", "304", "305", "306", "307", "308", "309", "4007", "4008", "404", "405", "406", "407", "408", "5008", "504", "505", "508", "604", "605", "607", "806", "807", "Boxer", "Expert", "Partner", "RCZ", "Rifter", "Traveller"] },
  { make: "Plymouth", models: ["Acclaim", "Barracuda", "Breeze", "Colt", "Duster", "Fury", "Gran Fury", "GTX", "Horizon", "Laser", "Neon", "Prowler", "Reliant", "Road Runner", "Satellite", "Valiant", "Voyager"] },
  { make: "Pontiac", models: ["6000", "Aztek", "Bonneville", "Catalina", "Fiero", "Firebird", "G6", "G8", "Grand Am", "Grand Prix", "GTO", "LeMans", "Montana", "Parisienne", "Phoenix", "Solstice", "Sunbird", "Sunfire", "Tempest", "Trans Am", "Vibe"] },
  { make: "Porsche", models: ["356", "356 Speedster", "718", "718 Boxster", "718 Cayman", "718 Spyder", "911", "911 (930 Turbo)", "911 (964)", "911 (991)", "911 (992)", "911 Carrera", "911 GT1", "911 GT2", "911 GT3", "911 GT3 RS", "911 Speedster", "911 Targa", "912", "914", "918 Spyder", "924", "924 Carrera GT", "928", "928 S", "928 S4", "928 GTS", "944", "944 Turbo", "944 S2", "959", "962", "968", "968 Club Sport", "Boxster", "Boxster S", "Carrera GT", "Cayenne", "Cayenne Coupe", "Cayenne GTS", "Cayenne S", "Cayenne Turbo", "Cayman", "Cayman GT4", "Cayman S", "Macan", "Macan GTS", "Macan S", "Macan Turbo", "Panamera", "Panamera 4", "Panamera GTS", "Panamera Turbo", "Panamera Turbo S", "Taycan", "Taycan 4S", "Taycan Cross Turismo", "Taycan GTS", "Taycan Sport Turismo", "Taycan Turbo"] },
  { make: "Ram", models: ["1500", "2500", "3500", "4500", "5500", "ProMaster", "ProMaster City"] },
  { make: "Renault", models: ["Alpine A110", "Avantime", "Captur", "Clio", "Coleos", "Dauphine", "Espace", "Fluence", "Kadjar", "Kangoo", "Koleos", "Kwid", "Laguna", "Latitude", "Master", "Megane", "Modus", "R4", "R5", "R9", "R11", "R16", "R19", "R21", "R25", "Safrane", "Sandero", "Scenic", "Symbol", "Talisman", "Trafic", "Twingo", "Vel Satis", "Zoe"] },
  { make: "Rolls-Royce", models: ["Camargue", "Corniche", "Cullinan", "Dawn", "Ghost", "Park Ward", "Phantom", "Phantom Drophead", "Silver Cloud", "Silver Dawn", "Silver Seraph", "Silver Shadow", "Silver Spirit", "Silver Spur", "Wraith"] },
  { make: "Rover", models: ["100", "200", "400", "600", "75", "800", "Metro", "Mini", "Montego", "SD1"] },
  { make: "Saab", models: ["9-2X", "9-3", "9-4X", "9-5", "9-7X", "900", "9000", "96", "99", "Sonett"] },
  { make: "Saturn", models: ["Astra", "Aura", "Ion", "L100", "L200", "L300", "LS", "LW", "Outlook", "Relay", "SC", "Sky", "SL", "SL1", "SL2", "SW", "Vue"] },
  { make: "Seat", models: ["Alhambra", "Altea", "Arona", "Arosa", "Ateca", "Cordoba", "Exeo", "Ibiza", "Leon", "Malaga", "Mii", "Toledo"] },
  { make: "Skoda", models: ["Citigo", "Fabia", "Favorit", "Felicia", "Kamiq", "Karoq", "Kodiaq", "Octavia", "Rapid", "Roomster", "Scala", "Superb", "Yeti"] },
  { make: "Smart", models: ["Forfour", "Fortwo", "Roadster"] },
  { make: "Subaru", models: ["1800", "Ascent", "Baja", "Brat", "BRZ", "Crosstrek", "Forester", "GL", "Impreza", "Justy", "Legacy", "Leone", "Loyale", "Outback", "SVX", "Tribeca", "WRX", "WRX STI", "XT"] },
  { make: "Suzuki", models: ["Alto", "Baleno", "Cappuccino", "Celerio", "Cultus", "Ertiga", "Escudo", "Grand Vitara", "Ignis", "Jimny", "Kizashi", "Liana", "Samurai", "Sidekick", "Swift", "SX4", "Vitara", "Wagon R", "XL-7"] },
  { make: "Tata", models: ["Altroz", "Aria", "Harrier", "Indica", "Indigo", "Nano", "Nexon", "Punch", "Safari", "Sierra", "Sumo", "Tiago", "Tigor", "Zest"] },
  { make: "Tesla", models: ["Cybertruck", "Model 3", "Model S", "Model X", "Model Y", "Roadster"] },
  { make: "Toyota", models: ["4Runner", "Altezza", "Avalon", "Aygo", "C-HR", "Camry", "Celica", "Century", "Corolla", "Cressida", "Crown", "FJ Cruiser", "GT86", "Hiace", "Highlander", "Hilux", "Land Cruiser", "MR2", "Matrix", "Mirai", "Paseo", "Previa", "Prius", "RAV4", "Sequoia", "Sienna", "Solara", "Supra", "Tacoma", "Tercel", "Tundra", "Venza", "Yaris"] },
  { make: "Triumph", models: ["Dolomite", "GT6", "Herald", "Spitfire", "Stag", "TR2", "TR3", "TR4", "TR5", "TR6", "TR7", "TR8"] },
  { make: "Vauxhall", models: ["Adam", "Agila", "Ampera", "Antara", "Astra", "Calibra", "Carlton", "Cavalier", "Chevette", "Combo", "Corsa", "Frontera", "Insignia", "Manta", "Meriva", "Mokka", "Monaro", "Nova", "Omega", "Senator", "Signum", "Tigra", "Vectra", "Vivaro", "VX220", "Zafira"] },
  { make: "Volkswagen", models: ["Arteon", "Beetle", "Bora", "Caddy", "California", "CC", "Corrado", "Crafter", "Eos", "Fox", "Golf", "Golf GTI", "Golf R", "ID.3", "ID.4", "ID.5", "ID.Buzz", "Jetta", "Karmann Ghia", "Kombi", "Lupo", "New Beetle", "Passat", "Phaeton", "Polo", "Rabbit", "Scirocco", "Sharan", "T-Cross", "T-Roc", "Tiguan", "Touareg", "Touran", "Transporter", "Up", "Vento"] },
  { make: "Volvo", models: ["120", "122", "140", "164", "1800", "240", "242", "244", "245", "260", "340", "360", "440", "460", "480", "740", "760", "780", "850", "940", "960", "C30", "C40", "C70", "S40", "S60", "S70", "S80", "S90", "V40", "V50", "V60", "V70", "V90", "XC40", "XC60", "XC70", "XC90", "P1800"] },
];