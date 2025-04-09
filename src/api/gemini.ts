import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export async function* generateExplanationStream(keyword: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" },{baseUrl:"https://gemini.918113.top"});
    const prompt = `请用中文解释拉丁语词汇"${keyword}"的含义、词源和相关文化背景，回答控制在200字以内`;
    
    const result = await model.generateContentStream(prompt);
    let text = '';
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      await setTimeout(()=>{},500)
      text += chunkText;
      yield text;
    }
  } catch (error) {
    console.error('Gemini API调用失败:', error);
    yield '无法获取解释，请稍后再试';
  }
}