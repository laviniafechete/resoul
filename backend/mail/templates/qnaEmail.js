const formatDate = (date) =>
  new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Bucharest",
  }).format(date);

module.exports = ({
  name,
  email,
  audience,
  question,
  courseTitle,
  subSectionTitle,
  createdAt,
  courseId,
  sectionId,
  subSectionId,
}) => {
  const timestamp = formatDate(createdAt);

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111">
      <h2 style="margin-bottom: 8px;">Întrebare nouă din Q&A</h2>
      <p style="margin:0 0 16px 0;">Ai primit o întrebare nouă din platforma ReSoul.</p>
      <ul style="padding-left: 18px; margin: 0 0 16px 0;">
        <li><strong>Nume:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Audiență:</strong> ${audience}</li>
        <li><strong>Trimis la:</strong> ${timestamp}</li>
        ${courseTitle ? `<li><strong>Curs:</strong> ${courseTitle}</li>` : ""}
        ${
          subSectionTitle
            ? `<li><strong>Lecție:</strong> ${subSectionTitle}</li>`
            : ""
        }
      </ul>
      ${
        courseId || subSectionId
          ? `<p style="margin:0 0 16px 0;">
              <strong>ID curs:</strong> ${courseId || "-"}<br/>
              <strong>ID secțiune:</strong> ${sectionId || "-"}<br/>
              <strong>ID lecție:</strong> ${subSectionId || "-"}
            </p>`
          : ""
      }
      <div style="padding: 16px; border-left: 4px solid #6b46c1; background: #f5f0ff; border-radius: 8px;">
        <strong>Întrebare:</strong>
        <p style="margin-top: 8px; white-space: pre-line;">${question}</p>
      </div>
      <p style="margin-top: 24px;">Poți răspunde direct la emailul expeditorului.</p>
    </div>
  `;
};
