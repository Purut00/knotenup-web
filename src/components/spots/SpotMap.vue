<template>
  <div v-if="spot.gpxUrl || spot.location" class="mb-8 animate-fade-in-up delay-100">
      <div class="bg-[#0f172a]/75 border border-white/10 rounded-[20px] backdrop-blur-[10px] shadow-[0_10px_30px_rgba(0,0,0,0.4)] p-1 overflow-hidden relative group">
        <div class="absolute top-4 left-4 z-[400] bg-black/60 backdrop-blur px-4 py-2 rounded-lg border border-white/10">
            <h3 class="font-bold text-white flex items-center gap-2">
              <i class="fas fa-mountain text-orange-400"></i> Peta Topografi & Laluan
            </h3>
        </div>

        <div v-if="spot.gpxUrl" class="absolute bottom-4 right-4 z-[400]">
            <a :href="spot.gpxUrl" download class="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg shadow-lg transition transform hover:-translate-y-1">
              <i class="fas fa-file-download"></i> Download GPX
            </a>
        </div>

        <div :id="mapId" class="w-full h-[500px] rounded-xl z-0 bg-gray-900 relative"></div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, nextTick, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-gpx';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const props = defineProps<{
  spot: any;
  mapId?: string;
}>();

const mapId = props.mapId || 'spot-map';
let mapInstance: any = null;

const initMap = () => {
  if (!props.spot || (!props.spot.gpxUrl && !props.spot.location)) return;

  nextTick(() => {
    const mapElement = document.getElementById(mapId);
    
    if (!mapElement) {
        setTimeout(initMap, 300);
        return;
    }

    if (mapInstance) { 
        mapInstance.remove(); 
        mapInstance = null; 
    }

    const defaultLat = props.spot.location ? props.spot.location.latitude : 4.2105;
    const defaultLng = props.spot.location ? props.spot.location.longitude : 101.9758;

    mapInstance = L.map(mapId, { scrollWheelZoom: false }).setView([defaultLat, defaultLng], 12);

    L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
    }).addTo(mapInstance);

    if (props.spot.location) {
        L.marker([props.spot.location.latitude, props.spot.location.longitude])
         .addTo(mapInstance)
         .bindPopup(`<b>${props.spot.name}</b><br>Lokasi Utama`);
    }

    setTimeout(() => {
        if (mapInstance) mapInstance.invalidateSize();
    }, 1000);

    if (props.spot.gpxUrl) {
        new (L as any).GPX(props.spot.gpxUrl, {
            async: true,
            marker_options: {
                startIconUrl: 'https://raw.githubusercontent.com/mpetazzoni/leaflet-gpx/master/pin-icon-start.png',
                endIconUrl: 'https://raw.githubusercontent.com/mpetazzoni/leaflet-gpx/master/pin-icon-end.png',
                shadowUrl: 'https://raw.githubusercontent.com/mpetazzoni/leaflet-gpx/master/pin-shadow.png'
            },
            polyline_options: { color: '#e67e22', opacity: 0.8, weight: 5, lineCap: 'round' }
        }).on('loaded', function (e: any) {
            if (mapInstance) {
                mapInstance.fitBounds(e.target.getBounds());
                setTimeout(() => { mapInstance.invalidateSize(); }, 200);
            }
        }).addTo(mapInstance);
    }
  });
};

onMounted(() => {
    initMap();
});

onUnmounted(() => {
    if (mapInstance) { 
        mapInstance.remove(); 
        mapInstance = null; 
    }
});

watch(() => props.spot, () => {
    initMap();
}, { deep: true });
</script>
