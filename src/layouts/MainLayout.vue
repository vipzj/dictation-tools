<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>{{ $t('dashboard.title') }} - Dictation Tools</q-toolbar-title>

        <div class="row items-center q-gutter-sm">
          <!-- Language Switcher -->
          <q-btn-dropdown
            flat
            dense
            icon="language"
            :label="$t('language.switch')"
            aria-label="Switch language"
          >
            <q-list>
              <q-item
                v-for="lang in availableLanguages"
                :key="lang.code"
                clickable
                @click="switchLanguage(lang.code)"
              >
                <q-item-section avatar>
                  <span class="text-h6">{{ lang.flag }}</span>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ lang.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <!-- <div class="text-caption">Quasar v{{ $q.version }}</div> -->
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>{{ $t('navigation.title') }}</q-item-label>

        <q-item clickable :to="{ name: 'index' }" :active-class="'text-primary'">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('navigation.home') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="{ path: '/tags' }" :active-class="'text-primary'">
          <q-item-section avatar>
            <q-icon name="label" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('navigation.tags') }}</q-item-label>
            <q-item-label caption>{{ $t('navigation.tagsCaption') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="{ path: '/units' }" :active-class="'text-primary'">
          <q-item-section avatar>
            <q-icon name="school" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('navigation.units') }}</q-item-label>
            <q-item-label caption>{{ $t('navigation.unitsCaption') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="{ path: '/dictation' }" :active-class="'text-primary'">
          <q-item-section avatar>
            <q-icon name="headphones" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('navigation.dictation') }}</q-item-label>
            <q-item-label caption>{{ $t('navigation.dictationCaption') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="{ path: '/dictation-history' }" :active-class="'text-primary'">
          <q-item-section avatar>
            <q-icon name="history" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('navigation.dictationHistory') }}</q-item-label>
            <q-item-label caption>{{ $t('navigation.dictationHistoryCaption') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="{ path: '/review' }" :active-class="'text-primary'">
          <q-item-section avatar>
            <q-icon name="psychology" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('navigation.review') }}</q-item-label>
            <q-item-label caption>{{ $t('navigation.reviewCaption') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="{ path: '/review-history' }" :active-class="'text-primary'">
          <q-item-section avatar>
            <q-icon name="history" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('navigation.reviewHistory') }}</q-item-label>
            <q-item-label caption>{{ $t('navigation.reviewHistoryCaption') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="{ path: '/settings' }" :active-class="'text-primary'">
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('navigation.settings') }}</q-item-label>
            <q-item-label caption>{{ $t('navigation.settingsCaption') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <q-item-label header>{{ $t('navigation.essentialLinks') }}</q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';
import { availableLanguages } from 'src/i18n';

const { locale } = useI18n();

const linksList: EssentialLinkProps[] = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev',
  },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework',
  },
  {
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'https://chat.quasar.dev',
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev',
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev',
  },
  {
    title: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev',
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev',
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function switchLanguage(languageCode: string) {
  locale.value = languageCode;
  // Save language preference to localStorage
  localStorage.setItem('language', languageCode);
}
</script>
