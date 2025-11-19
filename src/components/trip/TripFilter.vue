<template>
  <div class="filter-container">
    <div class="filter-item search-input">
      <span class="icon">🔍</span>
      <input type="text" :placeholder="t('trip.filterDest')" />
    </div>

    <div class="filter-item">
      <span class="label">{{ t('trip.filterDate') }}</span>
      <select>
        <option>{{ t('components.anyDate') }}</option>
        <option>{{ t('components.thisWeek') }}</option>
        <option>{{ t('components.nextMonth') }}</option>
      </select>
    </div>

    <div class="filter-item">
      <span class="label">{{ t('trip.filterLevel') }}</span>
      <select>
        <option>{{ t('components.allLevels') }}</option>
        <option>{{ t('components.easy') }}</option>
        <option>{{ t('components.moderate') }}</option>
        <option>{{ t('components.hard') }}</option>
      </select>
    </div>

    <div class="filter-item">
      <span class="label">{{ t('createTrip.category') }}</span>
      <select>
        <option value="">All</option>
        <optgroup v-for="group in ACTIVITY_CATEGORIES" :key="group.group" :label="group.group">
          <option v-for="item in group.items" :key="item">{{ item }}</option>
        </optgroup>
      </select>
    </div>

    <button class="btn-reset">{{ t('components.reset') }}</button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ACTIVITY_CATEGORIES } from '../../constants/data';

const { t } = useI18n();
</script>

<style scoped>
/* ... CSS KEKAL SAMA ... */
.filter-container { display: flex; align-items: center; gap: 1rem; padding: 1rem 2rem; background: white; border-bottom: 1px solid #e0e0e0; overflow-x: auto; white-space: nowrap; }
.filter-item { display: flex; flex-direction: column; min-width: 120px; }
.search-input { flex-direction: row; align-items: center; background: #f5f5f5; padding: 0.5rem 1rem; border-radius: 50px; min-width: 200px; }
.search-input input { border: none; background: transparent; outline: none; margin-left: 0.5rem; width: 100%; }
.label { font-size: 0.7rem; color: #888; font-weight: bold; margin-bottom: 2px; }
select { border: 1px solid #ddd; padding: 0.4rem; border-radius: 6px; font-size: 0.9rem; color: #333; cursor: pointer; }
.btn-reset { margin-left: auto; border: none; background: none; color: #e67e22; font-weight: bold; cursor: pointer; text-decoration: underline; }
</style>