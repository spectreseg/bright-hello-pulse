# Sewanee Food Redistribution App

## Food Map Integration

This app includes an integrated Google Maps feature that shows the locations of all available food posts across the University of the South (Sewanee) campus.

### Features

- **Interactive Campus Map**: Shows food locations on a Sewanee-focused map
- **Real-time Updates**: Food posts appear immediately on the map
- **Color-coded Markers**:
  - 🟢 **Green**: Active food available
  - 🟠 **Amber**: Almost finished (2+ people marked as finished)
  - ⚫ **Gray**: Expired food posts
- **Detailed Info Windows**: Click any marker to see:
  - Food photo (if available)
  - Title and description
  - Location details
  - Number of servings
  - Expiration time
  - Who posted it
  - How many people marked it as finished

### How to Use

1. **Access the Map**: Click "Find Food" in the main dashboard
2. **View Active/Expired Posts**: Toggle between active and expired food posts
3. **Explore Campus**: The map is restricted to Sewanee campus boundaries
4. **Get Details**: Click on any marker to see full post information
5. **Navigate**: Use the map controls to zoom and pan around campus

### Sewanee Locations

The app recognizes over 40+ campus locations including:

#### Dormitories
- Benedict Hall, Cannon Hall, Cleveland Hall
- Gorgas Hall, Hodgson Hall, Hunter Hall
- Johnson Hall, McCrady Hall, Smith Hall
- Tuckaway Inn

#### Academic Buildings
- All Saints Chapel, Carnegie Hall
- Convocation Hall, duPont Library
- Gailor Hall, Hamilton Hall
- Kirby-Smith Hall, Spencer Hall
- Walsh-Ellett Hall, Woods Laboratory

#### Dining Locations
- McClurg Dining Hall
- Stirling Coffee House
- Blue Chair Tavern

#### Recreational Facilities
- Fowler Center (Gym)
- Hardee-McGee Field
- Tennis Courts

#### Other Campus Areas
- The Quad, The Domain
- Abbo's Alley, University Offices

### Technical Details

- **Map Bounds**: Restricted to Sewanee campus (35.1942°N to 35.2142°N, -85.9317°W to -85.9117°W)
- **Center Point**: Sewanee campus center (35.2042°N, -85.9217°W)
- **Default Zoom**: Level 15 for optimal campus viewing
- **Location Matching**: Smart keyword matching for location names

### Privacy & Security

- Your Google Maps API key is stored securely in environment variables
- Map data is provided by Google Maps JavaScript API
- Location data is based on publicly available campus information

---

## Google Maps API Setup

The app uses the Google Maps JavaScript API. Your API key is configured in `.env`:

```
VITE_GOOGLE_MAPS_API_KEY=AIzaSyATuZ9W0N4GDGjow5fu9dupwJVpAerYBUY
```

### API Key Restrictions (Recommended)

For security, consider restricting your Google Maps API key:

1. **Application restrictions**: HTTP referrers (websites)
   - Add your domain: `yourdomain.com/*`
   - For development: `localhost:8080/*`

2. **API restrictions**: Limit to required APIs
   - Maps JavaScript API
   - Places API (if needed later)

3. **Quota management**: Set daily request limits to control costs

### Troubleshooting

If the map doesn't load:

1. **Check API Key**: Ensure it's valid and has proper permissions
2. **Check Console**: Look for JavaScript errors in browser dev tools
3. **Check Quotas**: Verify you haven't exceeded Google Maps API limits
4. **Check Network**: Ensure internet connectivity for Google Maps API

---

**Happy Food Sharing at Sewanee! 🍕🗺️**
