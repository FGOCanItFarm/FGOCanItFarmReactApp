<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
      permanent
      width="240"
    >
      <v-list>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.path"
          router
        >
          <template v-slot:prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container class="pa-4">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'

const drawer = ref(true)

const menuItems = [
  {
    title: 'Results',
    icon: 'mdi-table',
    path: '/'
  },
  {
    title: 'Team Selection',
    icon: 'mdi-account-group',
    path: '/teams'
  },
  {
    title: 'Quest Selection',
    icon: 'mdi-sword',
    path: '/quests'
  },
  {
    title: 'Test',
    icon: 'mdi-test-tube',
    path: '/test'
  }
]
</script>

<style scoped>
.v-main {
  margin-left: 240px;
}
</style>