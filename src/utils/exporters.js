// src/utils/exporters.js
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/** Excel: una sola hoja (datos = array de objetos) */
export function exportToExcel(data, filename = "export") {
  const ws = XLSX.utils.json_to_sheet(data || []);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Datos");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/** Excel: múltiples hojas
 * sheets: [{ name: 'Hoja1', data: [{...}, ...] }, ...]
 */
export function exportToExcelSheets(sheets = [], filename = "export") {
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, data }) => {
    const ws = XLSX.utils.json_to_sheet(data || []);
    XLSX.utils.book_append_sheet(wb, ws, name || "Datos");
  });
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/** PDF: una tabla
 * columns: [{ header, dataKey }...]
 * rows: array de objetos
 */
export function exportToPDF(
  columns,
  rows,
  filename = "export",
  title = "Reporte"
) {
  const doc = new jsPDF({ orientation: "l", unit: "pt", format: "a4" });
  doc.setFontSize(14);
  doc.text(title, 40, 40);

  autoTable(doc, {
    startY: 60,
    head: [columns.map((c) => c.header)],
    body: (rows || []).map((r) => columns.map((c) => r[c.dataKey] ?? "")),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [44, 62, 80] },
    margin: { left: 40, right: 40 },
  });

  doc.save(`${filename}.pdf`);
}

/** PDF: múltiples tablas apiladas
 * tables: [{ title?: string, columns: [{header, dataKey}], rows: [] }, ...]
 */
export function exportToPDFTables({
  filename = "export",
  reportTitle = "Reporte",
  tables = [],
}) {
  const doc = new jsPDF({ orientation: "l", unit: "pt", format: "a4" });
  doc.setFontSize(14);
  doc.text(reportTitle, 40, 40);

  let y = 60;

  tables.forEach((t, idx) => {
    if (t.title) {
      doc.setFontSize(12);
      doc.text(t.title, 40, y);
      y += 10;
    }
    autoTable(doc, {
      startY: y,
      head: [t.columns.map((c) => c.header)],
      body: (t.rows || []).map((r) => t.columns.map((c) => r[c.dataKey] ?? "")),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [44, 62, 80] },
      margin: { left: 40, right: 40 },
      didDrawPage: (data) => {
        y = data.cursor.y + 20;
      },
    });

    // Si la siguiente tabla no cabe, autoTable agregará página. y se actualiza arriba.
    if (idx < tables.length - 1) {
      doc.setFontSize(14);
    }
  });

  doc.save(`${filename}.pdf`);
}
