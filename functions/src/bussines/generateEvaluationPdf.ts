import {onCall, CallableRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {getFirestore} from "firebase-admin/firestore";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PdfPrinterLib = require("pdfmake/js/Printer");
const PdfPrinter = PdfPrinterLib.default || PdfPrinterLib;
import {TDocumentDefinitions} from "pdfmake/interfaces";

// Define fonts - we need to fetch them from somewhere or encode them
// Since we are in cloud functions, importing fonts might be tricky.
// Usually standard fonts are available.
const fonts = {
  Roboto: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};

// Define interfaces for data structure
interface Evaluation {
  studentKey?: string;
  classKey?: string;
  teacherKey?: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any; // Firestore Timestamp
  grid?: {
    indicatori: Indicatore[];
  };
}

interface Indicatore {
  descrizione: string;
  voto: number | string;
  valore: number | string;
}

interface GeneratePdfData {
  evaluationKey: string;
}

export const generateEvaluationPdf = onCall<GeneratePdfData>(
  {enforceAppCheck: false},
  async (request: CallableRequest<GeneratePdfData>) => {
    const {data} = request;

    if (!data || !data.evaluationKey) {
      throw new Error("Evaluation Key is required");
    }

    const {evaluationKey} = data;
    const db = getFirestore();

    try {
      // 1. Fetch Evaluation Data
      const evalDoc = await db.collection("valutazioni")
        .doc(evaluationKey).get();
      if (!evalDoc.exists) {
        throw new Error("Evaluation not found");
      }
      const evaluation = evalDoc.data() as Evaluation;

      // 2. Fetch Related Data (Student, Teacher, Class)
      let studentName = "Unknown Student";
      let className = "Unknown Class";
      let teacherName = "Unknown Teacher";

      if (evaluation?.studentKey) {
        const studentDoc = await db.collection("userProfiles")
          .doc(evaluation.studentKey).get();
        if (studentDoc.exists) {
          const s = studentDoc.data();
          studentName = `${s?.lastName} ${s?.firstName}`;
        }
      }

      if (evaluation?.classKey) {
        const classDoc = await db.collection("classi")
          .doc(evaluation.classKey).get();
        if (classDoc.exists) {
          const c = classDoc.data();
          className = c?.classe || "";
        }
      }
      if (evaluation?.teacherKey) {
        const teacherDoc = await db.collection("userProfiles")
          .doc(evaluation.teacherKey).get();
        if (teacherDoc.exists) {
          const t = teacherDoc.data();
          teacherName = `${t?.lastName} ${t?.firstName}`;
        }
      }


      // 3. Prepare PDF Content
      const printer = new PdfPrinter(fonts);
      let evalDate = "";
      if (evaluation?.data) {
        if (typeof evaluation.data.toDate === "function") {
          evalDate = evaluation.data.toDate().toLocaleDateString("it-IT");
        } else {
          evalDate = new Date(evaluation.data).toLocaleDateString("it-IT");
        }
      }

      const docDefinition: TDocumentDefinitions = {
        content: [
          {
            text: evaluation?.description || "",
            style: "subheader",
            alignment: "center",
            margin: [0, 10, 0, 20],
          },
          {
            columns: [
              {
                width: "*",
                text: [
                  {text: "Studente:\n", bold: true},
                  studentName,
                ],
              },
              {
                width: "*",
                text: [
                  {text: "Classe:\n", bold: true},
                  className,
                ],
              },
              {
                width: "*",
                text: [
                  {text: "Data di svolgimento della prova:\n", bold: true},
                  evalDate,
                ],
              },
            ],
          },
          {text: " ", margin: [0, 10]}, // Spacer
          {
            columns: [
              {
                width: "*",
                text: [
                  {text: "Prof.:\n", bold: true},
                  teacherName,
                ],
              },
            ],
          },
          {
            text: "Indicatori",
            style: "sectionHeader",
            margin: [0, 20, 0, 10],
            alignment: "center",
          },
          // Table for indicators
          {
            table: {
              headerRows: 1,
              widths: ["*", "auto"],
              body: [
                // Header
                [
                  {text: "Descrizione", bold: true, alignment: "center"},
                  {text: "Voto / Valore", bold: true},
                ],
                // Data Rows
                ...(evaluation?.grid?.indicatori || [])
                  .map((ind: Indicatore) => [
                    ind.descrizione,
                    `${ind.voto} / ${ind.valore}`,
                  ]),
                // Footer Row for total
                [
                  {text: "Voto Finale", bold: true, alignment: "right"},
                  {
                    text: calculateTotal(evaluation?.grid?.indicatori),
                    bold: true,
                  },
                ],
              ],
            },
          },
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
          },
          subheader: {
            fontSize: 14,
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
          },
        },
        defaultStyle: {
          font: "Roboto",
        },
      };

      // 4. Generate PDF
      const pdfDoc = await printer.createPdfKitDocument(docDefinition);

      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        pdfDoc.on("data", (chunk: Buffer) => chunks.push(chunk));
        pdfDoc.on("end", () => {
          const result = Buffer.concat(chunks);
          resolve({pdfBase64: result.toString("base64")});
        });
        pdfDoc.on("error", (err: Error) => reject(err));
        pdfDoc.end();
      });
    } catch (error) {
      logger.error("Error generating PDF", error);
      throw new Error("Failed to generate PDF");
    }
  }
);


/**
 * Calculates the total score of the evaluation.
 * @param {Indicatore[]} indicatori - The list of indicators.
 * @return {string} The formatted total score.
 */
function calculateTotal(indicatori: Indicatore[] | undefined): string {
  if (!indicatori) return "0/0";
  const totalVote = indicatori.reduce(
    (acc, curr) => acc + Number(curr.voto || 0), 0
  );
  const totalMax = indicatori.reduce(
    (acc, curr) => acc + Number(curr.valore || 0), 0
  );
  return `${totalVote} / ${totalMax}`;
}
