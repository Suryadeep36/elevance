import React, { useRef, useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

interface UserMapProps {
  users: any[];
  selectedSkill: string;
  selectedCompany: string;
  selectedUser: any;
  setSelectedUser: (user: any) => void;
  viewMode: 'simple' | '3d';
}

const UserMap = ({ users, selectedSkill, selectedCompany, selectedUser, setSelectedUser, viewMode }: UserMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapInstanceRef = useRef<any>(null);

  // Cleanup previous map instance when component unmounts or view mode changes
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (e) {
          console.error("Error cleaning up map:", e);
        }
      }
    };
  }, [viewMode]);

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Reset map state when view mode changes
    setMapInitialized(false);
    setMapError(null);
    
    // Add base map styles
    const addBaseMapStyles = () => {
      const styleId = 'map-custom-styles';
      let styleElement = document.getElementById(styleId);
      
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      
      styleElement.innerHTML = `
        .leaflet-container {
          height: 100%;
          width: 100%;
          background-color: #1e1e1e;
        }
        .custom-marker {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #4c1d95, #6d28d9);
          border-radius: 50%;
          color: white;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .selected-marker {
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          width: 35px;
          height: 35px;
        }
        .map3d-marker {
          transform: perspective(500px) rotateX(45deg);
          box-shadow: 0 15px 15px -10px rgba(0, 0, 0, 0.5);
        }
        .map3d-container {
          transform-style: preserve-3d;
          perspective: 1200px;
        }
        .map3d-container .leaflet-map-pane {
          transition: transform 0.3s ease;
        }
        .map3d-shadow {
          position: absolute;
          bottom: -10px;
          left: calc(50% - 15px);
          width: 30px;
          height: 10px;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 70%);
          border-radius: 50%;
        }
      `;
    };
    
    // Initialize map with selected view mode
    const initializeMap = async () => {
      try {
        // Add base styles for the map
        addBaseMapStyles();
        
        // Import Leaflet dynamically
        const L = (await import('leaflet')).default;
        
        // Clear previous map instance if it exists
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        
        // Make sure the map container exists
        if (!mapRef.current) return;
        
        // Create map instance with appropriate options
        const map = L.map(mapRef.current, {
          center: [20.5937, 78.9629], // Centered on India
          zoom: viewMode === '3d' ? 6 : 5,
          scrollWheelZoom: true,
        });
        
        // Choose tile layer based on view mode
        if (viewMode === 'simple') {
          // Simple view has a dark base map
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 19,
          }).addTo(map);
        } else {
          // 3D view has a satellite base map for more depth
          L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 19,
          }).addTo(map);
          
          // Add a subtle 3D effect to the map container
          if (mapRef.current) {
            mapRef.current.classList.add('map3d-container');
          }
        }
        
        // Add markers for filtered users
        const filteredUsers = users.filter(user => {
          const matchesSkill = !selectedSkill || user.skills.includes(selectedSkill);
          const matchesCompany = !selectedCompany || user.company === selectedCompany;
          return matchesSkill && matchesCompany;
        });
        
        const markers = filteredUsers.map(user => {
          const isSelected = selectedUser && selectedUser.name === user.name;
          
          // Create marker element with appropriate class based on view mode
          const markerEl = document.createElement('div');
          markerEl.className = `custom-marker ${isSelected ? 'selected-marker' : ''} ${viewMode === '3d' ? 'map3d-marker' : ''}`;
          markerEl.innerHTML = user.name.split(' ').map((n: string) => n[0]).join('');
          
          // For 3D mode, add a shadow element
          if (viewMode === '3d') {
            const shadowEl = document.createElement('div');
            shadowEl.className = 'map3d-shadow';
            markerEl.appendChild(shadowEl);
          }
          
          // Create the icon and marker
          const icon = L.divIcon({
            className: 'custom-map-marker', 
            html: markerEl,
            iconSize: [isSelected ? 35 : 30, isSelected ? 35 : 30],
            iconAnchor: [isSelected ? 17 : 15, isSelected ? 17 : 15],
          });
          
          // Add marker to map
          return L.marker([user.lat, user.lon], { icon })
            .addTo(map)
            .bindPopup(`
              <div class="p-2">
                <div class="font-bold text-purple-600 mb-1">${user.name}</div>
                <div class="text-sm">${user.title}</div>
                <div class="text-xs text-gray-700">${user.company}</div>
              </div>
            `)
            .on('click', () => {
              setSelectedUser(user);
            });
        });
        
        // Fit map to show all markers
        if (markers.length > 0) {
          const group = L.featureGroup(markers);
          map.fitBounds(group.getBounds(), { padding: [50, 50] });
        }
        
        // If there's a selected user, center the map on them
        if (selectedUser) {
          map.setView([selectedUser.lat, selectedUser.lon], viewMode === '3d' ? 8 : 7);
        }
        
        // Store map reference and update state
        mapInstanceRef.current = map;
        setMapInitialized(true);
        
        // For 3D mode, add mouse movement effect
        if (viewMode === '3d' && mapRef.current) {
          const handleMouseMove = (e: MouseEvent) => {
            if (!mapRef.current) return;
            
            const rect = mapRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate tilt based on mouse position
            const tiltX = (((y / rect.height) * 2) - 1) * -5;
            const tiltY = (((x / rect.width) * 2) - 1) * 5;
            
            // Apply tilt effect to map pane
            const mapPane = mapRef.current.querySelector('.leaflet-map-pane');
            if (mapPane) {
              (mapPane as HTMLElement).style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(20px)`;
            }
          };
          
          mapRef.current.addEventListener('mousemove', handleMouseMove);
          
          // Reset effect when mouse leaves
          mapRef.current.addEventListener('mouseleave', () => {
            const mapPane = mapRef.current?.querySelector('.leaflet-map-pane');
            if (mapPane) {
              (mapPane as HTMLElement).style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
            }
          });
          
          // Cleanup
          return () => {
            mapRef.current?.removeEventListener('mousemove', handleMouseMove);
            mapRef.current?.removeEventListener('mouseleave', () => {});
          };
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError(`Failed to initialize map: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    
    // Initialize map
    initializeMap();
  }, [users, selectedSkill, selectedCompany, selectedUser, setSelectedUser, viewMode]);

  return (
    <>
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80 z-10 p-4">
          <div className="bg-red-900/50 border border-red-500/50 p-4 rounded-lg max-w-md text-center">
            <h3 className="text-lg font-semibold text-red-300 mb-2">Map Error</h3>
            <p className="text-white">{mapError}</p>
          </div>
        </div>
      )}
      <div 
        ref={mapRef} 
        className="h-full w-full relative rounded-xl overflow-hidden" 
      >
        {!mapInitialized && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-t-purple-500 border-purple-200/20 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-300">Loading {viewMode === '3d' ? '3D' : 'simple'} map...</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserMap;