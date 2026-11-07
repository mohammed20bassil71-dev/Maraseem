import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // Server-Side Gemini AI Assistant for Maraseem Invitations
  app.post('/api/ai/invitation-assistant', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server.',
        });
      }

      const {
        prompt,
        category = 'engagement',
        groomName = 'علي',
        brideName = 'تبارك',
        graduateName = 'د. أحمد',
        projectTitle = '',
        tone = 'royal_romantic',
        lang = 'ar',
      } = req.body || {};

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction =
        lang === 'ar'
          ? `أنت المستشار الإبداعي الذكي لمنصة «مراسيم – لكل دعوة حكاية» المتخصصة في تصميم الدعوات الإلكترونية الفاخرة في العراق والوطن العربي.
مهمتك مساعدة المستخدم في:
1. صياغة عبارات ترحيبية (welcomeQuote) ونصوص دعوة (invitationBody) بأسلوب أدبي راقٍ (رومانسي، ملكي، رسمي، أو تراثي عراقي).
2. اقتراح 3 عبارات إضافية متنوعة (رومانسية، رسمية، وتراثية دافئة).
3. اقتراح تنسيق الألوان المتناغمة مع هوية مراسيم (الحليبي، الفستقي، الذهبي الملكي، الزمردي، والوردي الدافئ) والخط العربي الأنسب.
4. تقديم 3 أفكار إبداعية لتجربة المناسبة التفاعلية.`
          : `You are the Creative AI Assistant for "Maraseem – Every Invitation Has a Story", a luxury digital invitation platform.
Provide refined invitation wording, 3 alternative quotes (romantic, formal, heritage), color & font recommendations, and 3 creative interactive event ideas.`;

      const userQuery = `نوع المناسبة: ${category}
النبرة المطلوبة: ${tone}
الأسماء/التفاصيل: ${groomName} & ${brideName} / ${graduateName} ${projectTitle ? `(${projectTitle})` : ''}
طلب المستخدم: ${prompt || 'أريد عبارات دعوة فخمة وتنسيق لوني ملكي وأفكار إبداعية للمناسبة'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userQuery,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestedTitle: {
                type: Type.STRING,
                description: 'Suggested title for the invitation card',
              },
              welcomeQuote: {
                type: Type.STRING,
                description: 'Poetic or Quranic or celebratory opening quote',
              },
              invitationBody: {
                type: Type.STRING,
                description: 'Main invitation wording paragraph',
              },
              romanticQuotes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 alternative romantic, formal, and Iraqi warm quotes',
              },
              recommendedTemplateCategory: {
                type: Type.STRING,
                description: 'Recommended template category ID',
              },
              colorHarmonyAdvice: {
                type: Type.STRING,
                description: 'Color palette and typography recommendation',
              },
              creativeIdeas: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 creative interactive ideas for the occasion',
              },
            },
            required: [
              'suggestedTitle',
              'welcomeQuote',
              'invitationBody',
              'romanticQuotes',
              'colorHarmonyAdvice',
              'creativeIdeas',
            ],
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      return res.json(parsed);
    } catch (error: any) {
      console.error('Gemini API error:', error?.message || error);
      return res.status(500).json({
        error: error?.message || 'Failed to generate AI invitation suggestions',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Maraseem server running on http://localhost:${PORT}`);
  });
}

startServer();
