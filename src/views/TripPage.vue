<template>
  <div class="trip-page">
    <div class="trip-header">
      <h1>Terokai Trip Rekreasi</h1>
      <p>Cari pengalaman outdoor terbaik dari penganjur yang disahkan.</p>
    </div>

    <div class="sticky-filter">
      <TripFilter />
    </div>

    <div class="content-container">
      <div class="results-meta">
        <span>Menunjukkan <strong>{{ trips.length }}</strong> trip aktif</span>
        <div class="view-toggle">
          </div>
      </div>

      <div class="trip-grid">
        <TripCard 
          v-for="trip in trips" 
          :key="trip.id" 
          :trip="trip" 
        />
      </div>
      
      <div class="load-more">
        <button>Lihat Banyak Lagi</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TripFilter from '../components/trip/TripFilter.vue';
import TripCard from '../components/trip/TripCard.vue';

// Data Dummy untuk Trip
const trips = [
  {
    id: 1,
    title: 'Hiking Santai Bukit Tabur',
    category: 'Hiking',
    difficulty: 'Sederhana',
    date: '24 Dis 2025',
    duration: '4 Jam',
    rating: 4.8,
    price: 50,
    organizerName: 'Kembara Malaya',
    organizerImage: 'https://i.pravatar.cc/150?u=1',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400',
    currentSlots: 15,
    maxSlots: 20,
    status: 'open'
  },
  {
    id: 2,
    title: 'Camping & Stargazing',
    category: 'Camping',
    difficulty: 'Santai',
    date: '31 Dis 2025',
    duration: '2H 1M',
    rating: 5.0,
    price: 150,
    organizerName: 'Outdoor Pro',
    organizerImage: 'https://i.pravatar.cc/150?u=2',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400',
    currentSlots: 29,
    maxSlots: 30,
    status: 'open'
  },
  {
    id: 3,
    title: 'Scuba Open Water Course',
    category: 'Diving',
    difficulty: 'Sederhana',
    date: '10 Jan 2026',
    duration: '4H 3M',
    rating: 4.9,
    price: 1200,
    organizerName: 'Blue Ocean',
    organizerImage: 'https://i.pravatar.cc/150?u=3',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    currentSlots: 5,
    maxSlots: 5,
    status: 'full'
  },
  {
    id: 4,
    title: 'Trans Titiwangsa V1',
    category: 'Hiking',
    difficulty: 'Hardcore',
    date: '15 Feb 2026',
    duration: '7H 6M',
    rating: 4.7,
    price: 450,
    organizerName: 'Extreme Hikers',
    organizerImage: 'https://i.pravatar.cc/150?u=4',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400',
    currentSlots: 8,
    maxSlots: 15,
    status: 'open'
  }
];
</script>

<style scoped>
.trip-header {
  background-color: #2c3e50;
  color: white;
  padding: 3rem 2rem;
  text-align: center;
}

.sticky-filter {
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.results-meta {
  margin-bottom: 1.5rem;
  color: #666;
  font-size: 0.9rem;
}

.trip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.load-more {
  text-align: center;
  margin-top: 3rem;
}

.load-more button {
  padding: 0.8rem 2rem;
  border: 1px solid #2c3e50;
  background: transparent;
  cursor: pointer;
  border-radius: 50px;
  font-weight: bold;
  transition: all 0.3s;
}

.load-more button:hover {
  background: #2c3e50;
  color: white;
}
</style>