import { jsPDF } from 'jspdf';
import { CondoReceipt, HouseUnit, CondoSettings, MonthlyExpense } from '../types';

export const generateReceiptPDF = (receipt: CondoReceipt, settings: CondoSettings) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Draw border outline
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, pageWidth - 20, 277);

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`CONJUNTO RESIDENCIAL FLORENCIA ${receipt.street.toUpperCase()}`, 15, 20);

  // Logo text & flower emulation in top-right
  doc.setFontSize(16);
  doc.setTextColor(225, 29, 72); // Rose
  doc.text('Florencia', pageWidth - 65, 20);
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Conjunto Residencial', pageWidth - 65, 24);
  doc.setFont('helvetica', 'normal');
  doc.text(`RIF: ${settings.rif}`, pageWidth - 65, 28);

  // Recibo Nº & Reserve Fund Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 26, 75, 18, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Recibo de Cobro Nº', 18, 32);
  doc.setFontSize(11);
  doc.text(receipt.receiptNumber.toString(), 62, 32);

  doc.setFontSize(8);
  doc.text(`CASA: ${receipt.houseCode}`, 18, 38);
  doc.text(`ALICUOTA: ${receipt.alicuotaPercentStr}`, 45, 38);
  doc.text(`MES: ${receipt.monthYear}`, 18, 42);

  // Reserve fund status mini-box
  doc.rect(95, 26, 50, 18, 'FD');
  doc.setFontSize(7);
  doc.text('SALDO EN CTA FONDO DE RESERVA', 97, 30);
  doc.setFont('helvetica', 'normal');
  doc.text(`Saldo Anterior: Bs ${(receipt.reserveFundAccountBalanceBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, 97, 34);
  doc.text(`Crédito Mes: Bs ${(receipt.reserveFundMonthCreditBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, 97, 38);
  doc.text(`Total Disponible: Bs ${(receipt.reserveFundTotalBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, 97, 42);

  // Owner Name & Print Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Propietario(a): ${receipt.residentName}`, 15, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Fecha de emisión: ${receipt.issueDate}  |  Vencimiento: ${receipt.dueDate}`, 15, 54);

  // Summary Metrics Banner (green background header like the sheet)
  doc.setFillColor(220, 252, 231);
  doc.rect(15, 58, pageWidth - 30, 14, 'FD');
  doc.setDrawColor(187, 247, 208);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(22, 101, 52);
  doc.text('TOTAL CUOTA', 18, 63);
  doc.text('DEUDA ANT.', 45, 63);
  doc.text('MORA (3%)', 72, 63);
  doc.text('SALDO FAVOR', 97, 63);
  doc.text('TOTAL A PAGAR (BS)', 125, 63);
  doc.text('EQUIV. USD (BCV)', 160, 63);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`Bs ${receipt.totalCuotaMesBs.toFixed(2)}`, 18, 69);
  doc.text(`Bs ${receipt.deudaAnteriorBs.toFixed(2)}`, 45, 69);
  doc.text(`Bs ${receipt.moraBs.toFixed(2)}`, 72, 69);
  doc.text(`Bs ${receipt.saldoFavorActualBs.toFixed(2)}`, 97, 69);

  // Total in bold
  doc.setFontSize(9);
  doc.setTextColor(receipt.totalPagarBs > 0 ? 185 : 22, receipt.totalPagarBs > 0 ? 28 : 101, receipt.totalPagarBs > 0 ? 28 : 52);
  doc.text(`Bs ${receipt.totalPagarBs.toFixed(2)}`, 125, 69);
  doc.text(`$ ${receipt.totalPagarUsd.toFixed(2)}`, 160, 69);

  // Items table header
  let y = 78;
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y, pageWidth - 30, 7, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('DESCRIPCION DEL GASTO', 18, y + 4.5);
  doc.text('GASTO DEL MES (BS)', 115, y + 4.5);
  doc.text('COMÚN (BS)', 150, y + 4.5);
  doc.text('NO COMÚN', 175, y + 4.5);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  // Expense rows
  receipt.expenses.forEach((item, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y, pageWidth - 30, 6, 'F');
    }
    const truncatedDesc = item.description.length > 55 ? item.description.substring(0, 52) + '...' : item.description;
    doc.text(truncatedDesc, 18, y + 4.2);
    doc.text((item.totalAmountBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 }), 115, y + 4.2);
    doc.text((item.shareAmountBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 }), 150, y + 4.2);
    doc.text('-', 178, y + 4.2);
    y += 6;
  });

  // House-specific expenses (Cargos directos a la vivienda)
  if (receipt.houseExpenses && receipt.houseExpenses.length > 0) {
    receipt.houseExpenses.forEach((hse) => {
      doc.setFillColor(254, 243, 199); // light amber
      doc.rect(15, y, pageWidth - 30, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(146, 64, 14);
      const desc = `[Vivienda] ${hse.concept}${hse.invoiceNumber ? ` (Fact: ${hse.invoiceNumber})` : ''}`;
      const truncatedDesc = desc.length > 55 ? desc.substring(0, 52) + '...' : desc;
      doc.text(truncatedDesc, 18, y + 4.2);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text('-', 115, y + 4.2);
      doc.text('-', 150, y + 4.2);
      doc.setFont('helvetica', 'bold');
      doc.text((hse.amountBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 }), 175, y + 4.2);
      doc.setFont('helvetica', 'normal');
      y += 6;
    });
  }

  // Totals of expenses
  y += 2;
  doc.setDrawColor(203, 213, 225);
  doc.line(15, y, pageWidth - 15, y);
  y += 5;

  const totalGastosMes = (receipt.expenses || []).reduce((acc, curr) => acc + (curr.totalAmountBs || 0), 0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('GASTOS MES:', 65, y);
  doc.text(`Bs ${(totalGastosMes ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, 115, y);
  doc.text(`Bs ${(receipt.gastosMesTotalBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, 150, y);

  y += 5;
  doc.text('FONDO DE RESERVA 10%:', 65, y);
  doc.text(`Bs ${((totalGastosMes || 0) * 0.1).toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, 115, y);
  doc.text(`Bs ${(receipt.fondoReservaBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, 150, y);

  if ((receipt.houseExpensesTotalBs ?? 0) > 0) {
    y += 5;
    doc.setTextColor(146, 64, 14);
    doc.text('GASTOS POR VIVIENDA:', 65, y);
    doc.text(`Bs ${(receipt.houseExpensesTotalBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, 175, y);
    doc.setTextColor(15, 23, 42);
  }

  y += 5;
  doc.text('TOTAL GASTOS COMUNES Y NO COMUNES:', 65, y);
  doc.text(`Bs ${((totalGastosMes || 0) * 1.1 + (receipt.houseExpensesTotalBs || 0)).toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, 115, y);
  doc.text(`Bs ${(receipt.totalCuotaMesBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, 150, y);

  // Bank & Legal Instructions matching the sheet
  y = 230;
  doc.setFillColor(254, 252, 232); // light yellow box
  doc.rect(15, y, pageWidth - 30, 38, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(113, 63, 18);
  doc.text('INFORMACIÓN DE PAGO Y CONDICIONES LEGALES (SENIAT / LEY DE PROPIEDAD HORIZONTAL):', 18, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text('• El pago del recibo deberá realizarse dentro de los siete (7) días continuos una vez emitido el mismo.', 18, y + 10);
  doc.text(`• En bolívares (Bs) o su equivalente en divisas a la tasa oficial del Banco Central de Venezuela (BCV: Bs ${settings.bcvExchangeRate.toFixed(2)}/USD).`, 18, y + 14);
  doc.text('• Pasado el periodo de gracia de 7 días, se aplicará un recargo por mora del 3% mensual sobre el saldo deudor pendiente.', 18, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`DATOS BANCARIOS OFICIALES PARA TRANSFERENCIA O PAGO MÓVIL:`, 18, y + 24);
  doc.text(`${settings.bankName} - ${settings.accountType}`, 18, y + 28);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nº de Cuenta: ${settings.accountNumber}`, 18, y + 32);
  doc.text(`A nombre de: ${settings.condoName}   |   RIF: ${settings.rif}`, 18, y + 35);

  // Save the PDF
  doc.save(`Recibo_${receipt.houseCode}_${receipt.monthYear.replace(' ', '_')}.pdf`);
};

export const generateMonthlyFinancialReportPDF = (
  settings: CondoSettings,
  houses: HouseUnit[],
  expenses: MonthlyExpense[]
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('CONJUNTO RESIDENCIAL FLORENCIA - REPORTE GENERAL DE COBRANZA Y FINANZAS', 15, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`RIF: ${settings.rif}  |  Periodo: ${settings.currentBillingPeriod}  |  Tasa BCV Referencial: Bs ${settings.bcvExchangeRate.toFixed(2)} / USD`, 15, 21);
  doc.text(`Total Unidades: 216 casas (Calle 1: 92 | Calle 2: 84 | Calle C: 40)  |  Fecha de emisión: ${new Date().toLocaleDateString('es-VE')}`, 15, 26);

  // Financial KPIs
  const totalDebtBs = houses.reduce((acc, h) => acc + h.totalToPayBs, 0);
  const totalDebtUsd = totalDebtBs / settings.bcvExchangeRate;
  const totalExpensesBs = expenses.reduce((acc, e) => acc + e.amountBs, 0);

  doc.setFillColor(241, 245, 249);
  doc.rect(15, 30, pageWidth - 30, 14, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`GASTOS DEL MES: Bs ${totalExpensesBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, 20, 36);
  doc.text(`FONDO RESERVA: Bs ${settings.reserveFundBalanceBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, 85, 36);
  doc.text(`DISPONIBLE EN BANCO: Bs ${settings.bankBalanceBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, 150, 36);
  doc.text(`TOTAL CUENTAS POR COBRAR: Bs ${totalDebtBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} ($${totalDebtUsd.toFixed(2)})`, 210, 36);

  // Table summary of units
  let y = 52;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setFillColor(203, 213, 225);
  doc.rect(15, y - 5, pageWidth - 30, 6, 'FD');
  doc.setTextColor(30, 41, 59);

  doc.text('CASA', 17, y - 1);
  doc.text('CALLE', 32, y - 1);
  doc.text('PROPIETARIO', 52, y - 1);
  doc.text('ALÍCUOTA', 110, y - 1);
  doc.text('DEUDA ANT.', 135, y - 1);
  doc.text('MORA 3%', 160, y - 1);
  doc.text('TOTAL A PAGAR (BS)', 185, y - 1);
  doc.text('TOTAL (USD)', 225, y - 1);
  doc.text('REC. PEND.', 250, y - 1);
  doc.text('ESTADO', 270, y - 1);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  // We print the first 35 rows or page summary to maintain high performance
  const rowsToPrint = houses.slice(0, 38);
  rowsToPrint.forEach((h, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y, pageWidth - 30, 4.5, 'F');
    }
    doc.text(h.code, 17, y + 3.5);
    doc.text(h.street, 32, y + 3.5);
    doc.text(h.residentName.substring(0, 28), 52, y + 3.5);
    doc.text(h.alicuotaPercentStr, 110, y + 3.5);
    doc.text(h.currentDebt.toFixed(2), 135, y + 3.5);
    doc.text(h.moraAmount.toFixed(2), 160, y + 3.5);
    doc.text(h.totalToPayBs.toFixed(2), 185, y + 3.5);
    doc.text(`$${h.totalToPayUsd.toFixed(2)}`, 225, y + 3.5);
    doc.text(h.pendingReceiptsCount.toString(), 255, y + 3.5);
    doc.text(h.status.toUpperCase(), 270, y + 3.5);

    y += 4.5;
  });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.text(`* Mostrando resumen representativo de las 216 casas registradas. Documento generado para control de auditoría interna y SENIAT.`, 15, 195);

  doc.save(`Balance_Financiero_Florencia_${settings.currentBillingPeriod.replace(' ', '_')}.pdf`);
};
