import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export async function* generateExplanationStream(keyword: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" },{baseUrl:"https://gemini.918113.top"});
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

export async function getRelatedKeywords(keyword: string,ref:string[]): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" },{baseUrl:"https://gemini.918113.top"});
    const prompt = `请从以下单词中推荐5个与拉丁语词汇"${keyword}"相关的其他拉丁语词汇，用英文逗号分隔:\n${ref.join(',')}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text.split(/[,，]/).map(item => item.trim()).filter(Boolean);
  } catch (error) {
    console.error('Gemini API调用失败:', error);
    return [];
  }
}

export async function* generateExampleStream(keyword: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" },{baseUrl:"https://gemini.918113.top"});
    const prompt = `请用中文为拉丁语词汇"${keyword}"生成一个在拉丁文诗歌中的用法示例，回答控制在100字以内`;
    
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
    yield '无法生成用例，请稍后再试';
  }
}