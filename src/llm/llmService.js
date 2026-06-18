'use strict';

require('dotenv').config();
const OpenAI = require('openai');

const SYSTEM_PROMPT = `You are a senior QA automation engineer. Your job is to generate structured test cases from either a URL or a user story.

Return ONLY a valid JSON object with this exact structure:
{
  "test_cases": [
    {
      "title": "string - descriptive test name",
      "steps": ["array", "of", "plain", "English", "steps"],
      "expected": "string - what success looks like",
      "selectors": {
        "description": "string - hints about what elements to target"
      }
    }
  ]
}

Rules:
- Generate between 3 and 6 test cases covering the happy path and edge cases
- Steps must be actionable and specific (navigate, click, fill, verify)
- Expected results must be observable and verifiable
- Include at least one negative/edge case test
- Do not include any text outside the JSON object`;

class LLMService {
  constructor() {
    this.useMock = process.env.USE_MOCK_LLM === 'true' || !process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    if (!this.useMock) {
      this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  async generateTestCases(input) {
    if (this.useMock) {
      console.log('  [LLM] Running in mock mode (no API key required)');
      return this._mockResponse(input);
    }

    console.log(`  [LLM] Calling OpenAI (${this.model})...`);
    return this._callOpenAI(input);
  }

  async _callOpenAI(input) {
    const userPrompt = input.startsWith('http')
      ? `Generate test cases for this URL: ${input}`
      : `Generate test cases for this user story: ${input}`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  }

  _mockResponse(input) {
    const isUrl = input.startsWith('http');
    const context = isUrl ? `the page at ${input}` : input;

    return {
      test_cases: [
        {
          title: 'Page loads and displays main content',
          steps: [
            `Navigate to ${isUrl ? input : 'the application'}`,
            'Wait for the page to fully load',
            'Verify the main heading is visible',
            'Verify no console errors are present',
          ],
          expected: 'Page loads successfully with visible main content and no errors',
          selectors: {
            description: 'Target h1 or main heading element, check body for content',
          },
        },
        {
          title: 'Navigation links are functional',
          steps: [
            `Navigate to ${isUrl ? input : 'the application'}`,
            'Identify all navigation links in the header',
            'Click the first navigation link',
            'Verify the URL changes or content updates',
          ],
          expected: 'Navigation links respond to clicks and route correctly',
          selectors: {
            description: 'Target nav a, header a, or [role="navigation"] links',
          },
        },
        {
          title: 'Page is responsive on mobile viewport',
          steps: [
            'Set viewport to 375x667 (iPhone SE)',
            `Navigate to ${isUrl ? input : 'the application'}`,
            'Verify main content is visible and not overflowing',
            'Verify text is readable without horizontal scrolling',
          ],
          expected: 'Layout adapts to mobile viewport with no overflow or broken elements',
          selectors: {
            description: 'Check body overflow, main content containers',
          },
        },
        {
          title: 'Interactive elements are accessible via keyboard',
          steps: [
            `Navigate to ${isUrl ? input : 'the application'}`,
            'Press Tab to focus the first interactive element',
            'Verify focus indicator is visible',
            'Continue tabbing through interactive elements',
          ],
          expected: 'All interactive elements are reachable via keyboard with visible focus states',
          selectors: {
            description: 'Focus on buttons, links, and form inputs',
          },
        },
        {
          title: 'Page title and meta information are present',
          steps: [
            `Navigate to ${isUrl ? input : 'the application'}`,
            'Check the document title is not empty',
            'Verify the page has a meaningful title tag',
          ],
          expected: 'Page has a descriptive, non-empty title tag',
          selectors: {
            description: 'Use page.title() to retrieve document title',
          },
        },
      ],
    };
  }
}

module.exports = LLMService;
