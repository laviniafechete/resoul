const User = require("../models/user");
const mailSender = require("../utils/mailSender");
const qnaEmailTemplate = require("../mail/templates/qnaEmail");

const NOTIFICATION_EMAIL =
  process.env.QNA_NOTIFICATION_EMAIL || "contact@resoul.ro";

exports.createQuestion = async (req, res) => {
  try {
    const {
      question,
      courseTitle,
      subSectionTitle,
      courseId,
      sectionId,
      subSectionId,
    } = req.body || {};

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Întrebarea este obligatorie.",
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Autentificarea este necesară pentru a trimite întrebări.",
      });
    }

    const user = await User.findById(userId).select(
      "firstName lastName email accountType"
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilizatorul nu a fost găsit.",
      });
    }

    const metadata = {
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      audience: user.accountType,
      question: question.trim(),
      courseTitle: courseTitle || "",
      subSectionTitle: subSectionTitle || "",
      createdAt: new Date(),
      courseId: courseId || "",
      sectionId: sectionId || "",
      subSectionId: subSectionId || "",
    };

    try {
      await mailSender(NOTIFICATION_EMAIL, "Q&A", qnaEmailTemplate(metadata), {
        replyTo: `${metadata.name} <${metadata.email}>`,
        userEmail: metadata.email,
      });
    } catch (emailError) {
      console.log("Unable to send Q&A email", emailError);
      return res.status(502).json({
        success: false,
        message: "Nu am reușit să trimitem întrebarea prin email.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Întrebarea ta a fost trimisă către echipa ReSoul. Îți vom răspunde pe email.",
    });
  } catch (error) {
    console.log("Error while sending Q&A question", error);
    return res.status(500).json({
      success: false,
      message: "A apărut o eroare la trimiterea întrebării.",
      error: error.message,
    });
  }
};
