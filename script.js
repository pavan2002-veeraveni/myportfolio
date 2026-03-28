/* =============================================
   ENTERPRISE PORTFOLIO - Script
   ============================================= */

// =============================================
// CONFIGURATION
// =============================================
const CONFIG = {
    // API calls are proxied through the server (API key is in .env)
    CHAT_API_URL: '/api/chat',
    GROQ_MODEL: 'llama-3.3-70b-versatile',

    typingWords: [
        'Full Stack Developer',
        'Python Developer',
        'AI Enthusiast',
        'React Developer',
        'Problem Solver',
        'API Architect'
    ],
    typingSpeed: 80,
    deletingSpeed: 40,
    pauseEnd: 2000,
    pauseStart: 500,
};

const PORTFOLIO_INFO = `You are Pavan Kumar's AI portfolio assistant. You are embedded in his portfolio website.

About Pavan:
- Full Stack Developer specializing in React, Python, FastAPI, and AI/ML
- Education: B.Tech in Computer Science (Data Science) from Malla Reddy College of Engineering and Technology (2021 - 2025). CGPA: 7.1/10.
- Passionate about building scalable web applications and AI-powered solutions
- Experience with frontend (React, JavaScript, HTML5, CSS3), backend (Python, FastAPI, REST APIs, Node.js), databases (MySQL, MongoDB), and tools (Git, Docker, Postman, VS Code)
- AI & ML skills: OpenAI API, NLP, Machine Learning, Groq API

Projects:
1. Prescription Analysis: A Medication Extractor – AI system to extract and analyze medication details from medical prescriptions using OCR and NLP.
2. Calling Agent: Medication Reminder – Automated AI voice agent to remind patients of medication schedules using speech synthesis.
3. Job Craves: AI Recruitment System – Intelligent platform automating candidate screening by matching resumes to job descriptions using ML.
4. Colorization of Grayscale Medical Images – Deep-learning pipeline converting grayscale medical images to color for better diagnostic analysis using CNNs.

Contact:
- Email: pavanveeraveni89@gmail.com
- GitHub: https://github.com/pavan2002-veeraveni
- LinkedIn: https://www.linkedin.com/in/pavan-kumar-502a332ab
- Instagram: https://www.instagram.com/pavan._.yadav.___

Instructions:
- Be friendly, professional, and concise
- Answer questions about Pavan's skills, projects, experience, and contact info
- If asked something unrelated, politely redirect to portfolio topics
- Use emojis sparingly for warmth
- Keep responses under 3-4 sentences when possible`;

// =============================================
// TYPING ANIMATION
// =============================================
class TypingAnimation {
    constructor(element, words, config) {
        this.element = element;
        this.words = words;
        this.config = config;
        this.wordIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.start();
    }

    start() {
        this.type();
    }

    type() {
        const currentWord = this.words[this.wordIndex];

        if (this.isDeleting) {
            this.charIndex--;
        } else {
            this.charIndex++;
        }

        this.element.textContent = currentWord.substring(0, this.charIndex);

        let delay = this.isDeleting ? this.config.deletingSpeed : this.config.typingSpeed;

        if (!this.isDeleting && this.charIndex === currentWord.length) {
            delay = this.config.pauseEnd;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.wordIndex = (this.wordIndex + 1) % this.words.length;
            delay = this.config.pauseStart;
        }

        setTimeout(() => this.type(), delay);
    }
}

// =============================================
// SCROLL REVEAL
// =============================================
class ScrollReveal {
    constructor() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );
        this.init();
    }

    init() {
        document.querySelectorAll('.reveal').forEach((el) => {
            this.observer.observe(el);
        });
    }
}

// =============================================
// STATS COUNTER ANIMATION
// =============================================
class StatsCounter {
    constructor() {
        this.animated = false;
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !this.animated) {
                        this.animated = true;
                        this.animateCounters();
                    }
                });
            },
            { threshold: 0.5 }
        );

        const statsSection = document.querySelector('.about-stats');
        if (statsSection) {
            this.observer.observe(statsSection);
        }
    }

    animateCounters() {
        document.querySelectorAll('.stat-number').forEach((counter) => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const startTime = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(target * easeOut);
                counter.textContent = current;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        });
    }
}

// =============================================
// PARTICLES
// =============================================
class ParticleSystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (this.container) {
            this.createParticles(30);
        }
    }

    createParticles(count) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDuration = `${6 + Math.random() * 10}s`;
            particle.style.animationDelay = `${Math.random() * 6}s`;
            particle.style.width = `${2 + Math.random() * 3}px`;
            particle.style.height = particle.style.width;
            this.container.appendChild(particle);
        }
    }
}

// =============================================
// NAVBAR
// =============================================
class Navbar {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.hamburger = document.getElementById('hamburger');
        this.navLinks = document.getElementById('navLinks');
        this.links = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('section[id]');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.onScroll());
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggleMobile());
        }
        this.links.forEach((link) => {
            link.addEventListener('click', () => this.closeMobile());
        });
    }

    onScroll() {
        // Navbar background
        if (window.scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }

        // Active section highlighting
        let current = '';
        this.sections.forEach((section) => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        this.links.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            }
        });
    }

    toggleMobile() {
        this.hamburger.classList.toggle('active');
        this.navLinks.classList.toggle('mobile-open');
        document.body.style.overflow = this.navLinks.classList.contains('mobile-open') ? 'hidden' : '';
    }

    closeMobile() {
        this.hamburger.classList.remove('active');
        this.navLinks.classList.remove('mobile-open');
        document.body.style.overflow = '';
    }
}

// =============================================
// BACK TO TOP
// =============================================
class BackToTop {
    constructor() {
        this.button = document.getElementById('backToTop');
        if (this.button) {
            window.addEventListener('scroll', () => this.toggle());
            this.button.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    toggle() {
        if (window.scrollY > 400) {
            this.button.classList.add('visible');
        } else {
            this.button.classList.remove('visible');
        }
    }
}

// =============================================
// CURSOR GLOW
// =============================================
class CursorGlow {
    constructor() {
        this.glow = document.getElementById('cursorGlow');
        if (this.glow && window.innerWidth > 768) {
            document.addEventListener('mousemove', (e) => {
                requestAnimationFrame(() => {
                    this.glow.style.left = e.clientX + 'px';
                    this.glow.style.top = e.clientY + 'px';
                });
            });
        } else if (this.glow) {
            this.glow.style.display = 'none';
        }
    }
}

// =============================================
// CONTACT FORM
// =============================================
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const subject = document.getElementById('contactSubject').value;
        const message = document.getElementById('contactMessage').value;

        const btn = this.form.querySelector('.btn-submit');
        const originalHTML = btn.innerHTML;

        try {
            // Show loading feedback
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, subject, message })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send message');
            }

            // Show success feedback
            btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
            btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            this.form.reset();

        } catch (error) {
            console.error('Contact error:', error);
            btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error Sending';
            btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        } finally {
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.disabled = false;
            }, 3000);
        }
    }
}

// =============================================
// AI CHATBOT (Groq API)
// =============================================
class Chatbot {
    constructor() {
        this.container = document.getElementById('chatbotContainer');
        this.toggleBtn = document.getElementById('chatbotToggle');
        this.closeBtn = document.getElementById('chatbotClose');
        this.window = document.getElementById('chatbotWindow');
        this.messages = document.getElementById('chatbotMessages');
        this.form = document.getElementById('chatbotForm');
        this.input = document.getElementById('chatbotInput');
        this.suggestions = document.getElementById('chatbotSuggestions');

        this.chatHistory = [
            { role: 'system', content: PORTFOLIO_INFO }
        ];

        this.isOpen = false;
        this.isProcessing = false;

        this.init();
    }

    init() {
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
        }
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        }
        // Suggestion chips
        if (this.suggestions) {
            this.suggestions.querySelectorAll('.suggestion-chip').forEach((chip) => {
                chip.addEventListener('click', () => {
                    const msg = chip.getAttribute('data-message');
                    this.input.value = msg;
                    this.sendMessage();
                });
            });
        }
    }

    toggle() {
        this.isOpen = !this.isOpen;
        this.window.classList.toggle('open', this.isOpen);
        this.toggleBtn.classList.toggle('active', this.isOpen);
        if (this.isOpen) {
            this.input.focus();
        }
    }

    close() {
        this.isOpen = false;
        this.window.classList.remove('open');
        this.toggleBtn.classList.remove('active');
    }

    addMessage(content, isBot = false) {
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${isBot ? 'bot-message' : 'user-message'}`;
        messageEl.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${isBot ? 'robot' : 'user'}"></i>
            </div>
            <div class="message-content">
                <p>${this.escapeHTML(content)}</p>
            </div>
        `;
        this.messages.appendChild(messageEl);
        this.scrollToBottom();
    }

    addTypingIndicator() {
        const typing = document.createElement('div');
        typing.className = 'chat-message bot-message';
        typing.id = 'typingIndicator';
        typing.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        this.messages.appendChild(typing);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typing = document.getElementById('typingIndicator');
        if (typing) typing.remove();
    }

    scrollToBottom() {
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    async sendMessage() {
        const text = this.input.value.trim();
        if (!text || this.isProcessing) return;

        this.isProcessing = true;
        this.input.value = '';

        // Hide suggestions after first message
        if (this.suggestions) {
            this.suggestions.style.display = 'none';
        }

        // Add user message
        this.addMessage(text, false);

        // Add to chat history
        this.chatHistory.push({ role: 'user', content: text });

        // Show typing indicator
        this.addTypingIndicator();

        try {
            const response = await this.callGroqAPI();
            this.removeTypingIndicator();
            this.addMessage(response, true);
            this.chatHistory.push({ role: 'assistant', content: response });
        } catch (error) {
            this.removeTypingIndicator();
            console.error('Chatbot error:', error);

            // Fallback to local responses if API fails
            const fallbackResponse = this.getFallbackResponse(text);
            this.addMessage(fallbackResponse, true);
        }

        this.isProcessing = false;
    }

    async callGroqAPI() {
        const response = await fetch(CONFIG.CHAT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: this.chatHistory,
                max_tokens: 300,
                temperature: 0.7,
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    getFallbackResponse(input) {
        const lower = input.toLowerCase();

        if (lower.includes('skill') || lower.includes('tech') || lower.includes('stack')) {
            return "Pavan is skilled in React, JavaScript, Python, FastAPI, MySQL, MongoDB, Docker, Git, and AI/ML with OpenAI API. He's a versatile full stack developer! 💻";
        }
        if (lower.includes('project')) {
            return "Pavan has built amazing projects including an AI Resume Job Matcher, an Enterprise Chatbot System, a Bulk Poster Management System, and the Palle Admin Panel. Check out the Projects section for details! 🚀";
        }
        if (lower.includes('contact') || lower.includes('email') || lower.includes('reach') || lower.includes('hire')) {
            return "You can reach Pavan at pavanveeraveni89@gmail.com, on GitHub (pavan2002-veeraveni), or LinkedIn. Check out the Contact section to send a message directly! 📧";
        }
        if (lower.includes('github')) {
            return "Check out Pavan's GitHub: https://github.com/pavan2002-veeraveni — He has multiple projects showcasing his full stack and AI development skills! 🐙";
        }
        if (lower.includes('linkedin')) {
            return "Connect with Pavan on LinkedIn: https://www.linkedin.com/in/pavan-kumar-502a332ab 🔗";
        }
        if (lower.includes('instagram')) {
            return "Follow Pavan on Instagram: @pavan._.yadav.___ 📸";
        }
        if (lower.includes('experience') || lower.includes('work') || lower.includes('journey')) {
            return "Pavan's journey includes building enterprise admin panels, AI chatbots, and scalable web apps using React, Python, and FastAPI. Check out the Journey section for the full timeline! 🎯";
        }
        if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            return "Hey there! 👋 I'm Pavan's AI assistant. I can tell you about his skills, projects, experience, or how to get in touch. What would you like to know?";
        }
        if (lower.includes('resume') || lower.includes('cv')) {
            return "You can download Pavan's resume by clicking the 'Resume' button in the navigation bar at the top of the page! 📄";
        }
        if (lower.includes('education') || lower.includes('college') || lower.includes('university') || lower.includes('study')) {
            return "Pavan completed his B.Tech in Computer Science (Data Science) from Malla Reddy College of Engineering and Technology (2021-2025) with a CGPA of 7.1/10. 🎓";
        }

        return "Great question! I know all about Pavan's skills (React, Python, FastAPI, AI/ML), his projects, education, and how to contact him. Feel free to ask about any of these topics! 😊";
    }
}

// =============================================
// SMOOTH SCROLL for anchor links
// =============================================
class SmoothScroll {
    constructor() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
}

// =============================================
// SCROLL INDICATOR HIDE
// =============================================
class ScrollIndicatorHide {
    constructor() {
        this.indicator = document.getElementById('scrollIndicator');
        if (this.indicator) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 200) {
                    this.indicator.style.opacity = '0';
                    this.indicator.style.visibility = 'hidden';
                } else {
                    this.indicator.style.opacity = '';
                    this.indicator.style.visibility = '';
                }
            });
        }
    }
}

// =============================================
// AI RESUME BUILDER
// =============================================
class ResumeBuilder {
    constructor() {
        this.textarea = document.getElementById('jobDescriptionInput');
        this.charCount = document.getElementById('rbCharCount');
        this.generateBtn = document.getElementById('generateResumeBtn');
        this.progress = document.getElementById('rbProgress');
        this.progressFill = document.getElementById('rbProgressFill');
        this.progressText = document.getElementById('rbProgressText');
        this.download = document.getElementById('rbDownload');
        this.downloadLink = document.getElementById('rbDownloadLink');
        this.error = document.getElementById('rbError');
        this.errorText = document.getElementById('rbErrorText');
        this.isProcessing = false;
        this.init();
    }

    init() {
        if (!this.textarea) return;
        this.textarea.addEventListener('input', () => this.updateCharCount());
        this.generateBtn.addEventListener('click', () => this.generate());
    }

    updateCharCount() {
        const len = this.textarea.value.length;
        this.charCount.textContent = `${len} character${len !== 1 ? 's' : ''}`;
    }

    showProgress() {
        this.progress.style.display = 'block';
        this.download.style.display = 'none';
        this.error.style.display = 'none';
        this.progressFill.style.width = '0%';

        const stages = [
            { pct: 15, text: 'Analyzing job description...' },
            { pct: 35, text: 'Extracting key requirements...' },
            { pct: 55, text: 'Matching skills & experience...' },
            { pct: 75, text: 'Writing tailored bullet points...' },
            { pct: 90, text: 'Generating ATS-optimized PDF...' },
        ];
        let i = 0;
        this._progressTimer = setInterval(() => {
            if (i < stages.length) {
                this.progressFill.style.width = stages[i].pct + '%';
                this.progressText.textContent = stages[i].text;
                i++;
            }
        }, 2500);
    }

    stopProgress() {
        clearInterval(this._progressTimer);
        this.progressFill.style.width = '100%';
        this.progressText.textContent = 'Complete!';
        setTimeout(() => {
            this.progress.style.display = 'none';
        }, 600);
    }

    showError(msg) {
        this.error.style.display = 'flex';
        this.errorText.textContent = msg || 'Something went wrong. Please try again.';
        this.progress.style.display = 'none';
    }

    async generate() {
        const jd = this.textarea.value.trim();
        if (!jd) {
            this.showError('Please paste a job description first.');
            return;
        }
        if (jd.length < 50) {
            this.showError('The job description seems too short. Please paste the full description.');
            return;
        }
        if (this.isProcessing) return;
        this.isProcessing = true;
        this.generateBtn.disabled = true;
        this.generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        this.download.style.display = 'none';
        this.error.style.display = 'none';
        this.showProgress();

        try {
            const adminKey = localStorage.getItem('admin_key');
            const res = await fetch('/api/tailor-resume', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(adminKey && { 'X-Admin-Key': adminKey })
                },
                body: JSON.stringify({ jobDescription: jd })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Server error (${res.status})`);
            }

            // Response is a PDF blob
            const blob = await res.blob();

            // Revoke old blob URL to prevent memory leak
            if (this._blobUrl) {
                URL.revokeObjectURL(this._blobUrl);
            }

            const url = URL.createObjectURL(blob);

            // Store for the download button
            this._blobUrl = url;
            this.downloadLink.href = url;
            this.downloadLink.download = 'Pavan_Kumar_Resume.pdf';

            this.stopProgress();
            setTimeout(() => {
                this.download.style.display = 'block';
                // Auto-trigger download
                const autoLink = document.createElement('a');
                autoLink.href = url;
                autoLink.download = 'Pavan_Kumar_Resume.pdf';
                document.body.appendChild(autoLink);
                autoLink.click();
                document.body.removeChild(autoLink);
            }, 700);

        } catch (err) {
            console.error('Resume builder error:', err);
            this.stopProgress();
            this.showError(err.message);
        } finally {
            this.isProcessing = false;
            this.generateBtn.disabled = false;
            this.generateBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Generate Tailored Resume';
        }
    }
}

// =============================================
// ADMIN / OWNER AUTHENTICATION
// =============================================
class AdminAuth {
    constructor() {
        this.checkAdminParam();
        this.applyAdminContext();
    }

    checkAdminParam() {
        const urlParams = new URLSearchParams(window.location.search);
        const adminParam = urlParams.get('admin');
        const keyParam = urlParams.get('key');

        if (adminParam === 'true') {
            localStorage.setItem('isAdmin', 'true');
            if (keyParam) {
                localStorage.setItem('admin_key', keyParam);
            }
            this.cleanURL();
        } else if (adminParam === 'false') {
            localStorage.removeItem('isAdmin');
            this.cleanURL();
        }
    }

    applyAdminContext() {
        const isAdmin = localStorage.getItem('isAdmin') === 'true';

        if (!isAdmin) {
            // Physically remove admin-only elements if NOT an admin
            document.querySelectorAll('.admin-only').forEach(el => el.remove());
        } else {
            // Remove recruiter-only features for the admin so no duplicates show
            document.querySelectorAll('.recruiter-only').forEach(el => el.remove());
            document.body.classList.add('is-admin');
        }
    }

    cleanURL() {
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: newUrl }, '', newUrl);
    }
}

// =============================================
// INITIALIZE EVERYTHING
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // Admin checking
    new AdminAuth();

    // Core interactions
    new Navbar();
    new SmoothScroll();
    new BackToTop();
    new CursorGlow();
    new ScrollIndicatorHide();

    // Animations
    const typingEl = document.getElementById('typingText');
    if (typingEl) {
        new TypingAnimation(typingEl, CONFIG.typingWords, CONFIG);
    }
    new ScrollReveal();
    new StatsCounter();
    new ParticleSystem('particles');

    // Features
    new ContactForm();
    new Chatbot();
    new ResumeBuilder();
});
