import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";
import { Survey } from "src/surveys/entities/survey.entity";
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly genAI: GoogleGenAI;
  private readonly model: string = "gemini-2.0-flash";

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("GOOGLE_AI_API_KEY");
    if (!apiKey) {
      this.logger.warn(
        "GOOGLE_AI_API_KEY không được cấu hình. Tóm tắt AI sẽ không hoạt động."
      );
    } else {
      this.genAI = new GoogleGenAI({ apiKey });
    }
  }

  async generateSummary(survey: any, answers: any): Promise<string | null> {
    if (!this.genAI) {
      this.logger.warn(
        "Gemini API không được cấu hình. Không thể tạo tóm tắt AI."
      );
      return null;
    }

    try {
      const prompt = this.createPrompt(survey, answers);

      const model = this.genAI.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      const result = await model;

      if (!result.text) {
        this.logger.error("Không nhận được phản hồi từ Gemini API");
        return null;
      }

      return result.text;
    } catch (error) {
      this.logger.error(
        `Lỗi khi tạo tóm tắt AI: ${error.message}`,
        error.stack
      );
      return null;
    }
  }
  private createPrompt(survey: Survey, answers: any): string {
    return `
Hãy phân tích và tóm tắt các câu trả lời từ khảo sát sau đây:

Tiêu đề khảo sát: ${survey.title || "Không có tiêu đề"}
Mô tả: ${survey.description || "Không có mô tả"}

CÂU HỎI:
${JSON.stringify(answers)}
CÂU TRẢ LỜI:
${JSON.stringify(answers)}

Hãy cung cấp một bản tóm tắt ngắn gọn (khoảng 3-5 câu) về các điểm chính từ câu trả lời, bất kỳ xu hướng hoặc chủ đề nổi bật nào, và những hiểu biết quan trọng có thể thu được từ các phản hồi này.
`;
  }
}
