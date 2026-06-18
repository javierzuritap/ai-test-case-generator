# AI Test Case Generator + Playwright Runner

> Turn a URL or a plain English user story into a complete Playwright test suite in seconds using OpenAI or a zero setup mock mode.

This tool helps create Playwright test cases automatically from a website URL or a user story. It generates structured test cases, converts them into executable Playwright tests, and lets you run them right away.

---

## What it does

```bash
$ node generate-tests.js --url https://playwright.dev

→ Generating test cases for: "https://playwright.dev"
  [LLM] Running in mock mode (no API key required)

✓ Saved 5 test cases → tests/generated/test-cases-playwright-dev-1234567890.json
✓ Playwright spec → tests/generated/generated-playwright-dev-1234567890.spec.js

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ 5 test cases generated
  ✓ Spec ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Run your tests with: npm test
```

---

## How the AI generates tests

1. **Input**
   Provide a URL with `--url` or a user story with `--story`.

2. **LLM call**
   `LLMService` sends a prompt to OpenAI and asks it to act like a senior QA engineer that returns structured JSON.

3. **Schema validation**
   `TestCaseGenerator` validates the response and catches invalid output before saving it.

4. **Code generation**
   `PlaywrightRunner` reads the JSON and converts each step into Playwright code such as `page.goto`, `page.locator`, and `expect`.

5. **Test execution**
   `npm test` runs all generated tests with retries, parallel execution, and HTML reports.

**Mock mode** works the same way without an API key, which makes it useful for demos, CI environments, or offline development.

---

## Stack

| Layer              | Technology                            |
| ------------------ | ------------------------------------- |
| Browser automation | Playwright Test `^1.40`               |
| AI and LLM         | OpenAI API (`gpt-4o-mini` by default) |
| Runtime            | Node.js 18+                           |
| CLI                | Commander.js                          |
| Config             | dotenv                                |
| CI and CD          | GitHub Actions                        |

---

## Project structure

```text
.
├── src/
│   ├── llm/
│   │   └── llmService.js
│   ├── generator/
│   │   └── testCaseGenerator.js
│   ├── runner/
│   │   └── playwrightRunner.js
│   └── cli/
│       └── index.js
├── tests/
│   └── generated/
├── .github/
│   └── workflows/
│       └── tests.yml
├── generate-tests.js
├── playwright.config.js
├── .env.example
└── package.json
```

---

## Local setup

**Requirements:** Node.js 18+

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ai-test-case-generator.git
cd ai-test-case-generator

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Create environment file
cp .env.example .env

# Add your OPENAI_API_KEY if you want to use OpenAI
# Leave it empty to use mock mode
```

---

## Running the project

### Generate tests from a URL

```bash
node generate-tests.js --url https://playwright.dev
```

### Generate tests from a user story

```bash
node generate-tests.js --story "The user logs in and adds a product to the cart"
```

### Force mock mode

```bash
USE_MOCK_LLM=true node generate-tests.js --url https://example.com
```

### Run all generated tests

```bash
npm test
```

### Run with a visible browser

```bash
npm run test:headed
```

### Open the HTML report

```bash
npm run test:report
```

---

## Example input and output

**Input**

```bash
node generate-tests.js --story "The user logs in and reviews their profile"
```

**Generated JSON**

```json
{
  "meta": {
    "input": "The user logs in and reviews their profile",
    "generatedAt": "2024-01-15T10:30:00.000Z",
    "totalCases": 5
  },
  "test_cases": [
    {
      "title": "Successful login with valid credentials",
      "steps": [
        "Navigate to the login page",
        "Fill in the email field with a valid email",
        "Fill in the password field",
        "Click the login button",
        "Verify the user is redirected to the dashboard"
      ],
      "expected": "User is authenticated and sees their dashboard",
      "selectors": {
        "description": "Target input[type='email'], input[type='password'], button[type='submit']"
      }
    }
  ]
}
```

**Generated Playwright spec**

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Generated Test Suite', () => {
  test('Successful login with valid credentials', async ({ page }) => {
    // Expected: User is authenticated and sees their dashboard
    await page.goto('https://example.com');
    await page.locator('input[type="email"]').first().fill('test-value');
    await page.locator('input[type="password"]').first().fill('test-value');
    await page.locator('button, [type="submit"]').first().click();
    expect(page.url()).not.toBe('about:blank');
  });
});
```

---

## CI and CD with GitHub Actions

The workflow in `.github/workflows/tests.yml` runs automatically on every push to `main` or `develop`.

It does the following:

1. Installs Node.js 20 and project dependencies.
2. Installs Playwright browsers and system dependencies.
3. Generates test cases using mock mode unless `OPENAI_API_KEY` is available.
4. Runs the Playwright suite with workers and retries.
5. Uploads the HTML report, JSON results, and generated test cases as artifacts.

To use your API key in GitHub Actions:

`Settings → Secrets and variables → Actions → New secret → OPENAI_API_KEY`

### Manual execution

The workflow also supports `workflow_dispatch`, so you can run it manually and provide a custom URL or user story directly from GitHub Actions.

---

## Playwright features

| Feature                | Config                          |
| ---------------------- | ------------------------------- |
| Parallel execution     | `fullyParallel: true`           |
| Automatic retries      | 2 retries in CI and 1 locally   |
| Screenshots on failure | `screenshot: 'only-on-failure'` |
| Video on failure       | `video: 'retain-on-failure'`    |
| Trace on first retry   | `trace: 'on-first-retry'`       |
| HTML report            | `playwright-report/`            |
| JSON results           | `test-results/results.json`     |
| Browsers               | Chromium and Firefox            |

---

## Why use this tool

This tool helps automate the process of creating and running browser tests.

Features include:

* OpenAI integration with a real mode and a mock mode.
* JSON validation before code generation.
* Automatic conversion from test cases to Playwright specs.
* Built in CI and CD support with reports and artifacts.
* A simple structure that separates AI logic, test generation, execution, and the command line interface.

---

## License

MIT
