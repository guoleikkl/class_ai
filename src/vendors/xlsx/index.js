import { createApp, h } from "vue";

// import ExcelJS from "exceljs";
// import Table from "./Table.vue";
// import "handsontable/dist/handsontable.full.min.css";

/**
 * 渲染excel
 */
export default async function render(buffer, target) {
  const workbook = await new ExcelJS.Workbook().xlsx.load(buffer);
  console.log(workbook, "workbook");
  const app = createApp({
    render: () => h(),
  });
  app.mount(target);
  return app;
}
