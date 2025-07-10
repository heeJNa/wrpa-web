<script setup lang="ts">
  const { onMenuToggle, toggleDarkMode, isDarkTheme } = useLayout()
  const outsideClickListener = ref<((event: MouseEvent) => void) | null>(null)
  const topbarMenuActive = ref(false)
  const { request } = useClientAPI()
  onMounted(() => {
    bindOutsideClickListener()
  })
  onBeforeUnmount(() => {
    unbindOutsideClickListener()
  })

  const onTopBarMenuButton = () => (topbarMenuActive.value = !topbarMenuActive.value)

  const onProfileClick = () => (topbarMenuActive.value = false)

  const onLogoutClick = async () => {
    const { statusCode } = await request<{
      expiresIn: number
      header: string
      token: string
    }>('/api/auth/logout', {
      method: 'POST',
    })
    if (statusCode.value === 200) {
      await navigateTo('/login', {
        replace: true,
        external: true,
      })
    }
  }
  const topbarMenuClasses = computed(() => {
    return {
      'layout-topbar-menu-mobile-active': topbarMenuActive.value,
    }
  })

  const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
      outsideClickListener.value = (event: MouseEvent) => {
        if (isOutsideClicked(event)) {
          topbarMenuActive.value = false
        }
      }

      document.addEventListener('click', outsideClickListener.value)
    }
  }

  const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
      document.removeEventListener('click', outsideClickListener.value)
      outsideClickListener.value = null
    }
  }

  const isOutsideClicked = (event: MouseEvent) => {
    if (!topbarMenuActive.value) return
    const sidebarEl = document.querySelector('.layout-topbar-menu')
    const topbarEl = document.querySelector('.layout-topbar-menu-button')
    if (!sidebarEl || !topbarEl) return true
    return !(
      sidebarEl.isSameNode(event.target as Element) ||
      sidebarEl.contains(event.target as Element) ||
      topbarEl.isSameNode(event.target as Element) ||
      topbarEl.contains(event.target as Element)
    )
  }
</script>

<template>
  <div class="layout-topbar">
    <button
      class="p-link layout-menu-button layout-topbar-button"
      @click="onMenuToggle()">
      <i class="pi pi-bars" />
    </button>

    <button
      class="p-link layout-topbar-menu-button layout-topbar-button"
      @click="onTopBarMenuButton()">
      <i class="pi pi-ellipsis-v" />
    </button>

    <div class="layout-topbar-menu" :class="topbarMenuClasses">
      <button class="layout-topbar-button" type="button" @click="toggleDarkMode">
        <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]" />
        <span>Dark Mode</span>
      </button>
      <!-- <button class="layout-topbar-button" as="router-link" @click="onTopBarMenuButton()">
        <i class="pi pi-calendar" />
        <span>Calendar</span>
      </button> -->
      <!-- <button class="layout-topbar-button" as="router-link" @click="onProfileClick">
        <i class="pi pi-user" />
        <span>Profile</span>
      </button> -->
      <!-- <button class="layout-topbar-button" as="router-link">
        <i class="pi pi-cog" />
        <span>Settings</span>
      </button> -->
      <button class="layout-topbar-button" as="router-link" @click="onLogoutClick">
        <i class="pi pi-sign-out" />
        <span>Logout</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
