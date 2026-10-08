import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { Asset } from "@/types/inventory";

export async function generateQRLabelsPDF(assets: Asset[], labName: string = "Laboratorio", tenantId: string = "DEMO", baseUrl: string = "https://labvault.app") {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 12;
  const marginY = 15;
  const cols = 2;
  const colWidth = (pageWidth - marginX * 2 - 10) / cols; // ~89mm
  const rowHeight = 48; // ~48mm
  const rowsPerPage = 5; // 10 stickers per page

  let currentItem = 0;

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const pageIndex = Math.floor(currentItem / (cols * rowsPerPage));
    const itemOnPage = currentItem % (cols * rowsPerPage);
    const col = itemOnPage % cols;
    const row = Math.floor(itemOnPage / cols);

    if (itemOnPage === 0 && pageIndex > 0) {
      doc.addPage();
    }

    const x = marginX + col * (colWidth + 10);
    const y = marginY + row * (rowHeight + 8);

    // Outer double-bezel sticker border
    doc.setDrawColor(200, 205, 215);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, colWidth, rowHeight, 3, 3, "S");

    // Header bar inside sticker
    doc.setFillColor(15, 23, 42); // slate-900
    doc.roundedRect(x, y, colWidth, 9, 3, 3, "F");
    // Cover bottom rounded corners of header
    doc.rect(x, y + 5, colWidth, 4, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text("SYSKARDEX • RENDIMIENTO Y SEGURIDAD", x + 3, y + 6);

    // Generate QR Code data URL (Public Portal URL)
    try {
      const publicReportUrl = `${baseUrl}/report/${tenantId}/${asset.id}`;
      const qrDataUrl = await QRCode.toDataURL(publicReportUrl, {
        margin: 1,
        width: 120,
        errorCorrectionLevel: "M",
      });

      // Place QR image on right side of sticker
      const qrSize = 32;
      const qrX = x + colWidth - qrSize - 4;
      const qrY = y + 12;
      doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
    } catch {
      // Fallback text if QR rendering fails
      doc.rect(x + colWidth - 32, y + 12, 28, 28, "S");
    }

    // Text content on left side of sticker
    const textX = x + 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(asset.assetTag, textX, y + 16);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    const splitName = doc.splitTextToSize(asset.name, colWidth - 40);
    doc.text(splitName[0] || asset.name, textX, y + 21);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(`Marca/Mod: ${asset.brand} ${asset.model}`.substring(0, 32), textX, y + 26);
    doc.text(`S/N: ${asset.serialNumber}`.substring(0, 32), textX, y + 30);
    doc.text(`Ubicación: ${labName}`.substring(0, 32), textX, y + 34);

    // Pill badge for category/status
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(textX, y + 37, 34, 5.5, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`CAT: ${asset.category.toUpperCase()}`, textX + 2, y + 41);

    currentItem++;
  }

  doc.save(`Etiquetas_QR_${labName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
}

export function generateActaEntregaPDF(actaData: {
  actaNumber: string;
  date: string;
  custodianName: string;
  receiverName: string;
  department: string;
  reason: string;
  type: "ENTREGA" | "BAJA" | "TRANSFERENCIA";
  assets: Asset[];
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const marginX = 20;

  // Header banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("SYSKARDEX • RENDIMIENTO Y SEGURIDAD", marginX, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text("DIRECCIÓN GENERAL DE TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES (TIC)", marginX, 18);
  doc.text(`ACTA OFICIAL N° ${actaData.actaNumber} • ${actaData.type}`, marginX, 23);

  // Document Title
  let y = 42;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  const title = actaData.type === "BAJA"
    ? "ACTA DE BAJA Y DISPOSICIÓN FINAL DE EQUIPOS DE CÓMPUTO"
    : "ACTA FORMAL DE ENTREGA - RECEPCIÓN DE EQUIPOS TECNOLÓGICOS";
  doc.text(title, marginX, y);

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Fecha de Emisión: ${actaData.date}`, marginX, y);
  doc.text(`Departamento / Unidad: ${actaData.department}`, marginX + 85, y);

  y += 6;
  doc.text(`Custodio Responsable: ${actaData.custodianName}`, marginX, y);
  doc.text(`Funcionario Receptor: ${actaData.receiverName}`, marginX + 85, y);

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("1. MOTIVO Y ANTECEDENTES", marginX, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const reasonText = actaData.reason || "Asignación formal de equipamiento para laboratorios institucionales para el periodo lectivo.";
  const splitReason = doc.splitTextToSize(reasonText, pageWidth - marginX * 2);
  doc.text(splitReason, marginX, y);
  y += splitReason.length * 5 + 4;

  // Assets Table Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("2. DETALLE DE ACTIVOS TECNOLÓGICOS", marginX, y);

  y += 5;
  const tableHeaderY = y;
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, tableHeaderY, pageWidth - marginX * 2, 7, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("CÓDIGO ACTIVO", marginX + 2, tableHeaderY + 4.5);
  doc.text("DESCRIPCIÓN / MODELO", marginX + 36, tableHeaderY + 4.5);
  doc.text("SERIE (S/N)", marginX + 96, tableHeaderY + 4.5);
  doc.text("ESTADO", marginX + 142, tableHeaderY + 4.5);

  y = tableHeaderY + 7;

  // Assets Table Rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);

  actaData.assets.forEach((item, index) => {
    if (y > 245) {
      doc.addPage();
      y = 25;
    }

    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginX, y, pageWidth - marginX * 2, 6.5, "F");
    }

    doc.setTextColor(15, 23, 42);
    doc.text(item.assetTag, marginX + 2, y + 4.5);
    doc.text(`${item.name} (${item.brand})`.substring(0, 36), marginX + 36, y + 4.5);
    doc.text(item.serialNumber.substring(0, 24), marginX + 96, y + 4.5);
    doc.text(item.status.toUpperCase(), marginX + 142, y + 4.5);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.15);
    doc.line(marginX, y + 6.5, pageWidth - marginX, y + 6.5);

    y += 6.5;
  });

  // Terms and conditions
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("3. DECLARACIÓN DE CONFORMIDAD Y CUSTODIA", marginX, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const declaration = "Las partes firmantes dan fe de que los equipos descritos fueron verificados físicamente en sus números de serie, componentes y estado operativo. El custodio asume la responsabilidad del uso reglamentario de acuerdo a las políticas de seguridad institucional.";
  const splitDec = doc.splitTextToSize(declaration, pageWidth - marginX * 2);
  doc.text(splitDec, marginX, y);

  // Signatures
  y += 28;
  if (y > 255) {
    doc.addPage();
    y = 40;
  }

  const signWidth = 65;
  const sign1X = marginX + 10;
  const sign2X = pageWidth - marginX - signWidth - 10;

  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.3);
  doc.line(sign1X, y, sign1X + signWidth, y);
  doc.line(sign2X, y, sign2X + signWidth, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("ENTREGADO POR", sign1X + 14, y + 5);
  doc.text("RECIBIDO EN CONFORMIDAD", sign2X + 8, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(actaData.custodianName, sign1X + 10, y + 9);
  doc.text("Soporte y Custodia TIC", sign1X + 14, y + 13);

  doc.text(actaData.receiverName, sign2X + 10, y + 9);
  doc.text(actaData.department, sign2X + 12, y + 13);

  doc.save(`Acta_${actaData.type}_${actaData.actaNumber}.pdf`);
}
