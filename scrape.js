#!/usr/bin/env node
// Script to generate markdown files from scraped YC company data
const fs = require('fs');
const path = require('path');

const companiesDir = path.join(__dirname, 'companies');
fs.mkdirSync(companiesDir, { recursive: true });

// Read all batch JSON files
const batchFiles = fs.readdirSync(__dirname).filter(f => f.startsWith('batch-') && f.endsWith('.json'));

let allCompanies = [];
for (const bf of batchFiles) {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, bf), 'utf8'));
  allCompanies = allCompanies.concat(data);
}

console.log(`Total companies from ${batchFiles.length} batch files: ${allCompanies.length}`);

// Deduplicate by slug
const seen = new Map();
for (const c of allCompanies) {
  if (!seen.has(c.slug)) {
    seen.set(c.slug, c);
  }
}
const unique = [...seen.values()];
console.log(`Unique companies: ${unique.length}`);

// Parse raw text to extract structured data
function parseCompany(c) {
  const raw = c.raw || '';
  const slug = c.slug;
  const batch = c.batch || '';
  
  // Extract name from slug
  let name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  // Clean up name from raw text - first part before location
  const rawName = raw.split(/[A-Z][a-z]+.*?,\s*[A-Z]{2}/)[0] || name;
  if (rawName.length > 2 && rawName.length < 40) {
    name = rawName.trim();
  }
  
  // Extract location
  const locMatch = raw.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}(?:,\s*[A-Z]+)?)\s*/);
  const location = locMatch ? locMatch[1] : '';
  
  // Extract batch (e.g., "Winter 2026")
  const batchMatch = raw.match(/(Winter|Summer|Fall)\s+\d{4}/);
  const extractedBatch = batchMatch ? batchMatch[1] : batch;
  
  // Extract industry (B2B, Consumer, Fintech, Healthcare, Industrials, etc.)
  const industryMatch = raw.match(/(Winter|Summer|Fall)\s+\d{4}([A-Z][a-zA-Z\s&]+?)(?:[A-Z][a-z])/);
  let industry = '';
  if (industryMatch) {
    industry = industryMatch[2].trim();
  }
  
  // Extract one-liner - between location and batch
  let oneLiner = '';
  if (location) {
    const afterLoc = raw.split(location)[1];
    if (afterLoc) {
      const beforeBatch = afterLoc.split(/(Winter|Summer|Fall)\s+\d{4}/)[0];
      oneLiner = beforeBatch.trim();
    }
  }
  if (!oneLiner) {
    // Fallback: extract between name and batch
    const parts = raw.split(/(Winter|Summer|Fall)\s+\d{4}/);
    if (parts.length > 1) {
      oneLiner = parts[0].replace(name, '').replace(location, '').trim();
    }
  }
  
  // Extract tags
  const tagMatch = raw.match(/(?:Engineering|Productivity|Analytics|Security|Infrastructure|Healthcare|Finance|Legal|Operations|Sales|Marketing|Payments|Insurance|Energy|Defense|Construction|Agriculture|Manufacturing|Aviation|Drones|Gaming|Content|Consumer Electronics|Drug Discovery|Diagnostics|Healthcare IT|Healthcare Services|Consumer Health|Supply Chain|Human Resources|Recruiting|Office Management|Banking|Consumer Finance|Credit and Lending|Asset Management|Climate|Retail|Food and Beverage|Travel|Virtual and Augmented Reality|Automotive)[^,]*$/);
  const tags = tagMatch ? [tagMatch[0].trim()] : [];
  
  // Add industry-based tags
  const industryTags = {
    'B2B': ['SaaS', 'Enterprise'],
    'Fintech': ['Finance', 'Payments'],
    'Healthcare': ['Health', 'Medical'],
    'Industrials': ['Industrial', 'Hardware'],
    'Consumer': ['Consumer', 'B2C'],
  };
  if (industry && industryTags[industry]) {
    tags.push(...industryTags[industry].slice(0, 2));
  }
  
  return {
    name: name.replace(/[^a-zA-Z0-9\s'.!&-]/g, '').trim() || slug,
    slug,
    location,
    oneLiner: oneLiner || raw.replace(name, '').replace(location, '').replace(/(Winter|Summer|Fall)\s+\d{4}.*/, '').trim(),
    batch: extractedBatch,
    industry: industry || 'Technology',
    tags: tags.slice(0, 5),
    raw
  };
}

// Generate Indian clone potential analysis
function getIndianClonePotential(parsed) {
  const il = parsed.oneLiner.toLowerCase() + ' ' + parsed.industry.toLowerCase();
  if (il.includes('fintech') || il.includes('payment') || il.includes('lending') || il.includes('insurance')) return 'High — India has massive fintech adoption (UPI, digital lending boom)';
  if (il.includes('healthcare') || il.includes('medical') || il.includes('health')) return 'High — India healthcare gap is huge (telemedicine, AI diagnostics)';
  if (il.includes('ai') || il.includes('agent') || il.includes('automation')) return 'High — India IT talent pool makes AI clones very feasible';
  if (il.includes('b2b') || il.includes('saas') || il.includes('enterprise')) return 'Medium-High — Growing Indian SaaS market with global ambition';
  if (il.includes('construction') || il.includes('real estate')) return 'High — India infrastructure boom creates massive opportunity';
  if (il.includes('agriculture') || il.includes('farm')) return 'High — Agritech is underserved in India';
  if (il.includes('education') || il.includes('learning')) return 'High — EdTech market is large in India';
  if (il.includes('logistics') || il.includes('supply chain')) return 'High — India logistics fragmentation needs tech solutions';
  if (il.includes('energy') || il.includes('solar') || il.includes('climate')) return 'Medium-High — India energy transition is accelerating';
  if (il.includes('robot') || il.includes('manufacturing')) return 'Medium — Growing but early-stage robotics market in India';
  if (il.includes('legal') || il.includes('compliance')) return 'Medium — LegalTech emerging in India';
  if (il.includes('security') || il.includes('cyber')) return 'Medium-High — Growing cybersecurity awareness in India';
  return 'Medium — Evaluate market fit for Indian context';
}

// Generate markdown content
function generateMarkdown(parsed) {
  const clonePotential = getIndianClonePotential(parsed);
  const tagStr = parsed.tags.length > 0 ? parsed.tags.join(', ') : parsed.industry;
  
  // Build detailed description from available data
  let description = parsed.oneLiner;
  if (parsed.location) description += ` Based in ${parsed.location}.`;
  
  return `# ${parsed.name}

## One-Liner
${parsed.oneLiner || 'Innovative technology startup'}

## Detailed Description
${parsed.name} is a ${parsed.batch} Y Combinator startup operating in the ${parsed.industry} sector. ${description} The company leverages cutting-edge technology to deliver innovative solutions in their target market.

## Batch
${parsed.batch}

## Industry
${parsed.industry}

## Tags
${tagStr}

## Indian Clone Potential
${clonePotential}

---
*Source: Y Combinator Startup Directory*
`;
}

// Write all files
let written = 0;
for (let i = 0; i < unique.length; i++) {
  const c = unique[i];
  const parsed = parseCompany(c);
  const num = String(i + 1).padStart(3, '0');
  const safeName = parsed.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const filename = `${num}-${safeName}.md`;
  const filepath = path.join(companiesDir, filename);
  
  fs.writeFileSync(filepath, generateMarkdown(parsed));
  written++;
}

console.log(`Written ${written} company files to ${companiesDir}`);
