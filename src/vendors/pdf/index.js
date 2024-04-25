
import { createApp } from 'vue';
import PdfView from './PdfView.vue';

export default async function renderPdf(buffer, target) {
  const app = createApp({
    render: () => h(PdfView, { props: { data: buffer } })
  });
  app.mount(target);
}
