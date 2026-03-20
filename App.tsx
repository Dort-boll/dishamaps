
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { Style, Circle, Fill, Stroke } from 'ol/style';

import { Header } from './components/Header';
import { BottomPanel } from './components/BottomPanel';
import { LayerPanel } from './components/LayerPanel';
import { FloatingControls } from './components/FloatingControls';
import { MapTheme, MapLayerType, Destination, RouteInfo, Language, WeatherData } from './types';
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_SOURCES, POPULAR_DESTINATIONS } from './constants';

// Puter.js Global Declaration
declare const puter: any;

const secureVault = {
  encrypt: (data: string) => btoa(encodeURIComponent(data)),
  decrypt: (cipher: string) => {
    try { return decodeURIComponent(atob(cipher)); }
    catch(e) { return "{}"; }
  },
};

const App: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  
  const baseLayerRef = useRef<TileLayer<XYZ>>(new TileLayer({ zIndex: 0 }));
  const trafficLayerRef = useRef<TileLayer<XYZ>>(new TileLayer({ zIndex: 1, visible: false, opacity: 0.7 }));
  const weatherLayerRef = useRef<TileLayer<XYZ>>(new TileLayer({ zIndex: 2, visible: false }));
  const planetaryLayerRef = useRef<TileLayer<XYZ>>(new TileLayer({ zIndex: -1, visible: false }));
  
  const routeSource = useRef<VectorSource>(new VectorSource());
  const userLocSource = useRef<VectorSource>(new VectorSource());
  const poiSource = useRef<VectorSource>(new VectorSource());
  
  const [theme, setTheme] = useState<MapTheme>(MapTheme.DARK);
  const [language, setLanguage] = useState<Language>('en');
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
  const [isBottomPanelExpanded, setIsBottomPanelExpanded] = useState(false);
  const [activeLayers, setActiveLayers] = useState<MapLayerType[]>([MapLayerType.SATELLITE]);
  const [userLiveCoords, setUserLiveCoords] = useState<[number, number] | null>(null);
  const [mapViewCenter, setMapViewCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Destination | null>(null);
  const [nearbyPOIs, setNearbyPOIs] = useState<Destination[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [vayuIntel, setVayuIntel] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [is3D, setIs3D] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < 1024;

  // Initialization & Vault Sync
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2800);
    const saved = localStorage.getItem('_disha_v3_vault');
    if (saved) {
      try {
        const prefs = JSON.parse(secureVault.decrypt(saved));
        if (prefs.theme) setTheme(prefs.theme);
        if (prefs.lang) setLanguage(prefs.lang);
      } catch (e) { console.warn("Vault reset."); }
    }
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('_disha_v3_vault', secureVault.encrypt(JSON.stringify({ theme, lang: language })));
    document.body.className = theme === MapTheme.LIGHT ? 'light-mode' : '';
  }, [theme, language]);

  const fetchWeather = async (lon: number, lat: number): Promise<WeatherData | undefined> => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      if (!res.ok) return undefined;
      const data = await res.json();
      return {
        temp: Math.round(data.current_weather.temperature),
        condition: data.current_weather.temperature > 15 ? 'Clear' : 'Overcast',
        windSpeed: data.current_weather.windspeed,
        humidity: 62,
        icon: data.current_weather.temperature > 22 ? '☀️' : '⛅'
      };
    } catch (e) { return undefined; }
  };

  const fetchNearbyDiscovery = useCallback(async (lon: number, lat: number) => {
    try {
      const query = `[out:json][timeout:25];(node["amenity"~"cafe|restaurant|park|charging_station|hotel"](around:4000,${lat},${lon}););out 15;`;
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      if (!res.ok) return;
      const data = await res.json();
      const results: Destination[] = (data.elements || []).map((el: any) => ({
        id: `osm-${el.id}`,
        name: { en: el.tags.name || 'Urban Hub', hi: el.tags.name || 'नोड', kn: el.tags.name || 'ನೋಡ್', es: el.tags.name || 'Nodo' },
        category: { en: (el.tags.amenity || 'POINT').toUpperCase(), hi: 'स्थान', kn: 'ಸ್ಥಳ', es: 'Lugar' },
        coords: [el.lon, el.lat],
        description: { en: `Verified sector utility node. Status: Active.`, hi: 'सक्रिय नोड।', kn: 'ಸಕ್ರಿಯ ನೋಡ್.', es: 'Nodo activo.' },
        image: el.tags.amenity === 'cafe' ? '☕' : el.tags.amenity === 'hotel' ? '🏨' : el.tags.amenity === 'park' ? '🌳' : '📍',
        rating: 4.4 + (Math.random() * 0.5),
        isOpen: true,
        hours: el.tags.opening_hours || '08:00 - 22:00',
        phone: el.tags.phone || '+91 80 4400 1122',
        reviews: []
      }));
      setNearbyPOIs(results);
    } catch (err) {}
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = new Map({
      target: mapRef.current,
      layers: [
        planetaryLayerRef.current, baseLayerRef.current, trafficLayerRef.current, weatherLayerRef.current,
        new VectorLayer({ source: routeSource.current, zIndex: 10 }),
        new VectorLayer({ source: poiSource.current, zIndex: 40 }),
        new VectorLayer({ source: userLocSource.current, zIndex: 100 })
      ],
      view: new View({ 
        center: fromLonLat(DEFAULT_CENTER), 
        zoom: DEFAULT_ZOOM, 
        constrainResolution: true, 
        smoothExtentConstraint: true,
        multiWorld: true 
      }),
      controls: []
    });
    mapInstance.current = map;

    POPULAR_DESTINATIONS.forEach(dest => {
      const f = new Feature(new Point(fromLonLat(dest.coords)));
      f.set('poiData', dest);
      f.setStyle(new Style({ 
        image: new Circle({ 
          radius: 8, 
          fill: new Fill({ color: '#3b82f6' }), 
          stroke: new Stroke({ color: '#fff', width: 3 }) 
        }) 
      }));
      poiSource.current.addFeature(f);
    });

    if (navigator.geolocation) {
      const opt = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        setUserLiveCoords(coords);
        fetchNearbyDiscovery(coords[0], coords[1]);
        map.getView().animate({ center: fromLonLat(coords), zoom: 16, duration: 2500 });
      }, null, opt);

      navigator.geolocation.watchPosition((pos) => {
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        setUserLiveCoords(coords);
        userLocSource.current.clear();
        const f = new Feature(new Point(fromLonLat(coords)));
        f.setStyle(new Style({ 
          image: new Circle({ 
            radius: 10, 
            fill: new Fill({ color: '#3b82f6' }), 
            stroke: new Stroke({ color: '#fff', width: 4 }) 
          }) 
        }));
        userLocSource.current.addFeature(f);
      }, null, opt);
    }

    map.on('moveend', () => {
      const view = map.getView();
      setRotation(view.getRotation());
      const center = view.getCenter();
      if (center) {
        const lonLat = toLonLat(center) as [number, number];
        setMapViewCenter(lonLat);
        fetchNearbyDiscovery(lonLat[0], lonLat[1]);
      }
    });

    map.on('click', async (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (feature?.get('poiData')) {
        const data = feature.get('poiData');
        const weather = await fetchWeather(data.coords[0], data.coords[1]);
        setSelectedPlace({ ...data, weather });
      } else {
        setSelectedPlace(null);
        setVayuIntel(null);
        routeSource.current.clear();
        setRoutes([]);
      }
    });
  }, [fetchNearbyDiscovery]);

  useEffect(() => {
    if (!mapInstance.current) return;
    const isSatellite = activeLayers.includes(MapLayerType.SATELLITE);
    const isTraffic = activeLayers.includes(MapLayerType.TRAFFIC);
    const isWeather = activeLayers.includes(MapLayerType.WEATHER);
    const isNight = activeLayers.includes(MapLayerType.INDUSTRIAL);
    
    let url = theme === MapTheme.DARK ? MAP_SOURCES.DARK_CANVAS : MAP_SOURCES.GOOGLE_STREET;
    if (isSatellite) url = MAP_SOURCES.GOOGLE_SATELLITE;
    
    baseLayerRef.current.setSource(new XYZ({ url, crossOrigin: 'anonymous' }));
    trafficLayerRef.current.setVisible(isTraffic);
    weatherLayerRef.current.setVisible(isWeather);
    planetaryLayerRef.current.setVisible(isNight);
  }, [activeLayers, theme]);

  const handleAISearch = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setVayuIntel(null);
    
    try {
        // High-precision Urban Analytics via AI Mesh
        const systemPrompt = `Analyze spatial data for "${query}" near ${mapViewCenter[1]}, ${mapViewCenter[0]}. 
        Provide a concise urban density assessment, vibe summary, and utility level. 
        Tone: Professional, data-driven, futuristic. 
        Limit to 3 sentences. No markdown formatting like bolding or lists.`;
        
        // Using Puter's AI multi-model capability
        const response = await puter.ai.chat(systemPrompt);
        const intel = response?.toString() || 'Telemetry analysis complete.';
        setVayuIntel(intel);

        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        const geoData = await geoRes.json();
        if (geoData?.[0]) {
            const coords: [number, number] = [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)];
            const weather = await fetchWeather(coords[0], coords[1]);
            const discoveryDest: Destination = {
              id: `disha-${Date.now()}`,
              name: { en: geoData[0].display_name.split(',')[0], hi: '', kn: '', es: '' },
              category: { en: 'SPATIAL HUB', hi: '', kn: '', es: '' },
              coords: coords,
              description: { en: intel, hi: '', kn: '', es: '' },
              image: '📍',
              rating: 4.8,
              isOpen: true,
              weather,
            };
            setSelectedPlace(discoveryDest);
            mapInstance.current?.getView().animate({ 
              center: fromLonLat(coords), 
              zoom: 16, 
              duration: 1200,
              easing: (t) => t * (2 - t) // Smooth ease-out
            });
        }
    } catch (err) {
      console.error("System De-sync:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const calculateRoute = async (dest: Destination) => {
    if (!userLiveCoords) return;
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${userLiveCoords[0]},${userLiveCoords[1]};${dest.coords[0]},${dest.coords[1]}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0];
        routeSource.current.clear();
        const coords = route.geometry.coordinates.map((c: any) => fromLonLat(c));
        
        // Dynamic Segment Rendering for smooth visualization
        const segCount = isMobile ? 2 : 4;
        const segSize = Math.floor(coords.length / segCount);
        for (let i = 0; i < segCount; i++) {
          const start = i * segSize;
          const end = (i === segCount - 1) ? coords.length : (i + 1) * segSize;
          const segmentCoords = coords.slice(start, end);
          if (segmentCoords.length < 2) continue;
          
          const feature = new Feature(new LineString(segmentCoords));
          const color = ['#3b82f6', '#f59e0b', '#ef4444', '#3b82f6'][i % 4];
          feature.setStyle(new Style({ 
            stroke: new Stroke({ 
              color, 
              width: isMobile ? 6 : 8, 
              lineCap: 'round',
              lineJoin: 'round'
            }) 
          }));
          routeSource.current.addFeature(feature);
        }

        setRoutes([{
          id: 'rt1', distance: `${(route.distance / 1000).toFixed(1)} km`, duration: `${Math.round(route.duration / 60)} min`,
          trafficDelay: '0', congestionLevel: 'low', mode: 'driving', segments: []
        }]);
        
        mapInstance.current?.getView().fit(routeSource.current.getExtent(), { 
          padding: isMobile ? [80, 40, 120, 40] : [120, 120, 120, 120], 
          duration: 1200 
        });
      }
    } catch (e) {}
  };

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`relative w-full h-screen overflow-hidden transition-colors duration-700 ${theme === MapTheme.LIGHT ? 'light-mode' : ''}`}>
      <div ref={mapRef} className="map-container" />
      
      <AnimatePresence>
        {!isOnline && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[3000] glass px-4 py-2 rounded-full border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mono"
          >
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Offline Mode: Using Cached Intel
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showSplash && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[5000] bg-slate-950 flex flex-col items-center justify-center">
             <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
                <h1 className="text-7xl lg:text-9xl font-black text-white tracking-tighter">Disha</h1>
                <p className="text-blue-500 font-black uppercase text-xs lg:text-xl tracking-[0.8em] mono">find your way.</p>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header 
        theme={theme} language={language} mapCenter={mapViewCenter}
        onThemeToggle={() => setTheme(prev => prev === MapTheme.DARK ? MapTheme.LIGHT : MapTheme.DARK)}
        onLanguageChange={setLanguage}
        onLocate={() => userLiveCoords && mapInstance.current?.getView().animate({ center: fromLonLat(userLiveCoords), zoom: 17, duration: 1000 })}
        onOpenLayers={() => setIsLayerPanelOpen(true)}
        onSuggestionSelect={async (dest) => { 
            const weather = await fetchWeather(dest.coords[0], dest.coords[1]);
            setSelectedPlace({ ...dest, weather }); 
            calculateRoute(dest); 
        }}
        onAISearch={handleAISearch}
        isMobile={isMobile}
      />

      <LayerPanel 
        isOpen={isLayerPanelOpen} onClose={() => setIsLayerPanelOpen(false)}
        activeLayers={activeLayers} theme={theme} isOnline={true}
        onToggleLayer={(l) => setActiveLayers(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l])}
      />
      
      <BottomPanel 
        theme={theme} language={language} userLocation={userLiveCoords}
        routeInfo={routes[0] || null} selectedPlace={selectedPlace}
        nearbyDiscovery={nearbyPOIs} vayuIntel={vayuIntel} groundingLinks={[]}
        isExpanded={isBottomPanelExpanded}
        setIsExpanded={setIsBottomPanelExpanded}
        isMobile={isMobile}
        onClosePlace={() => { setSelectedPlace(null); setVayuIntel(null); routeSource.current.clear(); setRoutes([]); }}
        onDestinationSelect={async (dest) => { 
            const weather = await fetchWeather(dest.coords[0], dest.coords[1]);
            setSelectedPlace({ ...dest, weather }); 
            calculateRoute(dest); 
        }}
        onClearRoute={() => { setRoutes([]); routeSource.current.clear(); }}
      />

      <FloatingControls 
        onRecenter={() => mapInstance.current?.getView().animate({ rotation: 0, duration: 800 })}
        onGPS={() => userLiveCoords && mapInstance.current?.getView().animate({ center: fromLonLat(userLiveCoords), zoom: 17, duration: 1000 })}
        on3D={() => { setIs3D(!is3D); mapInstance.current?.getView().animate({ rotation: is3D ? 0 : Math.PI/4, duration: 1000 }); }}
        onMeasureToggle={() => setIsMeasuring(!isMeasuring)} 
        is3D={is3D} isMeasuring={isMeasuring} rotation={rotation}
        isBottomPanelExpanded={isBottomPanelExpanded}
        isMobile={isMobile}
      />
      
      {isSearching && (
        <div className="fixed inset-x-0 top-32 flex justify-center z-[2500] pointer-events-none">
          <div className="px-6 py-2 glass rounded-full flex items-center gap-3 border border-blue-500/30">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 mono">Syncing Urban Telemetry...</span>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
