<template>
  <div class="flex items-center gap-4 py-4 px-8 bg-white border-b border-gray-200 overflow-x-auto whitespace-nowrap scrollbar-hide">
    <div class="flex flex-col min-w-[120px] items-start">
      <div class="flex flex-row items-center bg-gray-100 py-2 px-4 rounded-full min-w-[200px]">
        <span class="text-lg mr-2">🔍</span>
        <input type="text" :placeholder="t('trip.filterDest')" class="border-none bg-transparent outline-none flex-1 w-full" />
      </div>
    </div>

    <div class="flex flex-col min-w-[120px]">
      <span class="text-[0.7rem] text-gray-500 font-bold mb-[2px]">{{ t('trip.filterDate') }}</span>
      <select class="border border-gray-200 p-1.5 rounded-md text-sm text-gray-800 cursor-pointer focus:border-purple-500 focus:outline-none">
        <option>{{ t('components.anyDate') }}</option>
        <option>{{ t('components.thisWeek') }}</option>
        <option>{{ t('components.nextMonth') }}</option>
      </select>
    </div>

    <div class="flex flex-col min-w-[120px]">
      <span class="text-[0.7rem] text-gray-500 font-bold mb-[2px]">{{ t('trip.filterLevel') }}</span>
      <select class="border border-gray-200 p-1.5 rounded-md text-sm text-gray-800 cursor-pointer focus:border-purple-500 focus:outline-none">
        <option>{{ t('components.allLevels') }}</option>
        <option>{{ t('levels.easy') }}</option>
        <option>{{ t('levels.moderate') }}</option>
        <option>{{ t('levels.hard') }}</option>
      </select>
    </div>

    <div class="flex flex-col min-w-[120px]">
      <span class="text-[0.7rem] text-gray-500 font-bold mb-[2px]">{{ t('createTrip.category') }}</span>
      <select class="border border-gray-200 p-1.5 rounded-md text-sm text-gray-800 cursor-pointer focus:border-purple-500 focus:outline-none">
        <option value="">{{ t('directory.catAll') }}</option>
        <optgroup v-for="group in ACTIVITY_CATEGORIES" :key="group.group" :label="t('activities.' + group.group)">
          <option v-for="item in group.items" :key="item">{{ t('activities.' + item) }}</option>
        </optgroup>
      </select>
    </div>

    <button class="ml-auto border-none bg-none text-orange-500 font-bold cursor-pointer underline hover:text-orange-600">{{ t('components.reset') }}</button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ACTIVITY_CATEGORIES } from '../../constants/data';

const { t } = useI18n();
</script>