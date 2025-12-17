import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'index', component: () => import('pages/IndexPage.vue') },
      { path: 'tags', name: 'tags', component: () => import('pages/TagManagement.vue') },
      { path: 'settings', name: 'settings', component: () => import('pages/Settings.vue') },
      { path: 'units', name: 'units', component: () => import('pages/UnitManagement.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
