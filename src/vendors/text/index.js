import { readText } from '@/components/FileDisplay/util';
import { createApp, h } from 'vue';
import CodeViewer from './CodeViewer.vue';

/**
 * 渲染文本
 * @param buffer 文本二进制内容
 * @param target 目标
 */
export default async function renderText(buffer, target) {
  const text = await readText(buffer);
  const app = createApp({
    render: () => h(CodeViewer, { value: text }),
  });
  app.mount(target);
}
