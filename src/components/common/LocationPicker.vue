<template>
  <div class="location-picker">
     <div class="flex justify-between items-end mb-2">
        <label class="block text-gray-300 font-bold">📍 Lokasi & Koordinat</label>
        <button @click.prevent="detectCurrentLocation" class="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow-md border border-blue-400/30">
          <i class="fas fa-location-arrow"></i> Auto-Detect GPS
        </button>
     </div>

     <div :id="mapId" class="h-64 w-full rounded-xl border border-white/20 z-0 mb-3 shadow-inner bg-gray-900"></div>
     
     <p v-if="detectedAddress" class="text-xs text-green-400 mb-3 flex items-center gap-1">
        <i class="fas fa-check-circle"></i> Lokasi dikesan: <span class="font-bold text-white">{{ detectedAddress }}</span>
     </p>

     <div class="grid grid-cols-2 gap-4">
       <div>
         <label class="text-xs text-gray-400 uppercase font-bold mb-1 block">Latitude</label>
         <input 
           type="number" step="any" 
           :value="lat"
           @input="(e) => updateLat(parseFloat((e.target as HTMLInputElement).value))"
           class="glass-input text-sm" placeholder="Cth: 4.2105" 
         />
       </div>
       <div>
         <label class="text-xs text-gray-400 uppercase font-bold mb-1 block">Longitude</label>
         <input 
           type="number" step="any" 
           :value="lng"
           @input="(e) => updateLng(parseFloat((e.target as HTMLInputElement).value))"
           class="glass-input text-sm" placeholder="Cth: 101.9758" 
         />
       </div>
     </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MALAYSIA_STATES } from '../../constants/data';
// @ts-ignore
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet Icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const props = defineProps<{
  initialLat?: number;
  initialLng?: number;
  mapId?: string;
}>();

const emit = defineEmits(['update:lat', 'update:lng', 'update:state', 'update:address']);

const mapId = props.mapId || 'picker-map-' + Math.random().toString(36).substr(2, 9);
let map: any = null;
let marker: any = null;

const lat = ref(props.initialLat || 4.2105);
const lng = ref(props.initialLng || 101.9758);
const detectedAddress = ref('');

const initMap = () => {
    if (map) return;
    const mapEl = document.getElementById(mapId);
    if (!mapEl) return;

    map = L.map(mapId).setView([lat.value, lng.value], props.initialLat ? 13 : 6);
    
    L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
    }).addTo(map);

    marker = L.marker([lat.value, lng.value], { draggable: true }).addTo(map);
    
    marker.on('dragend', (event: any) => {
        const position = event.target.getLatLng();
        updateCoords(position.lat, position.lng);
        reverseGeocode(position.lat, position.lng);
    });

    map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        updateCoords(lat, lng);
        reverseGeocode(lat, lng);
    });
};

const updateCoords = (newLat: number, newLng: number) => {
    lat.value = parseFloat(newLat.toFixed(5));
    lng.value = parseFloat(newLng.toFixed(5));
    emit('update:lat', lat.value);
    emit('update:lng', lng.value);
};

const updateLat = (val: number) => {
    lat.value = val;
    emit('update:lat', val);
    updateMarker();
};

const updateLng = (val: number) => {
    lng.value = val;
    emit('update:lng', val);
    updateMarker();
};

const updateMarker = () => {
    if (marker && !isNaN(lat.value) && !isNaN(lng.value)) {
        marker.setLatLng([lat.value, lng.value]);
        map.setView([lat.value, lng.value], 13);
    }
};

const detectCurrentLocation = () => {
  if (!navigator.geolocation) return alert("Browser tidak sokong GPS.");
  navigator.geolocation.getCurrentPosition((pos) => {
    const { latitude, longitude } = pos.coords;
    updateCoords(latitude, longitude);
    if (map) map.setView([latitude, longitude], 13);
    if (marker) marker.setLatLng([latitude, longitude]);
    reverseGeocode(latitude, longitude);
  }, (err) => {
    console.error(err);
    alert("Gagal dapatkan lokasi GPS.");
  });
};

const reverseGeocode = async (rLat: number, rLng: number) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${rLat}&lon=${rLng}`);
    const data = await res.json();
    if (data && data.address) {
      const city = data.address.city || data.address.town || data.address.village || '';
      const state = data.address.state || '';
      detectedAddress.value = [city, state].filter(Boolean).join(', ');
      
      emit('update:address', detectedAddress.value);
      if (state && MALAYSIA_STATES.includes(state)) {
        emit('update:state', state);
      }
    }
  } catch (e) { console.error("Geocoding failed:", e); }
};

onMounted(() => {
    // Delay slightly to ensure container is ready
    setTimeout(initMap, 500);
});

onUnmounted(() => {
   if (map) { map.remove(); map = null; } 
});
</script>

<style scoped>
.glass-input {
  width: 100%; padding: 10px; border-radius: 8px; 
  border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3);
  color: white; outline: none; font-size: 0.9rem;
}
.glass-input:focus { border-color: #6c63ff; }
</style>
