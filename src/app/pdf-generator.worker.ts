import "./pdf-polyfill"; // Shim must run before pdfmake imports

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";



// Initialize fonts
console.log('Worker: pdfFonts import:', pdfFonts);

if ((pdfFonts as any).pdfMake && (pdfFonts as any).pdfMake.vfs) {
  (pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;
} else if ((pdfFonts as any).vfs) {
  (pdfMake as any).vfs = (pdfFonts as any).vfs;
} else if ((pdfFonts as any).default && (pdfFonts as any).default.pdfMake && (pdfFonts as any).default.pdfMake.vfs) {
  (pdfMake as any).vfs = (pdfFonts as any).default.pdfMake.vfs;
} else {
  // Fallback: Assume pdfFonts IS the vfs object (based on logs)
  console.log('Worker: Assigning pdfFonts directly to vfs');
  (pdfMake as any).vfs = pdfFonts;
}

if (!(pdfMake as any).vfs) {
  console.warn('Worker: vfs NOT assigned correctly.');
}

export interface Indicatore {
  descrizione: string;
  voto: number | string;
  valore: number | string;
}

export interface EvaluationData {
  description?: string;
  date?: string | Date; // Pre-formatted or Date object
  grid?: {
    indicatori: Indicatore[];
  };
  studentName: string;
  className: string;
  teacherName: string;
}

// Global error handler
self.onerror = function (message, source, lineno, colno, error) {
  console.error('Worker: Global Error:', { message, source, lineno, colno, error });
};

addEventListener('message', ({ data }: { data: EvaluationData }) => {
  try {
    const evaluation = data;
    const docDefinition = generateDocDefinition(evaluation);

    // Create PDF
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);

    (pdfDocGenerator as any).getBase64((data: string) => {
      postMessage({ base64: data });
    });

  } catch (error) {
    console.error('Worker: Error generating PDF', error);
    postMessage({ error: error });
  }
});

function generateDocDefinition(evaluation: EvaluationData): any {
  let evalDate = "";
  if (evaluation.date) {
    // Handle both string and Date object if passed
    evalDate = new Date(evaluation.date).toLocaleDateString("it-IT");
  }

  return {
    content: [
      {
        text: evaluation.description || "",
        style: "subheader",
        alignment: "center",
        margin: [0, 10, 0, 20],
      },
      {
        columns: [
          {
            width: "*",
            text: [
              { text: "Studente:\n", bold: true },
              evaluation.studentName,
            ],
          },
          {
            width: "*",
            text: [
              { text: "Classe:\n", bold: true },
              evaluation.className,
            ],
          },
          {
            width: "*",
            text: [
              { text: "Data di valutazione:\n", bold: true },
              evalDate,
            ],
          },
        ],
      },
      { text: " ", margin: [0, 10] }, // Spacer
      {
        columns: [
          {
            width: "*",
            text: [
              { text: "Prof.:\n", bold: true },
              evaluation.teacherName,
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
              { text: "Descrizione", bold: true, alignment: "center" },
              { text: "Voto / Valore", bold: true },
            ],
            // Data Rows
            ...(evaluation.grid?.indicatori || [])
              .map((ind: Indicatore) => [
                ind.descrizione,
                `${ind.voto} / ${ind.valore}`,
              ]),
            // Footer Row for total
            [
              { text: "Voto Finale", bold: true, alignment: "right" },
              {
                text: calculateTotal(evaluation.grid?.indicatori),
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
      font: "Roboto", // PDFMake uses Roboto by default in vfs_fonts
    },
  };
}

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
