// ========================================
// AK INTERNATIONAL - ADVANCED INTERACTIONS
// ========================================

(function () {
    'use strict';

    // Config loader: optional /config.json can set { "API_BASE": "https://your-railway-url" }
    let API_BASE = '';
    let _configLoaded = false;
    async function ensureConfigLoaded() {
        if (_configLoaded) return;
        try {
            const res = await fetch('/config.json', { cache: 'no-store' });
            if (res.ok) {
                const cfg = await res.json();
                API_BASE = (cfg.API_BASE || '').replace(/\/$/, '');
            }
        } catch (e) {
            // ignore
        }
        _configLoaded = true;
    }
    // Expose for other scripts or event handlers that may run in different scopes
    try { window.ensureConfigLoaded = ensureConfigLoaded; window.API_BASE = API_BASE; } catch (e) {}

    // ===== PARTICLE BACKGROUND =====
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null };
        const particleCount = Math.min(80, Math.floor(window.innerWidth / 15));

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.opacity = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

                // Mouse interaction
                if (mouse.x !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        const force = (120 - dist) / 120;
                        this.x -= (dx / dist) * force * 0.8;
                        this.y -= (dy / dist) * force * 0.8;
                    }
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function connectParticles() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        const opacity = (1 - dist / 150) * 0.15;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            connectParticles();
            requestAnimationFrame(animateParticles);
        }

        animateParticles();

        document.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        document.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });
    }

    // ===== CUSTOM CURSOR =====
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');

    if (cursorDot && cursorRing && window.innerWidth > 768) {
        let cursorX = 0, cursorY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
            cursorDot.style.left = cursorX + 'px';
            cursorDot.style.top = cursorY + 'px';
        });

        function animateRing() {
            ringX += (cursorX - ringX) * 0.15;
            ringY += (cursorY - ringY) * 0.15;
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';
            requestAnimationFrame(animateRing);
        }
        animateRing();

        // Hover effects
        const hoverTargets = document.querySelectorAll('a, button, .btn, .feature-card, .service-card, .tech-card, .gallery-card, .contact-card');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('hovering');
                cursorRing.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('hovering');
                cursorRing.classList.remove('hovering');
            });
        });
    }

    // ===== NAVIGATION =====
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    // Scroll effect
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Mobile menu
    if (hamburger && navMenu) {
        const mobileBreakpoint = 1024;

        function setMobileMenuState(isOpen) {
            hamburger.classList.toggle('active', isOpen);
            navMenu.classList.toggle('active', isOpen);
            navbar?.classList.toggle('menu-open', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';

            if (!isOpen) {
                navMenu.querySelectorAll('.nav-item--dropdown.open').forEach(item => {
                    item.classList.remove('open');
                });
            }
        }

        function closeMobileMenu() {
            setMobileMenuState(false);
        }

        hamburger.addEventListener('click', () => {
            setMobileMenuState(!navMenu.classList.contains('active'));
        });

        // Remove 'Get a Quote' on mobile
        function updateMobileNavItems() {
            const getQuote = navMenu.querySelector('.nav-link--cta');
            if (window.innerWidth <= mobileBreakpoint) {
                if (getQuote) getQuote.style.display = 'none';
            } else {
                if (getQuote) getQuote.style.display = '';
            }
        }
        updateMobileNavItems();
        window.addEventListener('resize', updateMobileNavItems);

        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const dropdownTrigger = link.closest('.nav-item--dropdown') && window.innerWidth <= mobileBreakpoint;
                if (dropdownTrigger) {
                    e.preventDefault();
                    link.closest('.nav-item--dropdown').classList.toggle('open');
                    return;
                }
                closeMobileMenu();
            });
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth > mobileBreakpoint || !navMenu.classList.contains('active')) {
                return;
            }

            if (!navbar?.contains(e.target)) {
                closeMobileMenu();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > mobileBreakpoint) {
                closeMobileMenu();
            }
        });
    }

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    function updateActiveNav() {
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`);
            if (link) {
                if (scrollY >= top && scrollY < top + height) {
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    }
    window.addEventListener('scroll', updateActiveNav);

    // ===== SMOOTH SCROLLING =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const offset = navbar ? navbar.offsetHeight : 0;
                    const top = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            }
        });
    });

    // ===== SCROLL REVEAL =====
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger animation for sibling elements
                    const siblings = entry.target.parentElement.querySelectorAll('.reveal');
                    let delay = 0;
                    siblings.forEach((sibling, i) => {
                        if (sibling === entry.target) delay = i * 100;
                    });
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, Math.min(delay, 400));
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ===== HERO COUNTER ANIMATION =====
    const heroStatObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counters = entry.target.querySelectorAll('[data-count]');
                    counters.forEach(counter => {
                        const target = parseInt(counter.dataset.count, 10);
                        animateCount(counter, target);
                    });
                    heroStatObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) heroStatObserver.observe(heroStats);

    function animateCount(el, target) {
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(ease * target);
            el.textContent = current;
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target;
            }
        }
        requestAnimationFrame(update);
    }

    // ===== CARD GLOW FOLLOW =====
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', x + '%');
            card.style.setProperty('--mouse-y', y + '%');
        });
    });

    // ===== TILT EFFECT (SUBTLE) =====
    if (window.innerWidth > 768) {
        document.querySelectorAll('[data-tilt]').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                const tiltX = (y - 0.5) * 6;
                const tiltY = (x - 0.5) * -6;
                card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ===== MAGNETIC BUTTONS =====
    if (window.innerWidth > 768) {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    // ===== PARALLAX GLOW ON SCROLL =====
    const heroGlows = document.querySelectorAll('.hero-glow');
    if (heroGlows.length > 0) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            heroGlows.forEach((glow, i) => {
                const speed = (i + 1) * 0.1;
                glow.style.transform = `translateY(${scrollY * speed}px)`;
            });
        });
    }

    // ===== TEXT TYPING EFFECT FOR HERO =====
    const heroLines = document.querySelectorAll('.hero-line');
    heroLines.forEach((line, i) => {
        line.style.opacity = '0';
        line.style.transform = 'translateY(20px)';
        line.style.transition = `opacity 0.6s ease ${i * 0.2}s, transform 0.6s ease ${i * 0.2}s`;
        setTimeout(() => {
            line.style.opacity = '1';
            line.style.transform = 'translateY(0)';
        }, 100);
    });

})();

// ===== BACK TO TOP BUTTON =====
// Create back to top button
const backToTopButton = document.createElement('button');
backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTopButton.classList.add('back-to-top');
document.body.appendChild(backToTopButton);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===== LOADING ANIMATION =====
// No-op: removed body opacity flash that causes blank screen in Safari

// ===== ACTIVE LINK HIGHLIGHT =====
const currentLocation = location.pathname.split('/').pop() || 'index.html';
const navLinks = document.querySelectorAll('.nav-menu a');

navLinks.forEach(link => {
    if (link.getAttribute('href') === currentLocation) {
        link.classList.add('active');
    }
});

// ===== SERVICE CARD HOVER EFFECT =====
const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ===== FLOATING CHAT ICON =====
(function () {
    // 1. Create and inject dynamic styles
    const styles = `
        /* Back to Top Button */
        .back-to-top {
            position: fixed;
            bottom: 105px;
            right: 35px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
        }

        .back-to-top.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .back-to-top:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(99, 102, 241, 0.6);
        }

        .back-to-top:active {
            transform: translateY(0) scale(0.95);
        }

        /* Floating Chat Container */
        .floating-chat-container {
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            pointer-events: none; /* Let clicks pass through except on child interactive elements */
        }

        /* Chat Trigger Button */
        .floating-chat-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #06b6d4 0%, #6366f1 100%);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            outline: none;
            padding: 0;
            animation: chatFloat 3.5s ease-in-out infinite;
            pointer-events: auto; /* Re-enable pointer events */
        }

        .floating-chat-icon:hover {
            transform: scale(1.1) translateY(-2px);
            box-shadow: 0 8px 30px rgba(99, 102, 241, 0.7), inset 0 2px 4px rgba(255, 255, 255, 0.3);
            background: linear-gradient(135deg, #0891b2 0%, #4f46e5 100%);
        }

        .floating-chat-icon:active {
            transform: scale(0.95);
        }

        .floating-chat-icon svg {
            width: 28px;
            height: 28px;
            transition: transform 0.3s ease;
        }

        .floating-chat-icon:hover svg {
            transform: rotate(8deg) scale(1.05);
        }

        /* Dynamic Float Animation */
        @keyframes chatFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
        }

        /* Online/Notification Badge */
        .chat-badge {
            position: absolute;
            top: 2px;
            right: 2px;
            width: 14px;
            height: 14px;
            background-color: #10b981;
            border: 2.5px solid #0a0a0f;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
        }

        /* Online Badge Pulse */
        .chat-badge::after {
            content: '';
            position: absolute;
            top: -2.5px;
            left: -2.5px;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            border: 2px solid #10b981;
            animation: badgePulse 2s infinite ease-in-out;
            opacity: 0;
        }

        @keyframes badgePulse {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(2.2); opacity: 0; }
        }

        /* Tooltip Speech Bubble */
        .chat-tooltip {
            position: absolute;
            bottom: 75px;
            right: 5px;
            width: 240px;
            background: rgba(18, 18, 26, 0.85);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 14px 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 1px rgba(99, 102, 241, 0.2);
            color: #f1f5f9;
            opacity: 0;
            transform: translateY(10px) scale(0.95);
            transform-origin: bottom right;
            visibility: hidden;
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            z-index: 10000;
            pointer-events: auto; /* Re-enable pointer events */
        }

        .chat-tooltip.show {
            opacity: 1;
            transform: translateY(0) scale(1);
            visibility: visible;
        }

        .chat-tooltip-content {
            font-size: 13px;
            line-height: 1.5;
            font-weight: 500;
            padding-right: 15px;
        }

        .chat-tooltip-title {
            font-size: 11px;
            font-weight: 700;
            color: #818cf8;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
        }

        .chat-tooltip-close {
            position: absolute;
            top: 10px;
            right: 12px;
            border: none;
            background: transparent;
            color: #64748b;
            cursor: pointer;
            font-size: 14px;
            padding: 2px;
            line-height: 1;
            transition: color 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .chat-tooltip-close:hover {
            color: #f1f5f9;
        }

        /* Tooltip Little Triangle Pointer */
        .chat-tooltip::after {
            content: '';
            position: absolute;
            bottom: -6px;
            right: 24px;
            width: 12px;
            height: 12px;
            background: rgba(18, 18, 26, 0.85);
            border-right: 1px solid rgba(255, 255, 255, 0.08);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            transform: rotate(45deg);
        }

        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
            .back-to-top {
                bottom: 87px;
                right: 23px;
                width: 46px;
                height: 46px;
                font-size: 1rem;
            }

            .floating-chat-container {
                bottom: 20px;
                right: 20px;
            }
            
            .floating-chat-icon {
                width: 52px;
                height: 52px;
            }
            
            .floating-chat-icon svg {
                width: 24px;
                height: 24px;
            }
            
            .chat-tooltip {
                bottom: 67px;
                right: 0;
                width: 220px;
                padding: 12px 14px;
            }
        }
        /* Simple chat UI elements */
        .chat-message { margin-bottom: 8px; font-size: 14px; }
        .chat-message.system { font-weight: 600; color: #e6eefc; }
        .chat-message.small { font-size: 12px; color: #cbd5e1; }
        .chat-options { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
        .chat-option { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.04); padding: 8px 10px; border-radius: 10px; cursor: pointer; font-size: 13px; color: #e6eefc; text-align: left; }
        .chat-option:hover { background: rgba(255,255,255,0.06); }
        .chat-input textarea { width: 100%; resize: vertical; margin-top: 8px; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); color: #fff; }
        .chat-input .btn { margin-top: 8px; background: #6366f1; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; }
    `;
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // 2. Create the DOM elements
    const chatContainer = document.createElement('div');
    chatContainer.className = 'floating-chat-container';
    chatContainer.id = 'floatingChatContainer';

    // Tooltip Speech Bubble
    const tooltip = document.createElement('div');
    tooltip.className = 'chat-tooltip';
    tooltip.id = 'chatTooltip';
    tooltip.innerHTML = `
        <button class="chat-tooltip-close" id="chatTooltipClose" aria-label="Close message">×</button>
        <div class="chat-tooltip-title">AK Support</div>
        <div class="chat-tooltip-body">
            <div class="chat-message system">Welcome to AKI Assist</div>
            <div class="chat-message system small" id="chatPrompt">How can we help you today? Please choose an option below:</div>
            <div class="chat-options" id="chatOptions"></div>
            <div class="chat-input" id="chatInput" style="display:none;">
                <textarea id="chatTextarea" rows="3" placeholder="Describe your issue..."></textarea>
                <button id="chatSendBtn" class="btn">Send</button>
            </div>
        </div>
    `;

    // Chat Trigger Button
    const chatButton = document.createElement('button');
    chatButton.className = 'floating-chat-icon';
    chatButton.id = 'floatingChatIcon';
    chatButton.setAttribute('aria-label', 'Open Live Chat');
    chatButton.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="chat-badge"></span>
    `;

    // Assemble components
    chatContainer.appendChild(tooltip);
    chatContainer.appendChild(chatButton);
    document.body.appendChild(chatContainer);

    // 3. Register Custom Cursor interaction if available
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');
    
    function registerCursorHover(el) {
        if (cursorDot && cursorRing) {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('hovering');
                cursorRing.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('hovering');
                cursorRing.classList.remove('hovering');
            });
        }
    }
    
    registerCursorHover(chatButton);
    const closeBtn = tooltip.querySelector('#chatTooltipClose');
    if (closeBtn) registerCursorHover(closeBtn);

    // 4. Behaviors & Animations
    // Show tooltip after 3 seconds
    let tooltipTimeout = setTimeout(() => {
        tooltip.classList.add('show');
    }, 3000);

    // Close tooltip click event
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        tooltip.classList.remove('show');
        clearTimeout(tooltipTimeout);
    });

    // Chat icon click (future functionality placeholder)
    // Chat interaction logic
    const CHAT_OPTIONS = [
        { key: 'technical', label: 'Technical Support' },
        { key: 'odoo', label: 'Odoo Queries' },
        { key: 'web', label: 'Web & Web Applications' },
        { key: 'mobile', label: 'iOS & Android' },
        { key: 'other', label: 'Other Inquiries' }
    ];

    function populateOptions() {
        const container = tooltip.querySelector('#chatOptions');
        if (!container) return;
        container.innerHTML = '';
        CHAT_OPTIONS.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'chat-option';
            btn.type = 'button';
            btn.textContent = opt.label;
            btn.dataset.key = opt.key;
            btn.addEventListener('click', () => handleOptionSelect(opt));
            container.appendChild(btn);
        });
    }

    function getVisitorCountry() {
        try {
            const locale = (Intl && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().locale || navigator.language : navigator.language;
            if (!locale) return '';
            const parts = locale.replace('_', '-').split('-');
            const region = parts.length > 1 ? parts[1].toUpperCase() : '';
            const map = { US: 'United States', GB: 'United Kingdom', IN: 'India', PK: 'Pakistan', AU: 'Australia', CA: 'Canada', DE: 'Germany', FR: 'France', ES: 'Spain', IT: 'Italy', NL: 'Netherlands' };
            return map[region] || region || '';
        } catch (e) {
            return '';
        }
    }

    function handleOptionSelect(opt) {
        const body = tooltip.querySelector('.chat-tooltip-body');
        if (!body) return;

        const inferredCountry = getVisitorCountry();

        body.innerHTML = `
            <div class="chat-message system">Our live agent will connect you soon.</div>
            <div class="chat-message system small">We require a few details before we proceed.</div>
            <div class="chat-form">
                <label style="font-size:12px;margin-top:8px;display:block;color:#9fb4ff">Name</label>
                <input id="chatName" type="text" placeholder="Your name" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);color:#fff;">
                <label style="font-size:12px;margin-top:8px;display:block;color:#9fb4ff">Mobile</label>
                <input id="chatMobile" type="text" placeholder="Mobile number" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);color:#fff;">
                <label style="font-size:12px;margin-top:8px;display:block;color:#9fb4ff">Email</label>
                <input id="chatEmail" type="email" placeholder="you@example.com" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);color:#fff;">
                <label style="font-size:12px;margin-top:8px;display:block;color:#9fb4ff">Country</label>
                <input id="chatCountry" type="text" placeholder="Country" value="${inferredCountry}" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);color:#fff;">
                <div style="display:flex;justify-content:flex-end;margin-top:8px;"><button id="chatStartBtn" class="btn">Start Chat</button></div>
            </div>
        `;

        const startBtn = tooltip.querySelector('#chatStartBtn');
        if (startBtn) {
            startBtn.addEventListener('click', async () => {
                const name = (tooltip.querySelector('#chatName')||{}).value?.trim() || '';
                const mobile = (tooltip.querySelector('#chatMobile')||{}).value?.trim() || '';
                const email = (tooltip.querySelector('#chatEmail')||{}).value?.trim() || '';
                const country = (tooltip.querySelector('#chatCountry')||{}).value?.trim() || '';

                if (!name || !email) {
                    startBtn.textContent = 'Please complete Name & Email';
                    setTimeout(() => startBtn.textContent = 'Start Chat', 1600);
                    return;
                }

                startBtn.disabled = true;
                startBtn.textContent = 'Saving...';

                try {
                    // Guard against cases where the loader isn't available in this scope
                    if (typeof ensureConfigLoaded === 'function') {
                        await ensureConfigLoaded();
                    } else {
                        console.warn('ensureConfigLoaded not available, loading /config.json directly');
                        try {
                            const _res = await fetch('/config.json', { cache: 'no-store' });
                            if (_res.ok) {
                                const _cfg = await _res.json();
                                API_BASE = (_cfg.API_BASE || '').replace(/\/$/, '');
                            }
                        } catch (e) {
                            /* ignore */
                        }
                        _configLoaded = true;
                    }
                    const endpoint = API_BASE ? `${API_BASE}/api/connect` : '/api/connect';
                    const payload = { option: opt.key, name, mobile, email, country };
                    // Log outgoing payload for debugging (helps trace malformed requests)
                    try { console.debug('AKI Assist -> POST', endpoint, payload, JSON.stringify(payload)); } catch (e) {}
                    const resp = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    // If server returns JSON, parse it. If not, surface the text (helpful for HTML error pages).
                    const ct = (resp.headers.get('content-type') || '').toLowerCase();
                    let data = null;
                    if (ct.includes('application/json')) {
                        data = await resp.json();
                    } else {
                        const text = await resp.text();
                        throw new Error(`Server returned ${resp.status} ${resp.statusText}: ${text.replace(/\s+/g, ' ').slice(0,300)}`);
                    }

                    if (!resp.ok) throw new Error(data?.error || `Server error ${resp.status}`);

                    body.innerHTML = `\n                        <div class="chat-message system">Thanks ${name} — your connect ID is <strong>${data.connect_id}</strong>.</div>\n                        <div class="chat-message system small">Connecting you to <strong>${opt.label}</strong> now...</div>\n                    `;

                    setTimeout(() => openEmbeddedChat({ name, mobile, email, country, connect_id: data.connect_id }, opt), 900);
                } catch (err) {
                    startBtn.disabled = false;
                    startBtn.textContent = 'Start Chat';
                    body.innerHTML = `<div class="chat-message system small">Unable to save details: ${err.message}</div>`;
                    console.error('save error', err);
                }
            });
        }
    }

    function openEmbeddedChat(userData, opt) {
        // Replace tooltip with a small chat window (keeps same footprint)
        tooltip.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                <div style="font-weight:700;color:#cfe1ff">${opt.label} — AKI Assist</div>
                <button class="chat-tooltip-close" id="chatTooltipCloseSmall" aria-label="Close chat" style="background:transparent;border:none;color:#9fb4ff;cursor:pointer">×</button>
            </div>
            <div id="chatWindow" style="height:180px;overflow:auto;padding:6px;border-radius:8px;border:1px solid rgba(255,255,255,0.03);background:rgba(10,10,14,0.6);">
                <div class="chat-message system">Our live agent will join shortly. Meanwhile, you can type your message below.</div>
            </div>
            <div style="margin-top:8px;display:flex;gap:8px;">
                <input id="chatMsgInput" placeholder="Type a message..." style="flex:1;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);color:#fff;">
                <button id="chatMsgSend" class="btn">Chat</button>
            </div>
        `;

        // rebind close
        const closeSmall = tooltip.querySelector('#chatTooltipCloseSmall');
        if (closeSmall) {
            registerCursorHover(closeSmall);
            closeSmall.addEventListener('click', (e) => { e.stopPropagation(); tooltip.classList.remove('show'); });
        }

        const chatWin = tooltip.querySelector('#chatWindow');
        const input = tooltip.querySelector('#chatMsgInput');
        const send = tooltip.querySelector('#chatMsgSend');

        function appendMessage(text, who='user') {
            const el = document.createElement('div');
            el.className = 'chat-message';
            el.style.marginBottom = '6px';
            el.textContent = text;
            if (who === 'agent') el.style.color = '#cfe1ff';
            chatWin.appendChild(el);
            chatWin.scrollTop = chatWin.scrollHeight;
        }

        // simulate agent connection after a short delay
        setTimeout(() => appendMessage('Agent: Hi ' + (userData.name || '') + ', I will be assisting you shortly.', 'agent'), 1400);

        if (send && input) {
            send.addEventListener('click', () => {
                const txt = input.value.trim();
                if (!txt) return;
                appendMessage('You: ' + txt, 'user');
                input.value = '';
                // echo simulated agent reply
                setTimeout(() => appendMessage('Agent: Thanks for the details. We will respond soon.' , 'agent'), 800 + Math.random()*800);
            });
        }
    }

    chatButton.addEventListener('click', () => {
        const willShow = !tooltip.classList.contains('show');
        if (willShow) {
            // prepare UI
            const bodyPrompt = tooltip.querySelector('#chatPrompt');
            if (bodyPrompt) bodyPrompt.textContent = 'How can we help you today? Please choose an option below:';
            populateOptions();
            tooltip.classList.add('show');
        } else {
            tooltip.classList.remove('show');
        }
    });
})();

// ===== CONSOLE MESSAGE =====
console.log('%c🚀 Welcome to AK International! ', 'background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; font-size: 20px; padding: 10px; border-radius: 5px;');
