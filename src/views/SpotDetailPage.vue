<template>
  <div class="spot-detail-page">
    
    <div class="contour-lines"></div>
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <div v-if="loading" class="loading-container">
      <div class="glass-card inline-block px-8 py-6">
          <i class="fas fa-spinner fa-spin text-3xl text-purple-400 mb-3"></i>
          <p class="text-gray-300">⏳ {{ t('common.loading') }}</p>
      </div>
    </div>

    <div v-else-if="!spot" class="error-container">
      <div class="glass-card inline-block px-8 py-6 border-red-500/30 border">
          <i class="fas fa-exclamation-triangle text-3xl text-red-400 mb-3"></i>
          <p class="text-red-300">{{ t('spotDetail.notFound') }}</p>
          <button @click="$router.push('/spots')" class="mt-4 btn-cancel-small">Kembali</button>
      </div>
    </div>

    <div v-else class="container relative z-10" style="padding-top: 150px; padding-bottom: 80px;">
      
      <div class="hero-gallery-wrapper mb-8 fade-up">
        <div class="desktop-gallery hidden md:grid">
          <div class="gallery-item main-item" 
               :style="{ backgroundImage: `url(${displayImages[0]})` }"
               @click="openLightbox(0)">
             <div class="gallery-overlay">
                <span class="badge-cat">📍 {{ spot.state }}</span>
                <h1 class="text-4xl font-bold text-white mb-2 drop-shadow-md">{{ spot.name }}</h1>
                <div class="hero-meta flex gap-4 text-white/90">
                    <span>🏔️ {{ spot.height }}m</span>
                    <span v-if="spot.difficulty">💪 {{ getLevelLabel(spot.difficulty) }}</span>
                </div>
             </div>
          </div>
          <div class="sub-gallery grid grid-cols-2 grid-rows-2 gap-2">
            <div class="gallery-item h-full" 
                 v-for="(img, index) in displayImages.slice(1, 5)" 
                 :key="index"
                 :style="{ backgroundImage: `url(${img})` }"
                 @click="openLightbox(index + 1)">
            </div>
          </div>
          <button class="btn-show-all absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 backdrop-blur text-white px-4 py-2 rounded-lg border border-white/10 transition" @click="openLightbox(0)">
            🖼️ {{ t('spotDetail.viewPhotos') }}
          </button>
        </div>

        <div class="mobile-gallery md:hidden rounded-2xl overflow-hidden relative h-[350px]">
          <swiper
            :modules="[Pagination, Navigation]"
            :slides-per-view="1"
            :pagination="{ clickable: true }"
            class="detail-swiper h-full"
          >
            <swiper-slide v-for="(img, index) in displayImages" :key="index">
              <div class="slide-bg h-full bg-cover bg-center" :style="{ backgroundImage: `url(${img})` }" @click="openLightbox(index)"></div>
            </swiper-slide>
          </swiper>
          <div class="mobile-overlay absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-10">
            <span class="badge-cat bg-orange-500 text-white text-xs px-2 py-1 rounded mb-2 inline-block">📍 {{ spot.state }}</span>
            <h1 class="text-2xl font-bold text-white mb-1">{{ spot.name }}</h1>
            <div class="hero-meta-mobile text-white/80 text-sm">
               <span>🏔️ {{ spot.height }}m</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="spot.gpxUrl || spot.location" class="mb-8 fade-up delay-100">
         <div class="glass-card p-1 overflow-hidden relative group">
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

            <div id="spot-map" class="w-full h-[500px] rounded-xl z-0 bg-gray-900"></div>
         </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-up delay-100">
        
        <div class="lg:col-span-2 space-y-8">

            <div v-if="relatedTrips.length > 0" class="glass-card p-6 md:p-8 border-l-4 border-orange-500">
               <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                 <i class="fas fa-hiking text-orange-400"></i> Trip Akan Datang di Sini
               </h3>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <TripCard v-for="trip in relatedTrips" :key="trip.id" :trip="trip" />
               </div>
               <div class="mt-4 text-center">
                 <small class="text-gray-400 italic">Senarai trip yang masih dibuka untuk pendaftaran.</small>
               </div>
            </div>
            
            <div class="glass-card p-6 md:p-8">
                <div class="flex flex-wrap justify-between items-start mb-6 gap-4">
                    <h3 class="text-xl font-bold text-white">Maklumat Trek</h3>
                    <div class="flex items-center gap-3">
                         <button class="btn-icon-glass" @click="toggleTranslation" :disabled="translating" title="Translate">
                            <i class="fas fa-language"></i> 
                            <span class="text-xs ml-1" v-if="translating">...</span>
                         </button>
                         <button class="btn-icon-glass text-red-400 hover:text-red-300" @click="reportSpot" title="Report">
                            <i class="fas fa-flag"></i>
                         </button>
                         <div class="bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1" v-if="reviews.length > 0">
                            ⭐ {{ averageRating }} <span class="text-xs font-normal opacity-70">({{ reviews.length }})</span>
                         </div>
                    </div>
                </div>

                <div class="text-gray-300 leading-relaxed whitespace-pre-line mb-6 text-lg">
                    {{ showingTranslation ? translatedDesc : spot.description }}
                </div>
                <p v-if="translationError" class="text-red-400 text-xs mb-4">⚠️ {{ t('spotDetail.translationError') }}</p>

                <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    
                    <div class="info-box">
                        <span class="info-label">🏳️ Negeri</span>
                        <span class="info-value">{{ spot.state || '-' }}</span>
                    </div>

                    <div class="info-box">
                        <span class="info-label">🏔️ Ketinggian</span>
                        <span class="info-value">{{ spot.height ? spot.height + ' m' : '-' }}</span>
                    </div>

                    <div class="info-box">
                        <span class="info-label">📏 Jarak</span>
                        <span class="info-value">{{ spot.distance ? spot.distance + ' km' : '-' }}</span>
                    </div>

                    <div class="info-box">
                        <span class="info-label">⏱️ Masa</span>
                        <span class="info-value">{{ spot.duration || '-' }}</span>
                    </div>

                    <div class="info-box">
                        <span class="info-label">🛤️ Via</span>
                        <span class="info-value">{{ spot.via || '-' }}</span>
                    </div>

                    <div class="info-box">
                        <span class="info-label">💪 Tahap</span>
                        <span class="info-value">{{ getLevelLabel(spot.difficulty) }}</span>
                    </div>

                    <div class="info-box">
                        <span class="info-label">📜 Permit</span>
                        <span class="info-value font-bold" :class="(!spot.permit || spot.permit === 'No' || spot.permit === 'Tidak Perlu') ? 'text-green-400' : 'text-orange-400'">
                           {{ (!spot.permit || spot.permit === 'No' || spot.permit === 'Tidak Perlu') ? 'Tidak' : 'Perlu' }}
                        </span>
                    </div>

                    <div class="info-box">
                        <span class="info-label">👮 Guide</span>
                        <span class="info-value font-bold" :class="spot.guideRequired === 'Yes' ? 'text-red-400' : 'text-green-400'">
                            {{ getGuideLabel(spot.guideRequired) }}
                        </span>
                    </div>

                    <div class="info-box" v-if="spot.location">
                        <span class="info-label">📍 Koordinat</span>
                        <span class="info-value text-xs font-mono">
                          {{ spot.location.latitude.toFixed(4) }}, {{ spot.location.longitude.toFixed(4) }}
                        </span>
                    </div>
                </div>

                <div v-if="spot.parking" class="mb-6 p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg flex items-start gap-3">
                    <div class="mt-0.5"><i class="fas fa-parking text-blue-400 text-lg"></i></div>
                    <div>
                        <span class="block text-xs text-blue-300 uppercase font-bold mb-1">Info Parking</span>
                        <span class="text-gray-200 text-sm">{{ spot.parking }}</span>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" v-if="spot.checkpointDetail || spot.tips">
                    
                    <div v-if="spot.checkpointDetail" class="p-4 rounded-xl bg-white/5 border border-white/5">
                        <h4 class="text-orange-400 font-bold mb-2 flex items-center gap-2 text-sm uppercase">
                            <i class="fas fa-map-signs"></i> Info Checkpoint
                        </h4>
                        <p class="text-sm text-gray-300 whitespace-pre-line">{{ spot.checkpointDetail }}</p>
                    </div>

                    <div v-if="spot.tips" class="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                        <h4 class="text-yellow-400 font-bold mb-2 flex items-center gap-2 text-sm uppercase">
                            <i class="fas fa-lightbulb"></i> Tips Pendaki
                        </h4>
                        <p class="text-sm text-gray-300 whitespace-pre-line">{{ spot.tips }}</p>
                    </div>

                </div>

                <div v-if="spot.facilities && spot.facilities.length > 0" class="mb-6">
                    <h4 class="text-sm font-bold text-gray-400 mb-3 uppercase flex items-center gap-2">
                        <i class="fas fa-concierge-bell"></i> Fasiliti Disediakan
                    </h4>
                    <div class="flex flex-wrap gap-2">
                        <span v-for="fac in spot.facilities" :key="fac" class="px-3 py-1.5 bg-green-900/30 text-green-300 text-xs font-bold rounded-lg border border-green-500/20 flex items-center gap-2">
                            <i class="fas fa-check"></i> {{ fac }}
                        </span>
                    </div>
                </div>

                <div class="mt-8 pt-6 border-t border-white/10 flex justify-between items-center flex-wrap gap-4">
                    <div class="flex items-center gap-2">
                        <span class="text-gray-500 text-sm">{{ t('spotDetail.contributedBy') }}</span>
                        <div class="cursor-pointer hover:opacity-80 transition" @click="goToProfile(spot.contributorId)">
                           <AuthorBadge :userId="spot.contributorId" :fallbackName="spot.contributorName" />
                        </div>
                    </div>
                    <button class="text-blue-400 hover:text-blue-300 text-sm underline flex items-center gap-1" @click="showHistory = true">
                        📜 {{ t('spotDetail.viewHistory') }}
                    </button>
                </div>
                <p v-if="spot.lastEditedBy" class="text-xs text-gray-600 mt-2">
                    🔄 {{ t('spotDetail.lastUpdatedBy') }}: <strong class="text-gray-500">{{ spot.lastEditedBy }}</strong>
                </p>
            </div>

            <div class="glass-card p-6 md:p-8">
                <h3 class="text-xl font-bold text-white mb-6">💬 {{ t('spotDetail.reviewsTitle') }}</h3>
                
                <div v-if="auth.currentUser" class="mb-8 p-4 bg-black/20 rounded-xl border border-white/5">
                    <div class="flex gap-2 mb-3">
                        <i v-for="n in 5" :key="n" @click="newRating = n" 
                           class="fas fa-star text-2xl cursor-pointer transition hover:scale-110" 
                           :class="n <= newRating ? 'text-yellow-400' : 'text-gray-600'"></i>
                    </div>
                    <textarea v-model="newReviewText" rows="3" class="glass-input w-full mb-3" :placeholder="t('spotDetail.shareExperiencePlaceholder')"></textarea>
                    <button @click="submitReview" :disabled="!newReviewText || newRating === 0" class="btn-primary w-full md:w-auto text-sm">
                        {{ t('spotDetail.submitReview') }}
                    </button>
                </div>
                <div v-else class="mb-8 p-4 bg-black/20 rounded-xl text-center text-gray-400 text-sm">
                    🔒 {{ t('spotDetail.loginToReview') }}
                </div>

                <div class="space-y-6">
                    <div v-for="review in sortedReviews" :key="review.id" class="border-b border-white/10 pb-6 last:border-0">
                        <div class="flex justify-between items-start mb-2 cursor-pointer" @click="goToProfile(review.userId)">
                             <AuthorBadge :userId="review.userId" :fallbackName="review.userName" :fallbackAvatar="review.userAvatar">
                                  <template #subtext><span class="text-xs text-gray-500 ml-2">{{ formatDate(review.createdAt) }}</span></template>
                             </AuthorBadge>
                             <div class="flex text-yellow-400 text-xs">
                                <i v-for="n in 5" :key="n" class="fas fa-star" :class="n <= review.rating ? '' : 'text-gray-700'"></i>
                             </div>
                        </div>
                        <p class="text-gray-300 text-sm mb-3 pl-1">{{ review.text }}</p>
                        <div class="flex items-center gap-4 text-xs">
                             <div class="flex items-center bg-white/5 rounded-full px-2 py-1 border border-white/5">
                                <button class="hover:text-orange-400 px-1 transition" @click="voteReview(review, 1)">▲</button>
                                <span class="mx-2 font-bold" :class="(review.votes||0)>0 ? 'text-orange-400' : 'text-gray-500'">{{ review.votes || 0 }}</span>
                                <button class="hover:text-blue-400 px-1 transition" @click="voteReview(review, -1)">▼</button>
                             </div>
                             <button v-if="(auth.currentUser && auth.currentUser.uid === review.userId) || isAdmin" @click="deleteReview(review.id)" class="text-red-500 hover:text-red-400 ml-auto flex items-center gap-1">
                                🗑️ {{ t('common.delete') }}
                             </button>
                        </div>
                    </div>
                    <p v-if="reviews.length === 0" class="text-center text-gray-500 italic py-4">{{ t('spotDetail.noReviews') }}</p>
                </div>
            </div>

        </div>

        <div class="space-y-6">
            
            <div class="glass-card p-4">
                 <button 
                    class="w-full py-3 rounded-lg font-bold transition text-sm flex items-center justify-center gap-2 mb-2 shadow-lg"
                    :class="suggestions.length > 0 ? 'bg-gray-700 text-gray-400 cursor-not-allowed border border-white/5' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90'"
                    :disabled="suggestions.length > 0"
                    @click="showSuggestionModal = true"
                 >
                    <span v-if="suggestions.length > 0"><i class="fas fa-lock mr-2"></i> Edit Dibekukan</span>
                    <span v-else>✏️ Cadang Perubahan Info</span>
                 </button>
                 
                 <div v-if="suggestions.length > 0" class="text-[11px] text-orange-300 text-center mb-3 bg-orange-500/10 p-2 rounded border border-orange-500/20">
                    <i class="fas fa-info-circle mr-1"></i> Sedang dalam proses undian. Sila tunggu keputusan sebelum menghantar cadangan baru.
                 </div>
                 
                 <div v-if="isAdmin || isOwner">
                     <button 
                        class="w-full py-2 rounded-lg text-sm flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 transition"
                        @click="$router.push('/spots/edit/' + route.params.id)"
                     >
                        ⚙️ Edit Penuh (Admin/Owner)
                     </button>
                 </div>
            </div>

            <div v-if="suggestions.length > 0" class="glass-card p-5 border-l-4 border-l-yellow-500 relative overflow-hidden">
                <div class="absolute top-0 right-0 p-2 opacity-10"><i class="fas fa-hard-hat text-6xl text-yellow-500"></i></div>
                <h4 class="font-bold text-yellow-500 mb-4 flex items-center gap-2">🚧 Semakan Komuniti</h4>
                
                <div v-for="sugg in suggestions" :key="sugg.id" class="bg-black/30 rounded-lg p-3 mb-3 border border-white/5">
                    <p class="text-xs text-gray-400 mb-2">{{ t('spotDetail.suggestedBy') }}: <strong class="text-gray-300">{{ sugg.suggestedBy || 'Pengguna' }}</strong></p>
                    <p class="text-xs text-blue-300 mb-2">Ubah: {{ translateField(sugg.field) }}</p>
                    
                    <div class="h-2 bg-gray-700 rounded-full overflow-hidden flex mb-2 relative">
                        <div class="bg-green-500 h-full transition-all duration-500" :style="{ width: Math.min((sugg.votes / 5) * 100, 100) + '%' }"></div>
                        <div class="bg-red-500 h-full transition-all duration-500" :style="{ width: Math.min(((sugg.rejectVotes || 0) / 5) * 100, 100) + '%' }"></div>
                        <div class="absolute top-0 right-0 h-full w-px bg-white/30" title="Target 5 Undi"></div>
                    </div>
                    <div class="flex justify-between items-center text-[10px] text-gray-400 mb-3">
                        <span class="text-green-400">Setuju: {{ sugg.votes || 0 }}/5</span>
                        <span class="text-red-400">Tolak: {{ sugg.rejectVotes || 0 }}/5</span>
                    </div>
                    
                    <button @click="openCheckModal(sugg)" class="w-full py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs text-white transition border border-white/10">
                        🔍 Semak & Undi
                    </button>

                    <div v-if="isAdmin" class="flex gap-2 mt-2 pt-2 border-t border-white/5">
                        <button class="flex-1 py-1 bg-green-900/50 hover:bg-green-800 text-[10px] text-green-300 border border-green-500/30 rounded" @click="finalizeUpdate(sugg, true)">⚡ Force Accept</button>
                        <button class="flex-1 py-1 bg-red-900/50 hover:bg-red-800 text-[10px] text-red-300 border border-red-500/30 rounded" @click="adminReject(sugg)">✖ Force Reject</button>
                    </div>
                </div>
            </div>

            <div class="glass-card p-5">
                <h3 class="font-bold text-white mb-2">{{ t('spotDetail.navigation') }}</h3>
                <a :href="spot.mapsLink" target="_blank" class="flex items-center justify-center gap-2 w-full py-2 bg-blue-700/80 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition mb-2">
                    🚗 📍 Trailhead (Google Maps)
                </a>
                
                <a v-if="spot.location" 
                   :href="`https://www.google.com/maps/search/?api=1&query=${spot.location.latitude},${spot.location.longitude}`" 
                   target="_blank" 
                   class="flex items-center justify-center gap-2 w-full py-2 bg-green-700/80 hover:bg-green-600 text-white rounded-lg text-sm font-bold transition">
                    📍 Koordinat (Map)
                </a>
            </div>

        </div>
      </div>
    </div>

    <VueEasyLightbox :visible="visibleRef" :imgs="displayImages" :index="indexRef" @hide="onHide" />

    <div v-if="showSuggestionModal" class="modal-overlay">
       <div class="glass-modal w-full max-w-lg">
         <h3 class="text-xl font-bold text-white mb-4">✏️ Cadang Perubahan</h3>
         <p class="text-sm text-gray-400 mb-4">Perubahan ini akan dihantar kepada komuniti untuk undian (5 undi diperlukan).</p>
         
         <label class="block text-gray-300 text-sm mb-2 font-bold">Bahagian:</label>
         <select v-model="suggForm.field" class="glass-input mb-4 text-white bg-black/50">
             <option value="description">Deskripsi</option>
             <option value="difficulty">Kesukaran</option>
             <option value="duration">Masa / Durasi</option>
             <option value="distance">Jarak</option>
             <option value="permit">Permit</option>
             <option value="via">Laluan / Via</option>
         </select>

         <label class="block text-gray-300 text-sm mb-2 font-bold">Maklumat Baru:</label>
         <textarea v-model="suggForm.newValue" rows="4" class="glass-input mb-6" placeholder="Tulis maklumat yang betul di sini..."></textarea>

         <div class="flex gap-3">
             <button class="btn-cancel-small flex-1" @click="showSuggestionModal = false">Batal</button>
             <button class="btn-primary flex-1" @click="submitSuggestion">Hantar</button>
         </div>
       </div>
    </div>

    <div v-if="showDiffModal && selectedSugg" class="modal-overlay">
       <div class="glass-modal w-full max-w-2xl">
         <div class="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
             <div>
                 <h3 class="text-xl font-bold text-white">🔍 Semakan Komuniti</h3>
                 <p class="text-sm text-gray-400 mt-1">Perubahan dicadangkan oleh <strong class="text-purple-400">{{ selectedSugg.suggestedBy }}</strong></p>
             </div>
             <button class="text-gray-400 hover:text-white" @click="showDiffModal = false">✖</button>
         </div>
         
         <div class="overflow-x-auto mb-6 rounded-lg border border-white/10">
            <table class="w-full text-sm text-left">
               <thead class="bg-black/30 text-gray-400">
                  <tr>
                    <th class="p-3 w-1/4">Info</th>
                    <th class="p-3 w-1/3">Asal</th>
                    <th class="p-3 w-1/3">Cadangan Baru</th>
                  </tr>
               </thead>
               <tbody class="text-gray-300">
                  <tr>
                     <td class="p-3 font-semibold border-b border-white/5">{{ translateField(selectedSugg.field) }}</td>
                     <td class="p-3 text-red-300 line-through opacity-70 bg-red-900/20 border-b border-white/5">
                        {{ selectedSugg.oldValue || '-' }}
                     </td>
                     <td class="p-3 bg-green-900/20 text-green-300 font-bold border-b border-white/5">
                        {{ selectedSugg.newValue || '-' }}
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>

         <div class="flex justify-between items-center gap-4 pt-2">
            <div class="text-xs text-gray-500">
                Status Undian: <span class="text-green-400">{{ selectedSugg.votes }}/5 Setuju</span> • <span class="text-red-400">{{ selectedSugg.rejectVotes }}/5 Tolak</span>
            </div>
            <div class="flex gap-3">
               <button class="px-5 py-2 bg-red-900/40 hover:bg-red-800 text-red-300 border border-red-500/30 rounded-lg font-bold transition flex items-center gap-2" @click="confirmVote(selectedSugg, 'reject')">
                 ❌ Tolak
               </button>
               <button class="px-5 py-2 bg-green-900/40 hover:bg-green-800 text-green-300 border border-green-500/30 rounded-lg font-bold transition flex items-center gap-2" @click="confirmVote(selectedSugg, 'approve')">
                 ✅ Setuju
               </button>
            </div>
         </div>
       </div>
    </div>

    <div v-if="showHistory" class="modal-overlay" @click.self="showHistory = false">
       <div class="glass-modal w-full max-w-lg">
         <div class="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
            <h3 class="text-xl font-bold text-white">📜 Sejarah Kemaskini</h3>
            <button class="text-gray-400 hover:text-white text-xl" @click="showHistory = false">✖</button>
         </div>
         
         <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <div v-for="log in historyLogs" :key="log.id" class="pl-3 border-l-2 border-purple-500 py-1">
               <div class="flex justify-between items-center text-sm">
                   <strong class="text-purple-300">{{ log.editorName }}</strong>
                   <span class="text-xs text-gray-500">{{ formatDate(log.timestamp) }}</span>
               </div>
               <p class="text-xs text-gray-400 mt-1">
                   Mengemaskini <strong>{{ translateField(log.field || 'info') }}</strong>.
                   <span v-if="log.type === 'update'" class="text-green-500 ml-1">(Diluluskan)</span>
               </p>
            </div>
            <p v-if="historyLogs.length === 0" class="text-center text-gray-500 italic py-4">{{ t('spotDetail.noHistory') }}</p>
         </div>
       </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'; 
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, updateDoc, increment, arrayUnion, where, getDocs } from 'firebase/firestore'; 
import AuthorBadge from '../components/common/AuthorBadge.vue'; 
import TripCard from '../components/trip/TripCard.vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-gpx';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { isSpam } from '../utils/spamFilter';
import { checkRateLimit } from '../utils/rateLimiter';

// @ts-ignore
import VueEasyLightbox from 'vue-easy-lightbox';
// @ts-ignore
import { Swiper, SwiperSlide } from 'swiper/vue';
// @ts-ignore
import { Pagination, Navigation } from 'swiper/modules';
// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/pagination';
// @ts-ignore
import 'swiper/css/navigation';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const { t, locale } = useI18n(); 
const route = useRoute();
const router = useRouter(); 
const spotId = route.params.id as string;

const spot = ref<any>(null);
const loading = ref(true);
const isAdmin = ref(false);
const isOwner = ref(false); 
let mapInstance: any = null;
const reviews = ref<any[]>([]);
const newReviewText = ref('');
const newRating = ref(0);
const suggestions = ref<any[]>([]);
const historyLogs = ref<any[]>([]);
const showDiffModal = ref(false);
const showSuggestionModal = ref(false);
const showHistory = ref(false);
const selectedSugg = ref<any>(null);
const visibleRef = ref(false);
const indexRef = ref(0);
const translatedDesc = ref('');
const showingTranslation = ref(false);
const translating = ref(false);
const translationError = ref('');
const gpxData = reactive({ distance: '0.00', elevationGain: '0', elevationLoss: '0', maxElevation: '0', minElevation: '0', movingTime: '-' });
const ADMIN_EMAILS = ["knotenup@gmail.com", "admin@knotenup.com"];

const relatedTrips = ref<any[]>([]); 

const suggForm = reactive({ field: 'description', newValue: '' });

const allImages = computed(() => {
  if (!spot.value) return [];
  let imgs = spot.value.images && Array.isArray(spot.value.images) ? [...spot.value.images] : [];
  if (imgs.length === 0 && spot.value.image) imgs.push(spot.value.image);
  return [...new Set(imgs)].filter(url => url && url.length > 5);
});

const displayImages = computed(() => {
  const imgs = [...allImages.value];
  if (imgs.length === 0) return new Array(5).fill('https://via.placeholder.com/800x600?text=No+Image');
  while (imgs.length < 5) imgs.push(imgs[0]); 
  return imgs;
});

const openLightbox = (index: number) => { indexRef.value = index; visibleRef.value = true; };
const onHide = () => { visibleRef.value = false; };

const translateField = (field: string) => {
    const map: any = { 
        description: 'Deskripsi', 
        difficulty: 'Kesukaran', 
        duration: 'Masa', 
        distance: 'Jarak', 
        permit: 'Permit', 
        via: 'Laluan / Via'
    };
    return map[field] || field;
};

const toggleTranslation = async () => {
  if (showingTranslation.value) { showingTranslation.value = false; return; }
  if (translatedDesc.value) { showingTranslation.value = true; return; }
  if (!spot.value.description) return;
  translating.value = true; translationError.value = '';
  try {
      const targetLang = locale.value === 'ms' ? 'ms' : 'en'; 
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(spot.value.description)}&langpair=Autodetect|${targetLang}`);
      const data = await response.json();
      if (data.responseData && data.responseData.translatedText) {
        translatedDesc.value = data.responseData.translatedText;
        showingTranslation.value = true;
      } else { throw new Error("Translation failed"); }
  } catch (e) { console.error(e); translationError.value = t('spotDetail.translationError'); } 
  finally { translating.value = false; }
};

const getLevelLabel = (level: string) => { if (!level) return ''; const key = level.toLowerCase(); return t(`components.${key}`) !== `components.${key}` ? t(`components.${key}`) : level; };

const getGuideLabel = (val: string) => { 
    const labels: any = {
       'Yes': t('createSpot.guideYes') !== 'createSpot.guideYes' ? t('createSpot.guideYes') : 'Wajib',
       'Optional': t('createSpot.guideOptional') !== 'createSpot.guideOptional' ? t('createSpot.guideOptional') : 'Pilihan',
       'No': t('createSpot.guideNo') !== 'createSpot.guideNo' ? t('createSpot.guideNo') : 'Tidak Perlu'
    };
    return labels[val] || val || 'Tidak Perlu';
};

const formatDate = (timestamp: any) => { if (!timestamp) return ''; return new Date(timestamp.seconds * 1000).toLocaleDateString("en-MY", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' }); };
const averageRating = computed(() => { if (reviews.value.length === 0) return 0; const total = reviews.value.reduce((acc, curr) => acc + (curr.rating || 0), 0); return (total / reviews.value.length).toFixed(1); });
const sortedReviews = computed(() => { return [...reviews.value].sort((a, b) => (b.votes || 0) - (a.votes || 0)); });
const goToProfile = (userId: string) => { if (userId) router.push(`/user/${userId}`); };

const openCheckModal = (sugg: any) => { selectedSugg.value = sugg; showDiffModal.value = true; };

const submitSuggestion = async () => {
    if (!auth.currentUser) return alert(t('common.pleaseLogin'));
    if (!suggForm.newValue) return alert("Sila isi maklumat baru.");

    const limitCheck = checkRateLimit('submit_suggestion');
    if (!limitCheck.allowed) return alert(limitCheck.message);

    try {
        await addDoc(collection(db, "spots", spotId, "suggestions"), {
            field: suggForm.field,
            oldValue: spot.value[suggForm.field] || '(Tiada Maklumat)',
            newValue: suggForm.newValue,
            suggestedBy: auth.currentUser.displayName || 'Pengguna Komuniti',
            suggestedById: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            votes: 0,
            rejectVotes: 0,
            votedUsers: [],
            verifiedUsers: []
        });
        showSuggestionModal.value = false;
        suggForm.newValue = '';
        alert("Cadangan dihantar! Menunggu undian komuniti.");
    } catch (e) { console.error(e); alert("Gagal hantar cadangan."); }
};

const finalizeUpdate = async (sugg: any, forceAdmin = false) => {
   const editorName = forceAdmin ? ((sugg.suggestedBy || 'Admin') + " (Admin Force)") : (sugg.suggestedBy || 'Komuniti');
   
   await updateDoc(doc(db, "spots", spotId), { 
       [sugg.field]: sugg.newValue,
       lastEditedBy: editorName, 
       lastEditedAt: serverTimestamp() 
   });
   
   await addDoc(collection(db, "spots", spotId, "history"), { 
       editorName: editorName, 
       editorId: sugg.suggestedById || 'system', 
       timestamp: serverTimestamp(), 
       type: 'update',
       field: sugg.field
   });
   
   await deleteDoc(doc(db, "spots", spotId, "suggestions", sugg.id));
   alert(forceAdmin ? "Kemaskini dipaksa oleh Admin." : "Tahniah! Cadangan diluluskan komuniti."); 
   showDiffModal.value = false;
};

const rejectSuggestion = async (suggId: string) => { 
    await deleteDoc(doc(db, "spots", spotId, "suggestions", suggId)); 
    alert("Cadangan ditolak oleh komuniti."); 
    showDiffModal.value = false; 
};

const confirmVote = async (sugg: any, voteType: 'approve' | 'reject') => {
  if (!auth.currentUser) return alert(t('common.pleaseLogin'));
  
  const hasVoted = (sugg.votedUsers && sugg.votedUsers.includes(auth.currentUser.uid));
  if (hasVoted) return alert("Anda sudah mengundi cadangan ini.");
  
  const suggRef = doc(db, "spots", spotId, "suggestions", sugg.id);
  const VOTE_THRESHOLD = 5;

  if (voteType === 'approve') {
      const newVotes = (sugg.votes || 0) + 1;
      
      if (newVotes >= VOTE_THRESHOLD) { 
          await finalizeUpdate(sugg, false); 
      } else { 
          await updateDoc(suggRef, { votes: increment(1), votedUsers: arrayUnion(auth.currentUser.uid) }); 
          alert("Undian 'Setuju' diterima."); 
          showDiffModal.value = false; 
      }
  } else {
      const newRejectVotes = (sugg.rejectVotes || 0) + 1;
      
      if (newRejectVotes >= VOTE_THRESHOLD) { 
          await rejectSuggestion(sugg.id); 
      } else { 
          await updateDoc(suggRef, { rejectVotes: increment(1), votedUsers: arrayUnion(auth.currentUser.uid) }); 
          alert("Undian 'Tolak' diterima."); 
          showDiffModal.value = false; 
      }
  }
};

const adminReject = async (sugg: any) => { 
    if(!confirm("Tolak cadangan ini secara paksa?")) return; 
    await deleteDoc(doc(db, "spots", spotId, "suggestions", sugg.id)); 
    alert("Cadangan ditolak oleh Admin."); 
};

const reportSpot = async () => { if (!auth.currentUser) return alert(t('common.loginToReport')); const reason = prompt(t('spotDetail.reportReasonPrompt')); if (reason) { await addDoc(collection(db, "reports"), { targetId: spotId, targetType: 'spot', reason: reason, reportedBy: auth.currentUser.uid, createdAt: serverTimestamp() }); alert(t('spotDetail.reportSuccess')); } };

const submitReview = async () => { 
    if (!auth.currentUser) return alert(t('common.pleaseLogin')); 
    if (newRating.value === 0) return alert(t('spotDetail.pleaseRate')); 
    const limitCheck = checkRateLimit('submit_review');
    if (!limitCheck.allowed) return alert(limitCheck.message);
    if (isSpam(newReviewText.value)) return alert("Maaf, ulasan mengandungi perkataan dilarang.");

    try { 
        await addDoc(collection(db, "spots", spotId, "reviews"), { 
            text: newReviewText.value, rating: newRating.value, userId: auth.currentUser.uid, userName: auth.currentUser.displayName || 'User', 
            userAvatar: auth.currentUser.photoURL || '', createdAt: serverTimestamp(), votes: 0, votedUsers: [] 
        }); 
        newReviewText.value = ''; newRating.value = 0; 
    } catch (e) { console.error(e); } 
};

const voteReview = async (review: any, val: number) => { 
    if (!auth.currentUser) return alert(t('common.pleaseLogin')); 
    const uid = auth.currentUser.uid;
    if (review.votedUsers && review.votedUsers.includes(uid)) return alert("Sudah undi.");
    try { await updateDoc(doc(db, "spots", spotId, "reviews", review.id), { votes: increment(val), votedUsers: arrayUnion(uid) }); } catch (e) { console.error(e); }
};

const deleteReview = async (reviewId: string) => { if (!confirm(t('common.confirmDelete'))) return; try { await deleteDoc(doc(db, "spots", spotId, "reviews", reviewId)); } catch (e) { alert(t('common.failed')); } };

const initMap = () => {
  if (!spot.value || (!spot.value.gpxUrl && !spot.value.location)) return;

  nextTick(() => {
    const mapElement = document.getElementById('spot-map');
    
    if (!mapElement) {
        setTimeout(initMap, 300);
        return;
    }

    if (mapInstance) { 
        mapInstance.remove(); 
        mapInstance = null; 
    }

    const defaultLat = spot.value.location ? spot.value.location.latitude : 4.2105;
    const defaultLng = spot.value.location ? spot.value.location.longitude : 101.9758;

    mapInstance = L.map('spot-map', { scrollWheelZoom: false }).setView([defaultLat, defaultLng], 12);

    L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
    }).addTo(mapInstance);

    if (spot.value.location) {
        L.marker([spot.value.location.latitude, spot.value.location.longitude])
         .addTo(mapInstance)
         .bindPopup(`<b>${spot.value.name}</b><br>Lokasi Utama`);
    }

    setTimeout(() => {
        if (mapInstance) mapInstance.invalidateSize();
    }, 1000);

    if (spot.value.gpxUrl) {
        new (L as any).GPX(spot.value.gpxUrl, {
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
                
                const gpx = e.target;
                gpxData.distance = (gpx.get_distance() / 1000).toFixed(2);
            }
        }).addTo(mapInstance);
    }
  });
};

onMounted(async () => {
  try {
    const docSnap = await getDoc(doc(db, "spots", spotId));
    if (docSnap.exists()) { 
        spot.value = docSnap.data(); 
        if (auth.currentUser && spot.value.contributorId === auth.currentUser.uid) {
            isOwner.value = true;
        }
        
        if (spot.value.gpxUrl || spot.value.location) {
             setTimeout(() => initMap(), 100); 
        }

        const tripQ = query(
            collection(db, "trips"), 
            where("spotId", "==", spotId), 
            where("status", "==", "open") 
        );
        const tripSnap = await getDocs(tripQ);
        relatedTrips.value = tripSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    }
    if (auth.currentUser && ADMIN_EMAILS.includes(auth.currentUser.email!)) isAdmin.value = true;
    
    onSnapshot(query(collection(db, "spots", spotId, "reviews"), orderBy("createdAt", "desc")), (snap) => { reviews.value = snap.docs.map(d => ({ id: d.id, ...d.data() })); });
    onSnapshot(query(collection(db, "spots", spotId, "suggestions")), (snap) => { suggestions.value = snap.docs.map(d => ({ id: d.id, ...d.data() })); });
    onSnapshot(query(collection(db, "spots", spotId, "history"), orderBy("timestamp", "desc")), (snap) => { historyLogs.value = snap.docs.map(d => ({ id: d.id, ...d.data() })); });
  } catch (e) { console.error(e); } finally { loading.value = false; }
});
onUnmounted(() => { if (mapInstance) { mapInstance.remove(); mapInstance = null; } });
</script>

<style scoped>
/* --- BASE THEME (DARK) --- */
.spot-detail-page { 
  background-color: #0f172a; 
  min-height: 100vh; position: relative; overflow-x: hidden; color: white;
}
.container { max-width: 1200px; margin: 0 auto; padding-left: 1.5rem; padding-right: 1.5rem; }

/* GLOWS */
.page-glow-purple {
  position: absolute; top: 0; left: 0; width: 60vw; height: 60vw;
  background: #6c63ff; filter: blur(150px); opacity: 0.15; pointer-events: none; border-radius: 50%;
}
.page-glow-orange {
  position: absolute; bottom: 0; right: 0; width: 60vw; height: 60vw;
  background: #ff8c42; filter: blur(150px); opacity: 0.1; pointer-events: none; border-radius: 50%;
}
.contour-lines {
  position: absolute; inset: 0; z-index: 0; opacity: 0.08;
  background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400' stroke='white' fill='none' stroke-width='2' opacity='0.5'/%3E%3C/svg%3E");
  background-size: cover; pointer-events: none;
}

/* --- GLASS COMPONENTS (DARKER & REDUCED BLUR) --- */
.glass-card {
  background: rgba(15, 23, 42, 0.75); 
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px; 
  backdrop-filter: blur(10px); 
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}

.glass-input {
  width: 100%; padding: 12px; border-radius: 10px; 
  border: 1px solid rgba(255,255,255,0.1); background: rgba(0, 0, 0, 0.4); 
  color: white; outline: none; transition: 0.3s;
}
.glass-input:focus { border-color: #6c63ff; background: rgba(0, 0, 0, 0.6); }

/* INFO BOX (NEW) */
.info-box {
    padding: 12px; background: rgba(0,0,0,0.3); border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);
}
.info-label {
    display: block; font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
}
.info-value {
    font-size: 1rem; color: white; font-weight: 600;
}

/* --- HERO GALLERY --- */
.hero-gallery-wrapper { position: relative; }
.desktop-gallery { display: grid; grid-template-columns: 2fr 1fr; gap: 8px; height: 450px; border-radius: 24px; overflow: hidden; }
.gallery-item { background-size: cover; background-position: center; cursor: pointer; position: relative; transition: filter 0.3s; }
.gallery-item:hover { filter: brightness(1.1); }
.main-item { position: relative; }
.gallery-overlay {
    position: absolute; bottom: 0; left: 0; width: 100%; padding: 2rem;
    background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
    pointer-events: none;
}
.badge-cat {
    background: #e67e22; padding: 4px 10px; border-radius: 6px; 
    font-size: 0.75rem; font-weight: bold; text-transform: uppercase; 
    color: white; display: inline-block; margin-bottom: 8px;
    box-shadow: 0 4px 10px rgba(230, 126, 34, 0.4);
}

/* --- BUTTONS --- */
.btn-icon-glass {
    width: 36px; height: 36px; border-radius: 50%;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    color: white; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: 0.2s;
}
.btn-icon-glass:hover { background: rgba(255,255,255,0.15); transform: scale(1.05); }

.btn-primary { 
  background: linear-gradient(135deg, #6c63ff, #5b54e0); 
  color: white; padding: 10px 24px; border: none; border-radius: 8px; 
  font-weight: 600; cursor: pointer; transition: 0.3s;
  box-shadow: 0 4px 15px rgba(108, 99, 255, 0.3);
}
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(108, 99, 255, 0.5); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-cancel-small { background: rgba(255,255,255,0.05); color: #cbd5e1; padding: 8px 16px; border-radius: 8px; font-size: 0.9rem; cursor: pointer; transition: 0.2s; border: 1px solid rgba(255,255,255,0.1); }
.btn-cancel-small:hover { background: rgba(255,255,255,0.15); color: white; }

/* --- MODAL (Adjusted for less blur & darkness) --- */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); padding: 1rem; } 
.glass-modal { 
    background: rgba(15, 23, 42, 0.95); 
    padding: 2rem; border-radius: 20px; 
    border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    max-height: 90vh; overflow-y: auto;
}

/* ANIMATION */
.fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
.delay-100 { animation-delay: 0.1s; animation-fill-mode: backwards; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

/* LOADING/ERROR */
.loading-container, .error-container { min-height: 80vh; display: flex; align-items: center; justify-content: center; }

/* SWIPER OVERRIDES */
:deep(.swiper-pagination-bullet) { background: white; opacity: 0.5; }
:deep(.swiper-pagination-bullet-active) { opacity: 1; background: #6c63ff; }
</style>