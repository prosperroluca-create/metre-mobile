import * as MailComposer from 'expo-mail-composer';
import * as FileSystem from 'expo-file-system';
import { exportToExcel, exportToPDF } from './exportUtils';

export async function checkMailAvailability() {
  try {
    const isAvailable = await MailComposer.isAvailableAsync();
    return isAvailable;
  } catch (error) {
    console.error('Error checking mail availability:', error);
    return false;
  }
}

export async function sendCalculationEmail(meta, zones, total, recipientEmail = '') {
  try {
    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      return { success: false, error: 'Email non disponible sur cet appareil' };
    }

    // Generate Excel
    const excelResult = await exportToExcel(meta, zones, total);
    if (!excelResult.success) {
      return { success: false, error: 'Erreur lors de la génération du fichier' };
    }

    const projet = meta.projet || 'Relevé de surfaces';
    const date = new Date().toLocaleDateString('fr-FR');

    await MailComposer.composeAsync({
      recipients: recipientEmail ? [recipientEmail] : [],
      subject: `Relevé de surfaces - ${projet} - ${date}`,
      body: `
        <h2>Relevé des Surfaces</h2>
        <p><strong>Projet:</strong> ${meta.projet || 'Non spécifié'}</p>
        <p><strong>Référence:</strong> ${meta.ref || 'Non spécifiée'}</p>
        <p><strong>Établi par:</strong> ${meta.redacteur || 'Non spécifié'}</p>
        <p><strong>Surface totale:</strong> ${total.toLocaleString('fr-FR', {
          minimumFractionDigits: 2,
        })} m²</p>
        <p><strong>Nombre de mesures:</strong> ${zones.reduce((acc, zone) => acc + (zone.rows?.length || 0), 0)}</p>
        <hr>
        <p>Détails en pièce jointe (Excel)</p>
      `,
      isHtml: true,
      attachments: [excelResult.uri],
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

export async function generateCalculationReport(meta, zones, total) {
  try {
    const projet = meta.projet || 'Relevé de surfaces';
    const date = new Date().toLocaleDateString('fr-FR');
    const time = new Date().toLocaleTimeString('fr-FR');

    let report = `
================================
RELEVÉ DES SURFACES - MÉTRÉ
================================

Projet: ${meta.projet || '—'}
Référence: ${meta.ref || '—'}
Établi par: ${meta.redacteur || '—'}
Date: ${date} ${time}

================================
DÉTAIL DES MESURES
================================

    `;

    zones.forEach((zone, zoneIndex) => {
      let subtotal = 0;
      report += `\n${zone.title || `Zone ${zoneIndex + 1}`}:\n`;
      report += '─'.repeat(50) + '\n';

      if (zone.rows && zone.rows.length > 0) {
        zone.rows.forEach((row, rowIndex) => {
          const val =
            parseFloat(row.largeur || 0) *
            parseFloat(row.longueur || 0) *
            parseFloat(row.quantite || 1);

          if (!isNaN(val)) {
            subtotal += val;
            report += `${rowIndex + 1}. ${row.designation || '—'}\n`;
            report += `   L=${row.largeur}m × l=${row.longueur}m × Q=${row.quantite}\n`;
            report += `   Surface: ${val.toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
            })} m²\n\n`;
          }
        });
      }

      report += `Sous-total ${zone.title || 'Zone'}: ${subtotal.toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
      })} m²\n`;
      report += '='.repeat(50) + '\n';
    });

    report += `\n================================\nSURFACE TOTALE\n================================\n`;
    report += `${total.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} m²\n`;
    report += `\n================================\n`;

    return { success: true, report };
  } catch (error) {
    console.error('Error generating report:', error);
    return { success: false, error: error.message };
  }
}
