'use strict';

const fs = require('fs');
const path = require('path');
const LLMService = require('../llm/llmService');

const OUTPUT_DIR = path.resolve(__dirname, '../../tests/generated');

class TestCaseGenerator {
  constructor() {
    this.llm = new LLMService();
  }

  async generate(input) {
    this._ensureOutputDir();

    console.log(`\n→ Generating test cases for: "${input}"`);
    const result = await this.llm.generateTestCases(input);

    this._validateSchema(result);

    const filename = this._buildFilename(input);
    const outputPath = path.join(OUTPUT_DIR, filename);

    const output = {
      meta: {
        input,
        generatedAt: new Date().toISOString(),
        totalCases: result.test_cases.length,
      },
      ...result,
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`✓ Saved ${result.test_cases.length} test cases → ${outputPath}`);

    return { outputPath, testCases: result.test_cases };
  }

  _validateSchema(result) {
    if (!result.test_cases || !Array.isArray(result.test_cases)) {
      throw new Error('LLM response missing "test_cases" array');
    }

    result.test_cases.forEach((tc, index) => {
      if (!tc.title) throw new Error(`Test case ${index} missing "title"`);
      if (!Array.isArray(tc.steps)) throw new Error(`Test case "${tc.title}" missing "steps" array`);
      if (!tc.expected) throw new Error(`Test case "${tc.title}" missing "expected"`);
    });
  }

  _buildFilename(input) {
    const isUrl = input.startsWith('http');
    const slug = isUrl
      ? new URL(input).hostname.replace(/\./g, '-')
      : input
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .slice(0, 40);
    const timestamp = Date.now();
    return `test-cases-${slug}-${timestamp}.json`;
  }

  _ensureOutputDir() {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
  }
}

module.exports = TestCaseGenerator;
