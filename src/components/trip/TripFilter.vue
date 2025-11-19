<template>
  <div class="filter-container">
    <div class="filter-item search-input">
      <span class="icon">🔍</span>
      <input type="text" placeholder="Cari destinasi..." />
    </div>

    <div class="filter-item">
      <span class="label">Tarikh</span>
      <select>
        <option>Bila-bila masa</option>
        <option>Minggu Ini</option>
        <option>Bulan Depan</option>
      </select>
    </div>

    <div class="filter-item">
      <span class="label">Level</span>
      <select>
        <option>Semua Level</option>
        <option>🟢 Santai (Easy)</option>
        <option>🟡 Sederhana</option>
        <option>🔴 Hardcore</option>
      </select>
    </div>

    <div class="filter-item">
      <span class="label">Bajet Max</span>
      <select>
        <option>RM 1000+</option>
        <option>RM 500</option>
        <option>RM 200</option>
        <option>RM 100</option>
      </select>
    </div>

    <div class="filter-item">
      <span class="label">Aktiviti</span>
      <select>
        <option>Semua Aktiviti</option>
        <optgroup v-for="group in ACTIVITY_CATEGORIES" :key="group.group" :label="group.group">
          <option v-for="item in group.items" :key="item">{{ item }}</option>
        </optgroup>
      </select>
    </div>

    <button class="btn-reset">Reset</button>
  </div>
</template>

<script setup lang="ts">
import { ACTIVITY_CATEGORIES } from '../../constants/data';
</script>

<style scoped>
.filter-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  overflow-x: auto; /* Boleh scroll tepi kalau skrin kecil */
  white-space: nowrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  min-width: 120px;
}

.search-input {
  flex-direction: row;
  align-items: center;
  background: #f5f5f5;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  min-width: 200px;
}
.search-input input {
  border: none;
  background: transparent;
  outline: none;
  margin-left: 0.5rem;
  width: 100%;
}

.label {
  font-size: 0.7rem;
  color: #888;
  font-weight: bold;
  margin-bottom: 2px;
}

select {
  border: 1px solid #ddd;
  padding: 0.4rem;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
}

.btn-reset {
  margin-left: auto;
  border: none;
  background: none;
  color: #e67e22;
  font-weight: bold;
  cursor: pointer;
  text-decoration: underline;
}
</style>