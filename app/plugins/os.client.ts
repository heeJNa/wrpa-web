export default defineNuxtPlugin(() => {
  const userAgent = navigator.userAgent.toLowerCase()
  let os = 'unknown'

  if (userAgent.includes('windows')) {
    os = 'windows'
  } else if (userAgent.includes('macintosh') || userAgent.includes('mac os x')) {
    os = 'mac'
  } else if (userAgent.includes('linux')) {
    os = 'linux'
  } else if (userAgent.includes('android')) {
    os = 'android'
  } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
    os = 'ios'
  }

  document.cookie = `os=${os}; path=/; SameSite=Lax`
})
