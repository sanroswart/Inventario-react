// src/utils/exporters.js
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // 👈 importante

export function exportToExcel(data, filename = "export") {
  const ws = XLSX.utils.json_to_sheet(data || []);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Datos");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToPDF(
  columns,
  dataRows,
  filename = "export",
  title = "Reporte"
) {
  const doc = new jsPDF({ orientation: "l", unit: "pt", format: "a4" });

  doc.setFontSize(14);
  doc.text(title, 40, 40);

  autoTable(doc, {
    startY: 60,
    head: [columns.map((c) => c.header)],
    body: dataRows.map((row) => columns.map((c) => row[c.dataKey] ?? "")),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [44, 62, 80] },
    margin: { left: 40, right: 40 },
  });

  doc.save(`${filename}.pdf`);
}
