import { Router } from 'express';
import CryptoJS from 'crypto-js';

const router = Router();

// 암호화 키 가져오기
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY must be set');
}

interface TranslationRequest {
  text: string;
  sourceLang: 'ko' | 'en';
  targetLang: 'ko' | 'en';
}

// 암호화 함수
function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

// 복호화 함수
function decrypt(encryptedText: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

router.post('/translate', async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body as TranslationRequest;
    
    // 여기에 실제 번역 API 호출 로직 추가
    // 현재는 예시로 간단한 대체 구현
    const translatedText = sourceLang === 'ko' ? 
      `[EN] ${text}` : 
      `[KO] ${text}`;
    
    // 번역된 텍스트 암호화
    const encryptedTranslation = encrypt(translatedText);
    
    res.json({ 
      success: true,
      translatedText: encryptedTranslation
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export default router;
