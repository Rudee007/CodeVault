// services/aiService.js
const axios = require('axios');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

class AIService {
  constructor() {
    this.hasApiKey = GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here';
  }

  async callGemini(prompt, temperature = 0.3) {
    try {
      if (!this.hasApiKey) {
        console.warn('⚠️  Gemini API key not configured. Using placeholder responses.');
        return 'AI analysis unavailable. Please configure GEMINI_API_KEY in .env file.';
      }

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: temperature,
            maxOutputTokens: 500,
          }
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      return response.data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
      console.error('Gemini API error:', error.response?.data || error.message);
      throw new Error('AI service unavailable');
    }
  }

  async generateDescription(code, language) {
    const prompt = `You are a technical documentation expert. Generate a clear, concise description for this ${language || 'code'} snippet that explains what the code does and its main purpose. Keep it under 200 words.\n\nCode:\n${code}`;

    try {
      return await this.callGemini(prompt);
    } catch (error) {
      return `This ${language || 'code'} snippet performs a specific operation. (AI analysis temporarily unavailable)`;
    }
  }

  async generateSummary(code, language) {
    const prompt = `Generate a very brief 1-2 sentence summary of what this ${language || 'code'} snippet does. Focus on the main functionality.\n\nCode:\n${code}`;

    try {
      return await this.callGemini(prompt, 0.2);
    } catch (error) {
      return `${language || 'Code'} snippet for common programming task.`;
    }
  }

  async generateExplanation(code, language) {
    const prompt = `Provide a detailed technical explanation of this ${language || 'code'} snippet, including how it works, key concepts, and best practices. Make it educational for developers.\n\nCode:\n${code}`;

    try {
      return await this.callGemini(prompt, 0.4);
    } catch (error) {
      return `Detailed explanation temporarily unavailable for this ${language || 'code'} snippet.`;
    }
  }

  async generateMetadata(code, language) {
    try {
      const [description, summary] = await Promise.all([
        this.generateDescription(code, language),
        this.generateSummary(code, language)
      ]);

      return {
        description,
        summary,
        generatedAt: new Date(),
        confidence: 0.85
      };
    } catch (error) {
      console.error('Generate metadata error:', error);
      return {
        description: 'AI-generated description unavailable',
        summary: 'Code snippet',
        generatedAt: new Date(),
        confidence: 0.1
      };
    }
  }

  async extractTags(code, language) {
    const prompt = `Extract relevant tags/keywords from this ${language || 'code'} snippet. Return ONLY a JSON array of strings, maximum 15 tags. Focus on technologies, frameworks, patterns, and concepts used.\n\nCode:\n${code}\n\nReturn format: ["tag1", "tag2", "tag3"]`;

    try {
      const response = await this.callGemini(prompt, 0.1);
      // Extract JSON array from response
      const jsonMatch = response.match(/\[.*\]/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      console.error('Extract tags error:', error);
      return [];
    }
  }

  async detectFrameworks(code, language) {
    // Simple pattern-based detection for common frameworks
    const frameworkPatterns = {
      javascript: {
        'react': /import.*react|from ['"]react['"]|useState|useEffect|jsx|<\w+/i,
        'vue': /import.*vue|from ['"]vue['"]|v-|@click|{{.*}}/i,
        'angular': /import.*@angular|component|@Injectable|ngOnInit/i,
        'express': /express\(\)|app\.get|app\.post|req\.|res\./i,
        'nextjs': /next\/|getStaticProps|getServerSideProps/i,
        'nodejs': /require\(|module\.exports|process\.env/i
      },
      typescript: {
        'react': /import.*react|from ['"]react['"]|useState|useEffect|jsx|<\w+/i,
        'vue': /import.*vue|from ['"]vue['"]|v-|@click/i,
        'angular': /import.*@angular|component|@Injectable|ngOnInit/i,
        'express': /express\(\)|app\.get|app\.post|req\.|res\./i,
        'nextjs': /next\/|getStaticProps|getServerSideProps/i,
        'nodejs': /require\(|module\.exports|process\.env/i
      },
      python: {
        'django': /from django|django\.|models\.Model|HttpResponse/i,
        'flask': /from flask|Flask\(__name__\)|@app\.route/i,
        'fastapi': /from fastapi|FastAPI\(\)|@app\.|async def/i,
        'pandas': /import pandas|pd\.|DataFrame/i,
        'numpy': /import numpy|np\.|array\(/i,
        'tensorflow': /import tensorflow|tf\.|keras/i,
        'pytorch': /import torch|torch\./i
      },
      java: {
        'spring': /import.*springframework|@SpringBootApplication|@RestController/i,
        'hibernate': /import.*hibernate|@Entity|SessionFactory/i
      },
      csharp: {
        'dotnet': /using System|namespace|class|public/i,
        'aspnet': /using.*AspNetCore|Controller|IActionResult/i
      }
    };

    const detected = [];
    const patterns = frameworkPatterns[language?.toLowerCase()];
    
    if (patterns) {
      for (const [framework, pattern] of Object.entries(patterns)) {
        if (pattern.test(code)) {
          detected.push(framework);
        }
      }
    }

    return detected;
  }

  async detectLibraries(code, language) {
    // Extract import statements and dependencies
    const libraries = [];
    
    if (language === 'javascript' || language === 'typescript') {
      const importMatches = code.match(/import.*from ['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\)/g);
      if (importMatches) {
        importMatches.forEach(match => {
          const lib = match.match(/['"]([^'"]+)['"]/)?.[1];
          if (lib && !lib.startsWith('.') && !lib.startsWith('/')) {
            libraries.push(lib.split('/')[0]);
          }
        });
      }
    } else if (language === 'python') {
      const importMatches = code.match(/import (\w+)|from (\w+) import/g);
      if (importMatches) {
        importMatches.forEach(match => {
          const lib = match.replace(/import |from | import.*/g, '');
          libraries.push(lib);
        });
      }
    }

    return [...new Set(libraries)];
  }

  async analyzeCode(code, language) {
    const analysis = {
      functions: [],
      classes: [],
      imports: [],
      variables: [],
      comments: [],
      lineCount: (code.match(/\n/g) || []).length + 1,
      characterCount: code.length
    };

    if (language === 'javascript' || language === 'typescript') {
      const functionMatches = code.match(/function\s+(\w+)|const\s+(\w+)\s*=.*=>|(\w+)\s*:\s*function/g);
      if (functionMatches) {
        analysis.functions = functionMatches.map(match => 
          match.replace(/function\s+|const\s+|=.*|:\s*function/g, '').trim()
        );
      }
      
      const classMatches = code.match(/class\s+(\w+)/g);
      if (classMatches) {
        analysis.classes = classMatches.map(match => match.replace('class ', ''));
      }
    } else if (language === 'python') {
      const functionMatches = code.match(/def\s+(\w+)/g);
      if (functionMatches) {
        analysis.functions = functionMatches.map(match => match.replace('def ', ''));
      }
      
      const classMatches = code.match(/class\s+(\w+)/g);
      if (classMatches) {
        analysis.classes = classMatches.map(match => match.replace('class ', ''));
      }
    }

    const commentMatches = code.match(/\/\/.*|\/\*[\s\S]*?\*\/|#.*/g);
    if (commentMatches) {
      analysis.comments = commentMatches.map(comment => comment.trim());
    }

    return analysis;
  }

  async assessQuality(code, language) {
    const metrics = {
      overall: 5,
      readability: 5,
      security: 5,
      performance: 5,
      maintainability: 5,
      lastAnalyzed: new Date()
    };

    const hasComments = /\/\/|\/\*|\#/.test(code);
    const hasProperIndentation = code.includes('  ') || code.includes('\t');
    const hasDescriptiveNames = !/\b[a-z]\b/.test(code);
    const isNotTooLong = code.length < 2000;
    const hasErrorHandling = /try|catch|except|error|Error/.test(code);

    metrics.readability = Math.min(10, 5 + 
      (hasComments ? 2 : 0) + 
      (hasProperIndentation ? 2 : 0) + 
      (hasDescriptiveNames ? 1 : 0)
    );

    metrics.maintainability = Math.min(10, 4 + 
      (hasComments ? 3 : 0) + 
      (isNotTooLong ? 2 : 0) + 
      (hasDescriptiveNames ? 1 : 0)
    );

    metrics.security = hasErrorHandling ? 7 : 5;
    metrics.performance = isNotTooLong ? 7 : 4;
    
    metrics.overall = Math.round(
      (metrics.readability + metrics.maintainability + 
       metrics.security + metrics.performance) / 4
    );

    return metrics;
  }
}

module.exports = new AIService();
