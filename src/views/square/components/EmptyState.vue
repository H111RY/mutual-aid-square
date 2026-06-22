<template>
  <BaseEmpty :icon="current.icon" :title="current.title" :desc="current.desc" />
</template>

<script setup>
import { computed } from 'vue';
import BaseEmpty from '@/components/ui/BaseEmpty.vue';

const props = defineProps({ tab: { type: String, default: 'all' } });

const config = {
  all:  { icon: '📋', title: '暂无内容',     desc: '快来发布第一条信息吧' },
  help: { icon: '🆘', title: '暂无求助信息', desc: '有需要帮助的地方？来发布第一条求助' },
  idle: { icon: '🎁', title: '暂无闲置分享', desc: '家里有闲置物品？分享给邻居吧' },
  chat: { icon: '💬', title: '暂无交流话题', desc: '来开启一个邻里话题吧' }
};

const current = computed(() => config[props.tab] || config.all);
</script>
