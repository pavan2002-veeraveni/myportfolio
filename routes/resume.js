/**
 * Resume Tailoring Route
 * Uses Groq AI to tailor the candidate's resume to a job description,
 * then generates an ATS-friendly PDF targeting 80-95% match score.
 */
const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const PDFDocument = require('pdfkit');
const config = require('../config');
const { asyncHandler } = require('../middleware/error-handler');
const { aiLimiter } = require('../middleware/security');

const router = Router();

// ─── Validation ───
const validateResume = [
    body('jobDescription')
        .isString()
        .trim()
        .isLength({ min: 50 })
        .withMessage('Job description must be at least 50 characters'),
];

// ─── Build ATS Prompt ───
function buildSystemPrompt(BASE_RESUME) {
    return `You are a Senior ATS (Applicant Tracking System) Expert with a 99% success rate in getting candidates past resume filters. Your goal is to achieve an ATS match score of 80-95% for the provided Job Description (JD) by optimizing ONLY the Summary, Skills, and Soft Skills.

CRITICAL CONSTRAINTS:
1. DO NOT modify education, experience bullets, project bullets, or certifications. These are static.
2. The user identifies as an "AI/ML Developer & Full Stack Developer". Mirror the JD's specific role title in the summary.
3. Write in a natural, professional human tone. Avoid generic AI "fluff".

EXPERT ATS STRATEGY:
- KEYWORD DENSITY: Identify the top 25 most important keywords (technologies, methodologies, soft skills, industries) from the JD.
- VERBATIM MATCHING: Use the EXACT terminology from the JD. If the JD says "Designing cloud-based RESTful APIs", do not say "Building web APIs". Use the exact phrase.
- 100% INCLUSION: Every technical skill mentioned in the JD that the candidate reasonably possesses (or is adjacent to their expertise) must appear at least once.

WHAT TO TAILOR:

1. SUMMARY (4-5 sentences + Core Expertise list):
   - Start with a strong role-based hook matching the JD's target position.
   - Naturally weave in 15+ keywords from the JD into the paragraph.
   - End the paragraph with a dedicated line: "Core Expertise: [List 10-12 most critical JD technical keywords, comma separated]."

2. SKILLS (Pack these with JD terms across 6 categories):
   - Languages: Mirror JD's preferred languages first.
   - Backend: Include specific frameworks and "Backend/Api Development" phrases from JD.
   - Web: Include exact frontend terms from JD.
   - AI/Data: Use exact model names, libraries, and "AI/ML" terminology from JD.
   - Database: Use exact DB names and "Data Management" terms.
   - Tools: Include version control (Git), IDEs, and any specific tools from JD.
   - USE EXACT PHRASES: If JD says "version control systems", include that exact phrase in Tools.

3. SOFT SKILLS: List 8-10 soft skills using EXACT JD language, separated by pipes "|".
   - Example: "Problem-solving | Agile Collaboration | Cross-functional Teamwork"

CANDIDATE'S BASE SKILLS (Use as foundation, expand with JD terms):
- Languages: ${BASE_RESUME.skills.languages}
- Backend: ${BASE_RESUME.skills.backend}
- Web: ${BASE_RESUME.skills.web}
- AI/Data: ${BASE_RESUME.skills.ai_data}
- Database: ${BASE_RESUME.skills.database}
- Tools: ${BASE_RESUME.skills.tools}

CANDIDATE INFO:
- Name: ${BASE_RESUME.name}
- Projects: Prescription Analysis System, Medical Calling Agent, Colorization, Smart Attendance

RESPOND WITH THIS EXACT JSON STRUCTURE:
{
  "summary": "Full professional paragraph + 'Core Expertise:' list",
  "skills": {
    "languages": "...",
    "backend": "...",
    "web": "...",
    "ai_data": "...",
    "database": "...",
    "tools": "..."
  },
  "tailored_soft_skills": "Skill 1 | Skill 2 | ..."
}`;
}

// ─── Generate PDF from tailored data ───
function generatePDF(tailored, BASE_RESUME, res) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Pavan_Kumar_Resume.pdf"');
        res.send(pdfBuffer);
        console.log('[RESUME] Tailored PDF sent successfully');
    });

    const MARGIN = 50;
    const PAGE_WIDTH = doc.page.width;
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
    const RIGHT_EDGE = MARGIN + CONTENT_WIDTH;

    // ════════════════════════════════════════════
    // HEADER — Name + Contact Info (centered, each on its own line)
    // ════════════════════════════════════════════
    doc.font('Helvetica-Bold').fontSize(16).text(BASE_RESUME.name, { align: 'center' });
    doc.moveDown(0.2);
    doc.font('Helvetica').fontSize(9);
    doc.text(`Email: ${BASE_RESUME.email} | Mobile No: ${BASE_RESUME.mobile} |`, { align: 'center' });
    doc.text(`LinkedIn: ${BASE_RESUME.linkedin} |`, { align: 'center', link: 'https://www.' + BASE_RESUME.linkedin });
    doc.text(`GitHub: ${BASE_RESUME.github}`, { align: 'center', link: 'https://' + BASE_RESUME.github });
    doc.moveDown(0.5);

    // ════════════════════════════════════════════
    // HELPERS
    // ════════════════════════════════════════════
    function sectionHeader(title) {
        // Smart page break: if less than 80pt left, start a new page
        const spaceLeft = doc.page.height - doc.y - MARGIN;
        if (spaceLeft < 80) {
            doc.addPage();
        }
        doc.moveDown(0.3);
        doc.font('Helvetica-Bold').fontSize(11).fillColor('black').text(title);
        doc.moveTo(MARGIN, doc.y).lineTo(RIGHT_EDGE, doc.y).lineWidth(1).stroke();
        doc.moveDown(0.2);
    }

    function bodyText(text) {
        doc.font('Helvetica').fontSize(9.5).fillColor('black').text(text, MARGIN, doc.y, {
            width: CONTENT_WIDTH,
            align: 'justify',
            lineGap: 1
        });
    }

    function bulletItem(text) {
        // Smart page break: if less than 40pt left, start a new page
        const spaceLeft = doc.page.height - doc.y - MARGIN;
        if (spaceLeft < 40) {
            doc.addPage();
        }
        const bulletX = MARGIN + 15;
        const textX = MARGIN + 30;
        const y = doc.y;
        doc.font('Helvetica').fontSize(9.5).fillColor('black');
        doc.text('•', bulletX, y);
        doc.text(text, textX, y, { width: CONTENT_WIDTH - 30, lineGap: 1 });
        // Sync Y position to prevent overlapping
        doc.x = MARGIN;
    }

    // Two-column skill row: bold label on left, value on right (matching user's format)
    function skillRow(label, value) {
        if (!value) return;
        // Smart page break for skill rows
        const spaceLeft = doc.page.height - doc.y - MARGIN;
        if (spaceLeft < 30) {
            doc.addPage();
        }
        const bulletX = MARGIN + 15;
        const labelX = MARGIN + 30;
        const valueX = MARGIN + 200;
        const y = doc.y;

        doc.font('Helvetica').fontSize(9.5).text('•', bulletX, y);
        doc.font('Helvetica-Bold').fontSize(9.5).text(label + ':', labelX, y);
        doc.font('Helvetica').fontSize(9.5).text(value, valueX, y, { width: CONTENT_WIDTH - 200, align: 'left' });
        doc.x = MARGIN;
        doc.moveDown(0.1);
    }

    // Right-aligned text on same line, handling wrapping correctly
    function twoColumnLine(leftText, rightText, leftBold, rightBold) {
        // Smart page break
        const spaceLeft = doc.page.height - doc.y - MARGIN;
        if (spaceLeft < 40) {
            doc.addPage();
        }
        const y = doc.y;
        const rightWidth = 130;
        const leftWidth = CONTENT_WIDTH - rightWidth - 10;

        // Render left text and record where it ends
        doc.font(leftBold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9.5)
            .text(leftText, MARGIN, y, { width: leftWidth });
        const leftEndY = doc.y; // Y after left text (may have wrapped)

        // Render right text at the original Y (same starting line)
        doc.font(rightBold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9.5)
            .text(rightText, MARGIN + leftWidth + 10, y, {
                width: rightWidth,
                align: 'right'
            });

        // Set Y to whichever text went further down
        doc.y = Math.max(leftEndY, doc.y);
        doc.x = MARGIN;
    }

    // ════════════════════════════════════════════
    // 1. PROFESSIONAL SUMMARY
    // ════════════════════════════════════════════
    sectionHeader('PROFESSIONAL SUMMARY');
    bodyText(tailored.summary || BASE_RESUME.summary);

    // ════════════════════════════════════════════
    // 2. TECHNICAL SKILLS (two-column bullet layout)
    // ════════════════════════════════════════════
    sectionHeader('TECHNICAL SKILLS');
    const sk = tailored.skills || BASE_RESUME.skills;
    skillRow('Programming Languages', sk.languages);
    skillRow('Backend and API DEVELOPMENT', sk.backend);
    skillRow('Web Technologies', sk.web);
    skillRow('AI/DATA PROCESSING', sk.ai_data);
    skillRow('Database', sk.database);
    skillRow('Developer tools', sk.tools);

    // ════════════════════════════════════════════
    // 3. INTERNSHIP EXPERIENCE
    // ════════════════════════════════════════════
    sectionHeader('INTERNSHIP EXPERIENCE');
    BASE_RESUME.experience.forEach((exp) => {
        twoColumnLine(exp.title, exp.date, true, false);
        doc.font('Helvetica-Bold').fontSize(9.5).text(exp.company);
        doc.moveDown(0.15);
        (exp.bullets || []).forEach(b => bulletItem(b));
        doc.moveDown(0.2);
    });

    // ════════════════════════════════════════════
    // 4. EDUCATION
    // ════════════════════════════════════════════
    sectionHeader('EDUCATION');
    twoColumnLine(BASE_RESUME.education.college, BASE_RESUME.education.years, false, false);
    twoColumnLine(BASE_RESUME.education.degree, `CGPA: ${BASE_RESUME.education.cgpa}`, false, false);

    // ════════════════════════════════════════════
    // 5. PROJECTS
    // ════════════════════════════════════════════
    sectionHeader('PROJECTS');
    BASE_RESUME.projects.forEach((proj, idx) => {
        if (idx > 0) doc.moveDown(0.2);
        // Title on its own line (bold), with date on the right
        const dateText = proj.date === 'Recent' ? '' : proj.date;
        if (dateText) {
            twoColumnLine(proj.title, dateText, true, false);
        } else {
            doc.font('Helvetica-Bold').fontSize(9.5).text(proj.title);
        }
        // Technologies on a separate line below the title
        doc.font('Helvetica-Bold').fontSize(9.5).text('Technologies: ', MARGIN, doc.y, { continued: true });
        doc.font('Helvetica').fontSize(9.5).text(proj.technologies);
        doc.moveDown(0.1);
        (proj.bullets || []).forEach(b => bulletItem(b));
    });

    // ════════════════════════════════════════════
    // 6. CERTIFICATIONS
    // ════════════════════════════════════════════
    sectionHeader('CERTIFICATIONS');
    BASE_RESUME.certifications.forEach(c => bulletItem(c));

    // ════════════════════════════════════════════
    // 7. SOFT SKILLS
    // ════════════════════════════════════════════
    sectionHeader('SOFT SKILLS');
    bodyText(tailored.tailored_soft_skills || BASE_RESUME.softSkills);

    doc.end();
}

// ─── Route Handler ───
router.post('/', aiLimiter, validateResume, asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { jobDescription } = req.body;
    console.log('[RESUME] Tailoring resume (ATS 80-95% target)...');

    // ─── Dynamic Load to Avoid Caching ───
    delete require.cache[require.resolve('../config/resume-data')];
    const BASE_RESUME = require('../config/resume-data');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.groq.apiKey}`,
        },
        body: JSON.stringify({
            model: config.groq.model,
            messages: [
                { role: 'system', content: buildSystemPrompt(BASE_RESUME) },
                { role: 'user', content: `Tailor my resume for this job description. Output ONLY valid JSON.\n\n${jobDescription}` },
            ],
            max_tokens: config.groq.resumeMaxTokens,
            temperature: 0.4,
        }),
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error(`[GROQ] Resume API error ${response.status}:`, errorData);
        return res.status(500).json({ error: 'AI service error. Please try again.' });
    }

    const data = await response.json();
    let aiContent = data.choices[0].message.content.trim();

    // Strip markdown code fences if present
    aiContent = aiContent.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();

    let tailored;
    try {
        const jsonStart = aiContent.indexOf('{');
        const jsonEnd = aiContent.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            const jsonString = aiContent.substring(jsonStart, jsonEnd + 1);
            tailored = JSON.parse(jsonString);
        } else {
            tailored = JSON.parse(aiContent);
        }
    } catch (parseErr) {
        console.error('[RESUME] Failed to parse AI response:', aiContent.substring(0, 500));
        return res.status(500).json({ error: 'AI returned an unexpected format. Please try again.' });
    }

    // ─── Sanitize: strip verbose AI explanations from skill values ───
    if (tailored.skills) {
        for (const key of Object.keys(tailored.skills)) {
            let val = tailored.skills[key];
            if (typeof val === 'string') {
                // Remove patterns like "Not specified in the job description, however, the candidate has: "
                val = val.replace(/^.*?(?:however,?\s*(?:the\s+)?candidate\s+has:?\s*)/i, '');
                // Remove patterns like "Not specified in JD: "
                val = val.replace(/^.*?(?:not\s+specified.*?:)\s*/i, '');
                tailored.skills[key] = val.trim();
            }
        }
    }

    generatePDF(tailored, BASE_RESUME, res);
}));

module.exports = router;
