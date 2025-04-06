import { Question } from '../services/api';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

export const formatAnswerByQuestionType = (question: Question, answerValue: any): string => {
  switch (question.type) {
    case 'checkbox':
      return Array.isArray(answerValue) ? answerValue.join(', ') : String(answerValue);

    case 'matrix':
      if (typeof answerValue === 'object' && answerValue !== null) {
        return Object.entries(answerValue)
          .map(([key, value]) => {
            const rowTitle = question.rows?.find((r: any) => r.value === key)?.text || key;
            const colTitle = question.columns?.find((c: any) => c.value === value)?.text || value;
            return `${rowTitle}: ${colTitle}`;
          })
          .join(', ');
      }
      return String(answerValue);

    case 'rating':
      const rating = Number(answerValue);
      if (rating === 1 && question.minRateDescription) {
        return `${rating} (${question.minRateDescription})`;
      } else if (rating === question.rateMax && question.maxRateDescription) {
        return `${rating} (${question.maxRateDescription})`;
      }
      return String(rating);

    case 'file':
      return answerValue ? 'Đã tải tệp tin' : 'Không có tệp tin';

    case 'radiogroup':
    case 'dropdown':
    case 'text':
    case 'comment':
    default:
      return String(answerValue);
  }
};

export const generateQuestionsAndAnswers = (
  questions: Question[],
  answers: Record<string, any>[],
) => {
  const elements: any[] = [];

  questions.forEach((question, index) => {
    elements.push(
      new Paragraph({
        text: `${index + 1}. ${question.title || question.name}`,
        heading: HeadingLevel.HEADING_4,
        spacing: { before: 300, after: 200 },
      }),
    );

    if (answers.length > 0) {
      answers.forEach((answer: { [x: string]: any }, respIndex: number) => {
        const answerValue = answer[question.name];

        if (answerValue === undefined) {
          return;
        }

        const formattedAnswer = formatAnswerByQuestionType(question, answerValue);

        elements.push(
          new Paragraph({
            text: `Phản hồi #${respIndex + 1}: ${formattedAnswer}`,
            spacing: { before: 100, after: 100 },
          }),
        );
      });
    } else {
      elements.push(
        new Paragraph({
          text: 'Không có phản hồi nào cho câu hỏi này',
          spacing: { before: 100, after: 100 },
        }),
      );
    }
  });

  return elements;
};

export interface DocumentGeneratorProps {
  surveyTitle: string;
  surveyDescription?: string;
  aiSummary?: string;
  questions: Question[];
  answers: Record<string, any>[];
}

export const generateDocumentContent = ({
  surveyTitle,
  surveyDescription,
  aiSummary,
  questions,
  answers,
}: DocumentGeneratorProps) => {
  return {
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: `Báo cáo khảo sát: ${surveyTitle}`,
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: surveyDescription || 'Không có mô tả',
            spacing: { before: 200, after: 200 },
          }),
          new Paragraph({
            text: 'Tóm tắt AI',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
          }),
          new Paragraph({
            text: aiSummary || 'Chưa có tóm tắt AI',
            spacing: { before: 200, after: 400 },
          }),
          new Paragraph({
            text: 'Chi tiết phản hồi',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
          }),
          ...generateQuestionsAndAnswers(questions, answers),
        ],
      },
    ],
  };
};

export const exportSurveyReport = async (
  documentProps: DocumentGeneratorProps,
  fileName: string,
  onSuccess?: () => void,
  onError?: (error: any) => void,
) => {
  try {
    const doc = new Document(generateDocumentContent(documentProps));
    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, fileName);
    onSuccess?.();
  } catch (error) {
    console.error('Lỗi xuất báo cáo:', error);
    onError?.(error);
  }
};
