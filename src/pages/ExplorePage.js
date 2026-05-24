import { useEffect, useMemo, useRef, useState } from 'react';
import { buildGMapsUrl } from '../lib/utils';
import Navbar from '../components/Navbar';
import { useAuth } from '../lib/AuthContext';
import { createTrip } from '../lib/supabase';
import { toast } from '../lib/toast';
import TripModal from '../components/TripModal';
import SearchBox from '../components/SearchBox';

const ATTRACTIONS = [
  {
    id: 'kingston-lacy',
    name: 'Kingston Lacy',
    location: 'Wimborne Minster, Dorset',
    type: 'Park',
    lat: 50.8285,
    lng: -2.1236,
    description: 'National Trust estate with gardens, ornamental lakes and riverside walks.'
  },
  {
    id: 'fountains-abbey',
    name: 'Fountains Abbey & Studley Royal',
    location: 'Ripon, North Yorkshire',
    type: 'Park',
    lat: 54.1360,
    lng: -1.5363,
    description: 'Historic ruins, water gardens and trails within a stunning World Heritage site.'
  },
  {
    id: 'stowe-gardens',
    name: 'Stowe Gardens',
    location: 'Buckingham, Buckinghamshire',
    type: 'Park',
    lat: 51.9943,
    lng: -0.7899,
    description: 'An elegant landscape garden with temples, lakes and designed vistas.'
  },
  {
    id: 'ny',
    name: 'North York Moors',
    location: 'North Yorkshire',
    type: 'Park',
    lat: 54.4153,
    lng: -0.9016,
    description: 'Wide moorland, coastal cliffs and heather-filled trails.'
  },
  {
    id: 'white-horse-hill',
    name: 'White Horse Hill',
    location: 'Uffington, Oxfordshire',
    type: 'Walk',
    lat: 51.5710,
    lng: -1.5570,
    description: 'A scenic walk along the ridge with ancient hill figure and wide views.'
  },
  {
    id: 'forest-hill',
    name: 'Hampstead Heath',
    location: 'London',
    type: 'Park',
    lat: 51.5565,
    lng: -0.1760,
    description: 'Urban parkland with ponds, woodlands and sweeping skyline views.'
  },
  {
    id: 'tyntesfield',
    name: 'Tyntesfield',
    location: 'Bristol',
    type: 'Attraction',
    lat: 51.4076,
    lng: -2.7054,
    description: 'A Gothic Revival mansion with gardens, woodland and riverside trails.'
  },
  {
    id: 'cliveden',
    name: 'Cliveden',
    location: 'Berkshire',
    type: 'Park',
    lat: 51.5042,
    lng: -0.6443,
    description: 'Riverside formal gardens, woodland and extensive Thames-side walking.'
  },
  {
    id: 'stourhead',
    name: 'Stourhead',
    location: 'Wiltshire',
    type: 'Park',
    lat: 51.1841,
    lng: -2.3102,
    description: 'Famous classical landscape garden with lake, temples and hilltop views.'
  },
  {
    id: 'lyme-park',
    name: 'Lyme Park',
    location: 'Cheshire',
    type: 'Park',
    lat: 53.3123,
    lng: -2.2075,
    description: 'A country house set in 1,400 acres of deer park and woodland paths.'
  },
  {
    id: 'nymans',
    name: 'Nymans',
    location: 'West Sussex',
    type: 'Park',
    lat: 50.9776,
    lng: -0.2072,
    description: 'Garden ruins with colourful borders, woodland and historic views.'
  },
  {
    id: 'polesden-lacey',
    name: 'Polesden Lacey',
    location: 'Surrey',
    type: 'Park',
    lat: 51.2264,
    lng: -0.4721,
    description: 'Edwardian mansion with formal gardens and riverside walks.'
  },
  {
    id: 'dunham-massey',
    name: 'Dunham Massey',
    location: 'Cheshire',
    type: 'Park',
    lat: 53.3942,
    lng: -2.3450,
    description: 'Ancient deer park, pastureland and veteran trees near Altrincham.'
  },
  {
    id: 'chartwell',
    name: 'Chartwell',
    location: 'Kent',
    type: 'Attraction',
    lat: 51.2650,
    lng: 0.2538,
    description: 'Winston Churchill’s home with gardens, lakes and woodland paths.'
  },
  {
    id: 'sissinghurst',
    name: 'Sissinghurst Castle Garden',
    location: 'Kent',
    type: 'Park',
    lat: 51.0774,
    lng: 0.6582,
    description: 'Iconic garden rooms and walkways set around a dramatic tower.'
  },
  {
    id: 'tatton-park',
    name: 'Tatton Park',
    location: 'Cheshire',
    type: 'Park',
    lat: 53.3577,
    lng: -2.3378,
    description: 'Estate with deer park, gardens, mansion and farm trails.'
  },
  {
    id: 'brownsea-island',
    name: 'Brownsea Island',
    location: 'Dorset',
    type: 'Walk',
    lat: 50.7066,
    lng: -1.9353,
    description: 'Island reserve with woodland, heathland and coastal walks.'
  },
  {
    id: 'avebury',
    name: 'Avebury',
    location: 'Wiltshire',
    type: 'Attraction',
    lat: 51.4281,
    lng: -1.9935,
    description: 'Ancient stone circles set in a large park landscape with walking trails.'
  },
  {
    id: 'bodnant-garden',
    name: 'Bodnant Garden',
    location: 'Conwy, Wales',
    type: 'Park',
    lat: 53.2455,
    lng: -3.8674,
    description: 'Riverside terraces, exotic plantings and sweeping woodland walks.'
  },
  {
    id: 'richmond-park',
    name: 'Richmond Park',
    location: 'London',
    type: 'Park',
    lat: 51.4423,
    lng: -0.2730,
    description: 'Royal park with roaming deer, ancient trees and wide open grassland.'
  },
  {
    id: 'epping-forest',
    name: 'Epping Forest',
    location: 'London',
    type: 'Park',
    lat: 51.6540,
    lng: 0.0426,
    description: 'Ancient woodland with bridleways, ponds and long walking routes.'
  },
  {
    id: 'new-forest',
    name: 'New Forest',
    location: 'Hampshire',
    type: 'Park',
    lat: 50.8682,
    lng: -1.5994,
    description: 'Ancient forest, heathland and coastal walking with ponies and wildlife.'
  },
  {
    id: 'northumberland-coast',
    name: 'Northumberland Coast',
    location: 'Northumberland',
    type: 'Walk',
    lat: 55.2050,
    lng: -1.6000,
    description: 'Coastal paths and historic castles along wide beaches and dunes.'
  },
  {
    id: 'bournemouth-beach',
    name: 'Bournemouth Beach',
    location: 'Dorset',
    type: 'Beach',
    lat: 50.7184,
    lng: -1.8755,
    description: 'Golden sands, pier walks and a busy seaside promenade.'
  },
  {
    id: 'woolacombe-beach',
    name: 'Woolacombe Beach',
    location: 'Devon',
    type: 'Beach',
    lat: 51.1592,
    lng: -4.1910,
    description: 'Wide bay with surf, dunes and coastal walking.'
  },
  {
    id: 'tenby-beach',
    name: 'Tenby North Beach',
    location: 'Pembrokeshire',
    type: 'Beach',
    lat: 51.6729,
    lng: -4.7045,
    description: 'Historic seaside town beach with colourful harbour views.'
  },
  {
    id: 'fistral-beach',
    name: 'Fistral Beach',
    location: 'Newquay, Cornwall',
    type: 'Beach',
    lat: 50.4144,
    lng: -5.0783,
    description: 'Surf hotspot with dramatic coastline and beach-side trails.'
  },
  {
    id: 'blackpool-pleasure-beach',
    name: 'Blackpool Pleasure Beach',
    location: 'Blackpool, Lancashire',
    type: 'Theme Park',
    lat: 53.8181,
    lng: -3.0532,
    description: 'Classic seaside amusement park with rollercoasters and rides.'
  },
  {
    id: 'alton-towers',
    name: 'Alton Towers',
    location: 'Staffordshire',
    type: 'Theme Park',
    lat: 52.9918,
    lng: -1.8887,
    description: 'Major theme park with high-speed rides, gardens and a water park.'
  },
  {
    id: 'thorpe-park',
    name: 'Thorpe Park',
    location: 'Surrey',
    type: 'Theme Park',
    lat: 51.3889,
    lng: -0.5080,
    description: 'Adrenaline rides, rollercoasters and water attractions.'
  },
  {
    id: 'legoland',
    name: 'Legoland Windsor',
    location: 'Berkshire',
    type: 'Theme Park',
    lat: 51.5018,
    lng: -0.6048,
    description: 'Family theme park with Lego-themed rides and attractions.'
  },
  {
    id: 'chessington',
    name: 'Chessington World of Adventures',
    location: 'Surrey',
    type: 'Theme Park',
    lat: 51.3248,
    lng: -0.3095,
    description: 'Theme park with zoo, aquarium and rollercoasters.'
  },
  {
    id: 'paultons-park',
    name: 'Paultons Park',
    location: 'Hampshire',
    type: 'Theme Park',
    lat: 50.8416,
    lng: -1.3413,
    description: 'Family park with Peppa Pig World and outdoor rides.'
  },
  {
    id: 'heathrow',
    name: 'London Heathrow Airport',
    location: 'Hounslow, London',
    type: 'Airport',
    lat: 51.4700,
    lng: -0.4543,
    description: 'UK busiest international airport with flights worldwide.'
  },
  {
    id: 'gatwick',
    name: 'London Gatwick Airport',
    location: 'West Sussex',
    type: 'Airport',
    lat: 51.1537,
    lng: -0.1821,
    description: 'Major international airport serving London and south-east England.'
  },
  {
    id: 'london-city-airport',
    name: 'London City Airport',
    location: 'London',
    type: 'Airport',
    lat: 51.5053,
    lng: 0.0559,
    description: 'Inner London airport for business travelers and short-haul flights.'
  },
  {
    id: 'stansted',
    name: 'London Stansted Airport',
    location: 'Essex',
    type: 'Airport',
    lat: 51.8890,
    lng: 0.2389,
    description: 'International airport with many low-cost carriers.'
  },
  {
    id: 'luton-airport',
    name: 'London Luton Airport',
    location: 'Bedfordshire',
    type: 'Airport',
    lat: 51.8747,
    lng: -0.3683,
    description: 'Popular London airport for budget and European flights.'
  },
  {
    id: 'southend-airport',
    name: 'London Southend Airport',
    location: 'Essex',
    type: 'Airport',
    lat: 51.5710,
    lng: 0.6950,
    description: 'Small London airport serving leisure and European destinations.'
  },
  {
    id: 'manchester-airport',
    name: 'Manchester Airport',
    location: 'Greater Manchester',
    type: 'Airport',
    lat: 53.3628,
    lng: -2.2727,
    description: 'Large northern hub with domestic and international flights.'
  },
  {
    id: 'birmingham-airport',
    name: 'Birmingham Airport',
    location: 'West Midlands',
    type: 'Airport',
    lat: 52.4539,
    lng: -1.7480,
    description: 'Midlands airport serving domestic, European and long-haul routes.'
  },
  {
    id: 'bristol-airport',
    name: 'Bristol Airport',
    location: 'North Somerset',
    type: 'Airport',
    lat: 51.3825,
    lng: -2.7191,
    description: 'South west airport serving domestic and European destinations.'
  },
  {
    id: 'newcastle-airport',
    name: 'Newcastle Airport',
    location: 'Tyne and Wear',
    type: 'Airport',
    lat: 55.0375,
    lng: -1.6900,
    description: 'North east airport serving UK and European routes.'
  },
  {
    id: 'glasgow-airport',
    name: 'Glasgow Airport',
    location: 'Glasgow',
    type: 'Airport',
    lat: 55.8711,
    lng: -4.4331,
    description: 'Major Scottish airport with international connections.'
  },
  {
    id: 'edinburgh-airport',
    name: 'Edinburgh Airport',
    location: 'Edinburgh',
    type: 'Airport',
    lat: 55.95,
    lng: -3.3725,
    description: 'Scotland’s busiest airport with flights across Europe and beyond.'
  },
  {
    id: 'aberdeen-airport',
    name: 'Aberdeen Airport',
    location: 'Aberdeenshire',
    type: 'Airport',
    lat: 57.2019,
    lng: -2.1977,
    description: 'Airport serving northeast Scotland and oil industry flights.'
  },
  {
    id: 'inverness-airport',
    name: 'Inverness Airport',
    location: 'Highland',
    type: 'Airport',
    lat: 57.5420,
    lng: -4.0476,
    description: 'Gateway to the Scottish Highlands with domestic and international flights.'
  },
  {
    id: 'belfast-international',
    name: 'Belfast International Airport',
    location: 'Antrim, Northern Ireland',
    type: 'Airport',
    lat: 54.6575,
    lng: -6.2154,
    description: 'Northern Ireland’s main airport for international services.'
  },
  {
    id: 'belfast-city',
    name: 'George Best Belfast City Airport',
    location: 'Belfast',
    type: 'Airport',
    lat: 54.6180,
    lng: -5.8770,
    description: 'City airport serving Northern Ireland for short-haul flights.'
  },
  {
    id: 'cardiff-airport',
    name: 'Cardiff Airport',
    location: 'Cardiff',
    type: 'Airport',
    lat: 51.3965,
    lng: -3.3433,
    description: 'Wales airport for domestic and European services.'
  },
  {
    id: 'east-midlands-airport',
    name: 'East Midlands Airport',
    location: 'Leicestershire',
    type: 'Airport',
    lat: 52.8311,
    lng: -1.3280,
    description: 'Central England airport for cargo and passenger flights.'
  },
  {
    id: 'leeds-bradford-airport',
    name: 'Leeds Bradford Airport',
    location: 'West Yorkshire',
    type: 'Airport',
    lat: 53.8650,
    lng: -1.6600,
    description: 'Northern airport serving Leeds and Bradford.'
  },
  {
    id: 'liverpool-airport',
    name: 'Liverpool John Lennon Airport',
    location: 'Merseyside',
    type: 'Airport',
    lat: 53.3331,
    lng: -2.8497,
    description: 'Airport serving Liverpool and north west England.'
  },
  {
    id: 'teesside-airport',
    name: 'Teesside International Airport',
    location: 'North Yorkshire',
    type: 'Airport',
    lat: 54.5090,
    lng: -1.4290,
    description: 'North east airport serving Teesside and Yorkshire.'
  },
  {
    id: 'southampton-airport',
    name: 'Southampton Airport',
    location: 'Hampshire',
    type: 'Airport',
    lat: 50.9500,
    lng: -1.3564,
    description: 'Airport near the south coast with UK and European flights.'
  },
  {
    id: 'bournemouth-airport',
    name: 'Bournemouth Airport',
    location: 'Dorset',
    type: 'Airport',
    lat: 50.7787,
    lng: -1.8421,
    description: 'South coast airport serving holiday and charter flights.'
  },
  {
    id: 'warton-airport',
    name: 'Warton Airport',
    location: 'Warton, Lancashire',
    type: 'Airport',
    lat: 53.7278,
    lng: -2.9226,
    description: 'Commercial airfield used by BAE Systems and test flights.'
  },
  {
    id: 'hawarden-airport',
    name: 'Hawarden Airport',
    location: 'Hawarden, Flintshire',
    type: 'Airport',
    lat: 53.2286,
    lng: -2.9493,
    description: 'Regional airport serving north Wales and nearby industrial sites.'
  },
  {
    id: 'howden-airfield',
    name: 'Howden Airfield',
    location: 'East Riding of Yorkshire',
    type: 'Airport',
    lat: 53.8019,
    lng: -0.8042,
    description: 'Smaller airfield with general aviation and airfield facilities.'
  },
  {
    id: 'raf-brize-norton',
    name: 'RAF Brize Norton',
    location: 'Oxfordshire',
    type: 'Military Base',
    lat: 51.7536,
    lng: -1.5832,
    description: 'UK Ministry of Defence air transport base.'
  },
  {
    id: 'raf-lossiemouth',
    name: 'RAF Lossiemouth',
    location: 'Moray, Scotland',
    type: 'Military Base',
    lat: 57.7167,
    lng: -3.3397,
    description: 'Royal Air Force station in north-east Scotland.'
  },
  {
    id: 'raf-waddington',
    name: 'RAF Waddington',
    location: 'Lincolnshire',
    type: 'Military Base',
    lat: 53.1530,
    lng: -0.5080,
    description: 'RAF intelligence, surveillance and reconnaissance base.'
  },
  {
    id: 'raf-marham',
    name: 'RAF Marham',
    location: 'Norfolk',
    type: 'Military Base',
    lat: 52.6517,
    lng: 0.5405,
    description: 'Fast-jet station for Typhoon and Lightning aircraft.'
  },
  {
    id: 'raf-northolt',
    name: 'RAF Northolt',
    location: 'Greater London',
    type: 'Military Base',
    lat: 51.5461,
    lng: -0.4168,
    description: 'RAF station close to west London and military air traffic.'
  },
  {
    id: 'raf-valley',
    name: 'RAF Valley',
    location: 'Anglesey, Wales',
    type: 'Military Base',
    lat: 53.4342,
    lng: -4.5576,
    description: 'RAF training air station on the Isle of Anglesey.'
  },
  {
    id: 'raf-benson',
    name: 'RAF Benson',
    location: 'Oxfordshire',
    type: 'Military Base',
    lat: 51.6092,
    lng: -1.3008,
    description: 'Helicopter base for support and rescue operations.'
  },
  {
    id: 'raf-odiham',
    name: 'RAF Odiham',
    location: 'Hampshire',
    type: 'Military Base',
    lat: 51.2457,
    lng: -1.0553,
    description: 'RAF helicopter base supporting fast-jet and special forces.'
  },
  {
    id: 'raf-leeming',
    name: 'RAF Leeming',
    location: 'North Yorkshire',
    type: 'Military Base',
    lat: 54.2815,
    lng: -1.6207,
    description: 'RAF station home to Typhoon and support squadrons.'
  },
  {
    id: 'raf-coningsby',
    name: 'RAF Coningsby',
    location: 'Lincolnshire',
    type: 'Military Base',
    lat: 53.1392,
    lng: -0.2005,
    description: 'RAF Tornado and Typhoon station for Quick Reaction Alert.'
  },
  {
    id: 'raf-scampton',
    name: 'RAF Scampton',
    location: 'Lincolnshire',
    type: 'Military Base',
    lat: 53.2349,
    lng: -0.5463,
    description: 'Historic RAF station and home of the Red Arrows display team.'
  },
  {
    id: 'raf-shawbury',
    name: 'RAF Shawbury',
    location: 'Shropshire',
    type: 'Military Base',
    lat: 52.7412,
    lng: -2.6374,
    description: 'RAF flying training station for rotary and multi-engine pilots.'
  },
  {
    id: 'raf-cosford',
    name: 'RAF Cosford',
    location: 'Shropshire',
    type: 'Military Base',
    lat: 52.6767,
    lng: -2.2741,
    description: 'RAF base with training schools and aerospace museum.'
  },
  {
    id: 'raf-wittering',
    name: 'RAF Wittering',
    location: 'Cambridgeshire',
    type: 'Military Base',
    lat: 52.5583,
    lng: -0.3732,
    description: 'RAF base supporting helicopter and engineering units.'
  },
  {
    id: 'sissinghurst-beach',
    name: 'Rhossili Bay',
    location: 'Gower, Wales',
    type: 'Beach',
    lat: 51.5602,
    lng: -4.3031,
    description: 'Sweeping sandy bay with iconic coastal scenery.'
  },
  {
    id: 'blackpool-beach',
    name: 'Blackpool Beach',
    location: 'Blackpool, Lancashire',
    type: 'Beach',
    lat: 53.8150,
    lng: -3.0495,
    description: 'Classic seaside resort beach with promenade and piers.'
  },
  {
    id: 'south-wold',
    name: 'Southwold Beach',
    location: 'Suffolk',
    type: 'Beach',
    lat: 52.3260,
    lng: 1.6800,
    description: 'Quiet coastal beach with historic lighthouse and town.'
  },
  {
    id: 'fjord-trail',
    name: 'Dartmoor National Park',
    location: 'Devon',
    type: 'Park',
    lat: 50.5870,
    lng: -3.9410,
    description: 'Wild moorland and river valleys with long distance walking.'
  }
];

function getTypeLabel(type) {
  if (type === 'Airport' || type === 'Military Base') return `✈️ ${type}`;
  return type;
}

function getTileUrl(style) {
  return style === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
}

function getTileAttribution(style) {
  return style === 'satellite'
    ? 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
    : '© OpenStreetMap contributors';
}

function getDistanceKm(from, to) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat))
    * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function ExplorePage() {
  const { session } = useAuth();
  const [modalTrip, setModalTrip] = useState(null); // for TripModal
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [mapView, setMapView] = useState(false);
  const [mapStyle, setMapStyle] = useState('streets');
  const [selectedTypes, setSelectedTypes] = useState([
    'Airport', 'Military Base', 'Park', 'Attraction', 'Theme Park', 'Beach', 'Walk'
  ]);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const mapRef = useRef(null);
  const leafRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not available in this browser. Showing attractions by default order.');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoadingLocation(false);
      },
      () => {
        setLocationError('Location permission denied. Showing attractions by default order.');
        setLoadingLocation(false);
      },
      { timeout: 10000 }
    );
  }, []);

  const attractions = useMemo(() => {
    return ATTRACTIONS
      .filter(item => selectedTypes.includes(item.type))
      .filter(item => !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.location.toLowerCase().includes(search.toLowerCase()))
      .map((item) => {
        const distance = position ? getDistanceKm(position, item) : null;
        return { ...item, distance };
      }).sort((a, b) => {
        if (a.distance != null && b.distance != null) return a.distance - b.distance;
        if (a.distance != null) return -1;
        if (b.distance != null) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [position, selectedTypes, search]);

  useEffect(() => {
    if (!mapView) return;
    if (!mapRef.current) return;

    function fixLeafletDefaultIcons() {
      if (!window.L || !window.L.Icon || !window.L.Icon.Default) return;
      window.L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    }

    function ensureLeaflet(cb) {
      if (window.L) { fixLeafletDefaultIcons(); cb(); return; }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => { fixLeafletDefaultIcons(); cb(); };
      document.head.appendChild(script);
    }

    const buildMap = () => {
      if (!mapRef.current || !window.L) return;
      if (leafRef.current) { leafRef.current.remove(); }

      const center = position ? [position.lat, position.lng] : [51.5, -0.1];
      const m = window.L.map(mapRef.current).setView(center, 6);
      window.L.tileLayer(getTileUrl(mapStyle), {
        attribution: getTileAttribution(mapStyle)
      }).addTo(m);

      // Show current location marker
      if (position) {
        window.L.circleMarker([position.lat, position.lng], {
          radius: 10,
          color: '#1d4ed8',
          fillColor: '#3b82f6',
          fillOpacity: 0.8,
        }).addTo(m).bindPopup('You are here');
      }

      attractions.forEach((item) => {
        const marker = window.L.marker([item.lat, item.lng]).addTo(m);
        marker.bindPopup(
          `<div style="font-family:'DM Sans',sans-serif;line-height:1.4;max-width:220px">
            <strong style="font-size:14px;display:block;margin-bottom:6px">${item.name}</strong>
            <div style="color:#374151;font-size:13px;margin-bottom:4px">${item.location}</div>
            <div style="color:#374151;font-size:13px;margin-bottom:6px">${item.description}</div>
            <a href="${buildGMapsUrl(item)}" target="_blank" style="display:inline-block;margin-top:6px;padding:7px 12px;background:#1d4ed8;color:white;border-radius:8px;font-size:12px;text-decoration:none;">Navigate</a>
          </div>`
        );
      });

      const group = window.L.featureGroup(attractions.map((item) => window.L.marker([item.lat, item.lng])));
      if (attractions.length > 0) {
        m.fitBounds(group.getBounds().pad(0.2));
      }
      leafRef.current = m;
    };

    ensureLeaflet(() => setTimeout(buildMap, 100));
    return () => { if (leafRef.current) { leafRef.current.remove(); leafRef.current = null; } };
  }, [mapView, attractions, position, mapStyle]);

  return (
    <>
      <Navbar />
      <div className="main">
        <div className="page-header">
          <div>
            <h1 className="page-title">Explore</h1>
            <p className="page-subtitle">
              Browse National Trust parks, beaches, theme parks, attractions and UK airports.
            </p>
            <SearchBox placeholder="Search places..." onSearch={setSearch} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
              {['Airport', 'Military Base', 'Park', 'Attraction', 'Theme Park', 'Beach', 'Walk'].map((type) => (
                <label key={type} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--muted)' }}>
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => {
                      setSelectedTypes((prev) =>
                        prev.includes(type)
                          ? prev.filter((value) => value !== type)
                          : [...prev, type]
                      );
                    }}
                  />
                  {getTypeLabel(type)}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={() => setMapView(!mapView)}
            >
              {mapView ? 'Switch to list view' : 'Switch to map view'}
            </button>
            {mapView && (
              <select
                value={mapStyle}
                onChange={(e) => setMapStyle(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'white', color: 'var(--text)', minWidth: '170px' }}
              >
                <option value="streets">Normal map</option>
                <option value="satellite">Satellite</option>
              </select>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '1rem', color: 'var(--muted)' }}>
          {loadingLocation
            ? 'Finding your location…'
            : position
              ? `Showing attractions near ${position.lat.toFixed(2)}, ${position.lng.toFixed(2)}.`
              : locationError || 'Showing attractions from a default view.'
          }
        </div>

        {mapView ? (
          <div ref={mapRef} className="map-page-container" style={{ minHeight: '520px' }} />
        ) : (
          <div className="trips-grid" style={{ gap: '14px' }}>
            {attractions.map((item) => (
              <div key={item.id} className="detail-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span className="badge badge-teal" style={{ fontSize: '12px' }}>{getTypeLabel(item.type)}</span>
                      <strong>{item.name}</strong>
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '8px' }}>{item.location}</div>
                  </div>
                  {item.distance != null && (
                    <div style={{ color: 'var(--muted)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {item.distance} km
                    </div>
                  )}
                </div>
                <p style={{ marginBottom: '12px', color: 'var(--text)', fontSize: '14px' }}>{item.description}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={buildGMapsUrl(item)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    🧭 Navigate
                  </a>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      if (!session?.user?.id) {
                        toast('Please sign in to add trips.', 'error');
                        return;
                      }
                      setModalTrip({
                        name: item.name,
                        location: item.location,
                        description: item.description,
                        type: item.type,
                        lat: item.lat,
                        lng: item.lng,
                        date: '',
                        time: ''
                      });
                    }}
                  >
                    ＋ Add to My Trips
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {modalTrip && (
        <TripModal
          trip={modalTrip}
          onSave={async (form) => {
            try {
              await createTrip({
                ...form,
                user_id: session.user.id
              });
              toast('Added to your trips!', 'success');
            } catch (err) {
              toast('Could not add trip: ' + err.message, 'error');
            }
          }}
          onClose={() => setModalTrip(null)}
        />
      )}
    </>
  );
}
