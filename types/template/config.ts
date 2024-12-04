// - config.ts (template configuration types)

export interface TemplateConfig {
    inputSchema: JSONSchema7;
    outputFormat: OutputFormat;
    llmPreferences: LLMPreferences;
    defaultParams: LLMModelParams;
  }