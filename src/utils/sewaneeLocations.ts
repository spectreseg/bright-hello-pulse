// Comprehensive Sewanee campus location mapping
export interface LocationData {
  name: string;
  coordinates: { lat: number; lng: number };
  type: 'dorm' | 'academic' | 'dining' | 'administrative' | 'recreational' | 'other';
  keywords: string[];
}

export const SEWANEE_LOCATIONS: LocationData[] = [
  // Dormitories
  {
    name: 'Benedict Hall',
    coordinates: { lat: 35.2045, lng: -85.9210 },
    type: 'dorm',
    keywords: ['benedict', 'benedict hall', 'ben hall']
  },
  {
    name: 'Cannon Hall',
    coordinates: { lat: 35.2038, lng: -85.9205 },
    type: 'dorm',
    keywords: ['cannon', 'cannon hall']
  },
  {
    name: 'Cleveland Hall',
    coordinates: { lat: 35.2041, lng: -85.9198 },
    type: 'dorm',
    keywords: ['cleveland', 'cleveland hall']
  },
  {
    name: 'Gorgas Hall',
    coordinates: { lat: 35.2048, lng: -85.9215 },
    type: 'dorm',
    keywords: ['gorgas', 'gorgas hall']
  },
  {
    name: 'Hodgson Hall',
    coordinates: { lat: 35.2035, lng: -85.9220 },
    type: 'dorm',
    keywords: ['hodgson', 'hodgson hall']
  },
  {
    name: 'Hunter Hall',
    coordinates: { lat: 35.2043, lng: -85.9185 },
    type: 'dorm',
    keywords: ['hunter', 'hunter hall']
  },
  {
    name: 'Johnson Hall',
    coordinates: { lat: 35.2039, lng: -85.9225 },
    type: 'dorm',
    keywords: ['johnson', 'johnson hall']
  },
  {
    name: 'McCrady Hall',
    coordinates: { lat: 35.2046, lng: -85.9202 },
    type: 'dorm',
    keywords: ['mccrady', 'mccrady hall', 'mcready']
  },
  {
    name: 'Smith Hall',
    coordinates: { lat: 35.2040, lng: -85.9192 },
    type: 'dorm',
    keywords: ['smith', 'smith hall']
  },
  {
    name: 'Tuckaway Inn',
    coordinates: { lat: 35.2050, lng: -85.9230 },
    type: 'dorm',
    keywords: ['tuckaway', 'tuckaway inn', 'tuck']
  },

  // Academic Buildings
  {
    name: 'All Saints Chapel',
    coordinates: { lat: 35.2042, lng: -85.9210 },
    type: 'other',
    keywords: ['chapel', 'all saints', 'all saints chapel']
  },
  {
    name: 'Carnegie Hall',
    coordinates: { lat: 35.2044, lng: -85.9195 },
    type: 'academic',
    keywords: ['carnegie', 'carnegie hall']
  },
  {
    name: 'Convocation Hall',
    coordinates: { lat: 35.2041, lng: -85.9208 },
    type: 'academic',
    keywords: ['convocation', 'convocation hall', 'convo']
  },
  {
    name: 'duPont Library',
    coordinates: { lat: 35.2043, lng: -85.9212 },
    type: 'academic',
    keywords: ['library', 'dupont', 'dupont library']
  },
  {
    name: 'Gailor Hall',
    coordinates: { lat: 35.2045, lng: -85.9208 },
    type: 'academic',
    keywords: ['gailor', 'gailor hall']
  },
  {
    name: 'Hamilton Hall',
    coordinates: { lat: 35.2047, lng: -85.9203 },
    type: 'academic',
    keywords: ['hamilton', 'hamilton hall']
  },
  {
    name: 'Kirby-Smith Hall',
    coordinates: { lat: 35.2038, lng: -85.9200 },
    type: 'academic',
    keywords: ['kirby', 'kirby smith', 'kirby-smith', 'ks']
  },
  {
    name: 'McGriff Hall',
    coordinates: { lat: 35.2040, lng: -85.9195 },
    type: 'academic',
    keywords: ['mcgriff', 'mcgriff hall']
  },
  {
    name: 'Performing Arts Center',
    coordinates: { lat: 35.2035, lng: -85.9215 },
    type: 'academic',
    keywords: ['pac', 'performing arts', 'performing arts center', 'theater', 'theatre']
  },
  {
    name: 'Spencer Hall',
    coordinates: { lat: 35.2046, lng: -85.9190 },
    type: 'academic',
    keywords: ['spencer', 'spencer hall']
  },
  {
    name: 'Stirling Hall',
    coordinates: { lat: 35.2049, lng: -85.9205 },
    type: 'academic',
    keywords: ['stirling', 'stirling hall']
  },
  {
    name: 'Walsh-Ellett Hall',
    coordinates: { lat: 35.2037, lng: -85.9202 },
    type: 'academic',
    keywords: ['walsh', 'ellett', 'walsh-ellett', 'walsh ellett']
  },
  {
    name: 'Woods Laboratory',
    coordinates: { lat: 35.2044, lng: -85.9188 },
    type: 'academic',
    keywords: ['woods', 'woods lab', 'woods laboratory']
  },

  // Dining
  {
    name: "McClurg Dining Hall",
    coordinates: { lat: 35.2042, lng: -85.9218 },
    type: 'dining',
    keywords: ['mcclurg', 'dining hall', 'dining', 'cafeteria', 'caf']
  },
  {
    name: 'Stirling Coffee House',
    coordinates: { lat: 35.2049, lng: -85.9205 },
    type: 'dining',
    keywords: ['stirling coffee', 'coffee house', 'coffee', 'stirling cafe']
  },
  {
    name: 'Blue Chair Tavern',
    coordinates: { lat: 35.2038, lng: -85.9235 },
    type: 'dining',
    keywords: ['blue chair', 'tavern', 'bct']
  },

  // Recreational
  {
    name: 'Fowler Center',
    coordinates: { lat: 35.2033, lng: -85.9190 },
    type: 'recreational',
    keywords: ['fowler', 'fowler center', 'gym', 'fitness', 'recreation']
  },
  {
    name: 'Hardee-McGee Field',
    coordinates: { lat: 35.2030, lng: -85.9200 },
    type: 'recreational',
    keywords: ['hardee', 'mcgee', 'hardee-mcgee', 'field', 'football', 'stadium']
  },
  {
    name: 'Tennis Courts',
    coordinates: { lat: 35.2032, lng: -85.9185 },
    type: 'recreational',
    keywords: ['tennis', 'tennis courts', 'courts']
  },

  // Administrative
  {
    name: 'University Offices',
    coordinates: { lat: 35.2045, lng: -85.9220 },
    type: 'administrative',
    keywords: ['university offices', 'admin', 'administration', 'offices']
  },
  {
    name: 'Health Services',
    coordinates: { lat: 35.2047, lng: -85.9225 },
    type: 'administrative',
    keywords: ['health', 'health services', 'clinic', 'medical']
  },

  // Other Campus Locations
  {
    name: 'Quad',
    coordinates: { lat: 35.2043, lng: -85.9207 },
    type: 'other',
    keywords: ['quad', 'quadrangle', 'campus quad', 'main quad']
  },
  {
    name: 'Domain',
    coordinates: { lat: 35.2055, lng: -85.9240 },
    type: 'other',
    keywords: ['domain', 'the domain', 'cross']
  },
  {
    name: 'Abbo\'s Alley',
    coordinates: { lat: 35.2041, lng: -85.9230 },
    type: 'other',
    keywords: ['abbos', 'abbo', 'abbos alley', 'alley']
  }
];

export function findLocationCoordinates(locationString: string): { lat: number; lng: number } | null {
  const searchTerm = locationString.toLowerCase().trim();
  
  // First try exact match
  for (const location of SEWANEE_LOCATIONS) {
    if (location.keywords.some(keyword => keyword.toLowerCase() === searchTerm)) {
      return location.coordinates;
    }
  }
  
  // Then try partial match
  for (const location of SEWANEE_LOCATIONS) {
    if (location.keywords.some(keyword => 
      keyword.toLowerCase().includes(searchTerm) || 
      searchTerm.includes(keyword.toLowerCase())
    )) {
      return location.coordinates;
    }
  }
  
  // Default to campus center if no match found
  return { lat: 35.2042, lng: -85.9217 };
}

export function getLocationTypeColor(locationType: string): string {
  switch (locationType) {
    case 'dorm':
      return '#3B82F6'; // blue
    case 'academic':
      return '#10B981'; // green
    case 'dining':
      return '#F59E0B'; // amber
    case 'administrative':
      return '#8B5CF6'; // purple
    case 'recreational':
      return '#EF4444'; // red
    default:
      return '#6B7280'; // gray
  }
}
