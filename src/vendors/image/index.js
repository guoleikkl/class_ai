import { createApp } from 'vue';
import ImageViewer from './ImageViewer.vue';
import { readDataURL } from '@/components/FileDisplay/util';

/**
 * 图片渲染
 */
export default async function renderImage(buffer, target) {
  const url = await readDataURL(buffer);
  const app = createApp({
    render: () => h(ImageViewer, { image: url }),
  });
  app.mount(target);
}
