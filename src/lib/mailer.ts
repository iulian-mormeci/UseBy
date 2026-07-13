import nodemailer from "nodemailer";

function getTransporter() {
  const port = Number(process.env.SMTP_PORT ?? 1025);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
}

export async function sendMissingProductEmail(report: {
  id: number;
  requestedName: string;
  note: string | null;
}) {
  const to = process.env.REPORT_EMAIL_TO;
  if (!to) {
    throw new Error("REPORT_EMAIL_TO non configurato");
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@useby.local",
    to,
    subject: `UseBy: prodotto mancante segnalato — ${report.requestedName}`,
    text: [
      "È stato segnalato un prodotto mancante dal catalogo di UseBy.",
      "",
      `Prodotto richiesto: ${report.requestedName}`,
      report.note ? `Note: ${report.note}` : null,
      "",
      `ID segnalazione: ${report.id}`,
    ]
      .filter((line): line is string => line !== null)
      .join("\n"),
  });
}

export async function sendPendingProductSubmissionEmail(submission: {
  id: number;
  barcode: string;
  product: {
    name: string;
    brand: string | null;
    imageUrl: string | null;
    storageHint: string | null;
  };
}) {
  const to = process.env.REPORT_EMAIL_TO;
  if (!to) {
    throw new Error("REPORT_EMAIL_TO non configurato");
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@useby.local",
    to,
    subject: `UseBy: nuovo prodotto da revisionare — ${submission.product.name}`,
    text: [
      "Un utente ha aggiunto manualmente un prodotto non trovato né nel catalogo",
      "locale né su Open Food Facts durante la scansione di un codice a barre.",
      "Verifica i dati prima di un'eventuale submission a Open Food Facts o",
      "inclusione in una prossima release del progetto.",
      "",
      `Codice a barre: ${submission.barcode}`,
      `Nome: ${submission.product.name}`,
      submission.product.brand ? `Marca: ${submission.product.brand}` : null,
      submission.product.imageUrl ? `Immagine: ${submission.product.imageUrl}` : null,
      submission.product.storageHint
        ? `Suggerimento conservazione: ${submission.product.storageHint}`
        : null,
      "",
      `ID segnalazione: ${submission.id}`,
    ]
      .filter((line): line is string => line !== null)
      .join("\n"),
  });
}
