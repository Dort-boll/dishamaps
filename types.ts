
export enum MapLayerType {
  STREET = 'street',
  SATELLITE = 'satellite',
  TRAFFIC = 'traffic',
  WEATHER = 'weather',
  TRANSIT = 'transit',
  BUILDINGS = 'buildings',
  ROUTE = 'route',
  MINIMALIST = 'minimalist',
  RETRO = 'retro',
  INDUSTRIAL = 'industrial'
}

export enum MapTheme {
  DARK = 'dark',
  LIGHT = 'light'
}

export type Language = 'en' | 'hi' | 'kn' | 'es';
export type TravelMode = 'driving' | 'walking' | 'cycling' | 'transit';

export interface LocalizedString {
  en: string;
  hi: string;
  kn: string;
  es: string;
}

export interface PlaceReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  avatar?: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  windSpeed: number;
  humidity: number;
  icon: string;
}

export interface Destination {
  id: string;
  name: LocalizedString;
  category: LocalizedString;
  coords: [number, number];
  description: LocalizedString;
  image: string;
  rating?: number;
  reviews?: PlaceReview[];
  phone?: string;
  website?: string;
  isOpen?: boolean;
  hours?: string;
  weather?: WeatherData;
  isVerified?: boolean;
}

export interface RouteInfo {
  id: string;
  distance: string;
  duration: string;
  trafficDelay: string;
  congestionLevel: 'low' | 'moderate' | 'heavy';
  mode: TravelMode;
  segments: any[];
}
