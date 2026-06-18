'use strict';

require('dotenv').config();

const { program } = require('commander');
const TestCaseGenerator = require('../generator/testCaseGenerator');
const PlaywrightRunner = require('../runner/playwrightRunner');

program
  .name('ai-test-generator')
  .description('Generate Playwright test cases from a URL or user story using AI')
  .version('1.0.0');

program
  .option('--url <url>', 'Target URL to generate tests for')
  .option('--story <story>', 'User story in natural language')
  .option('--spec-only', 'Only generate the Playwright spec (skip JSON output summary)')
  .action(async (options) => {
    const input = options.url || options.story;

    if (!input) {
      console.error('\n✗ Error: provide either --url <url> or --story "<text>"\n');
      console.error('  Examples:');
      console.error('    node generate-tests.js --url https://playwright.dev');
      console.error('    node generate-tests.js --story "The user logs in and views their dashboard"\n');
      process.exit(1);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  AI Test Case Generator');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      const generator = new TestCaseGenerator();
      const runner = new PlaywrightRunner();

      const { outputPath, testCases } = await generator.generate(input);
      const specPath = runner.generateSpec(outputPath);

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`  ✓ ${testCases.length} test cases generated`);
      console.log(`  ✓ Spec ready: ${specPath}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n  Run your tests with:\n');
      console.log('    npm test\n');
    } catch (err) {
      console.error(`\n✗ Generation failed: ${err.message}\n`);
      process.exit(1);
    }
  });

program.parse(process.argv);
