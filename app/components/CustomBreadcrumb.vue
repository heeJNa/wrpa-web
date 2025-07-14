<script setup lang="ts">
  const { home, items } = defineProps<{
    home: { icon: string; route: string }
    items: { label: string; route: string; icon?: string }[]
  }>()

  const route = useRoute()
  const isCurrentRoute = computed(() => (itemRoute: string) => route.path === itemRoute)
</script>

<template>
  <Breadcrumb
    class="!p-0"
    :home="home"
    :model="items"
    :dt="{
      root: {
        background: 'transparent',
      },
    }">
    <template #item="{ item, props }">
      <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
        <a v-bind="props.action" :href="href" @click="navigate">
          <span
            :class="[
              item.icon,
              isCurrentRoute(item.route) ? 'text-primary' : 'text-color',
            ]" />
          <span :class="{ 'text-primary font-semibold': isCurrentRoute(item.route) }">{{
            item.label
          }}</span>
        </a>
      </router-link>
      <a v-else v-bind="props.action" :href="item.url" :target="item.target">
        <span class="text-surface-700 dark:text-surface-0">{{ item.label }}</span>
      </a>
    </template>
  </Breadcrumb>
</template>

<style scoped lang="scss"></style>
