// /utils/llm-params.ts

type LLM = {
    name: string;
    description: string;
    defaultParams: {
      max_tokens: number;
      temperature: number;
      top_p: number;
      n: number;
    };
  };
  
  type LLMCategory = {
    theme: string;
    llms: LLM[];
  };
  
  // Define LLM categories and associated models
  const llmCategories: LLMCategory[] = [
    {
      theme: "Conversation",
      llms: [
        {
          name: "ChatGPT",
          description: "General-purpose conversational AI.",
          defaultParams: { max_tokens: 200, temperature: 0.7, top_p: 0.9, n: 1 },
        },
        {
          name: "Claude",
          description: "Focused on safety and helpfulness in dialogues.",
          defaultParams: { max_tokens: 300, temperature: 0.6, top_p: 0.85, n: 1 },
        },
        {
          name: "Bard",
          description: "Google’s conversational AI integrated with Workspace.",
          defaultParams: { max_tokens: 250, temperature: 0.75, top_p: 0.8, n: 1 },
        },
        {
          name: "BlenderBot",
          description: "Conversational AI with focus on dialogue.",
          defaultParams: { max_tokens: 200, temperature: 0.65, top_p: 0.9, n: 1 },
        },
        {
          name: "OpenAssistant",
          description: "Open-source conversational AI.",
          defaultParams: { max_tokens: 200, temperature: 0.7, top_p: 0.8, n: 1 },
        },
        {
          name: "Grok",
          description: "Integrated with X (formerly Twitter) for conversational tasks.",
          defaultParams: { max_tokens: 150, temperature: 0.6, top_p: 0.9, n: 1 },
        },
      ],
    },
    {
      theme: "Coding",
      llms: [
        {
          name: "Codex",
          description: "Specializes in generating and understanding code.",
          defaultParams: { max_tokens: 500, temperature: 0.5, top_p: 0.9, n: 1 },
        },
        {
          name: "GPT-Neo",
          description: "Open-source alternative for code tasks.",
          defaultParams: { max_tokens: 400, temperature: 0.7, top_p: 0.85, n: 1 },
        },
        {
          name: "GPT-J",
          description: "Focused on code and efficiency.",
          defaultParams: { max_tokens: 400, temperature: 0.65, top_p: 0.8, n: 1 },
        },
      ],
    },
    {
      theme: "Multilingual",
      llms: [
        {
          name: "LLaMA",
          description: "Handles multiple languages effectively.",
          defaultParams: { max_tokens: 300, temperature: 0.7, top_p: 0.85, n: 1 },
        },
        {
          name: "Bloom",
          description: "Open-access multilingual model.",
          defaultParams: { max_tokens: 300, temperature: 0.7, top_p: 0.9, n: 1 },
        },
        {
          name: "Tongyi Qianwen",
          description: "Enterprise-focused with multilingual support.",
          defaultParams: { max_tokens: 250, temperature: 0.75, top_p: 0.85, n: 1 },
        },
        {
          name: "Aleph Alpha",
          description: "AI with advanced support for European languages.",
          defaultParams: { max_tokens: 350, temperature: 0.65, top_p: 0.8, n: 1 },
        },
      ],
    },
    {
      theme: "Content Creation",
      llms: [
        {
          name: "Jasper",
          description: "Specializes in content and copy generation.",
          defaultParams: { max_tokens: 400, temperature: 0.75, top_p: 0.9, n: 1 },
        },
        {
          name: "Writer",
          description: "Enterprise LLM for personalized content creation.",
          defaultParams: { max_tokens: 350, temperature: 0.65, top_p: 0.85, n: 1 },
        },
        {
          name: "Claude",
          description: "Supports content generation with clarity and alignment.",
          defaultParams: { max_tokens: 300, temperature: 0.6, top_p: 0.85, n: 1 },
        },
        {
          name: "GPT-4",
          description: "Versatile content generation capabilities.",
          defaultParams: { max_tokens: 1000, temperature: 0.7, top_p: 0.9, n: 1 },
        },
      ],
    },
    {
      theme: "Image-Related",
      llms: [
        {
          name: "DALL-E",
          description: "Text-to-image generation capabilities.",
          defaultParams: { max_tokens: 0, temperature: 0.7, top_p: 0.9, n: 1 }, // Image models might not use max_tokens
        },
        {
          name: "Gemini",
          description: "Multi-modal, including image and text integration.",
          defaultParams: { max_tokens: 200, temperature: 0.8, top_p: 0.85, n: 1 },
        },
      ],
    },
    {
      theme: "General-Purpose",
      llms: [
        {
          name: "GPT-4",
          description: "Advanced general-purpose model.",
          defaultParams: { max_tokens: 1000, temperature: 0.7, top_p: 0.9, n: 1 },
        },
        {
          name: "Claude",
          description: "General-purpose with emphasis on ethical AI.",
          defaultParams: { max_tokens: 300, temperature: 0.6, top_p: 0.85, n: 1 },
        },
        {
          name: "Bard",
          description: "General-purpose conversational AI with task-specific support.",
          defaultParams: { max_tokens: 250, temperature: 0.75, top_p: 0.8, n: 1 },
        },
        {
          name: "LLaMA 2",
          description: "Flexible for multiple general use cases.",
          defaultParams: { max_tokens: 300, temperature: 0.7, top_p: 0.85, n: 1 },
        },
        {
          name: "NeMo",
          description: "Customizable for various purposes.",
          defaultParams: { max_tokens: 400, temperature: 0.7, top_p: 0.85, n: 1 },
        },
      ],
    },
    {
      theme: "Enterprise AI",
      llms: [
        {
          name: "Azure OpenAI Service",
          description: "OpenAI models with enterprise integration.",
          defaultParams: { max_tokens: 500, temperature: 0.7, top_p: 0.85, n: 1 },
        },
        {
          name: "Turing-NLG",
          description: "Microsoft’s enterprise-friendly LLM.",
          defaultParams: { max_tokens: 450, temperature: 0.7, top_p: 0.85, n: 1 },
        },
        {
          name: "Tongyi Qianwen",
          description: "Enterprise-ready with multilingual features.",
          defaultParams: { max_tokens: 250, temperature: 0.75, top_p: 0.85, n: 1 },
        },
        {
          name: "Writer",
          description: "Enterprise-focused content creation.",
          defaultParams: { max_tokens: 350, temperature: 0.65, top_p: 0.85, n: 1 },
        },
      ],
    },
    {
      theme: "Specialized Tasks",
      llms: [
        {
          name: "Command R",
          description: "Fine-tuned for retrieval-augmented generation.",
          defaultParams: { max_tokens: 300, temperature: 0.65, top_p: 0.9, n: 1 },
        },
        {
          name: "Flan",
          description: "Fine-tuned for zero-shot and task-specific capabilities.",
          defaultParams: { max_tokens: 400, temperature: 0.7, top_p: 0.85, n: 1 },
        },
        {
          name: "PALM",
          description: "Multi-modal AI for complex reasoning tasks.",
          defaultParams: { max_tokens: 600, temperature: 0.7, top_p: 0.9, n: 1 },
        },
        {
          name: "GPT-J",
          description: "Efficient LLM for specialized coding tasks.",
          defaultParams: { max_tokens: 400, temperature: 0.65, top_p: 0.8, n: 1 },
        },
        {
          name: "BigScience T0",
          description: "Fine-tuned for zero-shot learning.",
          defaultParams: { max_tokens: 500, temperature: 0.7, top_p: 0.9, n: 1 },
        },
        {
          name: "Mixtral",
          description: "Specialized in mixture-of-experts techniques.",
          defaultParams: { max_tokens: 400, temperature: 0.7, top_p: 0.85, n: 1 },
        },
        {
          name: "Mistral 7B",
          description: "High-performance open-access LLM.",
          defaultParams: { max_tokens: 600, temperature: 0.65, top_p: 0.9, n: 1 },
        },
      ],
    },
  ];
    
  // Function to classify prompts and return the best LLM with default parameters
  export function classifyPrompt(
    prompt: string
  ): { theme: string; llm: LLM } | null {
    if (!prompt) return null;
  
    // Example expanded classification logic
    const lowerPrompt = prompt.toLowerCase();
  
    if (lowerPrompt.includes("code") || lowerPrompt.includes("function")) {
      const category = llmCategories.find((cat) => cat.theme === "Coding");
      return category ? { theme: category.theme, llm: category.llms[0] } : null;
    }
  
    if (lowerPrompt.includes("translate") || lowerPrompt.includes("language")) {
      const category = llmCategories.find((cat) => cat.theme === "Multilingual");
      return category ? { theme: category.theme, llm: category.llms[0] } : null;
    }
  
    if (
      lowerPrompt.includes("content") ||
      lowerPrompt.includes("blog") ||
      lowerPrompt.includes("marketing")
    ) {
      const category = llmCategories.find(
        (cat) => cat.theme === "Content Creation"
      );
      return category ? { theme: category.theme, llm: category.llms[0] } : null;
    }
  
    if (lowerPrompt.includes("image") || lowerPrompt.includes("design")) {
      const category = llmCategories.find((cat) => cat.theme === "Image-Related");
      return category ? { theme: category.theme, llm: category.llms[0] } : null;
    }
  
    // Default to General-Purpose LLM
    const generalCategory = llmCategories.find(
      (cat) => cat.theme === "General-Purpose"
    );
    return generalCategory ? { theme: generalCategory.theme, llm: generalCategory.llms[0] } : null;
  }
  