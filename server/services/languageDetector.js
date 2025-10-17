// services/languageDetector.js
class LanguageDetector {
    constructor() {
      this.patterns = {
        javascript: {
          patterns: [
            /function\s*\(/,
            /var\s+\w+|let\s+\w+|const\s+\w+/,
            /=>\s*{|=>\s*\w/,
            /console\.log/,
            /document\.|window\./,
            /require\(|import\s+.*from/,
            /\.then\(|\.catch\(|async|await/
          ],
          extensions: ['.js', '.jsx', '.mjs'],
          weight: 1.0
        },
        
        typescript: {
          patterns: [
            /:\s*(string|number|boolean|any|void)/,
            /interface\s+\w+/,
            /type\s+\w+\s*=/,
            /export\s+(interface|type|enum)/,
            /import.*from.*\.ts/
          ],
          extensions: ['.ts', '.tsx'],
          weight: 1.0
        },
  
        python: {
          patterns: [
            /def\s+\w+\s*\(/,
            /import\s+\w+|from\s+\w+\s+import/,
            /if\s+__name__\s*==\s*['"']__main__['"']/,
            /print\s*\(/,
            /class\s+\w+.*:/,
            /elif\s+/,
            /:\s*$/m
          ],
          extensions: ['.py', '.pyw'],
          weight: 1.0
        },
  
        java: {
          patterns: [
            /public\s+(class|interface|enum)/,
            /public\s+static\s+void\s+main/,
            /System\.out\.print/,
            /import\s+java\./,
            /@Override|@Deprecated/,
            /throws\s+\w+Exception/
          ],
          extensions: ['.java'],
          weight: 1.0
        },
  
        csharp: {
          patterns: [
            /using\s+System/,
            /public\s+(class|interface|struct)/,
            /Console\.WriteLine/,
            /string\[\]\s+args/,
            /namespace\s+\w+/
          ],
          extensions: ['.cs'],
          weight: 1.0
        },
  
        cpp: {
          patterns: [
            /#include\s*<.*>/,
            /std::|using\s+namespace\s+std/,
            /cout\s*<<|cin\s*>>/,
            /int\s+main\s*\(/,
            /^\s*#define/m
          ],
          extensions: ['.cpp', '.cxx', '.cc', '.c++'],
          weight: 1.0
        },
  
        c: {
          patterns: [
            /#include\s*<stdio\.h>/,
            /printf\s*\(/,
            /int\s+main\s*\(/,
            /malloc\s*\(|free\s*\(/,
            /scanf\s*\(/
          ],
          extensions: ['.c', '.h'],
          weight: 1.0
        },
  
        php: {
          patterns: [
            /<\?php/,
            /echo\s+|print\s+/,
            /\$\w+/,
            /function\s+\w+\s*\(/,
            /class\s+\w+\s*{/
          ],
          extensions: ['.php'],
          weight: 1.0
        },
  
        ruby: {
          patterns: [
            /def\s+\w+/,
            /end\s*$/m,
            /puts\s+|print\s+/,
            /class\s+\w+/,
            /@\w+/,
            /require\s+['"']/
          ],
          extensions: ['.rb'],
          weight: 1.0
        },
  
        go: {
          patterns: [
            /package\s+main/,
            /func\s+\w+\s*\(/,
            /import\s+['"']/,
            /fmt\.Print/,
            /var\s+\w+\s+\w+/
          ],
          extensions: ['.go'],
          weight: 1.0
        },
  
        rust: {
          patterns: [
            /fn\s+main\s*\(/,
            /let\s+(mut\s+)?\w+/,
            /println!\s*\(/,
            /use\s+std::/,
            /struct\s+\w+\s*{/
          ],
          extensions: ['.rs'],
          weight: 1.0
        },
  
        sql: {
          patterns: [
            /SELECT\s+.*FROM/i,
            /INSERT\s+INTO/i,
            /UPDATE\s+.*SET/i,
            /DELETE\s+FROM/i,
            /CREATE\s+(TABLE|DATABASE|INDEX)/i,
            /DROP\s+(TABLE|DATABASE)/i
          ],
          extensions: ['.sql'],
          weight: 1.0
        },
  
        html: {
          patterns: [
            /<html.*>/i,
            /<head>|<\/head>/i,
            /<body>|<\/body>/i,
            /<div.*>|<\/div>/i,
            /<p>|<\/p>|<br\s*\/?>/i,
            /<!DOCTYPE html>/i
          ],
          extensions: ['.html', '.htm'],
          weight: 1.0
        },
  
        css: {
          patterns: [
            /\{\s*[\w-]+\s*:\s*[^}]+\s*\}/,
            /@media\s+/,
            /\.[\w-]+\s*\{/,
            /#[\w-]+\s*\{/,
            /@import\s+/
          ],
          extensions: ['.css'],
          weight: 1.0
        },
  
        json: {
          patterns: [
            /^\s*\{.*\}\s*$/s,
            /^\s*\[.*\]\s*$/s,
            /"[\w-]+"\s*:\s*/,
            /"\w+":\s*"[^"]*"/,
            /"\w+":\s*(true|false|null|\d+)/
          ],
          extensions: ['.json'],
          weight: 1.0
        },
  
        yaml: {
          patterns: [
            /^[\w-]+:\s*.*/m,
            /^\s*-\s+\w+/m,
            /^---\s*$/m,
            /^\s+[\w-]+:\s*/m
          ],
          extensions: ['.yml', '.yaml'],
          weight: 1.0
        },
  
        xml: {
          patterns: [
            /<\?xml.*\?>/,
            /<\/\w+>/,
            /<\w+.*\/>/,
            /<\w+.*>.*<\/\w+>/
          ],
          extensions: ['.xml'],
          weight: 1.0
        }
      };
    }
  
    async detect(code, filename = null) {
      const scores = {};
      
      // Check filename extension first
      if (filename) {
        const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        for (const [lang, config] of Object.entries(this.patterns)) {
          if (config.extensions.includes(ext)) {
            scores[lang] = (scores[lang] || 0) + 0.5;
          }
        }
      }
  
      // Pattern matching
      for (const [language, config] of Object.entries(this.patterns)) {
        let matches = 0;
        
        for (const pattern of config.patterns) {
          if (pattern.test(code)) {
            matches++;
          }
        }
        
        if (matches > 0) {
          scores[language] = (scores[language] || 0) + 
            (matches / config.patterns.length) * config.weight;
        }
      }
  
      // Find the best match
      let bestLang = 'other';
      let bestScore = 0;
      
      for (const [lang, score] of Object.entries(scores)) {
        if (score > bestScore) {
          bestScore = score;
          bestLang = lang;
        }
      }
  
      return {
        language: bestLang,
        confidence: Math.min(bestScore, 1.0),
        scores
      };
    }
  }
  
  module.exports = new LanguageDetector();
  