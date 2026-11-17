#!/usr/bin/env node
// Checks the question bank for defects that break gameplay: missing fields, duplicate
// options, an option equal to the answer, generator artifacts, and duplicate questions.
const fs = require('fs');

const file = process.argv[2] || 'backend/services.json';
const { catagory } = JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = [];
const seen = new Map();
const norm = (s) => s.trim().toLowerCase();

// Retired, sunset or closed-to-new-customer services, plus old names of renamed ones.
// Update this list when AWS publishes a service availability update.
const OUTDATED = new Set([
  'Alexa for Business', 'Amazon Augmented AI', 'Amazon Chime', 'Amazon CloudSearch', 'Amazon CodeGuru',
  'Amazon CodeWhisperer', 'Amazon Elastic Inference', 'Amazon Elastic Transcoder', 'Amazon FinSpace',
  'Amazon Forecast', 'Amazon Fraud Detector', 'Amazon Kendra', 'Amazon Lumberyard', 'Amazon Omics',
  'Amazon Pinpoint', 'Amazon Q Business', 'Amazon QuickSight', 'Amazon Quantum Ledger Database (QLDB)',
  'Amazon RDS on VMware', 'Amazon SageMaker Ground Truth', 'Amazon Sumerian', 'Amazon WorkDocs',
  'Amazon WorkLink', 'Amazon WorkMail', 'Apache MXNet on AWS', 'AWS App Mesh', 'AWS App Runner',
  'AWS Application Discovery Service', 'AWS Chatbot', 'AWS Cloud9', 'AWS CodeStar', 'AWS Copilot',
  'AWS Data Pipeline', 'AWS DeepComposer', 'AWS DeepLens', 'AWS DeepRacer', 'AWS Elemental MediaStore',
  'AWS Fault Injection Simulator', 'AWS Greengrass', 'AWS IoT 1-Click', 'AWS IoT Analytics',
  'AWS IoT Button', 'AWS IoT Events', 'AWS IoT Things Graph', 'AWS Mainframe Modernization',
  'AWS Managed Services', 'AWS Migration Hub', 'AWS OpsWorks', 'AWS Private 5G', 'AWS Proton',
  'AWS RoboMaker', 'AWS SimSpace Weaver', 'AWS Single Sign-On', 'AWS Snow Family', 'AWS Snowcone',
  'AWS Transfer for SFTP', 'CloudEndure Disaster Recovery', 'CloudEndure Migration',
].map(norm));

for (const [category, questions] of Object.entries(catagory)) {
  if (!/^[a-z0-9_]{1,50}$/.test(category)) errors.push(`${category}: invalid category name`);
  if (!Array.isArray(questions) || questions.length === 0) {
    errors.push(`${category}: no questions`);
    continue;
  }
  questions.forEach((q, i) => {
    const where = `${category}[${i}] ${JSON.stringify(q.question)}`;
    if (typeof q.question !== 'string' || !q.question.trim()) errors.push(`${where}: missing question`);
    if (typeof q.answer !== 'string' || !q.answer.trim()) errors.push(`${where}: missing answer`);
    if (!Array.isArray(q.distractors) || q.distractors.length !== 3) {
      errors.push(`${where}: needs exactly 3 distractors`);
      return;
    }
    const options = [q.answer, ...q.distractors];
    if (options.some((o) => typeof o !== 'string' || !o.trim())) errors.push(`${where}: empty option`);
    if (options.some((o) => /\bundefined\b/i.test(o))) errors.push(`${where}: option contains "undefined"`);
    if (new Set(options.map(norm)).size !== options.length) errors.push(`${where}: options are not unique`);
    const stale = options.filter((o) => typeof o === 'string' && OUTDATED.has(norm(o)));
    if (stale.length) errors.push(`${where}: outdated service ${stale.join(', ')}`);

    const key = `${norm(q.question)}|${norm(q.answer)}`;
    if (seen.has(key)) errors.push(`${where}: duplicate of ${seen.get(key)}`);
    else seen.set(key, `${category}[${i}]`);
  });
}

if (errors.length) {
  console.error(`${errors.length} problem(s) in ${file}:\n` + errors.join('\n'));
  process.exit(1);
}
console.log(`${file}: ${seen.size} questions OK`);
