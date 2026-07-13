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
