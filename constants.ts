
import { Destination, Language } from './types';

export const DEFAULT_CENTER: [number, number] = [77.5946, 12.9716]; 
export const DEFAULT_ZOOM = 13;

export const MAP_SOURCES = {
  DARK_CANVAS: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  OPEN_STREET: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  GOOGLE_STREET: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
  GOOGLE_SATELLITE: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', 
  GOOGLE_TRAFFIC: 'https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}',
  NASA_GIBS_NIGHT: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png',
  NOAA_PRECIP: 'https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png',
};

// Fix: Added missing 'kn' and 'es' properties to comply with Record<Language, any>
export const TRANSLATIONS: Record<Language, any> = {
  en: {
    searchPlaceholder: "Vayu Uplink... 'Analyze urban density'...",
    explore: "Vayu Intel",
    directions: "Pathing",
    traffic: "Fluidity",
    nearby: "Proximity",
    reset: "Clear",
    startNav: "Engage",
    nightMode: "Dark Ops",
    dayMode: "Orbital",
    reviews: "Intelligence",
    isOpen: "Active",
    isClosed: "Silent",
    call: "Signal",
    save: "Archive",
    share: "Broadcast",
    weather: "Atmospherics",
    hours: "Operational Hours",
    phone: "Voice Link",
  },
  hi: {
    searchPlaceholder: "वायु एजीआई खोजें...",
    explore: "वायु इंटेल",
    directions: "मार्ग",
    traffic: "प्रवाह",
    nearby: "पास में",
    reset: "साफ़",
    startNav: "जुड़ें",
    nightMode: "रात",
    dayMode: "दिन",
    reviews: "खुफिया",
    isOpen: "सक्रिय",
    isClosed: "बंद",
    call: "सिग्नल",
    save: "संग्रह",
    share: "प्रसारण",
    weather: "मौसम",
    hours: "संचालन घंटे",
    phone: "वॉइस लिंक",
  },
  kn: {
    searchPlaceholder: "ವಾಯು ಅಪ್ಲಿಂಕ್...",
    explore: "ವಾಯು ಇಂಟೆಲ್",
    directions: "ಮಾರ್ಗ",
    traffic: "ಹರಿವು",
    nearby: "ಹತ್ತಿರದ",
    reset: "ತೆರವುಗೊಳಿಸಿ",
    startNav: "ತೊಡಗಿಸಿಕೊಳ್ಳಿ",
    nightMode: "ರಾತ್ರಿ",
    dayMode: "ಹಗಲು",
    reviews: "ಗುಪ್ತಚರ",
    isOpen: "ಸಕ್ರಿಯ",
    isClosed: "ಸ್ಥಗಿತ",
    call: "ಸಿಗ್ನಲ್",
    save: "ಆರ್ಕೈವ್",
    share: "ಪ್ರಸಾರ",
    weather: "ವಾತಾವರಣ",
    hours: "ಕಾರ್ಯಾಚರಣೆಯ ಸಮಯ",
    phone: "ಧ್ವನಿ ಲಿಂಕ್",
  },
  es: {
    searchPlaceholder: "Enlace Vayu...",
    explore: "Intel Vayu",
    directions: "Ruta",
    traffic: "Fluidez",
    nearby: "Proximidad",
    reset: "Limpiar",
    startNav: "Iniciar",
    nightMode: "Operaciones Nocturnas",
    dayMode: "Orbital",
    reviews: "Inteligencia",
    isOpen: "Activo",
    isClosed: "Silencioso",
    call: "Señal",
    save: "Archivar",
    share: "Transmitir",
    weather: "Atmosféricos",
    hours: "Horas Operativas",
    phone: "Enlace de Voz",
  }
};

export const POPULAR_DESTINATIONS: Destination[] = [
  {
    id: 'node-01',
    name: { en: 'Lalbagh Botanical Core', hi: 'लालबाग वनस्पति केंद्र', kn: 'ಲಾಲ್ ಬಾಗ್ ವೀಕ್ಷಣಾಲಯ', es: 'Núcleo de Lalbagh' },
    category: { en: 'SPATIAL VITALITY NODE', hi: 'नोड', kn: 'ನೋಡ್', es: 'Nodo Vital' },
    coords: [77.5844, 12.9507],
    description: { en: 'Critical oxygen and vitality node within the Bengaluru planetary mesh.', hi: 'ऐतिहासिक स्थल।', kn: 'ಐತಿಹಾಸಿಕ ತಾಣ.', es: 'Sitio histórico.' },
    image: '🌳',
    rating: 4.9,
    isOpen: true,
    hours: '06:00 - 19:00',
    phone: '+91 80 2657 1925',
    reviews: [
      { id: 'r1', author: 'Aditya K.', rating: 5, text: 'The lung of the city. Incredible biodiversity.', date: '2 days ago' },
      { id: 'r2', author: 'Sarah J.', rating: 4, text: 'Great for morning walks. Very peaceful.', date: '1 week ago' }
    ]
  },
  {
    id: 'node-02',
    name: { en: 'Vidhana Soudha Node', hi: 'विधान सभा नोड', kn: 'ವಿಧಾನ ಸೌಧ', es: 'Nodo Vidhana' },
    category: { en: 'GOVERNANCE MESH HUB', hi: 'प्रशासनिक केंद्र', kn: 'ಆಡಳಿತ ಕೇಂದ್ರ', es: 'Hub Gubernamental' },
    coords: [77.5908, 12.9797],
    description: { en: 'Primary administrative and symbolic node for the regional governance mesh.', hi: 'प्रशासनिक स्थल।', kn: 'ಆಡಳಿತ ಕೇಂದ್ರ.', es: 'Sitio administrativo.' },
    image: '🏛️',
    rating: 5.0,
    isOpen: true,
    hours: '10:00 - 17:30',
    phone: '+91 80 2225 4013',
    reviews: [
      { id: 'r3', author: 'Rajesh M.', rating: 5, text: 'Stunning architecture. Looks magical at night when lit up.', date: '1 month ago' }
    ]
  }
];
