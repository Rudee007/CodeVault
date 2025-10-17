// src/pages/SnippetWizard.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
// ✅ Import react-feather components instead of feather-icons
import { ArrowLeft, ChevronLeft, ChevronRight, Save, Code, Edit, Check } from "react-feather";
import CodeInputStep from '../components/CodeInputStep';
import MetadataStep from '../components/MetadataStep';
import ReviewStep from '../components/ReviewStep';
import { snippetService } from "../services/snippetService";


const LANGUAGE_OPTIONS = [
  "javascript", "typescript", "python", "java", "csharp", "cpp", "c", 
  "php", "ruby", "go", "rust", "sql", "html", "css", "json", "yaml", "xml"
];


const CATEGORIES = [
  "algorithm", "function", "class", "component", "utility", "api", "database", 
  "frontend", "backend", "data-science", "mobile", "devops", "other"
];


const COMPLEXITIES = ["beginner", "intermediate", "advanced"];


export default function SnippetWizard({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id !== "new";
  
  // Wizard state - Only 3 steps now
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true); // AI toggle state
  const [analyzing, setAnalyzing] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    programmingLanguage: "",
    summary: "",
    tags: [],
    frameworks: [],
    libraries: [],
    topics: [],
    category: "other",
    domain: "other", 
    complexity: "beginner",
    visibility: "private",
    notes: "",
    attributes: {}
  });

  // ✅ Icon mapping for dynamic rendering
  const iconComponents = {
    code: Code,
    edit: Edit,
    check: Check
  };

  const steps = [
    { id: 1, title: "Add Code", icon: "code", desc: "Enter your code" },
    { id: 2, title: "Metadata", icon: "edit", desc: "Fill details" },
    { id: 3, title: "Review", icon: "check", desc: "Final review" }
  ];

  // ✅ REMOVED: feather.replace() useEffect - no longer needed

  useEffect(() => {
    if (isEditMode && id !== "new") {
      loadExistingSnippet();
    }
  }, [id, isEditMode]);


  // Load existing snippet for editing
  const loadExistingSnippet = async () => {
    try {
      setLoading(true);
      const response = await snippetService.getSnippet(id);
      const snippet = response.data.snippet;
      
      setFormData({
        title: snippet.title || "",
        content: snippet.content || "",
        programmingLanguage: snippet.programmingLanguage || "",
        summary: snippet.summary || "",
        tags: snippet.tags || [],
        frameworks: snippet.frameworks || [],
        libraries: snippet.libraries || [],
        topics: snippet.topics || [],
        category: snippet.category || "other",
        domain: snippet.domain || "other",
        complexity: snippet.complexity || "beginner",
        visibility: snippet.visibility || "private",
        notes: snippet.notes || "",
        attributes: snippet.attributes || {}
      });
      
      setCurrentStep(2); // Skip to metadata for editing
    } catch (error) {
      showToast("Failed to load snippet", true);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };


  // Auto-detect language
  const detectLanguage = (code) => {
    const patterns = {
      javascript: /function\s*\(|=>\s*{|console\.log|document\.|import.*from|const\s+\w+/,
      typescript: /interface\s+\w+|type\s+\w+\s*=|:\s*(string|number|boolean)/,
      python: /def\s+\w+\s*\(|print\s*\(|if\s+__name__|import\s+\w+/,
      java: /public\s+class|public\s+static\s+void|System\.out/,
      csharp: /using\s+System|public\s+class|Console\.WriteLine/,
      html: /<\/?[a-z][\s\S]*>/i,
      css: /\{[^}]*\}/,
      sql: /SELECT\s+.*FROM|INSERT\s+INTO|UPDATE\s+.*SET/i,
      json: /^\s*[\{\[]/
    };


    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(code)) {
        return lang;
      }
    }
    return "";
  };


  // Process with AI - Only fill empty fields
  const processWithAI = async () => {
    if (!formData.content.trim()) {
      showToast("Please add code first", true);
      return;
    }


    try {
      setAnalyzing(true);
      showToast("AI is analyzing your code...");


      // Auto-detect language if empty
      if (!formData.programmingLanguage) {
        const detected = detectLanguage(formData.content);
        if (detected) {
          setFormData(prev => ({ ...prev, programmingLanguage: detected }));
        }
      }


      // Call AI services for missing data only
      const aiPromises = [];
      
      // Only generate description if summary is empty
      if (!formData.summary.trim()) {
        aiPromises.push(
          snippetService.generateAI({
            code: formData.content,
            language: formData.programmingLanguage || 'javascript',
            type: 'summary'
          }).then(res => ({ type: 'summary', data: res.data.result }))
        );
      }


      // Only generate tags if empty
      if (formData.tags.length === 0) {
        aiPromises.push(
          snippetService.generateAI({
            code: formData.content,
            language: formData.programmingLanguage || 'javascript',
            type: 'tags'
          }).then(res => ({ type: 'tags', data: res.data.result }))
        );
      }


      // Execute AI calls
      const aiResults = await Promise.all(aiPromises);


      // Apply AI results only to empty fields
      const updates = {};
      aiResults.forEach(result => {
        if (result.type === 'summary' && !formData.summary.trim()) {
          updates.summary = result.data;
        }
        if (result.type === 'tags' && formData.tags.length === 0) {
          updates.tags = Array.isArray(result.data) ? result.data : [];
        }
      });


      // Detect frameworks and libraries if empty
      if (formData.frameworks.length === 0) {
        updates.frameworks = detectFrameworksFromCode(formData.content, formData.programmingLanguage);
      }
      if (formData.libraries.length === 0) {
        updates.libraries = detectLibrariesFromCode(formData.content, formData.programmingLanguage);
      }


      // Auto-suggest category if still "other"
      if (formData.category === "other") {
        updates.category = suggestCategory(updates.frameworks || [], updates.libraries || [], formData.content);
      }


      // Auto-suggest complexity if still "beginner"
      if (formData.complexity === "beginner") {
        updates.complexity = suggestComplexity(formData.content);
      }


      // Apply updates
      if (Object.keys(updates).length > 0) {
        setFormData(prev => ({ ...prev, ...updates }));
        showToast(`AI filled ${Object.keys(updates).length} missing fields!`);
      } else {
        showToast("All fields already filled - no AI assistance needed!");
      }


    } catch (error) {
      console.error('AI processing failed:', error);
      showToast("AI analysis failed, but you can continue manually", true);
    } finally {
      setAnalyzing(false);
    }
  };


  // Helper functions for AI processing
  const detectFrameworksFromCode = (code, language) => {
    const patterns = {
      javascript: {
        'react': /import.*react|from ['"]react['"]|useState|useEffect|jsx/i,
        'vue': /import.*vue|from ['"]vue['"]|v-|@click/i,
        'express': /express\(\)|app\.get|app\.post/i,
        'nextjs': /next\/|getStaticProps/i,
      },
      python: {
        'django': /from django|django\./i,
        'flask': /from flask|Flask\(/i,
        'fastapi': /from fastapi|FastAPI\(/i,
        'pandas': /import pandas|pd\./i,
      }
    };


    const detected = [];
    const langPatterns = patterns[language?.toLowerCase()];
    if (langPatterns) {
      Object.entries(langPatterns).forEach(([framework, pattern]) => {
        if (pattern.test(code)) detected.push(framework);
      });
    }
    return detected;
  };


  const detectLibrariesFromCode = (code, language) => {
    const importMatches = code.match(/import.*from ['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\)/g) || [];
    return importMatches
      .map(match => match.match(/['"]([^'"]+)['"]/)?.[1])
      .filter(lib => lib && !lib.startsWith('.') && !lib.startsWith('/'))
      .map(lib => lib.split('/')[0])
      .slice(0, 5);
  };


  const suggestCategory = (frameworks, libraries, code) => {
    if (frameworks.some(f => ['react', 'vue', 'angular'].includes(f))) return 'frontend';
    if (frameworks.some(f => ['express', 'django', 'flask'].includes(f))) return 'backend';
    if (libraries.some(l => ['pandas', 'numpy'].includes(l))) return 'data-science';
    if (code.includes('function')) return 'function';
    return 'other';
  };


  const suggestComplexity = (code) => {
    const lines = code.split('\n').length;
    const hasComplexPatterns = /class|async|await|try|catch|interface/.test(code);
    
    if (lines > 50 || hasComplexPatterns) return 'advanced';
    if (lines > 20) return 'intermediate';
    return 'beginner';
  };


  // Navigation
  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.content.trim()) {
        showToast("Please add some code first", true);
        return;
      }
      
      // Process with AI if enabled, then move to next step
      if (aiEnabled) {
        processWithAI().then(() => setCurrentStep(2));
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep < 3) {
      setCurrentStep(curr => curr + 1);
    }
  };


  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(curr => curr - 1);
    }
  };


  // Save snippet
  // Save snippet with better error logging
const saveSnippet = async () => {
  if (!formData.title.trim() || !formData.content.trim()) {
    showToast("Title and code are required", true);
    return;
  }

  try {
    setLoading(true);
    
    // ✅ Ensure arrays are never undefined
const snippetData = {
  title: formData.title.trim(),
  code: formData.content,
  language: formData.programmingLanguage || 'other',
  tags: formData.tags || [],           // ✅ Default to empty array
  frameworks: formData.frameworks || [], // ✅ Default to empty array
  libraries: formData.libraries || [],   // ✅ Default to empty array
  topics: formData.topics || [],         // ✅ Default to empty array
  category: formData.category,
  domain: formData.domain,
  complexity: formData.complexity,
  visibility: formData.visibility,
  documentation: formData.summary?.trim() || '',  // ✅ Default to empty string
  notes: formData.notes?.trim() || ''             // ✅ Default to empty string
};

    // ✅ Log the exact data being sent
    console.log('📦 Sending snippet data:', JSON.stringify(snippetData, null, 2));
    console.log('🔑 Token in localStorage:', localStorage.getItem('cv_token') ? 'EXISTS' : 'MISSING');

    if (isEditMode) {
      await snippetService.updateSnippet(id, snippetData);
      showToast("Snippet updated successfully!");
    } else {
      await snippetService.createSnippet(snippetData);
      showToast("Snippet created successfully!");
    }
    
    setTimeout(() => navigate("/dashboard"), 1000);
  } catch (error) {
    // ✅ Log detailed error information
    console.error('💥 Full error object:', error);
    console.error('💥 Error response:', error.response);
    console.error('💥 Error response data:', error.response?.data);
    console.error('💥 Validation errors:', error.response?.data?.errors);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        'Failed to save snippet';
    
    // ✅ Show specific validation errors if available
    if (error.response?.data?.errors) {
      const validationErrors = error.response.data.errors;
      console.error('❌ Validation failed:', validationErrors);
      showToast(`Validation failed: ${JSON.stringify(validationErrors)}`, true);
    } else {
      showToast(errorMessage, true);
    }
  } finally {
    setLoading(false);
  }
};


  if (loading && isEditMode) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-indigo-950 to-cyan-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin"></div>
          <span className="text-indigo-300">Loading snippet...</span>
        </div>
      </div>
    );
  }


  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-indigo-950 to-cyan-900 text-white">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard" 
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {/* ✅ Replace with React component */}
              <ArrowLeft className="w-5 h-5 text-indigo-300" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {isEditMode ? "Edit Snippet" : "Create New Snippet"}
              </h1>
              <p className="text-indigo-300 text-sm mt-1">
                {aiEnabled ? "AI will help you organize your code" : "Manual entry mode"}
              </p>
            </div>
          </div>
          
          {/* AI Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300">AI Assistant</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>
        </div>


        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            {steps.map((step, index) => {
              // ✅ Get the icon component dynamically
              const IconComponent = iconComponents[step.icon];
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex items-center flex-col">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      currentStep >= step.id 
                        ? 'bg-indigo-500 border-indigo-500 text-white' 
                        : 'border-white/30 text-gray-400'
                    }`}>
                      {/* ✅ Use React component */}
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-white' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{step.desc}</div>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 transition-colors ${
                      currentStep > step.id ? 'bg-indigo-500' : 'bg-white/20'
                    }`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>


        {/* Step Content */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-8 min-h-[500px]">
          {/* Step 1: Code Input */}
          {currentStep === 1 && (
            <CodeInputStep 
              formData={formData}
              setFormData={setFormData}
              LANGUAGE_OPTIONS={LANGUAGE_OPTIONS}
              detectLanguage={detectLanguage}
              aiEnabled={aiEnabled}
              analyzing={analyzing}
            />
          )}


          {/* Step 2: Metadata */}
          {currentStep === 2 && (
            <MetadataStep 
              formData={formData}
              setFormData={setFormData}
              CATEGORIES={CATEGORIES}
              COMPLEXITIES={COMPLEXITIES}
              aiEnabled={aiEnabled}
            />
          )}


          {/* Step 3: Review */}
          {currentStep === 3 && (
            <ReviewStep 
              formData={formData}
              setFormData={setFormData}
              isEditMode={isEditMode}
            />
          )}
        </div>


        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {/* ✅ Replace with React component */}
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>


          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            {currentStep === 3 ? (
              <button
                onClick={saveSnippet}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    {/* ✅ Replace with React component */}
                    <Save className="w-4 h-4" />
                    {isEditMode ? "Update Snippet" : "Create Snippet"}
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={analyzing}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    AI Analyzing...
                  </>
                ) : (
                  <>
                    {currentStep === 1 ? (aiEnabled ? "Next (AI will help)" : "Next (Manual)") : "Next"}
                    {/* ✅ Replace with React component */}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
