export interface DensityEntry {
  teaspoon?:      number;   // çay kaşığı (gram)
  tablespoon?:    number;   // yemek kaşığı (gram)
  cup?:           number;   // bardak (gram)
  piece?:         number;   // adet (gram)
  slice?:         number;   // dilim (gram)
  handful?:       number;   // avuç (gram)
}

export const densityTable: Record<string, DensityEntry> = {
  // SIVI/YARI SIVI
  'su':              { teaspoon: 5,   tablespoon: 15,  cup: 240 },
  'süt':             { teaspoon: 5,   tablespoon: 15,  cup: 240 },
  'yoğurt':          { teaspoon: 6,   tablespoon: 18,  cup: 245 },
  'zeytinyağı':      { teaspoon: 4.5, tablespoon: 13.5, cup: 216 },
  'tereyağı':        { teaspoon: 5,   tablespoon: 14,  cup: 227 },
  'ayçiçek yağı':    { teaspoon: 4.5, tablespoon: 13.5, cup: 216 },
  'bal':             { teaspoon: 7,   tablespoon: 21,  cup: 340 },
  'pekmez':          { teaspoon: 7,   tablespoon: 21,  cup: 340 },
  'tahin':           { teaspoon: 6,   tablespoon: 18,  cup: 250 },
  'sirke':           { teaspoon: 5,   tablespoon: 15,  cup: 240 },
  'limon suyu':      { teaspoon: 5,   tablespoon: 15,  cup: 240 },

  // UN/TAHIL
  'un':              { teaspoon: 3,   tablespoon: 8,   cup: 125 },
  'tam buğday unu':  { teaspoon: 3,   tablespoon: 8,   cup: 120 },
  'mısır unu':       { teaspoon: 3,   tablespoon: 9,   cup: 130 },
  'pirinç':          { teaspoon: 4,   tablespoon: 12,  cup: 185 },
  'bulgur':          { teaspoon: 4,   tablespoon: 11,  cup: 180 },
  'yulaf':           { teaspoon: 2,   tablespoon: 6,   cup: 90  },
  'şeker':           { teaspoon: 4,   tablespoon: 12,  cup: 200 },
  'pudra şekeri':    { teaspoon: 3,   tablespoon: 9,   cup: 120 },
  'tuz':             { teaspoon: 6,   tablespoon: 18 },
  'kabartma tozu':   { teaspoon: 4,   tablespoon: 12 },
  'vanilya':         { teaspoon: 3 },
  'kakao':           { teaspoon: 2,   tablespoon: 6,   cup: 80 },

  // SEBZE
  'soğan':           { piece: 110, handful: 50 },
  'sarımsak':        { piece: 5 },
  'domates':         { piece: 150 },
  'biber':           { piece: 80 },
  'patates':         { piece: 150 },
  'havuç':           { piece: 80 },
  'salatalık':       { piece: 200, slice: 20 },
  'patlıcan':        { piece: 300 },
  'kabak':           { piece: 250 },
  'ıspanak':         { handful: 30, cup: 30 },
  'marul':           { handful: 20, leaf: 15 } as any,
  'maydanoz':        { handful: 15, tablespoon: 4 },
  'nane':            { handful: 10, tablespoon: 3 },
  'dereotu':         { handful: 10, tablespoon: 3 },
  'brokoli':         { handful: 50, cup: 90 },
  'karnabahar':      { handful: 50, cup: 100 },
  'pırasa':          { piece: 150 },
  'kereviz':         { piece: 300 },
  'mantar':          { piece: 20, handful: 40, cup: 70 },

  // MEYVE
  'elma':            { piece: 180 },
  'muz':             { piece: 120 },
  'limon':           { piece: 100 },
  'portakal':        { piece: 200 },
  'çilek':           { piece: 12, cup: 150, handful: 70 },
  'armut':           { piece: 160 },
  'şeftali':         { piece: 150 },
  'kayısı':          { piece: 35 },
  'erik':            { piece: 30 },
  'üzüm':            { handful: 60, cup: 150 },
  'karpuz':          { slice: 300, piece: 5000 },
  'kavun':           { slice: 200, piece: 2000 },

  // ET/PROTEİN
  'yumurta':         { piece: 60 },
  'tavuk göğsü':     { piece: 180 },
  'tavuk but':       { piece: 150 },
  'kıyma':           { tablespoon: 20, handful: 80, cup: 200 },
  'kuşbaşı et':      { handful: 100, cup: 220 },
  'sucuk':           { slice: 15 },
  'salam':           { slice: 20 },
  'pastırma':        { slice: 10 },
  'peynir':          { slice: 30, handful: 40, cup: 150 },
  'kaşar peyniri':   { slice: 20, handful: 30 },

  // KURUBAKLAGIL/FISTIK
  'mercimek':        { tablespoon: 10, cup: 200 },
  'nohut':           { tablespoon: 10, cup: 200 },
  'fasulye':         { tablespoon: 10, cup: 200 },
  'ceviz':           { piece: 7, handful: 30, cup: 100 },
  'badem':           { piece: 1.2, handful: 25, cup: 145 },
  'fındık':          { piece: 1, handful: 25, cup: 140 },
  'fıstık':          { handful: 25 },
  'leblebi':         { handful: 20 },

  // SÜSLEME/BAHARAT
  'karabiber':       { teaspoon: 2.3 },
  'kimyon':          { teaspoon: 2.5 },
  'pul biber':       { teaspoon: 2.5 },
  'zerdeçal':        { teaspoon: 3 },
  'kekik':           { teaspoon: 1 },
  'nane (kuru)':     { teaspoon: 1 },
  'tarçın':          { teaspoon: 2.5 },
};
