// ========================================
// AK INTERNATIONAL - ADVANCED INTERACTIONS
// ========================================

(function () {
    'use strict';

    const INSTAGRAM_URL = 'https://www.instagram.com/ak_int_office/?hl=en';
    document.querySelectorAll('a[aria-label="Instagram"], a[href*="instagram.com/ak_int_office"], .social-links a').forEach(link => {
        const hasInstagramIcon = link.querySelector('.fa-instagram');
        const isInstagramText = link.textContent.trim().toLowerCase() === 'instagram';
        if (hasInstagramIcon || isInstagramText || link.getAttribute('aria-label') === 'Instagram') {
            link.href = INSTAGRAM_URL;
            link.target = '_blank';
            link.rel = 'noopener';
        }
    });

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

    // ===== FIXED BACKGROUND VIDEO LOOP =====
    const siteBgVideo = document.getElementById('siteBgVideo');
    if (siteBgVideo) {
        let videoFadeFrame = null;
        siteBgVideo.style.opacity = '0';

        const updateVideoFade = () => {
            if (!siteBgVideo.paused && siteBgVideo.duration) {
                const cur = siteBgVideo.currentTime;
                const dur = siteBgVideo.duration;
                const fadeDuration = 0.5;
                let opacity = 1;

                if (cur < fadeDuration) {
                    opacity = cur / fadeDuration;
                } else if (cur > dur - fadeDuration) {
                    opacity = Math.max(0, (dur - cur) / fadeDuration);
                }

                siteBgVideo.style.opacity = String(opacity);
            }

            videoFadeFrame = requestAnimationFrame(updateVideoFade);
        };

        const restartVideo = () => {
            siteBgVideo.style.opacity = '0';
            setTimeout(() => {
                siteBgVideo.currentTime = 0;
                siteBgVideo.play().catch(() => {});
            }, 100);
        };

        siteBgVideo.addEventListener('ended', restartVideo);
        siteBgVideo.addEventListener('loadeddata', () => {
            siteBgVideo.play().catch(() => {});
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                siteBgVideo.pause();
            } else {
                siteBgVideo.play().catch(() => {});
            }
        });

        updateVideoFade();
    }

    // ===== PARTICLE BACKGROUND =====
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null };
        const particleCount = Math.min(80, Math.floor(window.innerWidth / 15));
        const particleColors = [
            [99, 102, 241],
            [15, 211, 197],
            [168, 85, 247]
        ];

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
                this.color = particleColors[Math.floor(Math.random() * particleColors.length)];
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
                ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.opacity})`;
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
                        const mix = (particles[i].color[0] + particles[j].color[0]) / 2;
                        ctx.beginPath();
                        ctx.strokeStyle = mix > 160
                            ? `rgba(99, 102, 241, ${opacity})`
                            : `rgba(15, 211, 197, ${opacity})`;
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
            link.addEventListener('click', () => {
                // dropdown triggers are handled by the dropdown handler below
                if (link.parentElement.classList.contains('nav-item--dropdown')) return;
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

    // Dropdowns (all pages): click/tap the trigger to pin it open; click elsewhere to close.
    // Hover also opens it on desktop (CSS), so it stays open while the cursor moves to an item.
    const dropdownItems = document.querySelectorAll('.nav-item--dropdown');
    dropdownItems.forEach(item => {
        const trigger = item.querySelector(':scope > a');
        if (!trigger) return;
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const willOpen = !item.classList.contains('open');
            dropdownItems.forEach(other => {
                other.classList.remove('open');
                other.querySelector(':scope > a')?.setAttribute('aria-expanded', 'false');
            });
            item.classList.toggle('open', willOpen);
            trigger.setAttribute('aria-expanded', String(willOpen));
        });
    });
    document.addEventListener('click', (e) => {
        dropdownItems.forEach(item => {
            if (!item.contains(e.target)) {
                item.classList.remove('open');
                item.querySelector(':scope > a')?.setAttribute('aria-expanded', 'false');
            }
        });
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') dropdownItems.forEach(item => item.classList.remove('open'));
    });

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

    // ===== HERO MEDIA PARALLAX =====
    const hero = document.getElementById('hero');
    const heroBanner = document.querySelector('.hero-media__banner');
    const heroSymbol = document.querySelector('.hero-media__symbol');
    if (hero && heroBanner && heroSymbol && window.innerWidth > 768) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5);
            const y = ((e.clientY - rect.top) / rect.height - 0.5);

            heroBanner.style.transform = `translate3d(calc(-50% + ${x * 22}px), calc(-50% + ${y * 18}px), 0) scale(1.06)`;
            heroSymbol.style.transform = `translate3d(calc(-50% + ${x * -14}px), calc(-50% + ${y * -10}px), 0) scale(0.98)`;
        });

        hero.addEventListener('mouseleave', () => {
            heroBanner.style.transform = '';
            heroSymbol.style.transform = '';
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
    // WhatsApp is the single enquiry channel across the website.  A prefilled
    // message keeps the hand-off clear while letting visitors edit it freely.
    const WHATSAPP_URL = 'https://wa.me/919051867095?text=' + encodeURIComponent(
        'Hello AK International, I would like to discuss my requirements.'
    );

    const whatsappStyles = document.createElement('style');
    whatsappStyles.textContent = `
        .back-to-top { position:fixed; bottom:105px; right:35px; width:50px; height:50px; border:0; border-radius:50%; background:linear-gradient(135deg,#6366f1,#a855f7); color:#fff; cursor:pointer; font-size:1.2rem; box-shadow:0 4px 20px rgba(99,102,241,.4); z-index:999; opacity:0; visibility:hidden; transform:translateY(10px); transition:all .3s ease; }
        .back-to-top.show { opacity:1; visibility:visible; transform:translateY(0); }
        .floating-whatsapp { position:fixed; right:30px; bottom:30px; z-index:9999; width:60px; height:60px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:#25d366; color:#fff; font-size:31px; text-decoration:none; box-shadow:0 8px 24px rgba(37,211,102,.38); transition:transform .25s ease, box-shadow .25s ease; animation:whatsappFloat 3.5s ease-in-out infinite; }
        .floating-whatsapp:hover, .floating-whatsapp:focus-visible { color:#fff; transform:translateY(-4px) scale(1.08); box-shadow:0 12px 30px rgba(37,211,102,.52); }
        .floating-whatsapp::before { content:'Chat with us on WhatsApp'; position:absolute; right:72px; width:max-content; padding:9px 12px; border-radius:8px; background:#17212b; color:#fff; font:600 12px/1.2 Inter,-apple-system,BlinkMacSystemFont,sans-serif; opacity:0; pointer-events:none; transform:translateX(6px); transition:opacity .2s ease,transform .2s ease; box-shadow:0 4px 14px rgba(0,0,0,.2); }
        .floating-whatsapp:hover::before, .floating-whatsapp:focus-visible::before { opacity:1; transform:translateX(0); }
        @keyframes whatsappFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
        @media (max-width:768px) { .back-to-top { bottom:87px; right:23px; width:46px; height:46px; } .floating-whatsapp { right:20px; bottom:20px; width:54px; height:54px; font-size:28px; } .floating-whatsapp::before { display:none; } }
    `;
    document.head.appendChild(whatsappStyles);

    const whatsappButton = document.createElement('a');
    whatsappButton.className = 'floating-whatsapp';
    whatsappButton.href = WHATSAPP_URL;
    whatsappButton.target = '_blank';
    whatsappButton.rel = 'noopener';
    whatsappButton.setAttribute('aria-label', 'Chat with AK International on WhatsApp');
    whatsappButton.setAttribute('title', 'Chat with us on WhatsApp');
    whatsappButton.innerHTML = '<i class="fab fa-whatsapp" aria-hidden="true"></i>';
    document.body.appendChild(whatsappButton);

    // Route all previous contact, quote and enquiry links to WhatsApp.
    document.querySelectorAll('a[href$="#contact"], a[href^="mailto:info@akint.co.in?subject=Product"]').forEach((link) => {
        link.href = WHATSAPP_URL;
        link.target = '_blank';
        link.rel = 'noopener';
        link.setAttribute('aria-label', `${(link.textContent || 'Contact us').trim()} on WhatsApp`);
    });

    return;

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
            width: 290px;
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
                width: min(290px, calc(100vw - 40px));
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
    tooltip.innerHTML = "";

    // Chat Trigger Button
    const chatButton = document.createElement('button');
    chatButton.className = 'floating-chat-icon';
    chatButton.id = 'floatingChatIcon';
    chatButton.setAttribute('aria-label', 'Request a Call Back or Send a Query');
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

    // 4. Behaviors & Animations
    // Show tooltip after 3 seconds
    let tooltipTimeout = setTimeout(() => {
        showMenu();
        tooltip.classList.add('show');
    }, 3000);

    // Call back / query request logic (submissions are emailed via Web3Forms)
    // The access key is public by design; get one at https://web3forms.com using noreply@akint.co.in
    const WEB3FORMS_ACCESS_KEY = '98b31045-1b2f-420c-9370-3f17ab4d1ccd';
    const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

    // ===== "Get a Quote" — full professional request modal =====
    const QUOTE_PRODUCTS = [
        'Integrated Business Management (IBM)',
        'Web Development',
        'Advance Vehicle & Heavy Equipment Management',
        'Business Management Light',
        'Invoice Creation',
        'Inventory Management',
        'Odoo Solutions',
        'Not Sure / Other'
    ];
    const QUOTE_COMPANY_SIZES = [
        '1–10 Employees',
        '11–50 Employees',
        '51–200 Employees',
        '201–500 Employees',
        '500+ Employees'
    ];

    let quoteModalRefs = null;

    function ensureQuoteModal() {
        if (quoteModalRefs) return quoteModalRefs;

        const quoteStyles = `
            .quote-modal-overlay {
                position: fixed; inset: 0; z-index: 10050;
                background: rgba(5, 5, 10, 0.72);
                backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
                display: flex; align-items: center; justify-content: center;
                padding: 24px; opacity: 0; visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            .quote-modal-overlay.show { opacity: 1; visibility: visible; }
            .quote-modal {
                width: 100%; max-width: 640px; max-height: 90vh; overflow-y: auto;
                background: linear-gradient(180deg, rgba(20,20,28,0.98), rgba(14,14,20,0.98));
                border: 1px solid rgba(255,255,255,0.08); border-radius: 20px;
                padding: 34px 36px; box-shadow: 0 30px 80px rgba(0,0,0,0.55);
                position: relative;
                transform: translateY(16px) scale(0.97);
                transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .quote-modal-overlay.show .quote-modal { transform: translateY(0) scale(1); }
            .quote-modal__close {
                position: absolute; top: 18px; right: 18px; width: 34px; height: 34px;
                border-radius: 50%; border: 1px solid rgba(255,255,255,0.1);
                background: rgba(255,255,255,0.04); color: #cbd5e1; font-size: 18px;
                cursor: pointer; display: flex; align-items: center; justify-content: center;
                transition: background 0.2s, color 0.2s;
            }
            .quote-modal__close:hover { background: rgba(255,255,255,0.12); color: #fff; }
            .quote-modal__eyebrow {
                font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
                color: #818cf8; margin-bottom: 8px;
            }
            .quote-modal__title { font-size: clamp(1.3rem, 3vw, 1.7rem); font-weight: 800; color: #fff; margin: 0 0 8px; }
            .quote-modal__subtitle { font-size: 14px; color: #9aa5b8; line-height: 1.6; margin: 0 0 26px; max-width: 480px; }
            .quote-form__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 18px; }
            .quote-form__field { display: flex; flex-direction: column; gap: 6px; }
            .quote-form__field--full { grid-column: 1 / -1; }
            .quote-form__field label { font-size: 12.5px; font-weight: 600; color: #c7d0e0; }
            .quote-form__field label .req { color: #f87171; margin-left: 2px; }
            .quote-form__field input, .quote-form__field select, .quote-form__field textarea {
                width: 100%; padding: 11px 13px; border-radius: 10px;
                border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03);
                color: #fff; font-size: 14px; font-family: inherit;
                transition: border-color 0.2s, background 0.2s;
            }
            .quote-form__field input::placeholder, .quote-form__field textarea::placeholder { color: #5b6476; }
            .quote-form__field input:focus, .quote-form__field select:focus, .quote-form__field textarea:focus {
                outline: none; border-color: #6366f1; background: rgba(99,102,241,0.07);
            }
            .quote-form__field select { cursor: pointer; }
            .quote-form__field select option { background: #15151d; color: #fff; }
            .quote-form__field textarea { resize: vertical; min-height: 80px; }
            .quote-form__error {
                margin-top: 14px; padding: 10px 12px; border-radius: 10px;
                background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25);
                color: #fca5a5; font-size: 13px; display: none;
            }
            .quote-form__footer {
                margin-top: 24px; display: flex; align-items: center; justify-content: space-between;
                gap: 16px; flex-wrap: wrap;
            }
            .quote-form__note { font-size: 11.5px; color: #6b7686; }
            .quote-form__submit {
                background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none;
                padding: 13px 28px; border-radius: 12px; font-size: 14px; font-weight: 700;
                cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
                transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
                box-shadow: 0 10px 30px rgba(99,102,241,0.3);
            }
            .quote-form__submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(99,102,241,0.4); }
            .quote-form__submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
            .quote-modal__success { text-align: center; padding: 22px 0 4px; }
            .quote-modal__success-icon {
                width: 62px; height: 62px; border-radius: 50%; margin: 0 auto 18px;
                background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.3);
                color: #4ade80; display: flex; align-items: center; justify-content: center; font-size: 26px;
            }
            .quote-modal__success h3 { color: #fff; font-size: 1.3rem; margin: 0 0 10px; }
            .quote-modal__success p { color: #9aa5b8; font-size: 14px; line-height: 1.65; margin: 0 auto 24px; max-width: 420px; }
            @media (max-width: 640px) {
                .quote-modal { padding: 26px 20px; border-radius: 16px; max-height: 92vh; }
                .quote-form__grid { grid-template-columns: 1fr; }
                .quote-form__footer { flex-direction: column-reverse; align-items: stretch; }
                .quote-form__submit { justify-content: center; }
            }
        `;
        const quoteStyleEl = document.createElement('style');
        quoteStyleEl.textContent = quoteStyles;
        document.head.appendChild(quoteStyleEl);

        const overlay = document.createElement('div');
        overlay.className = 'quote-modal-overlay';
        overlay.id = 'quoteModalOverlay';
        const modal = document.createElement('div');
        modal.className = 'quote-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Request a Quote');
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        function close() {
            overlay.classList.remove('show');
            document.body.style.overflow = '';
        }

        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('show')) close();
        });

        quoteModalRefs = { overlay, modal, close };
        return quoteModalRefs;
    }

    function optionsHtml(items) {
        return items.map(item => `<option>${item}</option>`).join('');
    }

    function renderQuoteForm(modal, close) {
        modal.innerHTML = `
            <button type="button" class="quote-modal__close" id="quoteModalClose" aria-label="Close">&times;</button>
            <div class="quote-modal__eyebrow">Request a Quote</div>
            <h2 class="quote-modal__title">Tell us about your business</h2>
            <p class="quote-modal__subtitle">Share a few details and our team will get back to you with a tailored quote within 24 hours.</p>
            <form class="quote-form" id="quoteForm" novalidate>
                <input type="text" id="quoteBotcheck" tabindex="-1" autocomplete="off" style="display:none">
                <div class="quote-form__grid">
                    <div class="quote-form__field">
                        <label for="quoteName">Full Name<span class="req">*</span></label>
                        <input type="text" id="quoteName" placeholder="Your full name" autocomplete="name">
                    </div>
                    <div class="quote-form__field">
                        <label for="quoteEmail">Work Email<span class="req">*</span></label>
                        <input type="email" id="quoteEmail" placeholder="you@company.com" autocomplete="email">
                    </div>
                    <div class="quote-form__field">
                        <label for="quotePhone">Phone Number<span class="req">*</span></label>
                        <input type="tel" id="quotePhone" placeholder="+91 00000 00000" autocomplete="tel">
                    </div>
                    <div class="quote-form__field">
                        <label for="quoteCompany">Company Name<span class="req">*</span></label>
                        <input type="text" id="quoteCompany" placeholder="Your company name" autocomplete="organization">
                    </div>
                    <div class="quote-form__field">
                        <label for="quoteEmployees">Company Size<span class="req">*</span></label>
                        <select id="quoteEmployees">
                            <option value="" selected>Select total employees</option>
                            ${optionsHtml(QUOTE_COMPANY_SIZES)}
                        </select>
                    </div>
                    <div class="quote-form__field">
                        <label for="quoteProduct">Product Interested In<span class="req">*</span></label>
                        <select id="quoteProduct">
                            <option value="" selected>Select a product</option>
                            ${optionsHtml(QUOTE_PRODUCTS)}
                        </select>
                    </div>
                    <div class="quote-form__field quote-form__field--full">
                        <label for="quoteMessage">Requirements <span style="color:#6b7686;font-weight:500;">(optional)</span></label>
                        <textarea id="quoteMessage" rows="3" placeholder="Tell us briefly about what you need..."></textarea>
                    </div>
                </div>
                <div class="quote-form__error" id="quoteFormError"></div>
                <div class="quote-form__footer">
                    <span class="quote-form__note"><i class="fas fa-lock" style="margin-right:5px;"></i>Your information stays private.</span>
                    <button type="submit" class="quote-form__submit" id="quoteSubmitBtn">
                        <span id="quoteSubmitText">Request Quote</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </form>
        `;

        const closeBtn = modal.querySelector('#quoteModalClose');
        closeBtn.addEventListener('click', close);
        registerCursorHover(closeBtn);

        const form = modal.querySelector('#quoteForm');
        const errorEl = modal.querySelector('#quoteFormError');
        const submitBtn = modal.querySelector('#quoteSubmitBtn');
        const submitText = modal.querySelector('#quoteSubmitText');
        registerCursorHover(submitBtn);
        const val = (id) => ((modal.querySelector(id) || {}).value || '');
        const showError = (msg) => { errorEl.textContent = msg; errorEl.style.display = 'block'; };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorEl.style.display = 'none';

            const name = val('#quoteName').trim();
            const email = val('#quoteEmail').trim();
            const phone = val('#quotePhone').trim();
            const company = val('#quoteCompany').trim();
            const employees = val('#quoteEmployees');
            const product = val('#quoteProduct');
            const message = val('#quoteMessage').trim();

            if (!name) return showError('Please enter your full name.');
            if (!/^\S+@\S+\.\S+$/.test(email)) return showError('Please enter a valid work email.');
            if (!phone) return showError('Please enter your phone number.');
            if (!company) return showError('Please enter your company name.');
            if (!employees) return showError('Please select your company size.');
            if (!product) return showError('Please select a product you are interested in.');
            if (val('#quoteBotcheck')) return; // honeypot: bots fill hidden fields

            submitBtn.disabled = true;
            submitText.textContent = 'Sending...';

            const payload = {
                access_key: WEB3FORMS_ACCESS_KEY,
                subject: `Quote Request from ${name} (${company}) - akint.co.in`,
                from_name: 'AK International Website',
                replyto: email,
                request_type: 'Get a Quote',
                name, email, phone, company,
                company_size: employees,
                product_interested: product,
                message: message || 'Not specified',
                page: location.href
            };

            try {
                const resp = await fetch(WEB3FORMS_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await resp.json().catch(() => ({}));
                if (!resp.ok || !data.success) throw new Error(data.message || `Server error ${resp.status}`);

                modal.innerHTML = `
                    <button type="button" class="quote-modal__close" id="quoteModalCloseSuccess" aria-label="Close">&times;</button>
                    <div class="quote-modal__success">
                        <div class="quote-modal__success-icon"><i class="fas fa-check"></i></div>
                        <h3>Thank you, ${name}!</h3>
                        <p>We've received your request for <strong>${product}</strong>. Our team will reach out to you at ${email} within 24 hours with a tailored quote.</p>
                        <button type="button" class="quote-form__submit" id="quoteCloseBtn" style="margin:0 auto;">Close</button>
                    </div>
                `;
                const successClose = modal.querySelector('#quoteModalCloseSuccess');
                const closeBtn2 = modal.querySelector('#quoteCloseBtn');
                successClose.addEventListener('click', close);
                closeBtn2.addEventListener('click', close);
                registerCursorHover(successClose);
                registerCursorHover(closeBtn2);
            } catch (err) {
                submitBtn.disabled = false;
                submitText.textContent = 'Request Quote';
                showError('Unable to send right now. Please try again or email info@akint.co.in.');
                console.error('quote submit error', err);
            }
        });
    }

    function openQuoteModal() {
        const qm = ensureQuoteModal();
        renderQuoteForm(qm.modal, qm.close);
        qm.overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    window.openQuoteModal = openQuoteModal;

    const REQUEST_TYPES = [
        { key: 'callback', label: 'Request a Call Back' },
        { key: 'query', label: 'Send a Query' }
    ];

    const fieldStyle = 'width:100%;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);color:#fff;';
    const labelStyle = 'font-size:12px;margin-top:8px;display:block;color:#9fb4ff';

    function populateOptions() {
        const container = tooltip.querySelector('#chatOptions');
        if (!container) return;
        container.innerHTML = '';
        REQUEST_TYPES.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'chat-option';
            btn.type = 'button';
            btn.textContent = opt.label;
            btn.dataset.key = opt.key;
            btn.addEventListener('click', () => handleOptionSelect(opt));
            container.appendChild(btn);
        });
    }

    function showMenu() {
        tooltip.innerHTML = `
            <button class="chat-tooltip-close" id="chatTooltipClose" aria-label="Close message">×</button>
            <div class="chat-tooltip-title">AK Support</div>
            <div class="chat-tooltip-body">
                <div class="chat-message system">How can we help you?</div>
                <div class="chat-message system small" id="chatPrompt">Please choose an option below:</div>
                <div class="chat-options" id="chatOptions"></div>
            </div>
        `;
        const close = tooltip.querySelector('#chatTooltipClose');
        registerCursorHover(close);
        close.addEventListener('click', (e) => {
            e.stopPropagation();
            tooltip.classList.remove('show');
            clearTimeout(tooltipTimeout);
        });
        populateOptions();
    }

    const COUNTRY_CODES = 'AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI KH CM CA CV CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PS PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW'.split(' ');

    function getCountryList() {
        let names;
        try {
            const dn = new Intl.DisplayNames(['en'], { type: 'region' });
            names = COUNTRY_CODES.map(code => ({ code, name: dn.of(code) }));
        } catch (e) {
            names = [];
        }
        return names.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Detect the visitor's actual country from their IP (not browser language)
    async function detectVisitorCountryCode() {
        const sources = [
            ['https://api.country.is/', d => d.country],
            ['https://ipapi.co/json/', d => d.country_code]
        ];
        for (const [url, pick] of sources) {
            try {
                const res = await fetch(url, { cache: 'no-store' });
                if (!res.ok) continue;
                const code = String(pick(await res.json()) || '').toUpperCase();
                if (COUNTRY_CODES.includes(code)) return code;
            } catch (e) { /* try next source */ }
        }
        return '';
    }

    function handleOptionSelect(opt) {
        const body = tooltip.querySelector('.chat-tooltip-body');
        if (!body) return;
        const isCallback = opt.key === 'callback';
        const submitLabel = isCallback ? 'Request Call Back' : 'Send Query';

        body.innerHTML = `
            <div class="chat-message system">${isCallback ? 'We will call you back soon.' : 'Tell us how we can help.'}</div>
            <div class="chat-message system small">Please share a few details.</div>
            <form class="chat-form" id="chatForm" novalidate>
                <input type="text" id="chatBotcheck" tabindex="-1" autocomplete="off" style="display:none">
                <label style="${labelStyle}">Name</label>
                <input id="chatName" type="text" placeholder="Your name" style="${fieldStyle}">
                <label style="${labelStyle}">Mobile</label>
                <input id="chatMobile" type="tel" placeholder="Mobile number" style="${fieldStyle}">
                <label style="${labelStyle}">Email</label>
                <input id="chatEmail" type="email" placeholder="you@example.com" style="${fieldStyle}">
                <label style="${labelStyle}">Country</label>
                <input id="chatCountry" type="text" autocomplete="off" placeholder="Type to search country..." style="${fieldStyle}">
                <ul id="chatCountryList" style="display:none;list-style:none;margin:4px 0 0;padding:4px;max-height:150px;overflow-y:auto;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(10,10,14,0.95);"></ul>
                ${isCallback
                    ? `<label style="${labelStyle}">Preferred time (optional)</label>
                       <input id="chatTime" type="text" placeholder="e.g. Today 5-7 PM IST" style="${fieldStyle}">`
                    : `<label style="${labelStyle}">Your query</label>
                       <textarea id="chatMessage" rows="3" placeholder="Describe your query..." style="${fieldStyle}resize:vertical;"></textarea>`}
                <div id="chatFormError" class="chat-message small" style="color:#fca5a5;margin-top:6px;display:none;"></div>
                <div style="display:flex;justify-content:flex-end;margin-top:8px;"><button id="chatStartBtn" type="submit" class="btn">${submitLabel}</button></div>
            </form>
        `;

        const countryInput = tooltip.querySelector('#chatCountry');
        const countryList = tooltip.querySelector('#chatCountryList');
        const countries = getCountryList();
        let countryTouched = false;

        function renderCountryList() {
            const q = countryInput.value.trim().toLowerCase();
            // Never show the full list: nothing until the visitor types, then at most 5 matches
            const matches = q ? countries.filter(c => c.name.toLowerCase().includes(q)).slice(0, 5) : [];
            countryList.innerHTML = '';
            matches.forEach(c => {
                const li = document.createElement('li');
                li.textContent = c.name;
                li.style.cssText = 'padding:6px 8px;border-radius:6px;cursor:pointer;font-size:13px;color:#e6eefc;';
                li.addEventListener('mouseenter', () => { li.style.background = 'rgba(255,255,255,0.08)'; });
                li.addEventListener('mouseleave', () => { li.style.background = ''; });
                li.addEventListener('mousedown', (e) => {
                    e.preventDefault(); // keep focus so blur doesn't hide the list first
                    countryInput.value = c.name;
                    countryTouched = true;
                    countryList.style.display = 'none';
                });
                countryList.appendChild(li);
            });
            countryList.style.display = matches.length ? 'block' : 'none';
        }
        countryInput.addEventListener('focus', () => countryInput.select());
        countryInput.addEventListener('input', () => { countryTouched = true; renderCountryList(); });
        countryInput.addEventListener('blur', () => { countryList.style.display = 'none'; });

        detectVisitorCountryCode().then(code => {
            const match = countries.find(c => c.code === code);
            if (match && !countryTouched) countryInput.value = match.name;
        });

        const form = tooltip.querySelector('#chatForm');
        const startBtn = tooltip.querySelector('#chatStartBtn');
        const errorEl = tooltip.querySelector('#chatFormError');
        const val = (id) => ((tooltip.querySelector(id) || {}).value || '').trim();
        const showError = (msg) => { errorEl.textContent = msg; errorEl.style.display = 'block'; };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorEl.style.display = 'none';

            const name = val('#chatName');
            const mobile = val('#chatMobile');
            const email = val('#chatEmail');
            const country = val('#chatCountry');
            const preferredTime = val('#chatTime');
            const message = val('#chatMessage');

            if (!name) return showError('Please enter your name.');
            if (!mobile) return showError('Please enter your mobile number.');
            if (!/^\S+@\S+\.\S+$/.test(email)) return showError('Please enter a valid email.');
            if (country && !countries.some(c => c.name.toLowerCase() === country.toLowerCase())) return showError('Please pick your country from the list.');
            if (!isCallback && !message) return showError('Please enter your query.');
            if (val('#chatBotcheck')) return; // honeypot: bots fill hidden fields

            startBtn.disabled = true;
            startBtn.textContent = 'Sending...';

            const payload = {
                access_key: WEB3FORMS_ACCESS_KEY,
                subject: `${opt.label} from ${name} (akint.co.in)`,
                from_name: 'AK International Website',
                replyto: email,
                request_type: opt.label,
                name, mobile, email, country,
                page: location.href
            };
            if (isCallback) payload.preferred_time = preferredTime || 'Not specified';
            else payload.message = message;

            try {
                const resp = await fetch(WEB3FORMS_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await resp.json().catch(() => ({}));
                if (!resp.ok || !data.success) throw new Error(data.message || `Server error ${resp.status}`);

                body.innerHTML = '';
                const thanks = document.createElement('div');
                thanks.className = 'chat-message system';
                thanks.textContent = `Thanks ${name}! ` + (isCallback
                    ? 'We have received your request and will call you back shortly.'
                    : 'We have received your query and will get back to you soon.');
                body.appendChild(thanks);
            } catch (err) {
                startBtn.disabled = false;
                startBtn.textContent = submitLabel;
                showError('Unable to send right now. Please try again or email info@akint.co.in.');
                console.error('request submit error', err);
            }
        });
    }

    function openRequestWidget(typeKey) {
        clearTimeout(tooltipTimeout);
        showMenu();
        tooltip.classList.add('show');
        const opt = REQUEST_TYPES.find(t => t.key === typeKey);
        if (opt) handleOptionSelect(opt);
    }
    window.openRequestWidget = openRequestWidget;

    chatButton.addEventListener('click', () => {
        if (tooltip.classList.contains('show')) {
            tooltip.classList.remove('show');
        } else {
            showMenu();
            tooltip.classList.add('show');
        }
    });

    // Send "Contact", "Get a Quote", etc. links to the call back / query request instead of the contact section
    document.addEventListener('click', (e) => {
        const link = e.target.closest && e.target.closest('a[href$="#contact"]');
        if (!link) return;
        e.preventDefault();
        const linkText = (link.textContent || '').trim().toLowerCase();
        if (linkText === 'get a quote') {
            openQuoteModal();
        } else {
            openRequestWidget();
        }
    });
})();

// ===== CONSOLE MESSAGE =====
// Compact, keyboard-accessible footer groups on phones.
(function () {
    const mobileFooter = window.matchMedia('(max-width: 600px)');
    const groups = [...document.querySelectorAll('.footer-col:not(.footer-col--brand)')];
    if (!groups.length) return;

    groups.forEach((group) => {
        const heading = group.querySelector('h4');
        if (!heading) return;
        group.classList.add('is-collapsible');
        heading.setAttribute('role', 'button');
        heading.setAttribute('tabindex', '0');

        const toggle = () => {
            if (!mobileFooter.matches) return;
            const expanded = group.classList.toggle('is-expanded');
            heading.setAttribute('aria-expanded', String(expanded));
        };
        heading.addEventListener('click', toggle);
        heading.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggle();
            }
        });
    });

    const sync = () => groups.forEach((group) => {
        if (mobileFooter.matches) group.classList.remove('is-expanded');
        else group.classList.add('is-expanded');
        const heading = group.querySelector('h4');
        if (heading) heading.setAttribute('aria-expanded', String(group.classList.contains('is-expanded')));
    });
    sync();
    mobileFooter.addEventListener('change', sync);
})();

// Foundation navigation uses a dedicated mobile trigger rather than wrapping desktop links.
(function () {
    const nav = document.querySelector('.foundation-nav');
    const menu = nav?.querySelector('.foundation-nav__menu');
    const brand = nav?.querySelector('.foundation-nav__brand');
    if (!nav || !menu || !brand || nav.querySelector('.foundation-nav__toggle')) return;

    const toggle = document.createElement('button');
    toggle.className = 'foundation-nav__toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Open navigation menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
    brand.insertAdjacentElement('afterend', toggle);

    const close = () => {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation menu');
        toggle.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
    };
    const open = () => {
        menu.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close navigation menu');
        toggle.innerHTML = '<i class="fas fa-xmark" aria-hidden="true"></i>';
    };

    toggle.addEventListener('click', () => menu.classList.contains('is-open') ? close() : open());
    menu.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (link && !link.closest('.nav-item--dropdown')) close();
    });
    document.addEventListener('click', (event) => {
        if (window.innerWidth <= 768 && menu.classList.contains('is-open') && !nav.contains(event.target)) close();
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 768) close(); });
})();

console.log('%c🚀 Welcome to AK International! ', 'background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; font-size: 20px; padding: 10px; border-radius: 5px;');

// ===== PROFESSIONAL ARABIC / ENGLISH I18N SYSTEM =====
(function () {
    'use strict';
    const arabicDict = {"AK International - Technology Solutions": "إيه كيه إنترناشيونال - حلول التقنية", "Google tag (gtag.js)": "Google tag (gtag.js)", "Custom Cursor": "مؤشر مخصص", "About / Features Section": "قسم من نحن / الميزات", "Services Section": "قسم الخدمات", "More Tech Services": "المزيد من الخدمات التقنية", "Stats Marquee": "شريط الإحصائيات", "Valued Customers Section": "قسم العملاء المميزين", "Tech Stack / Portfolio Section": "قسم التقنيات وسابقة الأعمال", "Import Export Mention Banner": "شريط قسم الاستيراد والتصدير", "Contact Section": "قسم اتصل بنا", "CTA Section": "قسم طلب الخدمة", "Footer": "التذييل", "Home": "الرئيسية", "About": "من نحن", "Customers": "العملاء", "Products": "المنتجات", "Integrated Business Management (IBM)": "إدارة الأعمال المتكاملة (IBM)", "Web Development": "تطوير المواقع والويب", "Advance Vehicle & Heavy Equipment Management": "إدارة المركبات والمعدات الثقيلة المتقدمة", "Business Management Pro": "إدارة الأعمال الاحترافية", "Invoice Creation": "إنشاء الفواتير", "Inventory Management": "إدارة المخزون", "Odoo Solutions": "حلول أودو", "Global Import Export Management": "إدارة الاستيراد والتصدير العالمية", "Our Businesses": "قطاعات أعمالنا", "AKI Ecom": "إيه كيه آي للتجارة الإلكترونية", "AKI Export": "إيه كيه آي للتصدير", "AKI IT": "إيه كيه آي لتقنية المعلومات", "Contact": "اتصل بنا", "Get a Quote": "اطلب عرض سعر", "Technology": "حلول", "Solutions": "التقنية", "Web development, mobile apps, AI systems, cloud infrastructure,": "تطوير المواقع، تطبيقات الجوال، أنظمة الذكاء الاصطناعي، البنية السحابية،", "Odoo solutions, and custom business platforms built for growth.": "حلول أودو، ومنصات الأعمال المخصصة والمصممة لدفع عجلة النمو.", "Schedule a Consult": "احجز استشارة تقنية", "Solutions built for": "حلول متقدمة مصممة من أجل", "modern business operations": "عمليات الأعمال الحديثة", "Mobile Apps": "تطبيقات الجوال", "AI Solutions": "حلول الذكاء الاصطناعي", "Cloud & DevOps": "الحوسبة السحابية والديف أوبس", "Odoo Custom Apps": "تطبيقات أودو المخصصة", "Import Export": "الاستيراد والتصدير", "Why Choose Us": "لماذا تختارنا", "Built for": "مصممة من أجل", "Innovation": "الابتكار والريادة", "We engineer high-performance digital products using the latest technologies, frameworks, and cloud infrastructure.": "نبتكر ونصمم منتجات رقمية فائقة الأداء باستخدام أحدث التقنيات وأطر العمل والبنى التحتية السحابية.", "Blazing Fast": "سرعة فائقة واستجابة فورية", "Optimized, high-performance applications with sub-second load times and 99.9% uptime guarantee.": "تطبيقات محسنة وعالية الأداء بزمن تحميل أجزاء من الثانية وضمان تشغيل بنسبة 99.9%.", "Secure by Design": "أمان مدمج في صميم التصميم", "Enterprise-grade security with end-to-end encryption, OWASP compliance, and continuous vulnerability scanning.": "أمان على مستوى المؤسسات الكبرى مع تشفير شامل وامتثال لمعايير OWASP وفحص مستمر للثغرات.", "Scalable Architecture": "بنية برمجية قابلة للتوسع", "Cloud-native solutions built on microservices and serverless architecture that scale with your growth.": "حلول سحابية متكاملة تعتمد على الخدمات المصغرة والأنظمة عديمة الخوادم تتوسع تلقائياً مع نمو أعمالك.", "24/7 Support": "دعم فني متواصل 24/7", "Dedicated technical support team with real-time monitoring and proactive issue resolution around the clock.": "فريق دعم فني متخصص يوفر المراقبة الحية والحلول الاستباقية للمشكلات على مدار الساعة.", "What We Do": "ماذا نقدم", "Our": "أبرز", "Services": "خدماتنا", "Full-stack technology solutions — from concept to deployment and beyond.": "حلول تقنية شاملة ومتكاملة — من الفكرة والتخطيط إلى الإطلاق وما بعده.", "Pixel-perfect, responsive websites and complex web applications using React, Next.js, Node.js, and modern stacks.": "مواقع متجاوبة وتطبيقات ويب معقدة فائقة الدقة باستخدام React وNext.js وNode.js وأحدث الأطر الحديثة.", "React": "React", "Next.js": "Next.js", "Node.js": "Node.js", "Native and cross-platform mobile applications for iOS & Android with smooth UX and offline-first capabilities.": "تطبيقات جوال أصلية وعابرة للمنصات لنظامي iOS وAndroid بتجربة مستخدم سلسة وإمكانية العمل دون اتصال.", "Flutter": "Flutter", "React Native": "React Native", "Swift": "Swift", "AI & ML Solutions": "حلول الذكاء الاصطناعي وتعلم الآلة", "Intelligent systems powered by machine learning, NLP, and computer vision to automate and optimize your business.": "أنظمة ذكية مدعومة بتعلم الآلة ومعالجة اللغات الطبيعية والرؤية الحاسوبية لأتمتة أعمالك وتعزيز كفاءتها.", "Python": "Python", "TensorFlow": "TensorFlow", "GPT": "GPT", "Advanced Solutions": "حلول تقنية متطورة", "Enterprise-Grade": "بمستوى المؤسسات الكبرى", "We engineer robust, scalable solutions for startups and enterprises alike.": "نطور حلولاً متينة وقابلة للتوسع تناسب الشركات الناشئة والمؤسسات الكبرى على حد سواء.", "Cloud": "السحابة", "End-to-end cloud infrastructure on AWS, GCP & Azure with CI/CD pipelines, containerization, and auto-scaling.": "بنية تحتية سحابية متكاملة على AWS وGCP وAzure مع مسارات CI/CD وحاويات البرمجيات والتوسع التلقائي.", "E-Commerce": "التجارة الإلكترونية", "Digital Commerce": "التجارة الرقمية", "Full-featured e-commerce platforms with inventory management, payment gateways, and analytics dashboards.": "منصات تجارة إلكترونية متكاملة الميزات مع إدارة المخزون وبوابات الدفع ولوحات تحكم تحليلية.", "Automation": "الأتمتة", "Business Automation": "أتمتة الأعمال والعمليات", "Intelligent workflow automation, CRM integrations, and custom ERP systems to streamline your operations.": "أتمتة ذكية لمسارات العمل وربط أنظمة إدارة علاقات العملاء وتطوير أنظمة ERP مخصصة لتسهيل عملياتك.", "ERP": "ERP", "Odoo Custom Apps & Addons": "تطبيقات وإضافات أودو المخصصة", "Tailor-made Odoo modules, custom apps, and addons to extend and automate your business workflows on any Odoo version.": "تطوير وحدات وتطبيقات وإضافات أودو المخصصة لتوسيع وأتمتة مسارات أعمالك على أي إصدار من أودو.", "150+": "150+", "Projects": "المشاريع المنجزة", "50+": "50+", "Clients": "العملاء والشركاء", "99%": "99%", "Uptime": "جاهزية التشغيل", "10+": "10+", "Years": "سنوات من الخبرة", "24/7": "24/7", "Support": "دعم مستمر", "Our Network of": "شبكة شركاء", "Excellence": "التميز والريادة", "We're part of a trusted network of specialized companies serving the industry.": "نحن جزء من شبكة موثوقة من الشركات المتخصصة التي تخدم قطاعات الصناعة والتجارة.", "Partner": "شريك", "Expert Partners": "شركاء متخصصون", "Fahmaat Factory": "مصنع فحمات", "EP Tech": "إي بي تك", "Rawae Al Batin": "روائع الباطن", "Trusted Customers": "عملاء يثقون بنا", "Our Valued": "عملاؤنا", "Trusted by Growing Businesses": "موثوق به من الشركات والمؤسسات الصاعدة", "A showcase of organizations that trust AK International for digital solutions and business transformation.": "نخبة من المؤسسات التي تعتمد على إيه كيه إنترناشيونال للحلول الرقمية والتحول التقني الشامل.", "MN Enterprise": "مؤسسة إم إن", "JA Enterprise": "مؤسسة جيه إيه", "JS Enterprise": "مؤسسة جيه إس", "Akhan Legal Consultancy & Services": "أخان للاستشارات والخدمات القانونية", "Sani Construction": "ساني للمقاولات العامة", "Tech Stack": "حزمة التقنيات", "Technologies We": "تقنيات متقدمة", "Master": "نحترفها ونتقنها", "We stay ahead of the curve with the most powerful tools in the industry.": "نواكب أحدث الابتكارات ونعتمد أقوى الأدوات والتقنيات البرمجية المعتمدة عالمياً.", "Frontend & Backend": "الواجهات الأمامية والخلفية", "React, Next.js, Vue, Node.js, Python, Django, Express — full-stack mastery.": "React، Next.js، Vue، Node.js، Python، Django، Express — إتقان شامل للبرمجة المتكاملة.", "AWS, GCP, Azure, Docker, Kubernetes, CI/CD — production-ready infrastructure.": "AWS، GCP، Azure، Docker، Kubernetes، CI/CD — بنية تحتية سحابية جاهزة للمشاريع الضخمة.", "Mobile & AI": "تطبيقات الجوال والذكاء الاصطناعي", "Flutter, React Native, Swift, TensorFlow, OpenAI — intelligent cross-platform apps.": "Flutter، React Native، Swift، TensorFlow، OpenAI — تطبيقات ذكية متعددة المنصات.", "We also operate in": "نعمل أيضاً في قطاع", "Import & Export": "الاستيراد والتصدير", "AK International has a dedicated import/export division —": "تمتلك إيه كيه إنترناشيونال قسماً متخصصاً ومستقلاً للتصدير والاستيراد —", "— handling global trade in leather goods, automotive parts, and more.": "— يدير التجارة الدولية في المنتجات الجلدية الفاخرة وقطع غيار السيارات والمزيد.", "AKI Import Export": "إيه كيه آي للاستيراد والتصدير", "Explore AKI Import Export": "استكشف قطاع إيه كيه آي للتصدير", "Get In Touch": "تواصل معنا", "Us": "معنا", "Have a project in mind? Let's build something amazing together.": "هل لديك فكرة مشروع؟ دعنا نبني معاً شيئاً رائعاً واستثنائياً.", "Call Us": "اتصل بنا هاتفياً", "KSA:": "السعودية:", "+966 564118034": "‎+966 564118034‎", "India:": "الهند:", "+91 90518 67095": "‎+91 90518 67095‎", "Email Us": "راسلنا عبر البريد الإلكتروني", "info@akint.co.in": "info@akint.co.in", "We'll respond within 24 hours": "سنرد على رسالتك خلال 24 ساعة", "Visit Us": "تفضل بزيارتنا", "Kolkata, India": "كولكاتا، الهند", "Open for business meetings": "متاحون للاجتماعات المهنية والشراكات", "Ready to Build Your": "هل أنت مستعد لبناء", "Next Project": "مشروعك القادم", "Let's discuss how AK International can bring your digital vision to life.": "دعنا نناقش كيف يمكن لإيه كيه إنترناشيونال تحويل رؤيتك الرقمية إلى واقع ملموس.", "Contact Us Today": "تواصل معنا اليوم", "AK": "إيه كيه", "Int": "إنترناشيونال", "Next-gen technology solutions — web, mobile, AI, cloud, and beyond. Empowering businesses with cutting-edge digital products.": "حلول تقنية متقدمة — مواقع، تطبيقات جوال، ذكاء اصطناعي، سحابة والمزيد. نمكّن الشركات بمنتجات رقمية متطورة.", "Quick Links": "روابط سريعة", "About Us": "من نحن", "Portfolio": "سابقة الأعمال", "Contact Info": "معلومات الاتصال", "AKI Tech - About Us": "إيه كيه آي تك - من نحن", "Page Header": "رأس الصفحة", "About Content": "محتوى من نحن", "Our Values": "قيمنا المؤسسية", "Team Section": "فريق العمل", "AKI Tech": "إيه كيه آي تك", "INR (₹)": "روبية هندية (₹)", "INR": "INR", "USD ($)": "دولار أمريكي ($)", "USD": "USD", "EUR (€)": "يورو (€)", "EUR": "EUR", "GBP (£)": "جنيه إسترليني (£)", "GBP": "GBP", "Empowering Businesses Through Next-Gen Technology": "تمكين الشركات والمؤسسات من خلال أحدث تقنيات الجيل القادم", "At AK International, we believe in the transformative power of technology. Founded with a vision to bridge the gap between complex business challenges and innovative digital solutions, we have grown into a trusted technology partner for startups, SMEs, and enterprises globally.": "في إيه كيه إنترناشيونال، نؤمن بالقوة التحويلية للتكنولوجيا. تأسسنا برؤية تهدف إلى سد الفجوة بين تحديات الأعمال المعقدة والحلول الرقمية المبتكرة، ونمونا لنصبح شريكاً تقنياً موثوقاً للشركات الناشئة والمؤسسات الصغيرة والمتوسطة والكبرى حول العالم.", "Our multidisciplinary team of engineers, designers, and strategists work collaboratively to deliver end-to-end solutions that drive real business outcomes. From intuitive mobile apps to robust enterprise ERP platforms, we craft technology that scales with your ambition.": "يعمل فريقنا متعدد التخصصات من المهندسين والمصممين والمخططين الاستراتيجيين بتعاون وثيق لتقديم حلول شاملة تحقق نتائج أعمال ملموسة. من تطبيقات الجوال البديهية إلى منصات ERP المؤسسية القوية، نصنع حلولاً تقنية تتوسع مع طموحاتك.", "Projects Completed": "مشروع مكتمل", "Happy Clients": "عميل سعيد", "Uptime Guarantee": "ضمان جاهزية التشغيل", "Global Reach": "انتشار وتغطية دولية", "Innovation First": "الابتكار أولاً", "We continuously explore cutting-edge technologies to keep our clients ahead of the competition.": "نستكشف باستمرار أحدث التقنيات لنضمن بقاء عملائنا في صدارة المنافسة دائماً.", "Quality Driven": "الالتزام بأعلى معايير الجودة", "Every line of code, design asset, and architecture decision is crafted with precision and care.": "كل سطر برمجي، وكل عنصر تصميم، وكل قرار معماري يُصاغ بأعلى درجات الدقة والعناية.", "Client Centric": "التركيز التام على العميل", "Your goals are our goals. We build lasting partnerships based on transparency and mutual growth.": "أهدافك هي أهدافنا؛ نبني شراكات مستدامة قائمة على الشفافية والنمو المشترك.", "Agile & Adaptive": "المرونة والقدرة على التكيف", "We move fast and adapt to changing requirements, ensuring timely delivery without compromising quality.": "نتحرك بسرعة ونتكيف مع المتطلبات المتغيرة، مما يضمن التسليم في المواعيد المحددة دون أدنى مساومة على الجودة.", "Data Privacy": "خصوصية وأمان البيانات", "Security is woven into everything we do, ensuring your intellectual property and data remain protected.": "الأمان متأصل في كل ما نقوم به، لنضمن بقاء بياناتك وملكيتك الفكرية محمية بالكامل.", "Continuous Learning": "التعلم والتطور المستمر", "Technology evolves rapidly, and so do we — constantly upgrading our skills and methodologies.": "التكنولوجيا تتطور بسرعة فائقة، ونحن نتطور معها — نرتقي بمهاراتنا ومنهجياتنا باستمرار.", "Meet Our Leadership": "تعرف على قادتنا", "The visionaries driving innovation and excellence at AK International": "أصحاب الرؤية الذين يقودون الابتكار والتميز في إيه كيه إنترناشيونال", "Founder & CEO": "المؤسس والرئيس التنفيذي", "Chief Technology Officer": "الرئيس التنفيذي للتقنية", "Head of Product": "رئيس إدارة المنتجات", "Head of Design": "رئيس قسم التصميم", "Join Our Team": "انضم إلى فريق عملنا", "We're always looking for talented individuals who are passionate about technology.": "نبحث دائماً عن أصحاب المواهب الاستثنائية والشغوفين بعالم التكنولوجيا.", "View Open Positions": "استعرض الوظائف الشاغرة", "Schedule a Call": "احجز مكالمة عمل", "Our Journey": "مسيرتنا وقصة نجاحنا", "How We Grew From a Vision to a Global Tech Partner": "كيف انطلقنا من مجرد فكرة ورؤية لنصبح شريكاً تقنياً عالمياً", "Foundation": "التأسيس والانطلاقة", "Started with a small team focused on web and mobile development for local businesses.": "بدأنا بفريق صغير ركز على تطوير المواقع وتطبيقات الجوال للشركات المحلية.", "Expansion into Enterprise": "التوسع نحو قطاع المؤسسات", "Expanded our service portfolio to include ERP systems, Odoo integrations, and cloud solutions.": "وسعنا باقة خدماتنا لتشمل أنظمة تخطيط الموارد ERP، وتكاملات أودو، والحلول السحابية المتقدمة.", "AI & Automation Era": "عصر الذكاء الاصطناعي والأتمتة", "Integrated AI/ML capabilities and launched dedicated enterprise automation suites.": "دمجنا قدرات الذكاء الاصطناعي وتعلم الآلة وأطلقنا حزم أتمتة متخصصة للمؤسسات الكبرى.", "Global Footprint": "الانتشار الدولي", "Serving clients across the Middle East, India, and North America with 24/7 dedicated support.": "نخدم عملاءنا في الشرق الأوسط والهند وأمريكا الشمالية مع دعم فني مخصص على مدار الساعة.", "AKI Tech - Services": "إيه كيه آي تك - الخدمات", "Services Detail Section": "قسم تفاصيل الخدمات", "Process Section": "قسم مسار العمل", "AkTech": "إيه كيه تك", "Our Services": "خدماتنا المتميزة", "Comprehensive technology solutions tailored to your business needs": "حلول تقنية شاملة ومخصصة لتلبية متطلبات أعمالك بدقة", "We create stunning, responsive websites and powerful web applications that deliver exceptional user experiences. Our team specializes in modern frameworks and technologies to build scalable, maintainable solutions.": "نبتكر مواقع ويب متجاوبة وجذابة وتطبيقات ويب قوية توفر تجارب مستخدم استثنائية. يتخصص فريقنا في أحدث أطر العمل لبناء حلول قابلة للتوسع وسهلة الصيانة.", "Custom Website Design": "تصميم مواقع ويب مخصصة", "E-commerce Solutions": "حلول التجارة الإلكترونية", "Progressive Web Apps (PWA)": "تطبيقات الويب التقدمية (PWA)", "CMS Development (WordPress, Drupal)": "تطوير أنظمة إدارة المحتوى (WordPress، Drupal)", "API Development & Integration": "تطوير وربط واجهات البرمجة (APIs)", "Mobile App Development": "تطوير تطبيقات الجوال", "Transform your ideas into powerful mobile applications. We develop native and cross-platform apps that provide seamless experiences across iOS and Android devices.": "حوّل أفكارك إلى تطبيقات جوال قوية. نطور تطبيقات أصلية ومتعددة المنصات تقدم تجربة استخدام سلسة عبر أجهزة iOS وAndroid.", "iOS App Development": "تطوير تطبيقات iOS", "Android App Development": "تطوير تطبيقات Android", "Cross-Platform (React Native, Flutter)": "تطبيقات عابرة للمنصات (React Native، Flutter)", "App Store Optimization (ASO)": "تحسين ظهور التطبيقات في المتاجر (ASO)", "App Maintenance & Support": "صيانة ودعم التطبيقات", "UI/UX Design": "تصميم واجهة المستخدم UI/UX", "Create intuitive, engaging user experiences that delight your customers. Our design process combines user research, modern aesthetics, and usability testing to craft exceptional digital products.": "ابتكر تجارب مستخدم بديهية وجذابة تنال إعجاب عملائك. يجمع مسار التصميم لدينا بين دراسة سلوك المستخدم والمظهر العصري واختبارات سهولة الاستخدام.", "User Research & Personas": "أبحاث المستخدمين وبناء الشخصيات المستهدفة", "Wireframing & Prototyping": "المخططات الهيكلية والنماذج التفاعلية", "Design Systems": "بناء أنظمة ومكتبات التصميم", "Usability Testing": "اختبارات قابلية الاستخدام", "Mobile & Web UI Design": "تصميم واجهات الجوال والويب", "Cloud Solutions": "الحلول والخدمات السحابية", "Leverage the power of cloud computing to scale your infrastructure efficiently. We help you migrate, manage, and optimize your cloud environments on leading platforms.": "استفد من قوة الحوسبة السحابية لتوسيع بنيتك التحتية بكفاءة عالية. نساعدك في ترحيل وإدارة وتحسين بيئاتك السحابية على كبرى المنصات العالمية.", "Cloud Migration": "الترحيل السحابي", "AWS, Azure & Google Cloud": "منصات AWS وAzure وGoogle Cloud", "DevOps & CI/CD": "منهجيات الديف أوبس ومسارات CI/CD", "Serverless Architecture": "البنى التحتية عديمة الخوادم", "Cloud Security & Compliance": "الأمان السحابي والامتثال الأمني", "Digital Marketing": "التسويق الرقمي", "Grow your online presence and reach your target audience effectively. Our data-driven digital marketing strategies help you increase visibility, generate leads, and drive conversions.": "عزز حضورك الرقمي وتصل إلى جمهورك المستهدف بكفاءة. تساعدك استراتيجياتنا التسويقية المعتمدة على البيانات في زيادة الانتشار وتوليد العملاء المحتملين ورفع المبيعات.", "Search Engine Optimization (SEO)": "تحسين محركات البحث (SEO)", "Social Media Marketing": "التسويق عبر شبكات التواصل الاجتماعي", "Content Strategy": "استراتيجيات صناعة المحتوى", "Pay-Per-Click Advertising (PPC)": "إعلانات الدفع بالنقرة (PPC)", "Analytics & Reporting": "التحليلات وإعداد التقارير الدقيقة", "IT Consulting": "الاستشارات التقنية المتخصصة", "Make strategic technology decisions with confidence. Our experienced consultants provide expert guidance on technology stack selection, architecture design, and digital transformation.": "اتخذ قراراتك التقنية الاستراتيجية بكل ثقة. يقدم مستشارونا المتمرسون توجيهات خبيرة لاختيار حزم التقنيات وهندسة البرمجيات والتحول الرقمي الشامل.", "Technology Strategy": "استراتيجيات التحول التقني", "Architecture Review": "مراجعة وتقييم البنى البرمجية", "Digital Transformation": "التحول الرقمي للمؤسسات", "Security Audits": "التدقيق والفحص الأمني للأنظمة", "Tech Stack Evaluation": "تقييم واختيار الحزم البرمجية", "How We Work": "منهجية ومسار عملنا", "A proven process that ensures project success from start to finish": "منهجية عمل مجربة ومثبتة تضمن نجاح مشروعك من البداية وحتى الإطلاق", "Discovery & Planning": "الاستكشاف والتخطيط", "We analyze your requirements, define objectives, and create a comprehensive project roadmap.": "نحلل متطلباتك بدقة، ونحدد الأهداف بوضوح، ونرسم خارطة طريق شاملة للمشروع.", "Design & Prototyping": "التصميم وبناء النماذج", "Our designers create intuitive wireframes and stunning visual designs that align with your brand.": "يبتكر مصممونا مخططات بديهية وتصاميم بصرية مبهرة تتماشى مع هويتك المؤسسية.", "Development & Testing": "التطوير البرمجي والاختبار", "We build your solution using modern technologies and conduct rigorous testing throughout the process.": "نطور حلولك البرمجية باستخدام أحدث التقنيات ونجري اختبارات جودة دقيقة في كافة المراحل.", "Deployment & Launch": "النشر والإطلاق الرسمي", "We deploy your project to production and ensure a smooth, seamless launch with minimal downtime.": "نطلق مشروعك في البيئة الحية ونضمن إطلاقاً سلساً وآمناً بأعلى مستويات الجاهزية.", "Ongoing Support": "الدعم الفني والتحسين المستمر", "We provide continuous maintenance, updates, and optimization to ensure your solution stays ahead.": "نوفر صيانة مستمرة، وتحديثات دورية، وتحسينات منتظمة لضمان تفوق حلولك التقنية دائماً.", "AKI Tech - Products": "إيه كيه آي تك - المنتجات", "Products Section": "قسم المنتجات", "Our Products": "منتجاتنا البرمجية", "Affordable & Powerful Solutions for Your Business": "حلول برمجية قوية وبأسعار مناسبة لتطوير أعمالك", "Choose Your Solution": "اختر الحل المناسب لأعمالك", "Cost-effective products designed to help your business grow": "منتجات عالية الفعالية ومنخفضة التكلفة صُممت لمساعدة شركتك على النمو السريع", "InventoryPro - Most Selling": "إنفنتوري برو - الأكثر مبيعاً", "Business Management": "إدارة الأعمال", "Most Selling": "الأكثر مبيعاً", "Complete inventory management solution with full pro functionality": "حل متكامل لإدارة المخزون والمستودعات بكامل الميزات الاحترافية المتقدمة", "Starting from": "يبدأ من", "/month": "/شهرياً", "Real-time stock tracking": "تتبع فوري ومباشر للمخزون", "Barcode scanning": "مسح الباركود السريع", "Low stock alerts": "تنبيهات فورية عند انخفاض المخزون", "Multi-warehouse support": "دعم إدارة المستودعات المتعددة", "Reporting & analytics": "تقارير تفصيلية ولوحات تحكم بيانية", "View Details": "عرض التفاصيل الكاملة", "Request Demo": "طلب عرض تجريبي حي", "Business Management Light": "إدارة الأعمال الخفيفة", "Lightweight solution for small business operations": "حل خفيف ومرن ومثالي لإدارة عمليات الشركات والمؤسسات الصغيرة", "Sales tracking": "تتبع المبيعات والطلبيات", "Expense management": "إدارة وتوثيق المصروفات", "Basic invoicing": "إصدار الفواتير الأساسية", "Customer management": "إدارة بيانات وسجلات العملاء", "Financial summaries": "ملخصات مالية وتقارير أداء دورية", "Vehicle & Equipment Management": "إدارة المركبات والمعدات الثقيلة", "Comprehensive tracking for your fleet and machinery": "نظام متكامل لتتبع وإدارة أسطول المركبات والآليات والمعدات الثقيلة", "Fleet tracking": "تتبع الأسطول الميداني", "Maintenance scheduling": "جدولة الصيانة الدورية والوقائية", "Fuel management": "إدارة وتدقيق استهلاك الوقود", "Operator assignments": "تعيين وتوزيع السائقين والمشغلين", "Performance reports": "تقارير شاملة عن كفاءة التشغيل والتكاليف", "Simple, professional invoicing with instant sharing": "إصدار فواتير احترافية بسهولة ومشاركتها فورياً مع العملاء", "Custom invoice templates": "قوالب فواتير احترافية مخصصة", "Payment tracking": "متابعة وتتبع حالات السداد", "PDF generation": "توليد وتصدير ملفات PDF فورياً", "Client database": "قاعدة بيانات شاملة لسجلات العملاء", "Tax calculations": "حساب تلقائي دقيق للضرائب والخصومات", "Need a Custom Solution?": "هل تبحث عن حل برمجي مخصص بالكامل؟", "We can customize any of our products or build a completely new solution from scratch to match your unique business processes.": "يمكننا تخصيص أي من منتجاتنا البرمجية أو بناء حل جديد كلياً من الصفر ليتوافق تماماً مع مسارات عملك الفريدة.", "Contact Our Team": "تواصل مع فريقنا المتخصص", "AKI Tech - Contact Us": "إيه كيه آي تك - اتصل بنا", "Map Section": "موقعنا على الخريطة", "FAQ Section": "قسم الأسئلة الشائعة", "Let's start a conversation about your project": "دعنا نبدأ محادثة مثمرة حول مشروعك القادم", "Get in Touch": "تواصل معنا الآن", "Have a question or want to work together? We'd love to hear from you. Fill out the form and our team will get back to you within 24 hours.": "هل لديك استفسار أو ترغب في بدء شراكة عمل؟ يسعدنا جداً تواصلك معنا. املأ النموذج وسيقوم فريقنا بالرد عليك خلال 24 ساعة.", "Address": "العنوان والمقر الرئيسي", "Kolkata": "كولكاتا", "West Bengal": "غرب البنغال", "India": "الهند", "Email": "البريد الإلكتروني", "Business Hours": "ساعات العمل الرسمية", "Monday - Friday: 9am - 6pm": "الاثنين - الجمعة: 9:00 صباحاً - 6:00 مساءً", "Saturday - Sunday: Closed": "السبت - الأحد: عطلة نهاية الأسبوع", "Follow Us": "تابعنا على شبكات التواصل", "Send Message": "إرسال الرسالة", "Frequently Asked Questions": "الأسئلة الشائعة وإجاباتها", "Find answers to common questions about our services and processes": "إجابات وافية وشاملة عن أبرز الأسئلة المتكررة حول خدماتنا وآليات عملنا", "How long does a typical project take?": "كم يستغرق تنفيذ المشروع البرمجي عادةً؟", "Project timelines vary based on scope and complexity. A standard website takes 2-4 weeks, while complex web or mobile apps may take 8-16 weeks. We provide detailed timeline estimates during the planning phase.": "تختلف الجداول الزمنية وفقاً لحجم المشروع وتعقيده؛ يستغرق موقع الويب القياسي من 2 إلى 4 أسابيع، بينما قد تستغرق التطبيقات المعقدة من 8 إلى 16 أسبوعاً. نحدد جدولاً زمنياً مفصلاً في مرحلة التخطيط.", "What technologies do you specialize in?": "ما هي أبرز التقنيات التي تتخصصون فيها؟", "We specialize in modern technologies including React, Next.js, Node.js, Python, Flutter, React Native, and cloud platforms like AWS and Google Cloud. We choose the best tech stack for each project.": "نتخصص في أحدث الأطر البرمجية مثل React وNext.js وNode.js وPython وFlutter وReact Native والسحابة مثل AWS وGoogle Cloud، ونختار الحزمة الأنسب لكل مشروع.", "Do you provide ongoing support after launch?": "هل تقدمون الدعم الفني المستمر بعد إطلاق المشروع؟", "Yes, we offer various maintenance and support packages to ensure your digital product stays secure, up-to-date, and running smoothly after launch.": "نعم، نوفر باقات دعم وصيانة متكاملة لضمان بقاء منتجك الرقمي آمناً ومحدثاً ويعمل بأعلى درجات الكفاءة بعد الإطلاق.", "How do you handle project communication?": "كيف يتم التواصل وإدارة المتابعة أثناء سير المشروع؟", "We maintain regular communication through scheduled meetings, sprint reviews, and collaboration tools like Slack and Jira. You will have a dedicated project manager as your primary point of contact.": "نحافظ على تواصل مستمر عبر اجتماعات دورية ومراجعات لمراحل العمل وأدوات مثل Slack وJira، مع تعيين مدير مشروع مخصص ليكون نقطة اتصالك الدائمة.", "What are your payment terms?": "ما هي شروط وخيارات الدفع المتاحة؟", "Typically, we work with a milestone-based payment structure: 30% upfront, 40% at the mid-point milestone, and 30% upon final delivery and acceptance. Custom payment schedules are available for larger enterprise engagements.": "عادة نعمل وفق نظام الدفعات المرتبطة بمراحل الإنجاز: 30% دفعة مقدمة، 40% عند مرحلة المنتصف، و30% عند التسليم النهائي والاعتماد. نوفر خطط سداد مخصصة للمشاريع المؤسسية الكبرى.", "Your Name": "اسمك الكريم", "Your Email": "بريدك الإلكتروني", "Your Phone": "رقم هاتفك", "Subject": "موضوع الرسالة", "Select a Service": "اختر الخدمة المطلوبة", "Select Budget Range": "اختر ميزانية المشروع التقديرية", "Tell us about your project...": "أخبرنا بمزيد من التفاصيل حول مشروعك...", "Thank you! Your message has been sent.": "شكراً لك! تم إرسال رسالتك بنجاح وسنتواصل معك قريباً.", "General Inquiry": "استفسار عام", "Mobile App": "تطبيقات الجوال", "Cloud / DevOps": "الحوسبة السحابية والديف أوبس", "Enterprise / Odoo": "أنظمة المؤسسات وأودو", "Other": "أخرى", "Under $5,000": "أقل من $5,000", "$5,000 - $10,000": "$5,000 - $10,000", "$10,000 - $25,000": "$10,000 - $25,000", "$25,000 - $50,000": "$25,000 - $50,000", "$50,000 - $100,000": "$50,000 - $100,000", "$100,000+": "$100,000+", "Navigation": "التنقل", "AUD ($)": "دولار أسترالي ($)", "AUD": "AUD", "CAD ($)": "دولار كندي ($)", "CAD": "CAD", "SGD ($)": "دولار سنغافوري ($)", "SGD": "SGD", "AED (د.إ)": "درهم إماراتي (د.إ)", "AED": "AED", "SAR (﷼)": "ريال سعودي (﷼)", "SAR": "SAR", "JPY (¥)": "ين ياباني (¥)", "JPY": "JPY", "About AKI Tech": "عن إيه كيه آي تك", "Pioneering the future of technology since 2015": "رواد صناعة المستقبل التقني منذ عام 2015", "Who We Are": "من نحن", "AKI Tech is a leading technology company dedicated to delivering innovative solutions that drive business success. Founded in 2015, we have grown from a small startup to a trusted partner for businesses worldwide, helping them navigate the complexities of digital transformation.": "إيه كيه آي تك هي شركة تقنية رائدة تكرس جهودها لتقديم حلول مبتكرة تدفع نجاح الأعمال. تأسست عام 2015، ونمت من شركة ناشئة واعدة إلى شريك موثوق للشركات حول العالم، لمساعدتها في قيادة التحول الرقمي بثقة.", "Our Mission": "رسالتنا", "To empower businesses with cutting-edge technology solutions that enhance efficiency, drive innovation, and create lasting value. We strive to be the catalyst for digital transformation in every organization we work with.": "تمكين الشركات بحلول تقنية متطورة تعزز الكفاءة وتدفع عجلة الابتكار وتخلق قيمة دائمة. نسعى لأن نكون المحفز الأساسي للتحول الرقمي لكل مؤسسة نعمل معها.", "Our Vision": "رؤيتنا", "To be the global leader in technology innovation, recognized for our commitment to excellence, integrity, and customer success. We envision a future where technology seamlessly integrates with business to create unprecedented opportunities.": "أن نكون رواد الابتكار التقني عالمياً، وأن نتميز بالتزامنا بالجودة والنزاهة ونجاح عملائنا. نتطلع إلى مستقبل تتكامل فيه التكنولوجيا بسلاسة مع الأعمال لخلق فرص غير مسبوقة.", "Our Core Values": "قيمنا الجوهرية", "We pursue excellence in everything we do, from code quality to customer service.": "نسعى للتميز في كل ما نقوم به، من جودة الكود البرمجي إلى خدمة ودعم العملاء.", "Integrity": "النزاهة والشفافية", "We conduct business with honesty, transparency, and ethical practices.": "ندير أعمالنا بصدق وشفافية وأعلى المعايير الأخلاقية والمهنية.", "Collaboration": "التعاون وروح الفريق", "We believe in the power of teamwork and open communication.": "نؤمن بقوة العمل الجماعي والتواصل الفعال والمفتوح مع عملائنا.", "We continuously explore new technologies and creative solutions.": "نستكشف باستمرار التقنيات الحديثة ونبتكر حلولاً إبداعية رائدة.", "Meet Our Leadership Team": "تعرف على فريق قيادتنا", "John Anderson": "جون أندرسون", "CEO & Founder": "الرئيس التنفيذي والمؤسس", "Visionary leader with 15+ years in tech industry": "قائد ذو رؤية استراتيجية بخبرة تتجاوز 15 عاماً في قطاع التكنولوجيا", "Sarah Chen": "سارة تشن", "CTO": "الرئيس التنفيذي للتكنولوجيا", "Tech innovator specializing in AI and cloud architecture": "مبتكرة تقنية متخصصة في الذكاء الاصطناعي وهندسة السحابة", "Michael Roberts": "مايكل روبرتس", "Head of Operations": "رئيس العمليات التشغيلية", "Expert in streamlining processes and team management": "خبير في تحسين العمليات التشغيلية وإدارة فرق العمل بكفاءة", "Emily Martinez": "إيميلي مارتينيز", "Creative director with a passion for user experience": "مديرة إبداعية شغوفة بتطوير وتصميم تجربة المستخدم", "Why Choose AKI Tech?": "لماذا تختار إيه كيه آي تك؟", "Proven Track Record": "سجل حافل بالنجاحات المثبتة", "Over 500 successful projects delivered to satisfied clients worldwide": "أكثر من 500 مشروع ناجح تم تسليمه لعملاء راضين حول العالم", "Expert Team": "فريق خبراء محترف ومتخصص", "Highly skilled professionals with diverse expertise across multiple technologies": "محترفون ذوو مهارات استثنائية وخبرات متنوعة عبر مختلف المجالات التقنية", "Agile Methodology": "منهجية عمل مرنة (Agile)", "Flexible and iterative approach ensuring timely delivery and quality": "نهج عمل مرن ومرحلي يضمن التسليم في الموعد المحدد وبأعلى معايير الجودة", "Client-Centric Approach": "نهج يركز بالكامل على العميل", "Your success is our priority - we listen, understand, and deliver": "نجاحك هو أولويتنا المطلقة - نستمع، نفهم بعمق، ونحقق النتائج", "Let's Build Something Amazing Together": "دعنا نبني معاً شيئاً استثنائياً", "Ready to start your next project with AKI Tech?": "هل أنت مستعد لبدء مشروعك القادم مع إيه كيه آي تك؟", "Get Started": "ابدأ الآن", "Innovative technology solutions for the modern world. Transforming businesses through cutting-edge technology.": "حلول تقنية مبتكرة للعالم الحديث. نحدث تحولاً رقمياً للشركات عبر أحدث التقنيات.", "InventoryPro": "إنفنتوري برو", "Website with Hosting": "موقع ويب مع استضافة متكاملة", "Mobile Application": "تطبيقات الجوال الذكية", "E-Commerce Platform": "منصة التجارة الإلكترونية", "CRM System": "نظام إدارة علاقات العملاء (CRM)", "Currency:": "العملة:", "Cross-Platform Development (React Native, Flutter)": "تطوير التطبيقات متعددة المنصات (React Native، Flutter)", "App UI/UX Design": "تصميم واجهة وتجربة المستخدم للتطبيقات", "Leverage the power of cloud computing to scale your business. We provide comprehensive cloud services including migration, architecture design, and ongoing management.": "استفد من قوة الحوسبة السحابية لتوسيع أعمالك. نقدم خدمات سحابية متكاملة تشمل الترحيل وهندسة البنية التحتية والإدارة المستمرة.", "Cloud Migration Services": "خدمات الترحيل السحابي الآمن", "AWS, Azure, Google Cloud Platform": "AWS، Azure، Google Cloud Platform", "DevOps & CI/CD Implementation": "تطبيق وتفعيل DevOps ومسارات CI/CD", "Cloud Infrastructure Management": "إدارة البنية التحتية السحابية", "Containerization (Docker, Kubernetes)": "تقنيات الحاويات (Docker، Kubernetes)", "AI & Machine Learning": "الذكاء الاصطناعي وتعلم الآلة", "Harness the power of artificial intelligence to automate processes, gain insights, and create intelligent systems that learn and adapt to your business needs.": "استثمر قوة الذكاء الاصطناعي لأتمتة العمليات واكتساب الرؤى وبناء أنظمة ذكية تتعلم وتتكيف مع احتياجات أعمالك.", "Machine Learning Model Development": "تطوير وتدريب نماذج تعلم الآلة", "Natural Language Processing (NLP)": "معالجة اللغات الطبيعية (NLP)", "Computer Vision Solutions": "حلول الرؤية الحاسوبية", "Predictive Analytics": "التحليلات التنبؤية الذكية", "AI Chatbots & Virtual Assistants": "روبوتات الدردشة الذكية والمساعدات الافتراضية", "Data Analytics": "تحليلات البيانات المتقدمة", "Turn your data into actionable insights. Our data analytics services help you make informed decisions based on comprehensive analysis and visualization.": "حوّل بياناتك إلى قرارات قابلة للتنفيذ. تساعدك خدمات تحليل البيانات في اتخاذ قرارات صائبة بناءً على التحليل والتصور الشامل.", "Business Intelligence Solutions": "حلول ذكاء الأعمال (BI)", "Data Visualization & Dashboards": "تصور البيانات ولوحات المعلومات التفاعلية", "Big Data Processing": "معالجة البيانات الضخمة (Big Data)", "ETL (Extract, Transform, Load) Solutions": "حلول معالجة البيانات ETL", "Custom Analytics Platforms": "منصات تحليلية مخصصة", "Cybersecurity": "الأمن السيبراني وحماية البيانات", "Protect your digital assets with our comprehensive cybersecurity solutions. We implement robust security measures to safeguard your systems and data.": "احمِ أصولك الرقمية بحلولنا المتكاملة للأمن السيبراني. نطبق تدابير أمنية متينة لحماية أنظمتك وبياناتك الحساسة.", "Security Audits & Assessment": "الفحص والتدقيق الأمني الشامل", "Penetration Testing": "اختبارات الاختراق وتقييم الثغرات", "Security Architecture Design": "تصميم بنية أمنية متينة ومحمية", "Compliance & Regulatory Solutions": "حلول الامتثال والمعايير التنظيمية", "Security Monitoring & Incident Response": "المراقبة الأمنية والاستجابة الفورية للحوادث", "Our Development Process": "مسار التطوير لدينا", "Discovery": "الاستكشاف والتحليل", "We learn about your business, goals, and requirements": "نتعرف على طبيعة عملك وأهدافك ومتطلباتك بدقة", "Planning": "التخطيط ووضع الاستراتيجية", "We create a detailed project plan and timeline": "نضع خطة عمل تفصيلية وجدولاً زمنياً واضحاً", "Design": "التصميم وتجربة المستخدم", "We craft intuitive designs and user experiences": "نصمم واجهات بديهية وتجارب مستخدم ملهمة", "Development": "التطوير البرمجي الاحترافي", "We build your solution using best practices": "نطور حلولك وفق أفضل الممارسات البرمجية العالمية", "Testing": "الاختبار وضمان الجودة", "We ensure quality through rigorous testing": "نضمن أعلى مستويات الجودة عبر اختبارات دقيقة", "Launch": "الإطلاق والتشغيل", "We deploy and provide ongoing support": "ننشر الحل في البيئة الحية ونوفر دعماً مستمراً", "Ready to Get Started?": "هل أنت مستعد للانطلاق؟", "Let's discuss how we can help bring your project to life": "دعنا نناقش كيف يمكننا المساعدة في تحويل مشروعك إلى واقع ناجح", "Contact Us": "اتصل بنا", "Multi-location support": "دعم الفروع والمستودعات المتعددة", "Advanced reporting & analytics": "تقارير وتحليلات متقدمة", "Full pro functionality": "وظائف وميزات احترافية كاملة", "Learn More": "اعرف المزيد", "Professional website with reliable hosting included": "موقع ويب احترافي مع استضافة سحابية موثوقة مشمولة", "Custom responsive design": "تصميم متجاوب مخصص وعصري", "Free SSL certificate": "شهادة أمان SSL مجانية", "99.9% uptime guarantee": "ضمان جاهزية التشغيل بنسبة 99.9%", "Email accounts included": "حسابات بريد إلكتروني رسمية مشمولة", "SEO optimized": "مهيأ ومحسن لمحركات البحث (SEO)", "Native or cross-platform mobile apps": "تطبيقات جوال أصلية أو متعددة المنصات", "iOS & Android development": "تطوير لأنظمة iOS وAndroid", "User-friendly interface": "واجهة استخدام سهلة وسلسة", "Push notifications": "إشعارات فورية مدمجة", "Offline functionality": "إمكانية العمل دون اتصال بالإنترنت", "App store deployment": "نشر وإطلاق التطبيق في المتاجر الرسمية", "Complete online store solution": "متجر إلكتروني متكامل ومتطور", "Product catalog management": "إدارة كتالوج المنتجات بسهولة", "Payment gateway integration": "ربط بوابات الدفع الإلكتروني المتنوعة", "Order management": "إدارة الطلبات والشحن والمبيعات", "Customer accounts": "حسابات وملفات شخصية للعملاء", "Sales analytics": "تحليلات بيانية مفصلة للمبيعات", "Manage customer relationships effectively": "إدارة علاقات العملاء بكفاءة وفعالية", "Contact management": "إدارة جهات الاتصال وبيانات العملاء", "Sales pipeline tracking": "متابعة مسار الصفقات والمبيعات", "Email integration": "ربط وتكامل البريد الإلكتروني", "Task automation": "أتمتة المهام اليومية والمتابعات", "All-in-one business solution": "حل شامل ومتكامل لإدارة أعمالك", "Accounting & invoicing": "المحاسبة وإصدار الفواتير", "Project management": "إدارة المشاريع وفرق العمل", "HR management": "إدارة الموارد البشرية وشؤون الموظفين", "Document management": "إدارة وأرشفة المستندات والملفات", "Business intelligence": "ذكاء الأعمال والتقارير الاستراتيجية", "Why Choose Our Products?": "لماذا تختار منتجاتنا؟", "Built with your success in mind": "صُممت بعناية لتحقيق نجاح أعمالك", "Affordable Pricing": "أسعار تنافسية ومناسبة", "Quality solutions that fit your budget": "حلول عالية الجودة تلائم ميزانيتك تماماً", "Round-the-clock assistance when you need it": "مساعدة فنية على مدار الساعة كلما احتجت إليها", "Secure & Reliable": "آمنة وموثوقة بنسبة 100%", "Enterprise-grade security and uptime": "أمان بمستوى المؤسسات الكبرى وجاهزية تشغيل دائمة", "Regular Updates": "تحديثات وتحسينات دورية", "Continuous improvements and new features": "تطوير مستمر وإضافة ميزات جديدة بانتظام", "Contact us today for a free consultation and quote": "اتصل بنا اليوم للحصول على استشارة مجانية وعرض سعر", "Replace YOUR_ACCESS_KEY_HERE with your actual Web3Forms access key": "Replace YOUR_ACCESS_KEY_HERE with your actual Web3Forms access key", "bb3f7c69-dc3f-47fa-a55d-609d85b9eddd": "bb3f7c69-dc3f-47fa-a55d-609d85b9eddd", "New Contact Form Submission from AKI Tech Website": "رسالة اتصال جديدة من موقع إيه كيه آي تك", "AKI Tech Contact Form": "نموذج اتصال إيه كيه آي تك", "Full Name *": "الاسم الكامل *", "Email Address *": "عنوان البريد الإلكتروني *", "Phone Number": "رقم الهاتف", "Company Name": "اسم الشركة أو المؤسسة", "Service Interested In": "الخدمة المطلوبة", "Select a service": "اختر الخدمة المطلوبة", "web-development": "تطوير المواقع والويب", "mobile-apps": "تطبيقات الجوال", "cloud-solutions": "الحلول السحابية", "ai-ml": "الذكاء الاصطناعي وتعلم الآلة", "data-analytics": "تحليلات البيانات", "cybersecurity": "الأمن السيبراني", "General Consultation": "استشارة عامة", "consultation": "استشارة", "other": "أخرى", "Project Budget": "ميزانية المشروع", "Select budget range": "اختر نطاق الميزانية", "5k-10k": "5,000 - 10,000 دولار", "10k-25k": "10,000 - 25,000 دولار", "25k-50k": "25,000 - 50,000 دولار", "50k-100k": "50,000 - 100,000 دولار", "100k+": "أكثر من 100,000 دولار", "Message *": "نص الرسالة *", "Visit Our Office": "تفضل بزيارة مكتبنا", "Map Location: Kolkata, West Bengal, India": "الموقع على الخريطة: كولكاتا، غرب البنغال، الهند", "Integrated map can be added using Google Maps API": "يمكن إضافة الخريطة التفاعلية باستخدام Google Maps API", "What is your typical project timeline?": "ما هي المدة الزمنية المعتادة لتنفيذ المشروع؟", "Project timelines vary based on scope and complexity. Typically, a small to medium project takes 8-12 weeks from discovery to launch. We'll provide a detailed timeline during our initial consultation.": "تختلف مدة المشروع باختلاف نطاقه وتعقيده؛ تستغرق المشاريع الصغيرة إلى المتوسطة عادة من 8 إلى 12 أسبوعاً من مرحلة التحليل حتى الإطلاق، وسنزودك بجدول زمني مفصل خلال استشارتنا الأولى.", "Do you offer ongoing support?": "هل تقدمون دعماً فنياً مستمراً؟", "Yes! We offer comprehensive maintenance and support packages to ensure your solution continues to perform optimally. Our 24/7 support team is always available to assist you.": "نعم! نقدم باقات صيانة ودعم شاملة لضمان استمرار عمل نظامك بأعلى كفاءة، وفريق دعمنا الفني متاح على مدار الساعة لمساعدتك.", "What technologies do you work with?": "ما هي التقنيات التي تعملون بها؟", "We work with a wide range of modern technologies including React, Angular, Vue.js, Node.js, Python, Java, and cloud platforms like AWS, Azure, and Google Cloud.": "نعمل بمجموعة واسعة من أحدث التقنيات تشمل React وAngular وVue.js وNode.js وPython وJava والمنصات السحابية مثل AWS وAzure وGoogle Cloud.", "We believe in transparent communication. You'll have a dedicated project manager and regular check-ins via your preferred channel (email, Slack, video calls).": "نؤمن بالتواصل الشفاف والفعال؛ سيكون لديك مدير مشروع مخصص وتحديثات دورية عبر وسيلتك المفضلة (البريد، Slack، مكالمات الفيديو).", "Integrated Business Management (IBM) - AK International": "إدارة الأعمال المتكاملة (IBM) - إيه كيه إنترناشيونال", "Particle Canvas": "خلفية الجزيئات", "Hero Section": "قسم الواجهة الرئيسية", "Product Showcase Section": "قسم استعراض المنتج", "Key Features Section": "قسم الميزات الرئيسية", "Why Choose Section": "قسم لماذا تختار النظام", "Business Management Suite": "حزمة إدارة الأعمال المتكاملة", "Integrated Business": "إدارة الأعمال", "Management (IBM)": "المتكاملة (IBM)", "Accounting • Sales • Inventory • HR •": "المحاسبة • المبيعات • المخزون • الموارد البشرية • ", "One Connected Platform": "منصة واحدة مترابطة وشاملة", "A complete, all-in-one business management system that unifies every department of your organization — so data flows seamlessly across accounting, sales, inventory, procurement, and HR, giving you one single source of truth.": "نظام متكامل وشامل لإدارة الأعمال يوحد كافة أقسام مؤسستك — لتتدفق البيانات بسلاسة متناهية بين المحاسبة والمبيعات والمخازن والمشتريات والموارد البشرية، مما يمنحك مصدراً واحداً وموثوقاً لجميع بياناتك.", "Explore Features": "استكشف الميزات", "Request a Demo": "طلب عرض تجريبي", "Modules": "وحدات النظام", "Unified Data": "بيانات موحدة", "/7": "/7", "Scroll": "تمرير", "See It In Action": "شاهده في الواقع العملي", "A Look Inside": "نظرة من الداخل على النظام", "IBM": "نظام IBM", "Real screens from the platform — one workspace for every part of your business.": "شاشات حقيقية من داخل المنصة — مساحة عمل واحدة تدير كل تفاصيل أعمالك.", "All-in-One Business Workspace": "مساحة عمل شاملة لكافة قطاعات الأعمال", "Every module lives on one home screen — Employees, Attendance, Payroll, Inventory, Sales & Orders, Ecommerce, Purchase, CRM, Expenses, Accounts, Assets, Contacts, Reports, Help Desk and File Manager — so your team never has to switch apps.": "كل وحدة برمجية متاحة من شاشة رئيسية واحدة — الموظفون، الحضور والانصراف، مسيرات الرواتب، المخازن، المبيعات والطلبيات، المتاجر الإلكترونية، المشتريات، علاقات العملاء CRM، المصروفات، الحسابات، الأصول، جهات الاتصال، التقارير، الدعم الفني، ومدير الملفات — حتى لا يضطر فريقك للتنقل بين تطبيقات متعددة.", "Smart Inventory Control": "إدارة ذكية وشاملة للمخزون", "A live view of total products, in-stock and low-stock counts, and warehouses, paired with a product inventory table and a recent transactions feed — so stock levels are never a guess.": "عرض حي ومباشر لإجمالي المنتجات، وحالات التوفر، وتنبيهات انخفاض الكميات في المستودعات، مقترنة بجدول مخزون وسجل أحدث الحركات — لتبقى مستويات المخزون تحت السيطرة الدقيقة دائماً.", "Sales & Orders Made Easy": "إدارة المبيعات والطلبيات بكل سهولة", "Quotations, sales orders, invoices, deliveries, and payments flow through one clean pipeline — track every customer from \"sent\" to \"paid\" without leaving the screen.": "عروض الأسعار، وأوامر البيع، والفواتير، وأذون التسليم، والدفعات تتدفق في مسار واحد متصل — تابع كل عميل من مرحلة \"تم الإرسال\" إلى \"تم السداد\" دون مغادرة الشاشة.", "Reports That Help You Grow": "تقارير وتحليلات استراتيجية تدعم النمو", "Sales and expense trends, account balances, and profit charts come together on one dashboard, with one-click export to Excel, PDF, or a summary report for faster decisions.": "اتجاهات المبيعات والمصروفات، وأرصدة الحسابات، ورسوم الأرباح البيانية تجتمع في لوحة تحكم واحدة، مع ميزة التصدير بنقرة واحدة إلى Excel أو PDF أو تقرير ملخص لاتخاذ قرارات أسرع.", "Key Features": "الميزات الرئيسية", "Everything Your Business": "كل ما تحتاجه أعمالك", "Needs": "من أدوات متطورة", "IBM brings every core business function under one roof, eliminating data silos and manual re-entry.": "يجمع نظام IBM كافة الوظائف الأساسية تحت مظلة واحدة، لينهي تماماً عزلة البيانات وتكرار الإدخال اليدوي.", "Accounting & Finance": "المحاسبة والمالية", "Automated bookkeeping, ledgers, tax compliance, and real-time financial statements in one place.": "قيود دفترية مؤتمتة، ودفاتر أستاذ، وامتثال ضريبي كامل، وقوائم مالية حية ومباشرة في مكان واحد.", "Inventory & Procurement": "المخزون والمشتريات", "Track stock across warehouses, automate reordering, and manage vendor purchase cycles with ease.": "تتبع المخزون عبر المستودعات، وأتمتة إعادة الطلب، وإدارة دورات الشراء مع الموردين بكل سهولة.", "Sales & CRM": "المبيعات وإدارة علاقات العملاء (CRM)", "Manage leads, quotations, orders, and customer relationships through a single sales pipeline.": "إدارة العملاء المحتملين وعروض الأسعار والطلبيات وعلاقات العملاء عبر مسار مبيعات موحد.", "HR & Payroll": "الموارد البشرية والرواتب", "Employee records, attendance, leave, and payroll processing integrated with your finances.": "سجلات الموظفين والحضور والإجازات ومسيرات الرواتب متكاملة تماماً مع نظامك المالي.", "Invoicing & Billing": "إصدار الفواتير والفوترة الآلية", "Create professional invoices, track payments, and automate recurring billing cycles.": "إنشاء فواتير احترافية وتتبع تحصيل الدفعات وأتمتة دورات الفوترة المتكررة.", "Reports & Dashboards": "التقارير ولوحات التحكم التفاعلية", "Real-time dashboards and custom reports that give leadership full visibility across operations.": "لوحات تحكم فورية وتقارير مخصصة تمنح الإدارة رؤية شاملة ودقيقة لكافة العمليات.", "Why IBM": "لماذا نظام IBM", "Built to": "مصمم لكي", "Scale With You": "ينمو ويتوسع معك", "Whether you're a growing SME or an established enterprise, IBM adapts to your workflows.": "سواء كنت شركة صغيرة في طور النمو أو مؤسسة كبرى راسخة، يتكيف نظام IBM تماماً مع مسارات عملك.", "Fully Integrated": "تكامل شامل وتام", "Every module shares the same database — no duplicate entries, no sync issues.": "تتشارك جميع الوحدات قاعدة بيانات موحدة — لا إدخال مكرر ولا مشكلات في المزامنة إطلاقاً.", "Fully Customizable": "قابل للتخصيص الكامل", "Tailor workflows, fields, and permissions to match exactly how your business operates.": "تخصيص مسارات العمل والحقول والصلاحيات لتتطابق تماماً مع أسلوب إدارة مؤسستك.", "Cloud or On-Premise": "سحابي أو على خوادمك الخاصة", "Deploy on our secure cloud or your own servers — your data, your choice.": "انشر النظام على سحابتنا الآمنة أو على خوادمك الداخلية — بياناتك، وخيارك المطلق.", "Role-based access control and audit logs keep your business data protected.": "تحكم في الصلاحيات بناءً على الأدوار وسجلات تدقيق تفصيلية لحماية أمان بياناتك.", "Getting Started": "خطوات البدء والتنفيذ", "From Setup to": "من التأسيس والإعداد حتى", "Go-Live": "الإطلاق والتشغيل الكامل", "We handle the full rollout so your team can focus on running the business.": "نتولى عملية الإطلاق والتهيئة بالكامل ليتفرغ فريقك لإدارة وتنمية الأعمال.", "We map your current processes and identify the modules you need most.": "ندرس ونرسم مسارات عملك الحالية ونحدد الوحدات البرمجية الأكثر أهمية لك.", "Configuration": "الضبط والإعداد المخصص", "We set up and customize IBM to match your chart of accounts, roles, and workflows.": "نقوم بإعداد وتخصيص نظام IBM ليتوافق تماماً مع دليلك المحاسبي وهيكلك التنظيمي ومسارات عملك.", "Data Migration": "ترحيل البيانات بأمان", "We import your existing records securely with zero disruption to daily operations.": "نستورد سجلاتك وبياناتك الحالية بأمان تام دون أي انقطاع في سير العمليات اليومية.", "Go-Live & Support": "التشغيل الفعلي والدعم المستمر", "Your team is trained and live, backed by ongoing support from our team.": "يتم تدريب فريقك بالكامل وبدء التشغيل الفعلي مع دعم فني مستمر ومتواصل من خبرائنا.", "Ready to Unify Your": "هل أنت مستعد لتوحيد", "Business Operations": "عمليات وإدارات أعمالك؟", "Talk to our team about rolling out Integrated Business Management (IBM) across your organization.": "تحدث مع فريقنا اليوم حول تطبيق نظام إدارة الأعمال المتكاملة (IBM) في مؤسستك.", "Get a Free Consultation": "احصل على استشارة مجانية", "Back to Home": "العودة للرئيسية", "Integrated Business Management — one connected platform for accounting, sales, inventory, and HR.": "إدارة الأعمال المتكاملة — منصة واحدة مترابطة للمحاسبة والمبيعات والمخزون والموارد البشرية.", "Tech Services": "الخدمات التقنية", "Integrated Business Management": "إدارة الأعمال المتكاملة", "Web Development - AK International": "تطوير المواقع والويب - إيه كيه إنترناشيونال", "Custom Web Development": "تطوير الويب المخصص", "Web": "تطوير", "Websites • Web Apps • E-Commerce •": "المواقع الإلكترونية • تطبيقات الويب • المتاجر الإلكترونية • ", "Custom Platforms": "منصات برمجية مخصصة", "We design and build fast, responsive, and scalable websites and web applications — from marketing sites and e-commerce stores to complex custom platforms — engineered to grow with your business.": "نصمم ونبني مواقع وتطبيقات ويب سريعة ومتجاوبة وقابلة للتوسع — من مواقع التعريف والمتاجر الإلكترونية إلى المنصات المخصصة المعقدة — مصممة لتواكب نمو أعمالك.", "Start Your Project": "ابدأ مشروعك الآن", "Responsive": "متجاوب تماماً", ".9%": ".9%", "Websites Built to": "مواقع وتطبيقات صُممت لكي", "Perform": "تحقق أعلى أداء وتميز", "From a single landing page to a full custom platform, every build is fast, secure, and made to convert.": "من صفحة هبوط ترويجية إلى منصة مخصصة بالكامل، كل مشروع نبتكره يتسم بالسرعة الفائقة والأمان العالي والقدرة على زيادة التحويلات.", "Responsive Design": "تصميم متجاوب وشامل", "Pixel-perfect layouts that adapt seamlessly across desktop, tablet, and mobile devices.": "تصاميم فائقة الدقة تتكيف بانسيابية عبر شاشات الحواسيب المكتبية والأجهزة اللوحية والهواتف الذكية.", "Custom Web Applications": "تطبيقات ويب مخصصة", "Tailor-built web apps with dashboards, user accounts, and business logic unique to you.": "تطبيقات ويب مطورة خصيصاً مع لوحات تحكم وحسابات مستخدمين ومنطق أعمال مصمم وفق متطلباتك.", "E-Commerce Development": "تطوير المتاجر الإلكترونية", "Online stores with product catalogs, secure checkout, and payment gateway integration.": "متاجر رقمية متكاملة بكتالوجات منتجات وعمليات شراء آمنة وربط مباشر مع بوابات الدفع الإلكتروني.", "CMS Integration": "ربط أنظمة إدارة المحتوى (CMS)", "Easily update content yourself with a clean, user-friendly content management system.": "تحديث وإدارة محتوى موقعك بنفسك بكل بساطة وسرعة عبر نظام إدارة محتوى أنيق وسهل الاستخدام.", "SEO & Performance": "تحسين محركات البحث والسرعة", "Fast-loading pages optimized for search engines so customers find you first.": "صفحات سريعة التحميل مهيأة لمحركات البحث لتتصدر النتائج ويصل عملاؤك إليك أولاً.", "API & Third-Party Integration": "ربط واجهات البرمجة والخدمات الخارجية", "Connect payment gateways, CRMs, shipping providers, and marketing tools seamlessly.": "ربط بوابات الدفع وأنظمة إدارة العملاء وشركات الشحن والأدوات التسويقية بسلاسة تامة.", "Custom Websites & Web Apps": "مواقع وتطبيقات ويب مخصصة", "A Look at What We": "نظرة على ما", "Build": "نبتكره ونبنيه", "Real screens from our web builds — from corporate sites to e-commerce and client portals.": "شاشات حقيقية من مشاريع الويب التي طورناها — من المواقع المؤسسية إلى المتاجر وبوابات العملاء.", "Corporate & Brand Websites": "مواقع الشركات والهوية المؤسسية", "Clean, modern sites that establish credibility and communicate your value clearly.": "مواقع أنيقة وعصرية تبني المصداقية وتبرز قيمة علامتك التجارية بوضوح واحترافية.", "E-Commerce Platforms": "منصات التجارة الرقمية المتطورة", "Full storefronts with product browsing, shopping cart, coupon codes, and order tracking.": "واجهات متاجر متكاملة مع تصفح المنتجات وسلة التسوق وأكواد الخصم وتتبع الطلبيات.", "Client Portals & Dashboards": "بوابات العملاء ولوحات التحكم التفاعلية", "Secure, role-protected portals where clients can view orders, documents, and project updates.": "بوابات آمنة ومحمية بالصلاحيات تمكّن العملاء من متابعة الطلبات والوثائق ومستجدات المشاريع.", "Landing Pages That Convert": "صفحات هبوط تزيد المبيعات والتحويلات", "High-impact, single-page sites designed to turn visitors into leads and customers.": "صفحات ترويجية قوية التأثير صُممت خصيصاً لتحويل الزوار إلى عملاء ومبيعات حقيقية.", "Modern Tech": "أحدث التقنيات البرمجية", "We use proven, scalable frameworks to build fast, maintainable websites.": "نستخدم أحدث أطر العمل العالمية الموثوقة لبناء مواقع وتطبيقات سريعة وسهلة التحديث.", "Custom Architecture": "بنية برمجية مخصصة", "No cookie-cutter templates — every platform is architected around your specific requirements.": "نبتعد تماماً عن القوالب الجاهزة؛ كل منصة نصمم بنيتها البرمجية خصيصاً لتلائم متطلباتك الفريدة.", "Built for Speed": "صُممت لأعلى سرعة ممكنة", "Optimized assets, clean code, and fast hosting ensure your site loads in under two seconds.": "ملفات محسنة وكود نظيف واستضافة فائقة السرعة لضمان تحميل صفحاتك في أقل من ثانيتين.", "Search & Social Ready": "جاهزة لمحركات البحث وشبكات التواصل", "Structured data, open graph tags, and clean URLs ensure your site ranks well and shares cleanly.": "بيانات منظمة ووسوم مشاركة متقدمة وروابط نظيفة لضمان أفضل تصنيف وأجمل ظهور في المشاركات.", "Full Handover & Training": "تسليم كامل مع تدريب شامل", "We train your team to update content, manage orders, and run the site independently.": "ندرب فريقك على تحديث المحتوى وإدارة الطلبات وتشغيل الموقع بكل ثقة واستقلالية.", "From Idea to": "من الفكرة حتى", "Discovery & Wireframes": "الاستكشاف ورسم المخططات الهيكلية", "We understand your goals, map the site structure, and create wireframes for every page.": "نفهم أهدافك بدقة ونرسم هيكلية الموقع وننشئ مخططات أولية لكافة الصفحات.", "Visual Design": "التصميم البصري والهوية الرقمية", "We design polished mockups matching your brand, colours, and typography.": "نصمم نماذج بصرية متألقة تعكس هويتك المؤسسية وألوانك وخطوطك بأعلى درجات الجاذبية.", "We build responsive, fast-loading pages with clean code and interactive elements.": "نبرمج صفحات متجاوبة سريعة التحميل بكود نظيف وتفاعلية استثنائية.", "Testing & QA": "الفحص والاختبار وضمان الجودة", "We test across browsers, screen sizes, and devices to ensure a flawless experience.": "نختبر الأداء عبر مختلف المتصفحات والشاشات والأجهزة لضمان تجربة مستخدم خالية من أي عيوب.", "Your site goes live on secure hosting, fully configured and ready for visitors.": "يتم إطلاق موقعك على استضافة سحابية آمنة ومحمية وجاهزة لاستقبال الزوار والعملاء.", "Website": "موقعك أو منصتك الإلكترونية؟", "Tell us what you need and we will propose the right stack, timeline, and budget.": "أخبرنا برؤيتك ومتطلباتك، وسنقدم لك الحزمة التقنية والجدول الزمني والميزانية الأنسب.", "Custom web development — fast, responsive websites, e-commerce stores, and custom web applications.": "تطوير الويب المخصص — مواقع سريعة ومتجاوبة، ومتاجر إلكترونية، وتطبيقات ويب مبتكرة.", "Advance Vehicle & Heavy Equipment Management - AK International": "إدارة المركبات والمعدات الثقيلة المتقدمة - إيه كيه إنترناشيونال", "Fleet & Equipment Suite": "حزمة إدارة الأساطيل والمعدات", "Vehicle & Heavy Equipment": "المركبات والمعدات", "Management": "الثقيلة المتقدمة", "Fleet Tracking • Maintenance • Fuel Control •": "تتبع الأسطول • الصيانة الوقائية • مراقبة الوقود • ", "Full Lifecycle Visibility": "رؤية شاملة لدورة حياة الأصول بالكامل", "An advanced management system for vehicles and heavy equipment — covering maintenance scheduling, fuel and usage tracking, operator assignment, and complete asset lifecycle control for construction, logistics, and industrial fleets.": "نظام متقدم لإدارة أساطيل المركبات والمعدات الثقيلة والآليات — يشمل جدولة الصيانة، وتتبع الوقود والتشغيل، وتوزيع المشغلين، والتحكم الشامل بدورة حياة الأصول لأساطيل المقاولات والخدمات اللوجستية والمصانع.", "Fleet Visibility": "رؤية ميدانية متكاملة للأسطول", "Downtime Surprises": "منع الأعطال المفاجئة وتوقف العمل", "Tracking": "تتبع دقيق ومباشر", "Real screens from the platform — managing vehicle records, service logs, fuel entries, and equipment deployments in one place.": "شاشات حقيقية من داخل المنصة — إدارة سجلات المركبات، وسجلات الصيانة، ومتابعة استهلاك الوقود، وتوزيع المعدات في موقع واحد.", "Central Fleet & Equipment Register": "سجل مركزي موحد لكافة المركبات والمعدات", "Every asset has a complete profile: registration, make, model, purchase date, insurance, assigned operator, and current operational status.": "ملف شامل ومفصل لكل مركبة وآلية: بيانات التسجيل، الطراز، تاريخ الشراء، وثائق التأمين، المشغل المعين، وحالة التشغيل اللحظية.", "Preventive & Corrective Maintenance": "الصيانة الوقائية والطارئة الدورية", "Schedule service intervals by mileage, operating hours, or calendar date. Log parts used, vendor invoices, and technician notes against each job.": "جدولة مواعيد الصيانة الدورية بناءً على المسافات المقطوعة أو ساعات العمل أو التواريخ، مع تسجيل قطع الغيار وفواتير الصيانة وملاحظات الفنيين.", "Fuel Consumption & Efficiency Log": "سجل ومراقبة استهلاك الوقود وكفاءته", "Track every fill-up with odometer readings, cost per litre, and location. Identify abnormal consumption spikes and reduce fuel theft or wastage.": "تسجيل كل عملية تزويد بالوقود مع قراءات العداد والتكلفة والموقع، لكشف الاستهلاك غير الطبيعي والحد من الهدر أو السرقات.", "Operator Assignment & Trip Logs": "توزيع المشغلين وسجلات الرحلات والمهام", "Assign certified operators to specific machinery. Log trips, project sites, working hours, and pre-start safety checklists in real time.": "تعيين مشغلين مؤهلين لكل معدة، وتوثيق مسارات الرحلات ومواقع المشاريع وساعات العمل وقوائم الفحص والسلامة قبل التشغيل.", "Complete Fleet": "إدارة متكاملة", "Control": "لكافة الأصول والآليات", "Everything you need to reduce operating costs, extend equipment life, and keep your fleet compliant.": "كل ما يلزمك لخفض تكاليف التشغيل وإطالة العمر الافتراضي لمعداتك وضمان الامتثال التام للمعايير.", "Asset Registry": "سجل الأصول الشامل", "Maintain a digital record of every vehicle, crane, excavator, and generator with documents, warranties, and photos.": "سجل رقمي متكامل لكل مركبة وشاحنة ورافعة وحفار ومولد كهربائي مع الوثائق والضمانات والصور.", "Scheduled Maintenance": "جدولة الصيانة التلقائية", "Automated reminders for oil changes, tyre rotations, inspections, and regulatory permits based on usage triggers.": "تنبيهات تلقائية لتغيير الزيوت، وصيانة الإطارات، والفحص الدوري، وتجديد التراخيص والتصاريح النظامية.", "Fuel & Mileage Tracking": "مراقبة الوقود والمسافات", "Detect fuel leakage, track fuel efficiency per kilometre or operating hour, and reconcile fuel cards easily.": "كشف أي تسريب أو هدر، وحساب كفاءة الوقود لكل كيلومتر أو ساعة تشغيل، ومطابقة بطاقات التزود بالوقود بسهولة.", "Operator & Driver Management": "إدارة السائقين والمشغلين", "Track licences, certifications, violations, and working hours to ensure compliance and operator accountability.": "متابعة رخص القيادة وشهادات التأهيل والمخالفات وساعات العمل لضمان الامتثال ومحاسبة المشغلين.", "Breakdown & Work Orders": "أوامر العمل وإصلاح الأعطال", "Generate work orders immediately when a fault is reported. Track repair status, labor costs, and downtime hours.": "إصدار أوامر العمل فور الإبلاغ عن أي عطل ومتابعة مراحل الإصلاح وتكاليف الصيانة وساعات التوقف.", "Cost & Utilization Analytics": "تحليلات التكاليف ونسب التشغيل", "Understand the true cost of ownership for each asset — repair costs, depreciation, fuel, and revenue generated.": "معرفة التكلفة الفعلية لامتلاك وتشغيل كل أصل — تكاليف الإصلاح والاستهلاك والوقود والعوائد المحققة.", "Why Our Fleet System": "لماذا نظامنا لإدارة الأساطيل؟", "Built for Heavy-Duty": "مصمم خصيصاً للمهام الشاقة", "Operations": "والبيئات التشغيلية القاسية", "Designed for construction companies, logistics fleets, mining operations, and equipment rental businesses.": "مطور لشركات المقاولات وأساطيل النقل والخدمات اللوجستية وعمليات التعدين وشركات تأجير المعدات الثقيلة.", "Mobile-Friendly for the Field": "متوافق تماماً مع الهواتف في الميدان", "Supervisors and operators can log fuel, report defects, and complete checklists right from the jobsite.": "يمكن للمشرفين والمشغلين تسجيل الوقود والإبلاغ عن الأعطال وتعبئة قوائم الفحص مباشرة من مواقع العمل الميدانية.", "Prevent Costly Downtime": "تجنب التوقفات والأعطال المكلفة", "Catch small mechanical issues before they turn into engine failures and multi-day project delays.": "اكتشف الأعطال الميكانيكية البسيطة وعالجها قبل أن تتحول إلى أعطال جسيمة تعطل المشاريع لأيام.", "Extend Asset Lifespan": "إطالة العمر التشغيلي للأصول", "Adhere strictly to manufacturer service intervals and keep equipment running reliably for years longer.": "الالتزام الدقيق بجداول الصيانة الدورية الموصى بها من المصنع للحفاظ على كفاءة الآليات لسنوات إضافية.", "Compliance & Safety First": "أولوية السلامة والامتثال القانوني", "Never miss a safety inspection, vehicle fitness test, or insurance renewal with automated compliance alerts.": "لا تفوت أي فحص دوري للسلامة أو شهادة صلاحية للمركبة أو تجديد تأمين بفضل التنبيهات الآلية الذكية.", "Fast Onboarding for Your": "تهيئة سريعة وسلسة", "Fleet": "لكامل أسطولك", "We get your fleet imported and your team trained with minimal disruption to operations.": "نقوم باستيراد بيانات أسطولك وتدريب فريق عملك بسلاسة دون أي تأثير على سير العمليات الميدانية.", "Fleet Audit & Data Prep": "تدقيق بيانات الأسطول وتجهيزها", "We collect your current vehicle lists, service histories, and operator records into a clean import format.": "نجمع قوائم مركباتك ومعداتك وسجلات الصيانة السابقة وبيانات السائقين في ملفات استيراد منظمة وجاهزة.", "System Setup & Custom Fields": "تهيئة النظام والحقول المخصصة", "We configure asset categories, maintenance checklists, and notification thresholds for your workflow.": "نقوم بتهيئة تصنيفات الأصول، وقوائم فحص الصيانة، ومستويات التنبيهات لتتطابق مع مسار عملك.", "Import & Validation": "استيراد البيانات والتحقق منها", "Your assets, past service records, and open work orders are loaded and verified in the live system.": "يتم رفع كافة أصولك وسجلات الصيانة السابقة وأوامر العمل النشطة والتأكد من دقتها في النظام الحي.", "Field Training & Go-Live": "تدريب الكوادر الميدانية والتشغيل", "We train fleet managers, mechanics, and site supervisors so everyone uses the platform from day one.": "ندرب مديري الأساطيل والفنيين والمشرفين الميدانيين لضمان استخدام المنصة بكفاءة من اليوم الأول.", "Ready to Take Control of Your": "هل أنت مستعد لإحكام السيطرة على", "Fleet & Equipment": "أسطولك ومعداتك الثقيلة؟", "Schedule a walkthrough and see how our system cuts downtime, tracks fuel, and simplifies maintenance.": "احجز جلسة استعراض حي واكتشف كيف يقلل نظامنا أعطال الأسطول ويضبط استهلاك الوقود ويبسط الصيانة.", "Vehicle & equipment management — maintenance scheduling, fuel tracking, operator assignments, and fleet lifecycle control in one platform.": "إدارة المركبات والمعدات — جدولة الصيانة، تتبع الوقود، تعيين المشغلين، والتحكم الشامل بدورة حياة الأسطول في منصة واحدة.", "Business Management Pro - AK International": "إدارة الأعمال الاحترافية - إيه كيه إنترناشيونال", "Simple. Affordable. Powerful.": "بسيط. اقتصادي. فائق القوة.", "Light": "المرنة", "Sales • Expenses • Invoicing •": "المبيعات • المصروفات • الفواتير • ", "Built for Small Teams": "مصمم خصيصاً للشركات وفرق العمل الصغيرة", "A lightweight, easy-to-use business management tool for startups and small businesses — covering the essentials of sales, expenses, invoicing, and basic inventory, without the complexity or cost of a full ERP.": "أداة خفيفة وسهلة الاستخدام لإدارة الأعمال مصممة للشركات الناشئة والمؤسسات الصغيرة — تغطي أساسيات المبيعات والمصروفات والفواتير والمخزون، دون أي تعقيد أو تكاليف باهظة لأنظمة تخطيط الموارد الكبرى.", "min": "دقيقة", "Setup Time": "زمن الإعداد والتهيئة", "Training Needed": "تدريب مطلوب", "Cloud-Based": "سحابي بالكامل", "Real screens from the workspace — from the home screen and POS billing to sales, purchases, partners and accounts.": "شاشات حقيقية من داخل بيئة العمل — من الشاشة الرئيسية ونقاط البيع POS إلى المبيعات والمشتريات والشركاء والحسابات.", "One Home Screen for Every Module": "شاشة رئيسية واحدة لكل أقسام العمل", "Every part of the business sits on one home screen: Dashboard, POS, Inventory, Sales, Purchase, Partners, Accounts, Reports and Settings. A branch selector at the top lets you switch between locations without leaving the workspace.": "كل قطاع من أعمالك متاح من شاشة واحدة: لوحة المعلومات، نقطة البيع POS، المخزون، المبيعات، المشتريات، الشركاء، الحسابات، التقارير والإعدادات، مع محدد فروع بالأعلى للتنقل بين الفروع بسلاسة.", "POS": "نقطة البيع (POS)", "Inventory": "المخزون", "Sales": "المبيعات", "Accounts": "الحسابات", "Fast POS Billing": "فوترة نقاط بيع سريعة وفورية", "Ring up a sale from one clean screen. Tap a product card to add it to the cart, see available stock on every item, apply 15% VAT with a single toggle, and check out with the subtotal, tax and total updated as you go.": "أتمم عمليات البيع من شاشة واحدة أنيقة؛ اضغط على بطاقة المنتج لإضافته للسلة، واطلع على الكمية المتوفرة فورياً، وطبق ضريبة القيمة المضافة 15% بضغطة زر، وسدد الفاتورة بحسابات فورية للمجموع والضريبة والإجمالي.", "Cart": "سلة المشتريات", "15% VAT": "ضريبة القيمة المضافة 15%", "Checkout": "إتمام الدفع والفاتورة", "Live Business Dashboard": "لوحة تحكم حية ومباشرة للأعمال", "Track the health of the business at a glance: total products, total inventory value, low-stock items, branches and warehouses. The inventory movement chart compares stock in, stock out and transfers across 7, 30, 90 days or a year, with quick actions and low-stock alerts beside it.": "تابع مؤشرات أداء أعمالك بلمحة واحدة: إجمالي المنتجات، القيمة الإجمالية للمخزون، المنتجات منخفضة الكمية، الفروع والمستودعات، مع رسم بياني لمقارنة حركات الوارد والمنصرف والتحويلات وتنبيهات فورية.", "KPIs": "مؤشرات الأداء (KPIs)", "Movement Charts": "مخططات حركة المخزون", "Quick Actions": "إجراءات سريعة وفورية", "Inventory Movement Control": "مراقبة وتتبع حركة المخزون بدقة", "Follow every receipt, delivery, transfer and return as it happens. The last 30 days are summarised at the top, and the movements table shows each IN or OUT entry with its items, total quantity and amount, so stock levels always match what moved.": "تابع كل إذن استلام وتسليم وتحويل ومرتجع فور حدوثه؛ ملخص لآخر 30 يوماً بالأعلى وجدول تفصيلي لحركات الوارد والمنصرف بالكميات والقيم، لتتطابق أرقام المخزون بدقة تامة مع الواقع.", "Receipts": "أذون الاستلام", "Deliveries": "أذون التسليم والشحن", "Transfers": "التحويلات بين الفروع", "Returns": "المرتجعات", "Sales Order Management": "إدارة أوامر وعمليات البيع", "Create quotations and sales orders, then follow each one from draft to confirmed. Filter by status, search by customer or reference, and see total revenue and pending orders at a glance.": "أنشئ عروض الأسعار وأوامر البيع وتابع كل طلب من مرحلة المسودة حتى الاعتماد، مع إمكانية التصفية بحسب الحالة والبحث بالعميل أو المرجع ومعاينة الإيرادات والأوامر المعلقة بلمحة واحدة.", "Orders": "الطلبيات وأوامر البيع", "Order Status": "حالة الطلب", "Revenue": "الإيرادات والمبيعات", "Purchase Order Control": "التحكم في أوامر الشراء والموردين", "Manage vendor orders from one workflow: approve, track and receive. See total orders, confirmed orders, total spending and pending approvals at the top, then filter the list by draft, sent or confirmed status.": "أدر طلبيات الموردين عبر مسار عمل موحد: اعتمد، تتبع، واستلم. اطلع على إجمالي الطلبيات والإنفاق والموافقات المعلقة، وقم بتصفية القوائم حسب حالة المسودة أو المرسلة أو المعتمدة.", "Vendors": "الموردون", "Spend": "إجمالي الإنفاق والمشتريات", "Receive": "استلام البضائع", "Partner & Customer Management": "إدارة الشركاء والعملاء والموردين", "Keep customers, vendors and contacts in one searchable list. Each partner shows its contact details and a type badge — Customer, Vendor or Both — and the totals at the top show how your network is split.": "احتفظ بسجلات عملائك ومورديك وجهات الاتصال في قائمة واحدة قابلة للبحث الفوري؛ كل شريك يوضح بيانات اتصاله وتصنيفه — عميل، مورد، أو كلاهما — مع ملخصات إحصائية شاملة.", "Contacts": "جهات الاتصال وسجلات الشركاء", "Accounts & Financial Reports": "الحسابات والقوائم المالية الشاملة", "Keep the books in the same system as sales and purchases. Track total assets, liabilities and net equity, and see profit for the month. Jump to a new journal entry, the chart of accounts, trial balance, profit and loss, balance sheet or general ledger, and review recent activity in one list.": "أدر دفاتر حساباتك في نفس بيئة المبيعات والمشتريات؛ تتبع الأصول والخصوم وصافي حقوق الملكية وأرباح الشهر، مع وصول فوري للقيود اليومية ودليل الحسابات وميزان المراجعة وقائمة الدخل والميزانية العمومية ودفتر الأستاذ.", "Assets": "الأصول والموجودات", "Ledger": "دفتر الأستاذ العام", "Trial Balance": "ميزان المراجعة", "Profit & Loss": "قائمة الأرباح والخسائر", "Just What Small Businesses": "الأنسب لاحتياجات", "Need": "المؤسسات والشركات الصغيرة", "A focused feature set that covers daily operations without unnecessary complexity.": "باقة ميزات مركزة وذكية تغطي كافة العمليات اليومية دون أي تعقيدات غير ضرورية.", "Sales Management": "إدارة المبيعات والطلبيات", "Create quotations and sales orders, and track every deal from lead to close.": "إنشاء عروض الأسعار وأوامر البيع ومتابعة الصفقات من البداية وحتى الإغلاق بنجاح.", "Expense Tracking": "متابعة وتسجيل المصروفات", "Log business expenses by category and keep a clear view of where money is going.": "توثيق نفقات الأعمال حسب التصنيفات المختلفة للحصول على رؤية واضحة لحركة التدفق النقدي.", "Simple Invoicing": "إصدار فواتير مبسط واحترافي", "Generate and send professional invoices in seconds, with payment status tracking.": "إنشاء وإرسال فواتير احترافية خلال ثوانٍ معدودة مع تتبع فوري لحالات السداد.", "Basic Inventory": "إدارة المخزون الأساسية", "Keep track of product stock levels without the overhead of a full inventory system.": "متابعة مستويات المخزون بدقة دون التعقيدات المرهقة للأنظمة الضخمة.", "Contact Management": "إدارة جهات الاتصال والعملاء", "Store customer and vendor details in one organized, searchable address book.": "حفظ بيانات العملاء والموردين في دفتر سجلات منظم وسهل البحث السريع.", "Simple Dashboards": "لوحات تحكم بيانية مبسطة", "A clear, at-a-glance view of sales, expenses, and outstanding payments.": "نظرة شاملة وواضحة بلمحة سريعة على المبيعات والنفقات والدفعات المستحقة.", "Why Light": "لماذا نوصي بهذا النظام؟", "Grow Without": "توسع في أعمالك", "Growing Pains": "دون أي معوقات أو تعقيد", "Start simple, and upgrade to full Integrated Business Management whenever you're ready.": "ابدأ بخطوات بسيطة ومرنة، وتدرج نحو نظام إدارة الأعمال المتكاملة (IBM) في أي وقت تكون فيه مستعداً.", "Quick to Start": "انطلاقة فورية في نفس اليوم", "Be up and running the same day — no lengthy implementation process.": "ابدأ التشغيل الفعلي في نفس اليوم — دون الحاجة لأسابيع من الإعداد المعقد.", "Budget-Friendly": "ملائم للميزانية واقتصادي للغاية", "Priced for startups and small teams, with no hidden fees or long contracts.": "أسعار مدروسة تناسب الشركات الناشئة وفرق العمل الصغيرة دون رسوم خفية أو عقود ملزمة.", "Upgrade Path": "ترقية سلسة ومضمونة مستقبلاً", "Move to full IBM later without losing any of your existing data.": "انتقل إلى نظام IBM الشامل مستقبلاً دون فقدان أي سجل أو معلومة من بياناتك الحالية.", "Works Anywhere": "يعمل معك في كل مكان", "Access your business data from your phone, tablet, or laptop — anytime.": "الوصول إلى بيانات أعمالك من هاتفك أو جهازك اللوحي أو حاسوبك المحمول — في أي وقت ومن أي مكان.", "Up and Running in": "جاهزية وتشغيل خلال", "Days, Not Months": "أيام معدودة، وليس أشهراً", "A lightweight rollout designed for busy small business owners.": "خطة تطبيق مبسطة وسريعة صُممت خصيصاً لأصحاب الأعمال والمشاريع الصغيرة.", "Quick Consultation": "استشارة أولية سريعة", "We understand your basic needs in a short, focused call.": "نتعرف على احتياجاتك الأساسية من خلال مكالمة هاتفية قصيرة ومركزة.", "Account Setup": "تهيئة الحساب والبيانات", "We configure your products, contacts, and invoice templates.": "نقوم بتهيئة قائمة منتجاتك وجهات اتصالك وقوالب الفواتير الخاصة بك.", "Quick Walkthrough": "جولة تدريبية مختصرة وميسرة", "A short session to get your team comfortable with the essentials.": "جلسة تعريفية قصيرة تمكّن فريقك من التعامل مع النظام الأساسي بكل سلاسة وثقة.", "Start Using It": "ابدأ الاستخدام الفوري", "Start creating invoices and tracking sales right away.": "ابدأ بإصدار الفواتير ومتابعة مبيعاتك فورياً في نفس اللحظة.", "Ready for": "هل أنت مستعد لتجربة", "Simpler Business Management": "إدارة أعمال أكثر بساطة ومرونة؟", "Get started with Business Management Pro and run your small business with confidence.": "ابدأ اليوم مع إدارة الأعمال الاحترافية وقُد شركتك الصغيرة بكل ثقة ونجاح.", "Business Management Pro — a simple, affordable business tool for startups and small teams.": "إدارة الأعمال الاحترافية — أداة أعمال بسيطة واقتصادية مصممة للشركات الناشئة وفرق العمل الصغيرة.", "Connect your site to payment gateways, CRMs, ERPs, and any third-party service you rely on.": "ربط موقعك ببوابات الدفع الإلكتروني، وأنظمة إدارة العملاء CRM، وتخطيط الموارد ERP، وكافة الخدمات الخارجية التي تعتمد عليها.", "Performance & SEO": "الأداء العالي وتحسين محركات البحث (SEO)", "Optimized for speed and search rankings, so your site loads fast and gets found.": "مهيأ للسرعة الفائقة والتصدر في نتائج البحث، ليفتح موقعك فورياً ويصل إليه عملاؤك بسهولة.", "Built Right,": "مبني بدقة وإتقان،", "Built to Last": "مصمم ليدوم ويتطور معك", "We use modern tools and practices so your website stays fast, secure, and easy to maintain.": "نعتمد أحدث الأدوات والممارسات العالمية ليبقى موقعك سريعاً وآمناً وسهل الإدارة والتحديث.", "Modern Tech Stack": "حزمة تقنية برمجية حديثة", "Built with current frameworks and best practices for speed, security, and maintainability.": "مطور بأحدث أطر العمل العالمية مع الالتزام بأفضل الممارسات للسرعة والأمان وسهولة التطوير المستقبلي.", "Your site grows with your traffic and features — no rebuild required down the line.": "يتوسع موقعك تلقائياً مع زيادة الزوار والميزات — دون الحاجة لإعادة بنائه من الصفر لاحقاً.", "Mobile-First": "تصميم مخصص للهواتف أولاً", "Designed for the device most of your visitors actually use, from day one.": "مصمم ومُهيأ للشاشات التي يستخدمها غالبية زوارك بالفعل، منذ اليوم الأول.", "Ongoing Maintenance": "صيانة وتحديثات مستمرة", "Updates, backups, and support after launch so your site keeps running smoothly.": "تحديثات دورية ونسخ احتياطي منتظم ودعم فني متواصل بعد الإطلاق ليعمل موقعك بسلاسة تامة.", "Live Site": "الموقع الحي بعد الإطلاق", "A clear, collaborative process from the first sketch to launch day and beyond.": "مسار عمل واضح وتعاوني ينطلق من المخطط الأولي حتى يوم الإطلاق وما بعده.", "We learn about your goals, audience, and the features your site needs to succeed.": "نتعرف بعمق على أهدافك وجمهورك المستهدف والميزات الضرورية لتحقيق نجاح موقعك.", "We craft wireframes and visual designs tailored to your brand for your review.": "نصمم مخططات هيكلية ونماذج بصرية مخصصة تعكس هويتك وتلبي تطلعاتك للمراجعة والاعتماد.", "We build, test across devices and browsers, and refine until it's pixel-perfect.": "نبرمج ونختبر عبر مختلف الأجهزة والمتصفحات وندقق كل تفصيلة حتى نصل لأعلى معايير الإتقان.", "Launch & Support": "الإطلاق والدعم المستمر", "Your site goes live, backed by ongoing support, updates, and performance monitoring.": "يتم إطلاق موقعك رسمياً مع توفير دعم فني متواصل وتحديثات ومراقبة دورية للأداء.", "Next Website": "موقعك الإلكتروني القادم", "Tell us about your project and we'll design and build a website that works as hard as you do.": "أخبرنا عن فكرة مشروعك وسنصمم ونطور لك موقعاً استثنائياً يعمل بكفاءة تضاهي طموحك.", "Web Development — custom websites, web applications, and e-commerce platforms built to perform.": "تطوير المواقع والويب — مواقع مخصصة، تطبيقات ويب، ومتاجر إلكترونية صُممت لتحقيق أعلى أداء.", "A Look Inside Your": "نظرة داخل نظام إدارة", "Workshop": "الورش والأسطول", "Real screens from the platform — from the first job intake to the final invoice and report.": "شاشات حقيقية من المنصة — من تسجيل بطاقة أمر العمل الأولى حتى إصدار الفاتورة والتقرير النهائي.", "One Dashboard for Your Whole Workshop": "لوحة تحكم مركزية شاملة لكامل الورشة والأسطول", "See active jobs, pending jobs, monthly revenue, customer count and inventory alerts the moment you log in. Six-month revenue, a jobs-by-status breakdown, recent jobs and low-stock alerts sit right below, with a date range filter to look back at any period.": "شاهد أوامر العمل النشطة والمعلقة والإيراد الشهري وعدد العملاء وتنبيهات المخزون فور تسجيل الدخول، مع إيرادات ستة أشهر وتوزيع المهام وتنبيهات انخفاض القطع وفلاتر زمنية دقيقة.", "Active Jobs": "أوامر العمل النشطة", "Revenue Trends": "مؤشرات الإيرادات", "Jobs by Status": "المهام حسب الحالة", "Inventory Alerts": "تنبيهات المخزون", "Fast Job Intake": "تسجيل واستلام سريع للمركبات", "Register a vehicle or heavy machine in one guided form. Search or enter the customer, add plate or VIN/chassis number, make, model, colour and mileage or hours, then describe the complaint. Attach photos from your files or camera, and generate a Job ID in one click.": "تسجيل بيانات المركبة أو المعدة الثقيلة عبر نموذج إرشادي موحد؛ ابحث عن العميل وسجل رقم اللوحة أو الهيكل (الشاسيه) والماركة والطراز واللون والعداد، واكتب وصف العطل وأرفق الصور برقم أمر عمل تلقائي فوري.", "Customer Search": "بحث سريع عن العملاء", "VIN / Chassis": "رقم الهيكل / الشاسيه (VIN)", "Photo Upload": "إرفاق الصور والمستندات", "Auto Job ID": "توليد رقم أمر عمل تلقائي", "Track Every Repair Stage": "متابعة دقيقة لكل مراحل الإصلاح", "Follow each job from intake to delivery on one board. Every vehicle and machine shows its current stage, status, progress bar and complaint or work description, with stage counts across the top so you know what needs attention first.": "تابع كل مهمة من الاستلام إلى التسليم على لوحة تفاعلية واحدة؛ تظهر كل مركبة ومعدة مرحلتها الحالية ونسبة الإنجاز ووصف العطل مع إحصائيات بالأعلى لتحديد الأولويات فورياً.", "Pending": "معلق وفي الانتظار", "Repairing": "قيد الإصلاح والصيانة", "Delivered": "تم الإنجاز والتسليم", "Parts Inventory & Billing Control": "مراقبة مخزون قطع الغيار والفوترة", "Keep spare parts such as filters, brake pads, engine oil and spark plugs under control. Low-stock items are flagged against their minimum levels, and every invoice is tied to its job, customer and vehicle, from draft through confirmed, with service revenue totals.": "تحكم كامل بقطع الغيار كالفلاتر والفرامل والزيوت والشموع؛ تنبيه فوري بالقطع المنخفضة وربط كل فاتورة بأمر العمل والعميل والمركبة من المسودة للاعتماد مع حساب إجمالي إيرادات الخدمة.", "Spare Parts": "قطع الغيار والزيوت", "Low-Stock Alerts": "تنبيهات فورية عند انخفاض الرصيد", "Invoices": "الفواتير وسندات القبض", "Service Revenue": "إيرادات خدمات الصيانة", "Customer & Equipment Records": "سجلات العملاء والمركبات والمعدات", "Open a customer and see their contact details alongside every vehicle and machine they own. Each asset has its own details and service history timeline, recent jobs, and a status-tagged equipment list, so the full history is always one click away.": "افتح ملف العميل واطلع على بياناته وسجل كافة المركبات والمعدات التابعة له، مع جدول زمني مفصل لسجل الصيانة السابقة وحالات التشغيل بضغطة زر واحدة.", "Profiles": "ملفات العملاء والمعدات", "Vehicles": "المركبات والشاحنات", "Service History": "سجل وتاريخ الصيانة", "Search": "بحث سريع", "Reports & Workshop Insights": "تقارير تفصيلية ورؤى تشغيلية للورشة", "Review job trends month by month, service revenue growth, inventory alerts (low stock, reorder soon, out of stock), invoice status (paid, pending, overdue, draft) and technician performance on one dashboard. Export the reports when you need to share them.": "راجع اتجاهات أوامر العمل شهراً بشهر، ونمو الإيرادات، وتنبيهات المخزون (منخفض، يحتاج إعادة طلب، نفد)، وحالات الفواتير (مدفوعة، معلقة، متأخرة) وأداء الفنيين مع إمكانية تصدير التقارير بسهولة.", "Job Trends": "اتجاهات ومعدلات أوامر العمل", "Technician Performance": "تقييم كفاءة وإنتاجية الفنيين", "Export Reports": "تصدير التقارير والإحصائيات", "Complete Fleet & Equipment": "إدارة شاملة للأسطول والمعدات", "From a single truck to a full construction fleet, manage every asset from one dashboard.": "من شاحنة نقل واحدة إلى أسطول مقاولات ضخم، أدر كافة أصولك من لوحة تحكم موحدة.", "Real-Time Tracking": "تتبع حي ومباشر في الوقت الفعلي", "Monitor vehicle and equipment location, status, and utilization across all your sites.": "مراقبة مواقع المركبات والمعدات وحالاتها ونسب استخدامها عبر كافة مواقع ومشاريع العمل.", "Preventive Maintenance": "الصيانة الوقائية الدورية", "Automated service schedules and alerts based on usage hours, mileage, or calendar intervals.": "جداول صيانة دورية وتنبيهات تلقائية تعتمد على ساعات التشغيل أو الكيلومترات أو التواريخ المحددة.", "Fuel & Usage Tracking": "تتبع استهلاك الوقود وساعات العمل", "Log fuel consumption and operating hours to control costs and catch anomalies early.": "توثيق استهلاك الوقود وساعات التشغيل للسيطرة التامة على النفقات وكشف أي هدر مبكراً.", "Assign operators, track licenses and certifications, and log driver/operator history.": "تعيين المشغلين ومتابعة الرخص والشهادات المهنية وأرشفة سجل أداء السائقين.", "Documentation & Compliance": "التوثيق والامتثال النظامي", "Store registration, insurance, permits, and inspection records with expiry reminders.": "حفظ رخص السير ووثائق التأمين والتصاريح والفحص الدوري مع تنبيهات ذكية قبل انتهاء صلاحيتها.", "Cost & Lifecycle Reports": "تقارير التكاليف ودورة حياة الأصول", "Analyze total cost of ownership, downtime, and depreciation across your entire fleet.": "تحليل تكلفة الامتلاك الشاملة ونسب توقف العمل ومعدلات الإهلاك لكامل أسطولك.", "Why This Platform": "لماذا هذه المنصة المتطورة؟", "Reduce Downtime,": "تقليل أعطال التشغيل،", "Control Costs": "وضبط النفقات بدقة", "Purpose-built for industries that depend on vehicles and heavy machinery every day.": "مصمم خصيصاً للقطاعات الحيوية التي تعتمد على المركبات والمعدات الثقيلة في عملياتها اليومية.", "Proactive Alerts": "تنبيهات وإشعارات استباقية", "Get notified before maintenance is due, documents expire, or usage limits are hit.": "احصل على إشعارات مسبقة قبل مواعيد الصيانة أو انتهاء الوثائق أو تجاوز حدود الاستخدام المقررة.", "Multi-Site Support": "دعم وإدارة المواقع المتعددة", "Manage fleets and equipment across multiple projects, yards, or locations centrally.": "إدارة الأساطيل والآليات عبر عدة مشاريع وساحات ومواقع مختلفة من مركز قيادة موحد.", "Mobile-Ready": "جاهز ومتوافق تماماً مع الجوال", "Field teams can log checks, fuel, and usage directly from the field on any device.": "يمكن للفرق الميدانية تسجيل الفحوصات والوقود وساعات التشغيل مباشرة من الموقع عبر أي هاتف.", "Integrates With IBM": "يتكامل بسلاسة مع نظام IBM", "Connect seamlessly with Integrated Business Management for unified accounting and reporting.": "ربط مباشر وسلس مع نظام إدارة الأعمال المتكاملة (IBM) لمحاسبة وتقارير موحدة.", "Onboarding Your": "تهيئة وتشغيل كامل", "We get your vehicles and equipment into the system quickly and accurately.": "ندرج كافة مركباتك ومعداتك في النظام بسرعة فائقة وبأعلى درجات الدقة.", "Asset Inventory": "حصر وجرد الأصول والمعدات", "We catalog every vehicle and piece of equipment with full specifications.": "نقوم بفهرسة وتسجيل كل مركبة ومعدة بكافة مواصفاتها وبياناتها الفنية.", "We set maintenance schedules, alerts, and reporting rules for your operation.": "نحدد جداول الصيانة ومستويات التنبيه وقواعد التقارير بما يناسب أسلوب عملياتك.", "Team Training": "تدريب وتأهيل فريق العمل", "Operators, drivers, and office staff are trained to log data correctly from day one.": "تدريب السائقين والمشغلين وموظفي المكاتب على إدخال البيانات بكفاءة واحترافية من اليوم الأول.", "Your fleet goes live on the platform with ongoing support from our team.": "يتم تشغيل أسطولك رسمياً على المنصة مع توفير دعم فني مستمر ومتكامل من خبرائنا.", "Take Control of Your": "أحكم السيطرة الآن على", "Talk to our team about deploying Advance Vehicle & Heavy Equipment Management for your operation.": "تحدث مع خبرائنا اليوم لتطبيق نظام إدارة المركبات والمعدات الثقيلة المتقدمة في مؤسستك.", "Advance Vehicle & Heavy Equipment Management — fleet tracking, maintenance, and lifecycle control in one platform.": "إدارة المركبات والمعدات الثقيلة المتقدمة — تتبع الأسطول، الصيانة، والتحكم الشامل بدورة حياة الأصول في منصة واحدة.", "Invoice Creation - AK International": "إنشاء الفواتير - إيه كيه إنترناشيونال", "Get Paid Faster": "تحصيل مستحقاتك وأموالك بشكل أسرع", "Invoice": "إنشاء", "Creation": "الفواتير الاحترافية", "Create • Send • Track •": "إنشاء • إرسال • تتبع • ", "Get Paid Online": "التحصيل الإلكتروني الفوري", "A focused invoicing tool that lets you create branded, professional invoices in seconds, send them directly to clients, track payment status in real time, and automate reminders for overdue payments.": "أداة فوترة متخصصة تمكنك من إنشاء فواتير احترافية بهويتك المؤسسية في ثوانٍ معدودة، وإرسالها مباشرة لعملائك، وتتبع حالات الدفع فورياً، وأتمتة التذكيرات للمطالبات المتأخرة.", "sec": "ثانية", "Per Invoice": "لكل فاتورة", "Branded": "هوية مؤسسية مخصصة", "Manual Follow-ups": "متابعات يدوية مرهقة", "Real screens from the workspace — quotations, invoices, and print-ready bills in one place.": "شاشات حقيقية من داخل بيئة العمل — عروض الأسعار، الفواتير، وسندات الدفع الجاهزة للطباعة في مكان واحد.", "Your Billing Workspace, One Screen Away": "مساحة الفوترة المتكاملة الخاصة بك بلمسة واحدة", "Start from a clear home screen with separate Quotation and Invoice cards, then jump straight into Create Quotation, Create Invoice, Print, or Manage Records from the quick actions. No hunting through menus to get a bill out the door.": "ابدأ من شاشة رئيسية منظمة ببطاقات مستقلة لعروض الأسعار والفواتير، وانطلق مباشرة إلى إنشاء عرض سعر أو فاتورة أو الطباعة أو إدارة السجلات عبر إجراءات سريعة دون البحث في القوائم المعقدة.", "Quotations": "عروض الأسعار", "Print": "طباعة فورية", "Manage Records": "إدارة السجلات والأرشيف", "Create an Invoice in Minutes": "إنشاء فاتورة مكتملة خلال دقائق", "Enter the customer's name, address, and date, choose Normal Bill (no GST) or GST Bill (18% GST), then add items with description, quantity, unit, and unit price. Gross, discount, GST, and net total update as you go.": "أدخل اسم العميل وعنوانه والتاريخ، واختر فاتورة عادية أو فاتورة ضريبية، ثم أضف البنود بالوصف والكمية وسعر الوحدة؛ حيث يتم تحديث المجموع الإجمالي والخصم والضريبة والصافي تلقائياً.", "Customer Details": "بيانات العميل", "GST 18%": "ضريبة 18%", "Multiple Items": "بنود متعددة", "Auto Totals": "حساب تلقائي للإجماليات", "Clean Quotations, Ready to Send": "عروض أسعار أنيقة جاهزة للإرسال", "Prepare estimates with the same simple form. Add customer details, pick the bill type, list items with a discount if needed, and save and print the quotation in a single step.": "جهّز عروض الأسعار والتقديرات بنفس السهولة والسرعة؛ أضف بيانات العميل واختر نوع الفاتورة وحدد البنود والخصومات، ثم احفظ واطبع عرض السعر في خطوة واحدة.", "Customer": "العميل", "Discounts": "الخصومات", "Save & Print": "حفظ وطباعة", "Print-Ready Business Documents": "مستندات أعمال جاهزة للطباعة الفورية", "Preview any quotation or invoice before it goes out. Choose the document type, toggle the company logo, tax details, and totals, then print or save as PDF. Every document ends with an authorized signature line and a thank-you note.": "عاين أي عرض سعر أو فاتورة قبل إرسالها؛ اختر نوع المستند، وأظهر شعار شركتك والتفاصيل الضريبية والإجماليات، ثم اطبعها أو احفظها بصيغة PDF مع خانة التوقيع المعتمد ورسالة الشكر.", "Preview": "معاينة", "PDF": "ملف PDF", "Share": "مشاركة", "Invoicing Made": "إصدار الفواتير أصبح", "Effortless": "بمنتهى السهولة والمرونة", "Everything you need to bill clients professionally and get paid on time.": "كل ما تحتاجه لإصدار فواتير احترافية لعملائك وتحصيل مستحقاتك في المواعيد المحددة.", "Branded Templates": "قوالب مخصصة بهوية علامتك", "Customize invoice templates with your logo, colors, and business details.": "خصص قوالب الفواتير بإضافة شعار شركتك وألوان هويتك وبياناتك الرسمية.", "Instant Delivery": "إرسال وتسليم فوري", "Send invoices directly by email or shareable link the moment they're ready.": "أرسل الفواتير مباشرة عبر البريد الإلكتروني أو روابط سريعة قابلة للمشاركة فور تجهيزها.", "Online Payments": "دفع إلكتروني متكامل", "Let clients pay directly from the invoice with integrated payment gateways.": "اسمح لعملائك بالسداد مباشرة من داخل الفاتورة عبر بوابات الدفع الإلكتروني المدمجة.", "Automated Reminders": "تذكيرات سداد آلية", "Overdue invoices trigger automatic, polite payment reminders — no manual chasing.": "تطلق الفواتير المتأخرة إشعارات تذكيرية مهذبة وتلقائية بالسداد دون الحاجة للمتابعة اليدوية.", "Recurring Invoices": "فواتير واشتراكات متكررة", "Set up subscriptions or retainers to auto-generate and send on schedule.": "قم بجدولة الاشتراكات أو الدفعات الدورية لتوليد الفواتير وإرسالها تلقائياً في مواعيدها.", "Payment Tracking": "تتبع دقيق لحالات الدفع", "See exactly which invoices are paid, pending, or overdue at a glance.": "اطلع بدقة وبلمحة واحدة على الفواتير المدفوعة والمعلقة والمتأخرة عن موعدها.", "Why This Tool": "لماذا نوصي بهذه الأداة؟", "Look Professional,": "مظهر في غاية الاحترافية،", "Built for freelancers, small teams, and businesses that bill clients regularly.": "صُممت للمستقلين وفرق العمل والشركات التي تصدر فواتير دورية ومستمرة لعملائها.", "Lightning Fast": "سرعة استثنائية وفورية", "Go from blank invoice to sent in under a minute with saved templates.": "انتقل من نموذج فارغ إلى فاتورة مرسلة للعميل في أقل من دقيقة باستخدام القوالب الجاهزة.", "Multi-Currency": "دعم وتعدد العملات", "Bill international clients in their local currency with ease.": "أصدر الفواتير لعملائك الدوليين بعملاتهم المحلية بكل سهولة ومرونة.", "Tax Ready": "جاهز ومتوافق مع الضرائب", "Auto-apply tax rates and generate reports ready for filing.": "تطبيق تلقائي للنسب الضريبية وتوليد تقارير مالية جاهزة للإقرارات الرسمية.", "Connect with Integrated Business Management for full accounting sync.": "ربط مباشر مع نظام إدارة الأعمال المتكاملة (IBM) لمزامنة محاسبية شاملة.", "How It Works": "آلية العمل البسيطة", "From Draft to": "من المسودة حتى", "Paid": "السداد التام", "A simple, repeatable flow for every invoice you send.": "مسار عمل سلس ومنتظم لكل فاتورة تصدرها.", "Create": "إنشاء الفاتورة", "Pick a template, add line items, and your invoice is ready.": "اختر القالب وأضف بنود الفاتورة لتصبح جاهزة فوراً.", "Send": "إرسال للعميل", "Deliver it instantly by email or a shareable payment link.": "أرسلها فورياً عبر البريد أو رابط دفع مباشر قابل للمشاركة.", "Track": "متابعة السداد", "See when it's viewed, and follow payment status in real time.": "اعرف متى اطلع العميل على الفاتورة وتابع حالة الدفع لحظة بلحظة.", "Get Paid": "تحصيل الأموال", "Clients pay online and your records update automatically.": "يسدد العملاء إلكترونياً وتُحدث قيودك وسجلاتك المالية تلقائياً.", "Start Sending": "ابدأ بإصدار وإرسال", "Today": "اليوم بكل ثقة", "Professional Invoices": "فواتير احترافية متكاملة", "Get set up with our Invoice Creation tool and stop chasing payments manually.": "ابدأ الآن مع أداة إنشاء الفواتير وتوقف عن ملاحقة المدفوعات بالطرق اليدوية المرهقة.", "Invoice Creation — generate, send, and track professional invoices in seconds.": "إنشاء الفواتير — إصدار وإرسال وتتبع الفواتير الاحترافية في ثوانٍ معدودة.", "Inventory Management - AK International": "إدارة المخزون والمستودعات - إيه كيه إنترناشيونال", "Real-Time Stock Control": "إحكام السيطرة الفورية على المخزون", "Stock Tracking • Barcode Scanning •": "تتبع المخزون • مسح الباركود • ", "Multi-Location Support": "دعم وإدارة الفروع المتعددة", "A complete inventory management solution that gives you real-time visibility into stock levels across every warehouse and location, with barcode scanning, low-stock alerts, and automated reordering to keep your business running smoothly.": "حل متكامل لإدارة المخزون يمنحك رؤية فورية لمستويات البضائع في كل مستودع وفرع، مع مسح الباركود وتنبيهات انخفاض الكميات وأتمتة إعادة الطلب لضمان استمرارية أعمالك.", "Real-Time Accuracy": "دقة فورية بنسبة 100%", "Stockouts Missed": "صفر نفاد للمخزون دون علم", "Visibility": "رؤية شاملة ومباشرة", "Real screens from the platform — from the product catalog to purchase receiving, low-stock alerts and reports.": "شاشات حقيقية من المنصة — من كتالوج المنتجات واستلام المشتريات إلى تنبيهات نقص المخزون والتقارير.", "One Dashboard for Your Entire Stock": "لوحة تحكم موحدة لكامل مخزونك ومستودعاتك", "Open the dashboard to see total products, items in stock, low-stock alerts, categories and total stock value at a glance. Stock overview and stock-by-category charts sit beside recent stock movements and a low-stock alert list, so you know where to look first.": "افتح لوحة المعلومات لتشاهد إجمالي المنتجات والمتوفر وتنبيهات النقص والتصنيفات وقيمة المخزون الكلية، مع رسوم بيانية لحركة البضائع وقائمة تنبيهات النقص لمعرفة أولويات العمل فورياً.", "Total Products": "إجمالي عدد المنتجات", "Stock Overview": "نظرة عامة على المخزون", "Stock by Category": "توزيع المخزون حسب التصنيف", "Smart Product Catalog": "كتالوج منتجات ذكي ومنظم", "Keep every product organised in one searchable catalog. Each item has its image, category, unit of measure and live stock status — In Stock, Low Stock or Out of Stock — and you can filter by category or unit or search by name in seconds.": "فهرسة المنتجات في كتالوج موحد وقابل للبحث الفوري؛ كل صنف يتضمن صورته وتصنيفه ووحدة قياسه وحالته الحية — متوفر، منخفض، أو نافد — مع فلاتر حسب الصنف والوحدة وبحث فوري بالاسم.", "Categories": "التصنيفات", "Units": "وحدات القياس", "Real-Time Stock Movement": "تتبع حركة المخزون لحظة بلحظة", "Record every stock in, stock out, transfer and adjustment as it happens. Period totals for each movement type sit at the top, and the movement timeline shows the product, warehouse, reference, quantity and balance so nothing slips through.": "توثيق كل حركة وارد ومنصرف وتحويل وتسويه فور حدوثها؛ إجماليات لكل حركة بالأعلى وسجل زمني يوضح المنتج والمستودع والرقم المرجعي والكمية والرصيد المتبقي بدقة تامة.", "Movements": "حركات المخزون", "Stock In & Out": "الوارد والمنصرف", "Adjustment Logs": "سجلات التسويات الجردية", "Purchase Receiving & Supplier Orders": "استلام المشتريات وطلبيات الموردين", "Track incoming purchase orders through draft, ordered and received stages. The receive flow links suppliers directly to warehouses, shows line items with cost and tax, and updates your on-hand stock the moment goods are checked in.": "متابعة أوامر الشراء الواردة عبر مراحل المسودة والطلب والاستلام؛ ربط الموردين بالمستودعات مع بيان التكاليف والضرائب وتحديث رصيد المخزون فورياً عند فحص واستلام البضاعة.", "Suppliers": "الموردون وسجلاتهم", "Purchase Orders": "أوامر الشراء", "Auto-Receive": "استلام وتحديث تلقائي", "Stock Level Auditing & Reports": "التدقيق الجردي وتقارير المستودعات", "Generate detailed inventory reports by warehouse, category, or movement type. Audit physical stock against system records, identify slow-moving items, and export data for your accounting team in a single click.": "توليد تقارير جرد مفصلة حسب المستودع أو التصنيف أو نوع الحركة، ومطابقة الجرد الفعلي مع سجلات النظام وتحديد الأصناف الراكدة وتصدير البيانات بضغطة زر واحدة.", "Audits": "عمليات التدقيق والجرد", "Valuation": "التقييم المالي للمخزون", "Take Total Control of Your": "أحكم السيطرة التامة على", "Stock": "مخزونك ومستودعاتك", "Everything you need to eliminate stockouts, prevent overstocking, and run lean warehouses.": "كل ما يلزمك لمنع نفاد البضائع وتجنب تكدس المخزون وإدارة مستودعاتك بأعلى كفاءة.", "Multi-Warehouse": "إدارة المستودعات المتعددة", "Track stock levels independently across multiple warehouses, stores, or storage yards.": "تتبع مستويات المخزون بشكل مستقل عبر عدة مستودعات أو معارض أو ساحات تخزين.", "Barcode Scanning": "دعم مسح الباركود السريع", "Speed up receiving, picking, and cycle counts using standard barcode scanners or mobile cameras.": "تسريع عمليات الاستلام والصرف والجرد الدوري باستخدام أجهزة الباركود أو كاميرات الجوال.", "Automated notifications when products hit their reorder point, so you never run out of critical items.": "إشعارات آلية فور وصول أي صنف إلى حد إعادة الطلب لتفادي انقطاع المنتجات الحيوية.", "Batch & Serial Tracking": "تتبع أرقام التشغيلات والتسلسل", "Track items by batch number, lot, or serial number for full traceability and warranty management.": "تتبع البضائع برقم التشغيلة (Batch) أو الرقم التسلسلي (Serial) لإمكانية التتبع وإدارة الضمان.", "Automated Reordering": "إعادة الطلب التلقائية الذكية", "Generate purchase orders automatically when stock levels fall below your defined safety threshold.": "توليد أوامر شراء تلقائية للموردين فور هبوط كميات المخزون تحت حد الأمان المحدد.", "Valuation & Costing": "التقييم المحاسبي للمخزون والتكاليف", "Supports FIFO, LIFO, and weighted average costing methods for precise financial reporting.": "دعم طرق التقييم المحاسبي (الوارد أولاً يصرف أولاً، المتوسط المرجح) لتقارير مالية بالغة الدقة.", "Why Our Inventory System": "لماذا نظامنا لإدارة المخزون؟", "Accuracy That Drives": "دقة متناهية تقود", "Profitability": "الربحية والنمو المالي", "Designed for retail chains, distributors, e-commerce sellers, and manufacturing warehouses.": "صُمم لشبكات التجزئة والموزعين وشركات التجارة الإلكترونية ومستودعات المصانع.", "Real-Time Visibility": "رؤية مباشرة في الوقت الفعلي", "Know exactly what you have, where it is, and what it is worth at any given second.": "اعرف بدقة ما تملكه وموقع تخزينه وقيمته المالية في كل ثانية.", "Reduce Holding Costs": "خفض تكاليف التخزين والهدر", "Identify dead stock and slow-moving items before they tie up your working capital.": "اكتشف البضائع الراكدة وبطيئة الحركة قبل أن تعطل سيولتك ورأس مالك العامل.", "Zero Discrepancy Audits": "جرد دوري بدون فروقات محاسبية", "Reconcile physical stock with digital records faster with barcode-assisted cycle counting.": "طابق الجرد الفعلي مع السجلات الرقمية بسرعة وسهولة عبر الجرد المدعوم بالباركود.", "Omnichannel Sync": "مزامنة مع قنوات البيع المتعددة", "Keep stock levels synchronized between your physical stores, e-commerce site, and marketplaces.": "مزامنة فورية لأرصدة المخزون بين متاجرك الفعلية وموقعك الإلكتروني ومنصات البيع.", "Smooth Rollout for Your": "تطبيق وتدريب سلس لكامل", "Warehouses": "مستودعاتك وفروعك", "We get your catalog imported and your warehouse staff trained without stopping shipments.": "نرفع كتالوج منتجاتك وندرب أمناء المستودعات دون أي تعطيل لشحناتك ومبيعاتك.", "Catalog Clean-Up & Prep": "تنظيم وتجهيز كتالوج المنتجات", "We format your SKUs, descriptions, categories, and initial counts into a validated template.": "نرتب أرقام الأصناف (SKUs) والأوصاف والتصنيفات والأرصدة الافتتاحية في قوالب معتمدة.", "Warehouse & Bin Setup": "تهيئة المستودعات وأماكن التخزين", "We map your physical locations, zones, aisles, and shelf bins into the system hierarchy.": "نحدد مستودعاتك ومناطق التخزين والممرات والأرفف رقمياً داخل الهيكل التنظيمي للنظام.", "Staff Training & Handhelds": "تدريب الكوادر وأجهزة المسح", "We train warehouse pickers, receivers, and managers on desktop and mobile workflows.": "ندرب مسؤولي الاستلام وأمناء المخازن والمديرين على أجهزة المسح وتطبيقات الجوال والكمبيوتر.", "Your inventory goes live with real-time tracking from day one, supported by our specialists.": "يبدأ نظام المخزون بالعمل مباشرة مع تتبع حي ومباشر من اليوم الأول بدعم متخصص من خبرائنا.", "Schedule a live demo to see how our inventory platform keeps stock accurate and orders moving.": "احجز عرضاً توضيحياً حياً لترى كيف يحافظ نظامنا على دقة المخزون وسلاسة شحن الطلبيات.", "Inventory Management — real-time stock control, barcode scanning, and multi-location tracking in one platform.": "إدارة المخزون — تحكم فوري بالمخزون، مسح الباركود، وتتبع الفروع المتعددة في منصة واحدة.", "InventoryPro - AkTech": "إنفنتوري برو - إيه كيه تك", "Product Overview": "نظرة عامة على النظام", "Demo Video Section": "مقطع العرض التوضيحي", "Platform Availability": "توافق المنصات والأجهزة", "Screenshots Gallery": "معرض شاشات النظام", "Multi-Branch & Multi-Company Section": "إدارة الشركات والفروع المتعددة", "Features Section": "قسم الميزات المتقدمة", "Pricing Section": "خطط الأسعار والاشتراكات", "Benefits Section": "الفوائد ومزايا الاستخدام", "Complete Inventory Management Solution with Full Pro Functionality": "الحل الشامل لإدارة المخزون والمبيعات والمشتريات بكامل الميزات الاحترافية", "Available on Web, Android, iOS, Windows, and macOS with cross-platform synchronization": "متوفر على الويب، وأندرويد، وiOS، وويندوز، وماك مع مزامنة فورية عابرة للمنصات", "Watch Demo": "شاهد العرض التجريبي", "View Pricing": "استعرض خطط الأسعار", "Experience InventoryPro in Action": "شاهد إنفنتوري برو في الواقع العملي", "Watch how InventoryPro simplifies complex inventory management workflows with ease": "شاهد كيف يبسط إنفنتوري برو إدارة المخزون والمبيعات المعقدة بكل سهولة وسلاسة", "Your browser does not support the video tag.": "متصفحك لا يدعم تشغيل مقاطع الفيديو.", "Available on All Your Devices": "يعمل بتوافق تام على كافة أجهزتك", "Access your inventory anywhere, anytime with our cross-platform applications": "تحكم في مخزونك وأعمالك من أي مكان وفي أي وقت عبر تطبيقاتنا المتوافقة مع جميع الأجهزة", "Web Application": "منصة وتطبيق الويب", "Access via any modern browser with full functionality": "الوصول عبر أي متصفح حديث بكامل الميزات والخصائص دون الحاجة لتثبيت أي برامج", "Android App": "تطبيق أندرويد للهواتف والأجهزة اللوحية", "Download from Google Play Store for mobile management": "حمّله من متجر Google Play لإدارة مبيعاتك ومخزونك الميداني بكل سهولة", "iOS App": "تطبيق آيفون وآيباد (iOS)", "Available on the App Store for iPhone and iPad": "متاح على App Store لأجهزة iPhone وiPad بواجهة أنيقة وسريعة", "Desktop Apps": "تطبيقات الحواسيب المكتبية", "Native Windows and macOS applications for heavy workloads": "تطبيقات أصلية لأنظمة Windows وmacOS مصممة لأعباء العمل اليومية المكثفة", "Explore the Interface": "استكشف واجهات النظام الأنيقة", "Intuitive, modern design built for efficiency and ease of use": "تصميم عصري وبديهي صُمم لتحقيق أعلى درجات السرعة وسهولة الاستخدام", "Dashboard": "لوحة التحكم الرئيسية", "Comprehensive overview with charts, KPIs, and quick actions": "نظرة شاملة مع رسوم بيانية ومؤشرات أداء رئيسية وإجراءات سريعة فورية", "Detailed product listings with stock levels and alerts": "قوائم منتجات تفصيلية مع مستويات المخزون وتنبيهات النقص الفورية", "Track orders, generate invoices, and manage customers": "تتبع الطلبات وإصدار الفواتير وإدارة بيانات العملاء بدقة", "Barcode Scanner": "ماسح الباركود السريع", "Fast, accurate barcode scanning using your device camera": "مسح سريع ودقيق للباركود باستخدام كاميرا جهازك أو أجهزة المسح المخصصة", "Analytics & Reports": "التقارير والتحليلات البيانية", "In-depth business intelligence and downloadable reports": "تقارير ذكاء أعمال تفصيلية وقابلة للتنزيل والطباعة بنقرة واحدة", "Scale Across Branches and Companies": "توسع في فروعك وشركاتك المتعددة", "Manage multiple companies and branch locations from a single, unified account": "أدر عدة شركات وفروع ومستودعات مختلفة من حساب موحد وسهل التحكم", "Multi-Company Management": "إدارة الشركات المتعددة", "Create and manage separate business entities under one master account with independent books, currencies, and settings.": "أنشئ وأدر كيانات أعمال وشركات مستقلة تحت حساب رئيسي واحد مع دفاتر محاسبية وعملات وإعدادات منفصلة.", "Multi-Branch Operations": "إدارة الفروع والمنافذ المتعددة", "Assign products, warehouses, and staff to specific branches with localized inventory tracking and reporting.": "خصص المنتجات والمستودعات والموظفين لفروع محددة مع تتبع محلي وتقارير مستقلة لكل فرع.", "Inter-Branch Transfers": "التحويلات السلسة بين الفروع", "Seamlessly transfer stock between branches with automated transfer orders, transit tracking, and approvals.": "حوّل البضائع بين الفروع بسلاسة عبر أوامر تحويل مؤتمتة وتتبع الشحنات أثناء النقل ونظام موافقات محكم.", "Consolidated Reporting": "تقارير مجمعة وشاملة", "View performance across all branches together or drill down into individual locations for detailed insights.": "شاهد أداء كافة الفروع معاً في تقرير موحد أو تعمق في أداء فرع بعينه للحصول على رؤى تفصيلية.", "Role-Based Permissions": "صلاحيات دقيقة بحسب الأدوار", "Control access at the company, branch, and feature level to ensure team members only see what they need to.": "تحكم في الصلاحيات على مستوى الشركة والفرع والميزات لضمان وصول الموظفين لما يخصهم فقط.", "Centralized Catalog": "كتالوج منتجات موحد ومركزي", "Share a central product catalog across branches while maintaining branch-specific pricing, stock levels, and reorder points.": "شارك كتالوج منتجات رئيسي عبر كافة الفروع مع تخصيص أسعار ومستويات مخزون وحدود طلب لكل فرع.", "Powerful Features for Modern Businesses": "ميزات فائقة القوة للشركات الحديثة", "Everything you need to streamline operations and boost productivity": "كل ما يلزمك لتسهيل العمليات ورفع الإنتاجية ومضاعفة الأرباح", "Monitor stock movements across all warehouses in real time with automated updates.": "راقب حركة المخزون عبر جميع المستودعات لحظة بلحظة مع تحديثات آلية فورية.", "Quick barcode scanning with mobile cameras or dedicated hardware scanners.": "مسح فوري للباركود باستخدام كاميرات الهواتف أو أجهزة المسح الضوئي المخصصة.", "Receive proactive notifications when stock falls below predefined thresholds.": "استقبل إشعارات استباقية وتنبيهات فور وصول المخزون لحدود إعادة الطلب المحددة.", "Automate purchasing workflows with supplier management and automatic PO generation.": "أتمتة دورات الشراء مع إدارة سجلات الموردين وتوليد أوامر الشراء تلقائياً.", "Seamlessly connect with your e-commerce platforms and accounting software.": "ربط مباشر وسلس مع متاجرك الإلكترونية وبرامج المحاسبة المعتمدة لديك.", "Generate comprehensive reports and gain valuable insights into your business.": "توليد تقارير مالية وجردية شاملة والحصول على رؤى استراتيجية قيمة لأعمالك.", "Simple, Transparent Pricing": "أسعار واضحة وبسيطة وشفافة", "Choose the plan that fits your business needs. Upgrade or downgrade at any time.": "اختر الخطة المناسبة لاحتياجات أعمالك؛ يمكنك الترقية أو التعديل في أي وقت.", "Starter": "الخطة الأساسية (Starter)", "Perfect for small businesses getting started": "مثالية للمتاجر والشركات الصغيرة في بداية انطلاقتها", "Up to 500 products": "حتى 500 منتج", "1 warehouse": "مستودع واحد", "2 team members": "عضوان في فريق العمل", "Basic reporting": "تقارير وإحصائيات أساسية", "Mobile app access": "الوصول عبر تطبيقات الجوال", "Email support": "دعم فني عبر البريد الإلكتروني", "Get Started Free": "ابدأ الآن مجاناً", "Professional": "الخطة الاحترافية (Professional)", "Ideal for growing businesses that need more power": "مثالية للشركات النامية التي تحتاج ميزات متقدمة", "POPULAR": "الأكثر طلباً", "Unlimited products": "عدد غير محدود من المنتجات", "Up to 5 warehouses": "حتى 5 مستودعات مختلفة", "10 team members": "10 أعضاء في فريق العمل", "Advanced analytics": "تحليلات وإحصائيات بيانية متقدمة", "Barcode scanning & printing": "مسح وطباعة ملصقات الباركود", "Priority support": "أولوية في الدعم الفني", "Enterprise": "خطة المؤسسات (Enterprise)", "For large organizations with complex operations": "للمؤسسات والشركات الكبرى ذات العمليات الواسعة", "Custom": "سعر مخصص", "Unlimited warehouses": "عدد غير محدود من المستودعات", "Unlimited team members": "عدد غير محدود من الموظفين", "Custom integrations": "ربط وتكامل برمجي مخصص", "Dedicated account manager": "مدير حساب مخصص لمتابعة أعمالك", "SLA guarantee": "ضمان مستوى الخدمة (SLA)", "Why Businesses Choose InventoryPro": "لماذا تفضل الشركات نظام إنفنتوري برو؟", "Proven results that drive growth, efficiency, and customer satisfaction": "نتائج عملية ملموسة تعزز النمو وترفع الكفاءة ورضا العملاء", "Save 15+ Hours Weekly": "توفير أكثر من 15 ساعة أسبوعياً", "Automate manual inventory tasks and reduce data entry errors significantly.": "أتمتة المهام الجردية اليدوية وخفض أخطاء الإدخال البشري بنسب هائلة.", "Reduce Stockouts by 80%": "خفض نفاد المخزون بنسبة 80%", "Smart reorder points and automated alerts ensure you never miss a sale.": "تنبيهات ذكية وحدود طلب مبرمجة تضمن عدم خسارة أي صفقة بيع.", "Fast ROI in Under 30 Days": "عائد استثماري سريع في أقل من 30 يوماً", "Most customers recover their investment within the first month of use.": "يسترد معظم عملائنا تكلفة استثمارهم في النظام خلال الشهر الأول من استخدامه.", "Scale Effortlessly": "توسع في أعمالك بكل سلاسة", "From one shop to multiple branches and companies — InventoryPro grows with you.": "من متجر واحد إلى فروع وشركات متعددة — إنفنتوري برو يواكب نموك خطوة بخطوة.", "Ready to Transform Your Inventory Management?": "هل أنت مستعد لتطوير إدارة مخزونك بالكامل؟", "Join hundreds of businesses that trust InventoryPro to manage their stock and operations": "انضم إلى مئات الشركات الرائدة التي تعتمد على إنفنتوري برو لإدارة مخزونها وعملياتها", "Start Free Trial": "ابدأ تجربتك المجانية الآن", "Expense Management - AK International": "إدارة المصروفات والنفقات - إيه كيه إنترناشيونال", "Expense Management": "إدارة المصروفات", "Financial Operations Suite": "حزمة العمليات المالية المتقدمة", "Expense": "إدارة", "Capture • Approve • Reimburse • Analyse •": "توثيق • اعتماد • سداد • تحليل • ", "One Clear Expense Flow": "مسار عمل واضح ومحكم للنفقات", "Give every employee a simple way to submit expenses while finance keeps policy, approvals, budgets and reimbursements under precise control — from receipt to ledger.": "امنح موظفيك وسيلة سهلة لرفع طلبات المصروفات، بينما يحكم القسم المالي السيطرة على السياسات والموافقات والميزانيات والدفعات — من الإيصال الورقي حتى دفتر الأستاذ العام.", "-Step": "خطوات", "Submission": "رفع الطلب", "Policy Control": "الالتزام بالسياسات المالية", "One System for Every Receipt, Claim, and Payout": "نظام موحد وشامل لكل إيصال ومطالبة وصرف", "Real screens from the platform — from quick expense capture to approvals, reimbursements, and category reports.": "شاشات حقيقية من داخل المنصة — من تسجيل المصروفات السريع إلى الموافقات وصرف المستحقات وتقارير التصنيفات.", "Unified Expense Dashboard": "لوحة تحكم موحدة للنفقات والمصروفات", "See total spend, pending approvals, claims in reimbursement, and budget usage in one view. A category breakdown and recent activity feed show where company money goes every day.": "اطلع على إجمالي الإنفاق والمطالبات المعلقة ومبالغ الصرف ونسب استهلاك الميزانية بلمحة واحدة، مع رسم بياني للتصنيفات ومتابعة يومية دقيقة لحركة الأموال.", "Receipt Capture in Seconds": "توثيق الإيصالات في ثوانٍ معدودة", "Employees take a photo, choose the currency, category, project, and payment method, and submit. The system flags missing fields, applies limits, and routes the claim automatically.": "يلتقط الموظف صورة الإيصال ويحدد العملة والتصنيف والمشروع وطريقة الدفع ويرسل الطلب، ليقوم النظام بالتحقق التلقائي وتطبيق السياسات وتوجيه المطالبة للاعتماد.", "Smart Multi-Level Approvals": "موافقات ذكية متعددة المستويات", "Line managers review receipts, check policy violations, and approve or reject with comments. Approved claims move directly to finance for payout without lost paperwork.": "يراجع المديرون الإيصالات ويدققون مطابقتها للسياسات ويعتمدونها مع كتابة الملاحظات، لتنتقل المطالبات المعتمدة إلى الإدارة المالية للصرف دون أي فقد للمستندات.", "Reimbursements & Finance Settlement": "صرف المستحقات والتسويات المالية", "Batch approved claims, select payout accounts, and mark reimbursements as paid. Export bank files or sync payments straight into accounting ledgers.": "تجميع المطالبات المعتمدة واختيار حسابات الصرف وإتمام التسويات بنقرة واحدة، مع تصدير ملفات التحويلات البنكية أو مزامنة الدفعات مع دفاتر المحاسبة فورياً.", "Every Expense,": "كل مصروف ونفقة،", "Accounted For": "مسجلة وموثقة بدقة متناهية", "Everything you need to eliminate paper receipts, speed up approvals, and control spend before it happens.": "كل ما يلزمك للتخلص من الإيصالات الورقية، وتسريع الاعتمادات، وإحكام السيطرة على الإنفاق قبل حدوثه.", "Receipt Capture": "توثيق الإيصالات الرقمي", "Capture receipts via mobile camera, upload PDFs, or forward digital invoices into a clean inbox.": "تصوير الإيصالات بكاميرا الجوال، أو رفع ملفات PDF، أو إعادة توجيه الفواتير الإلكترونية إلى صندوق وارد منظم.", "Policy & Budget Controls": "ضوابط السياسات والميزانيات", "Set per-diem limits, project budgets, and required receipts so out-of-policy claims never slip through.": "تحديد بدلات السفر وميزانيات المشاريع والإيصالات الإلزامية لمنع أي مصروف مخالف للسياسات المالية.", "Smart Approvals": "مسارات موافقة ذكية", "Route claims by department, amount, or cost centre with automated reminders to keep approvals moving.": "توجيه المطالبات تلقائياً حسب القسم أو المبلغ أو مركز التكلفة مع تنبيهات دورية للمديرين.", "Employee Reimbursements": "صرف مستحقات الموظفين", "Pay back approved claims quickly and transparently with clear status updates for every team member.": "صرف النفقات المعتمدة للموظفين بسرعة وشفافية مع تحديثات فورية لحالة كل طلب.", "Corporate Spend": "مراقبة إنفاق وبطاقات الشركات", "Track company cards, advances, and petty cash balances alongside employee claims in one place.": "متابعة بطاقات الشركة والسلف والعهد النثرية جنباً إلى جنب مع مطالبات الموظفين في منصة واحدة.", "Expense Intelligence": "تحليلات وتقارير النفقات الذكية", "Analyse spend by vendor, category, team, or project to find savings and negotiate better rates.": "تحليل النفقات حسب المورد أو التصنيف أو الفريق أو المشروع لاكتشاف فرص التوفير والتفاوض الأفضل.", "Why Expense Management": "لماذا نظام إدارة المصروفات؟", "Control Spend Without": "تحكم في النفقات والميزانيات", "Slowing Teams Down": "دون إبطاء حركة فرق العمل", "Built for fast-moving businesses that need clean records, happy employees, and zero receipt chaos.": "صُمم للشركات سريعة التطور التي تتطلب سجلات مالية دقيقة، وموظفين راضين، وتخلصاً تاماً من فوضى الفواتير الورقية.", "No More Lost Receipts": "وداعاً لفقدان وضياع الإيصالات", "Digital records stay attached to each claim permanently, ready for tax audits and internal reviews.": "تبقى الإيصالات الرقمية مرتبطة بكل مطالبة للأبد، جاهزة لأي تدقيق ضريبي أو مراجعة داخلية.", "Faster Payouts, Happier Teams": "صرف مستحقات أسرع ورضا أعلى للفرق", "Shorten reimbursement cycles from weeks to days with clear visibility at every approval step.": "تقليص دورة صرف المستحقات من أسابيع إلى أيام معدودة مع شفافية تامة في كل مرحلة اعتماد.", "Strict Policy Enforcement": "تطبيق صارم للسياسات المالية", "Catch duplicate claims, weekend expenses, and limit breaches automatically before anyone signs off.": "كشف المطالبات المكررة ومصروفات العطلات وتجاوز الحدود المعتمدة آلياً قبل توقيع المسؤولين.", "Accounting-Ready Output": "مخرجات محاسبية جاهزة للترحيل", "Export structured journal entries or integrate directly with your general ledger and ERP.": "تصدير قيود يومية منظمة أو ربط مباشر مع دفتر الأستاذ العام وأنظمة تخطيط الموارد ERP.", "Fast Implementation for Your": "تطبيق وتشغيل سريع", "Finance Team": "لفريقك المالي والمحاسبي", "We configure your expense policies, approval chains, and chart of accounts in days.": "نقوم بتهيئة سياسات نفقاتك وسلاسل الموافقات ودليل حساباتك في غضون أيام معدودة.", "Policy & Category Setup": "تهيئة السياسات وتصنيفات المصروفات", "We define your expense types, per-diem rules, mileage rates, and tax treatment.": "نحدد تصنيفات نفقاتك، وقواعد البدلات، ومعدلات الكيلومترات، والمعاملات الضريبية بدقة.", "Approval Workflow Mapping": "رسم وتحديد مسارات الموافقات", "We set up department heads, project managers, and finance teams in clear routing ladders.": "نحدد صلاحيات مديري الأقسام ومديري المشاريع والإدارة المالية في مسارات اعتماد واضحة.", "Team & Mobile Onboarding": "تدريب الفرق واستخدام تطبيقات الجوال", "We train employees and managers with short guides so claim submission is second nature.": "ندرب الموظفين والمديرين بأدلة إرشادية ميسرة لتصبح عملية رفع المطالبات في غاية السهولة.", "Your team logs live expenses with clean policy enforcement, backed by our dedicated support.": "يبدأ فريقك بتسجيل النفقات مباشرة مع تطبيق ذكي للسياسات بدعم فني مخصص من خبرائنا.", "Take Control of Your Company": "أحكم السيطرة الآن على", "Expenses": "نفقات ومصروفات شركتك", "Schedule a demo to see how our expense platform speeds up reimbursements, eliminates receipt chaos, and tightens spend control.": "احجز عرضاً توضيحياً لتكتشف كيف يسرع نظامنا صرف المستحقات وينهي فوضى الإيصالات ويحكم الرقابة على الإنفاق.", "Expense Management — capture receipts, automate approvals, control budgets, and streamline reimbursements in one platform.": "إدارة المصروفات — توثيق الإيصالات، أتمتة الموافقات، ضبط الميزانيات، وتسريع صرف المستحقات في منصة واحدة.", "Global Import Export Management - AK International": "إدارة الاستيراد والتصدير العالمية - إيه كيه إنترناشيونال", "International Trade ERP": "نظام تخطيط الموارد للتجارة الدولية (ERP)", "Global Import & Export": "الاستيراد والتصدير", "Imports • Exports • Customs • Multi-Currency •": "استيراد • تصدير • جمارك • تعدد العملات • ", "One Global Control Tower": "برج مراقبة مركزي موحد للتجارة العالمية", "A sophisticated international trade platform that connects every import, export, shipment, currency exposure and landed-cost decision — from overseas order to warehouse receipt — across regions, entities and compliance workflows.": "منصة تجارة دولية متطورة تربط كل عملية استيراد وتصدير وشحن وتحوط للعملات وحساب تكلفة إجمالية واصلة (Landed Cost) — من طلبية المورد بالخارج حتى استلام المستودع — عبر مختلف الدول والكيانات ومسارات الامتثال.", "Currencies": "العملات الدولية", "Trade Controls": "ضوابط التجارة والجمارك", "Audit Ready": "جاهزية كاملة للتدقيق الجمركي", "Trade Command Centre": "مركز القيادة والتحكم للتجارة الدولية", "Real screens from the platform — trade orders, logistics milestones, shipping status and customs clearance in one view.": "شاشات حقيقية من داخل المنصة — أوامر التجارة، المحطات اللوجستية، حالات الشحن، والتخليص الجمركي في مشهد واحد.", "Central Global Trade Operations": "عمليات مركزية للتجارة العالمية", "Live oversight across shipments, orders, custom clearances, and landed costs. One entry point gives executives and trade operators instant status, risk alerts, and operational momentum.": "إشراف حي ومباشر على الشحنات والطلبيات والإفراج الجمركي والتكاليف الإجمالية؛ شاشة واحدة تمنح الإدارة التنفيذية ومشغلي التجارة رؤية فورية وتنبيهات بالمخاطر.", "Cross-Border Purchase Order Control": "إدارة أوامر الشراء العابرة للحدود", "Track POs with foreign suppliers down to HS code, incoterm, container requirement, and currency rate locks — linking trade contracts to actual delivery schedules.": "تتبع أوامر الشراء مع الموردين الأجانب حتى مستوى بنود التعريفة الجمركية (HS Code) وشروط الشحن (Incoterms) والعملات، لربط العقود بجداول التوريد الفعلية.", "Shipment & Logistics Tracking": "تتبع مسار الشحنات والخدمات اللوجستية", "Log vessel, container numbers, booking details, transit milestones, and port arrivals. Keep clearing agents, freight forwarders, and receiving warehouses aligned.": "تسجيل بيانات السفن وأرقام الحاويات وحجوزات الشحن والمحطات ومواعيد وصول الموانئ، لمزامنة المخلصين الجمركيين ووكلاء الشحن ومستودعات الاستلام بدقة.", "Customs Clearance & Landed Cost Breakdown": "التخليص الجمركي واحتساب التكلفة الإجمالية الواصلة", "Accurately capture duties, port charges, insurance, transport, and agent fees. Allocate landed cost across line items to know your exact gross margin before selling.": "حساب الرسوم الجمركية ومصاريف الموانئ والتأمين والنقل وأتعاب التخليص بدقة، وتوزيع التكلفة الواصلة على الأصناف لمعرفة هامش ربحك الحقيقي قبل البيع.", "Built for High-Stakes": "مصمم خصيصاً للعمليات الكبرى", "Cross-Border Trade": "والتجارة العابرة للحدود", "Purpose-built workflows engineered around shipping compliance, document control, and foreign currency movement.": "مسارات عمل مخصصة صُممت حول معايير الامتثال الملاحي، وضبط المستندات الرسمية، وإدارة التدفقات بالعملات الأجنبية.", "Incoterm-Driven Costing": "احتساب التكاليف وفق شروط التجارة (Incoterms)", "Handle FOB, CIF, EXW, DDP and more with precision — automatically dividing buyer vs seller liabilities and insurance burdens.": "إدارة عقود FOB وCIF وEXW وDDP بدقة تامة — مع تقسيم تلقائي لالتزامات المشتري والبائع ومسؤوليات التأمين والشحن.", "Harmonized System (HS) Code Mapping": "فهرسة وتصنيف بنود التعريفة الجمركية (HS Codes)", "Tag items with trade tariff codes for automated duty calculation, export-control checks, and customs filing readiness.": "ربط الأصناف ببنود التعريفة الجمركية لاحتساب الرسوم آلياً وفحص ضوابط التصدير وتجهيز مستندات الإفراج الجمركي.", "Multi-Currency & FX Hedging": "تعدد العملات والتحوط المالي للعملات الأجنبية", "Record commitments in original trade currencies while calculating realized gain/loss and balance sheet valuations automatically.": "تسجيل الالتزامات بعملات التداول الأصلية مع احتساب فروق أسعار الصرف والأرباح أو الخسائر المحققة وتقييم الميزانية تلقائياً.", "Container & Packing Management": "إدارة الحاويات والشحن والتغليف", "Track FCL, LCL, pallet weights, cubic volume, and container seal numbers to optimize freight space and reduce split-shipment risks.": "متابعة الحاويات الكاملة (FCL) والمشتركة (LCL) وأوزان الطبالي والأحجام وأرقام أختام الحاويات لتقليل تكاليف الشحن.", "Letter of Credit (LC) & Trade Finance": "الاعتمادات المستندية (LC) والتمويل التجاري", "Track LCs, bank guarantees, bill collection (DP/DA), and milestone payment tranches to prevent documentation discrepancies.": "متابعة خطابات الاعتماد المصرفي والضمانات البنكية ومستندات التحصيل وأقساط السداد لتفادي أي تعارض في المستندات.", "End-to-End Compliance Audit": "تدقيق الامتثال والوثائق الشامل", "Archive certificates of origin, bills of lading, packing lists, inspection reports, and sanitary clearances against each shipment.": "أرشفة شهادات المنشأ وبوالص الشحن (B/L) وقوائم التعبئة وتقارير الفحص والشهادات الصحية رقمياً لكل شحنة.", "Why AK International for": "لماذا إيه كيه إنترناشيونال في", "Global Trade": "قطاع التجارة والاستيراد والتصدير؟", "Most generic ERP systems fail when dealing with customs declarations, demurrage, and landed cost recalculations. We built this for trade operators.": "تفشل غالبية أنظمة ERP التقليدية في التعامل مع الإقرارات الجمركية وغرامات التأخير وحسابات التكلفة الواصلة؛ لذلك طورنا هذا النظام لخبراء التجارة.", "Protect Profit Margins": "حماية هوامش الربح الحقيقية", "Never under-price finished goods. Know the true cost of every imported item with every fee factored in before it enters inventory.": "لا تسعر بضائعك بأقل من تكلفتها أبداً؛ اعرف التكلفة الحقيقية الدقيقة لكل منتج مستورد بعد احتساب كافة الرسوم قبل دخوله المستودع.", "Eliminate Port Demurrage": "منع غرامات التأخير في الموانئ (Demurrage)", "Automated milestone alerts prompt agents and clearing teams before free-time expires at destination ports.": "تنبيهات استباقية بالتواريخ تذكّر الوكلاء وفرق التخليص الجمركي قبل انتهاء الفترات المجانية المسموحة في الموانئ.", "Real-Time FX Exposure": "رؤية لحظية لمخاطر تقلبات العملة", "Track outstanding payments across foreign currencies and evaluate exposure before placing new overseas orders.": "مراقبة الالتزامات المالية القائمة بالعملات الأجنبية وقياس حجم المخاطر قبل توقيع طلبيات خارجية جديدة.", "Audit-Proof Trade Files": "ملفات جمركية وتجارية جاهزة للتدقيق", "Every invoice, clearance document, and transport receipt is tied to its master shipment file for frictionless inspections.": "كل فاتورة ومستند إفراج جمركي وإيصال نقل مرتبط بملف الشحنة الرئيسي لتسهيل أي فحص وتفتيش رسمي.", "Rapid Deployment for": "تطبيق وتهيئة سريعة", "Trading Houses": "للشركات والبيوت التجارية", "We implement your trade workflows, import custom duties tables, and configure your supplier networks cleanly.": "نطبق مسارات عملك التجارية ونرفع جداول الرسوم الجمركية ونهيئ شبكات مورديك بسلاسة واحترافية.", "Trade Process Blueprint": "رسم وتخطيط المسار التجاري", "We map your trade lanes, Incoterms, clearing partners, and shipping workflows.": "نرسم خطوطك الملاحية وموانئ الشحن وشروط Incoterms وشركاء التخليص الجمركي.", "Tariff & HS Data Import": "استيراد بيانات التعريفة الجمركية (HS Codes)", "We upload your product trade catalog with tariff codes, standard duties, and customs classifications.": "نرفع كتالوج منتجاتك مع أكواد التعريفة الجمركية ونسب الرسوم الرسمية والتصنيفات الجمركية.", "Forwarder & Bank Workflows": "مسارات وكلاء الشحن والبنوك", "We set up tracking hooks for forwarders, insurance partners, and trade finance pipelines.": "نهيئ قنوات المتابعة لوكلاء الشحن وشركات التأمين ومسارات التمويل والاعتمادات البنكية.", "Trading Desk Go-Live": "بدء التشغيل الفعلي لغرفة التجارة", "Your logistics and procurement teams go live with live tracking, backed by AK International specialists.": "تبدأ فرق المشتريات واللوجستيات بإدارة الشحنات والعمليات الحية بدعم مباشر من خبراء إيه كيه إنترناشيونال.", "Global Import & Export Management": "إدارة الاستيراد والتصدير العالمية", "Schedule a strategy session to see how our trade platform orchestrates customs, logistics, landed costs and FX risks.": "احجز جلسة استشارية لتكتشف كيف تنظم منصتنا الجمارك واللوجستيات وحسابات التكلفة ومخاطر العملات.", "Global Import & Export Management — end-to-end international trade ERP, customs tracking, and landed-cost visibility.": "إدارة الاستيراد والتصدير العالمية — نظام ERP متكامل للتجارة الدولية، تتبع الجمارك، واحتساب التكلفة الواصلة بدقة.", "Odoo Solutions | Custom Apps & Addons - AK International": "حلول أودو | تطبيقات وإضافات مخصصة - إيه كيه إنترناشيونال", "What We Offer Section": "قسم ما نقدمه في أودو", "Apps / Addons Section": "قسم التطبيقات والإضافات الجاهزة", "Odoo ERP Specialists": "خبراء ومتخصصو نظام أودو (Odoo ERP)", "Odoo": "حلول", "Custom Solutions": "أودو المخصصة", "Built for You": "المصممة خصيصاً لأعمالك", "Custom Apps • Addons • Integrations •": "تطبيقات مخصصة • إضافات برمجية • ربط وتكامل • ", "Full Support": "دعم فني كامل ومستمر", "Tailor-made Odoo modules and addons that perfectly fit your business workflows — with full support for": "وحدات وتطبيقات وإضافات أودو مصممة خصيصاً لتتطابق تماماً مع مسارات عملك — مع دعم كامل وشامل لإصدارات", "Odoo versions 16, 17, 18 & 19": "أودو بإصداراتها 16 و17 و18 و19", "Odoo 16": "أودو 16", "Odoo 17": "أودو 17", "Odoo 18": "أودو 18", "Odoo 19": "أودو 19", "Browse Addons": "تصفح الإضافات والتطبيقات", "Request Custom App": "اطلب تطبيقاً مخصصاً", "Versions": "إصدارات أودو المدعومة", "Addons": "إضافات وتطبيقات جاهزة", "What We Offer": "ماذا نقدم لك في أودو", "Our Odoo": "خبراتنا المتخصصة في", "Expertise": "نظام أودو (Odoo)", "From a single custom module to a complete Odoo ERP rollout — we cover the full spectrum.": "من تطوير وحدة برمجية مخصصة واحدة حتى تطبيق نظام Odoo ERP المؤسسي الشامل — نغطي كافة المتطلبات.", "Custom Module Development": "تطوير وحدات وتطبيقات مخصصة من الصفر", "We build purpose-built Odoo modules from scratch — perfectly aligned with your unique business logic, reports, and automation needs.": "نطور وحدات برمجية مخصصة بالكامل في أودو من الصفر — تتوافق بدقة متناهية مع منطق أعمالك الفريد وتقاريرك واحتياجاتك المؤتمتة.", "Addon Customization": "تخصيص وتعديل إضافات أودو", "Extend or modify existing Odoo apps to match your workflows. We customize standard features without breaking upgradability.": "توسيع وتعديل تطبيقات أودو الحالية لتلائم أسلوب عملك، مع تخصيص الميزات القياسية دون التأثير على إمكانية الترقية المستقبلية.", "Version Migration": "الترقية والترحيل بين إصدارات أودو", "Seamlessly migrate your Odoo instance and custom modules from older versions to Odoo 16, 17, 18, or 19 with full data integrity.": "ترحيل وترقية نسختك من أودو والوحدات المخصصة بسلاسة من الإصدارات القديمة إلى أودو 16 أو 17 أو 18 أو 19 مع الحفاظ التام على سلامة البيانات.", "Third-Party Integrations": "الربط والتكامل مع الأنظمة الخارجية", "Connect Odoo with payment gateways, shipping APIs, e-commerce platforms, ERPs, and any external system via REST or XML-RPC.": "ربط أودو ببوابات الدفع الإلكتروني، وواجهات شركات الشحن، ومنصات المتاجر، والأنظمة الخارجية عبر بروتوكولات REST أو XML-RPC.", "Dedicated post-deployment support, bug fixes, performance optimization, and user training to keep your Odoo running at peak.": "دعم فني مخصص بعد الإطلاق، ومعالجة فورية للمشكلات، وتحسين كفاءة وسرعة النظام، وتدريب الموظفين ليعمل نظام أودو بأعلى أداء.", "Odoo Deployment": "تنصيب وتشغيل واستضافة أودو", "End-to-end Odoo setup on your server or cloud — configuration, module installation, user roles, and production-ready deployment.": "إعداد شامل لنظام أودو على خوادمك الخاصة أو السحابة — الضبط وتثبيت الوحدات والصلاحيات والتشغيل الإنتاجي الفعلي.", "Our Addons": "تطبيقاتنا وإضافاتنا المطورة", "Apps & Addons We": "تطبيقات وإضافات برمجية", "Built": "طورناها بأعلى كفاءة", "Ready-to-install Odoo modules crafted by our team — each solving a real-world business problem.": "وحدات وإضافات أودو جاهزة للتثبيت الفوري طورها فريقنا المتخصص — كل منها يحل مشكلة تشغيلية واقعية في قطاع الأعمال.", "App 1: Sales to Purchase Cycle": "التطبيق 1: ربط دورة المبيعات بالمشتريات", "App 2: Attendance Overview": "التطبيق 2: لوحة المتابعة الشاملة للحضور", "App 3: AKI Audio Player": "التطبيق 3: مشغل الصوتيات AKI المدمج", "Sales → Purchase Cycle": "دورة المبيعات ← المشتريات المباشرة", "v16": "v16", "v17": "v17", "v18": "v18", "v19": "v19", "A smart bridge module that connects your Sales and Purchasing flows to handle out-of-stock items without missing a beat. When a customer order can't be fulfilled from current stock, this addon lets you instantly generate a Purchase Quotation (PQ) directly from the Sales Order — keeping both teams in sync and the workflow moving.": "وحدة ربط ذكية تجمع بين مسارات المبيعات والمشتريات لمعالجة الأصناف غير المتوفرة فورياً؛ عندما يتعذر تلبية طلب العميل من المخزون الحالي، تمكنك الإضافة من إنشاء طلب تسعير مشتريات (PQ) مباشرة من أمر البيع — للحفاظ على تزامن الفريقين وسرعة الإنجاز.", "One-click": "بنقرة واحدة", "button on Quotation / Sales Order to auto-generate a Purchase Quotation for out-of-stock products.": "زر ذكي في عرض السعر أو أمر البيع لتوليد طلب تسعير مشتريات تلقائي للأصناف غير المتوفرة.", "Create PQ": "إنشاء طلب تسعير مشتريات (PQ)", "Automatically maps sales order lines to purchase order lines — product, quantity, and vendor in one step.": "نقل وتعيين بنود أمر البيع تلقائياً إلى بنود أمر الشراء — المنتج والكمية والمورد في خطوة واحدة.", "Displays": "عرض فوري", "directly in the order line for instant stock visibility while quoting.": "مباشرة داخل سطر بنود الطلب لرؤية رصيد المخزون اللحظي أثناء تقديم عرض السعر للعميل.", "On-Hand Qty": "الكمية المتوفرة حالياً (On-Hand Qty)", "Eliminates manual data re-entry between Sales and Purchase teams — faster response, fewer errors.": "ينهي تكرار الإدخال اليدوي للبيانات بين فريقي المبيعات والمشتريات — استجابة أسرع وخالية من الأخطاء.", "Works seamlessly across Odoo 16 to 19 with no core overrides.": "يعمل بانسيابية تامة عبر إصدارات أودو من 16 إلى 19 دون أي تعديل على كود أودو الأساسي.", "Sales · Purchase": "المبيعات · المشتريات", "Get This Addon": "احصل على هذه الإضافة", "HR": "الموارد البشرية", "Attendance Overview": "لوحة متابعة الحضور والانصراف", "A dedicated": "لوحة تحكم تفاعلية", "dashboard added right inside Odoo Attendances. At a glance, managers see the real-time attendance status of every active employee for any selected date — no more digging through raw check-in records. Color-coded indicators make the entire workforce status instantly readable.": "لوحة تحكم مخصصة مدمجة داخل وحدة حضور وانصراف أودو؛ يشاهد المديرون بلمحة واحدة حالة الحضور المباشرة لكل موظف نشط في أي تاريخ محدد دون الحاجة للبحث في السجلات الخام، مع مؤشرات لونية تجعل الرؤية فورية وواضحة.", "Daily Overview": "نظرة يومية شاملة", "— employee checked in before 14:00; shows exact check-in time (From HH:MM:SS).": "— سجل الموظف حضوره قبل الساعة 14:00؛ يوضح وقت تسجيل الحضور بدقة (ساعة:دقيقة:ثانية).", "Present": "حاضر (Present)", "— no qualifying check-in and current time is past 09:00; highlighted in red for immediate action.": "— لم يسجل الحضور وتجاوز الوقت الساعة 09:00 صباحاً؛ يظهر بلون أحمر بارز للتنبيه الفوري.", "Absent": "غائب (Absent)", "— employee has an approved time-off covering the selected day; shown in blue.": "— الموظف في إجازة رسمية معتمدة تغطي اليوم المحدد؛ يظهر باللون الأزرق.", "On Leave": "في إجازة (On Leave)", "— automatically marks Fridays (or your configured off-day) as Week Off with no false absences.": "— يسجل أيام الجمعة (أو أيام العطل المعتمدة لديك) كعطلة أسبوعية تلقائياً دون احتساب غياب خاطئ.", "Week Off": "عطلة أسبوعية (Week Off)", "Navigate day-by-day with prev/next arrows or jump to Today — all employees, all statuses, one view.": "التنقل يوماً بيوم بأسهم السابق والتالي أو الانتقال الفوري لليوم الحالي — كافة الموظفين وجميع الحالات في مشهد واحد.", "HR · Attendances": "الموارد البشرية · الحضور والانصراف", "Media": "الوسائط المتعددة", "AKI Audio Player": "مشغل الصوتيات AKI المدمج", "A full-featured music player built right into Odoo. Scan your local audio folder, play tracks offline, enjoy a real-time neon visualizer, and keep music running while you work with a floating mini player.": "مشغل صوتيات كامل الميزات مدمج في أودو؛ افحص مجلدك الصوتي وشغّل المقاطع دون اتصال بالإنترنت مع مؤثرات بصرية حية ومشغل عائم مصغر أثناء أداء مهامك.", "from your local library with no uploads or cloud dependency.": "من مكتبتك الصوتية المحلية دون الحاجة لأي رفع أو استهلاك للبيانات السحابية.", "100% offline playback": "تشغيل بدون إنترنت 100%", "reads folders and subfolders to build your track list instantly.": "يفحص المجلدات والمجلدات الفرعية لإنشاء قائمة المقاطع والتشغيل فورياً.", "Local library scanner": "فاحص المكتبة المحلية السريع", "with full playback controls, seek, shuffle, repeat, mute, and volume.": "مع أدوات تحكم كاملة: التقديم والتأخير، التشغيل العشوائي، التكرار، والتحكم بالصوت.", "Real-time neon visualizer": "مؤثرات نيون بصرية حية ومتفاعلة", "stays available while navigating across Odoo screens.": "يظل متاحاً ويعمل بسلاسة أثناء تنقلك بين شاشات ووحدات أودو المختلفة.", "Floating mini player": "مشغل مصغر عائم ومتحرك", "restores the current track, volume, and playback state after reload.": "يستعيد المقطع الحالي ومستوى الصوت وحالة التشغيل تلقائياً بعد تحديث الصفحة.", "Session memory": "ذاكرة ذكية لحفظ جلسة التشغيل", "Entertainment · Audio": "الترفيه · الصوتيات", "View Addon": "معاينة الإضافة والطلب", "From your idea to a live Odoo module — clear, fast, and collaborative.": "من فكرتك حتى تطبيق وحدة أودو الحية — بمسار عمل واضح وسريع وتعاوني.", "Discover": "الاستكشاف والتحليل", "We understand your workflow challenges and define the exact scope of your custom Odoo module.": "نتعرف بعمق على تحديات مسارات عملك ونحدد النطاق والمواصفات الدقيقة لوحدتك البرمجية المخصصة.", "We map the data model, views, and automation logic — then share a clear spec for your review.": "نصمم نماذج البيانات والواجهات ومنطق الأتمتة، ونشاركك وثيقة مواصفات واضحة للمراجعة والاعتماد.", "Develop & Test": "البرمجة والاختبار الدقيق", "Our Odoo developers build the module, run unit and integration tests, and deliver a staging demo.": "يطور مبرمجو أودو لدينا الوحدة البرمجية، ويجرون اختبارات التكامل والوحدات، ويقدمون عرضاً تجريبياً حياً.", "Deploy & Support": "التنصيب والدعم المستمر", "We deploy to your production instance and provide ongoing support, updates, and training.": "ننشر الوحدة في نسختك الإنتاجية الحية ونوفر دعماً فنياً وتحديثات وتدريباً مستمراً.", "Supported": "مدعومة بالكامل", "100%": "100%", "Need a": "هل تحتاج إلى", "Custom Odoo Module": "تطبيق أو إضافة أودو مخصصة؟", "Tell us about your workflow challenge. We'll design and build the exact Odoo solution you need — on any version from 16 to 19.": "أخبرنا عن التحدي الذي يواجه مسار عملك؛ سنصمم ونطور لك حل أودو الدقيق الذي تحتاجه — على أي إصدار من 16 إلى 19.", "Odoo custom apps, addons & ERP solutions — built for businesses that want more from their Odoo platform.": "تطبيقات وإضافات أودو المخصصة وحلول ERP — صُممت للشركات والمؤسسات التي تطمح لتحقيق أقصى استفادة من منصة أودو.", "Odoo Services": "خدمات واستشارات أودو", "Custom Development": "التطوير البرمجي المخصص", "Record every stock in, stock out, transfer and adjustment as it happens. Period totals for each movement type sit at the top, and the movement timeline shows the product, source or destination, quantity and whether each move is completed or still in progress.": "توثيق كل حركة وارد ومنصرف وتحويل وتعديل فور حدوثها؛ إجماليات لكل حركة بالأعلى وسجل زمني يوضح المنتج والمصدر أو الوجهة والكمية وما إذا كانت الحركة مكتملة أو قيد التنفيذ.", "Stock In": "وارد المخزون", "Stock Out": "منصرف المخزون", "Audit Trail": "سجل التدقيق والتتبع", "Purchase & Receiving Control": "مراقبة المشتريات والاستلام", "Manage purchase orders from creation to receipt. Track ordered, received and pending quantities for each PO, and record goods received notes that update stock automatically, so supplier deliveries and warehouse counts always match.": "إدارة أوامر الشراء من الإنشاء حتى الاستلام؛ تتبع الكميات المطلوبة والمستلمة والمعلقة لكل أمر شراء، وتوثيق أذون استلام البضائع التي تحدث المخزون آلياً لمطابقة توريدات الموردين مع الواقع.", "Receiving": "الاستلام والتحقق", "Stock Update": "تحديث رصيد المخزون", "Never Miss Low Stock": "لا تفوت تنبيهات انخفاض المخزون أبداً", "Get warned before items run out. Critical, low and watch items are listed with current stock against the reorder level, safety stock status shows what is below or near its limit, and a recommended purchase list lets you reorder with one click.": "احصل على تحذيرات مسبقة قبل نفاد أي صنف؛ قائمة بالأصناف الحرجة والمنخفضة توضح الرصيد مقابل حد إعادة الطلب، مع بيان حالة مخزون الأمان وقائمة شراء موصى بها لإعادة الطلب بنقرة واحدة.", "Instant Alerts": "تنبيهات فورية", "Reorder": "إعادة الطلب", "Thresholds": "حدود الأمان", "Action": "إجراء فوري", "Inventory Reports & Exports": "تقارير المخزون والتصدير", "Turn stock data into decisions. Review stock value over time, stock by category, movement trends and a low-stock summary with status for each product, then export the full report to Excel or PDF for planning and purchasing.": "حوّل بيانات المخزون إلى قرارات استراتيجية؛ راجع قيمة المخزون عبر الوقت والتوزيع حسب التصنيف وحركة البضائع وملخص النقص، ثم صدر التقرير بالكامل إلى Excel أو PDF للتخطيط والشراء.", "Stock Value": "قيمة المخزون الإجمالية", "Category Mix": "مزيج التصنيفات", "Export Excel": "تصدير إلى Excel", "Export PDF": "تصدير إلى PDF", "Full Visibility,": "رؤية شاملة ومباشرة،", "Zero Guesswork": "دون أي تخمين أو عشوائية", "Know exactly what you have, where it is, and when to reorder — at all times.": "اعرف بدقة ما تملكه، وموقع تخزينه، وموعد إعادة طلبه — في كل وقت وحين.", "Real-Time Stock Tracking": "تتبع رصيد المخزون لحظياً", "See accurate stock levels update instantly across every warehouse and store.": "اطلع على مستويات المخزون الدقيقة والمحدثة فورياً في كل مستودع ومتجر.", "Speed up receiving, picking, and stocktaking with mobile barcode scanning.": "سرّع عمليات الاستلام والصرف والجرد الميداني باستخدام ماسح الباركود المحمول.", "Low Stock Alerts": "تنبيهات انخفاض الكميات", "Automatic notifications when items fall below your defined reorder thresholds.": "إشعارات آلية فور هبوط رصيد الأصناف تحت حدود إعادة الطلب المقررة.", "Manage stock across multiple warehouses, stores, or project sites from one view.": "أدر المخزون عبر عدة مستودعات أو معارض أو مواقع مشاريع من شاشة واحدة.", "Generate purchase orders automatically when stock hits reorder points.": "توليد أوامر شراء للموردين تلقائياً بمجرد وصول المخزون لنقطة إعادة الطلب.", "Advanced Reporting": "تقارير وإحصائيات متطورة", "Analyze stock movement, turnover, and valuation with detailed analytics.": "حلل حركة المخزون ومعدل الدوران والتقييم المالي عبر تحليلات تفصيلية.", "Never Run Out,": "لا تدع بضائعك تنفد،", "Never Overstock": "ولا تراكم مخزوناً راكداً", "Built for retailers, distributors, and manufacturers who need precise stock control.": "صُمم لتجار التجزئة والموزعين والمصانع التي تحتاج إلى تحكم جردي فائق الدقة.", "Live Dashboards": "لوحات معلومات حية ومباشرة", "Monitor stock health across your entire operation from a single screen.": "راقب سلامة وحركة المخزون لكامل عملياتك من شاشة واحدة مركزية.", "Stock Transfers": "التحويلات المخزنية", "Move inventory between locations with full tracking and audit trails.": "انقل البضائع بين الفروع والمستودعات مع تتبع كامل وسجل تدقيق موثق.", "Track items by batch or serial number for traceability and compliance.": "تتبع الأصناف برقم التشغيلة أو الرقم التسلسلي لإمكانية المتابعة والامتثال.", "Sync inventory data directly with Integrated Business Management.": "مزامنة بيانات المخزون مباشرة مع نظام إدارة الأعمال المتكاملة (IBM).", "From Stockroom to": "من المستودع الفعلي إلى", "System": "النظام الرقمي المتكامل", "We help you digitize your inventory without disrupting operations.": "نساعدك على رقمنة مخزونك بالكامل دون إيقاف أو تعطيل سير العمليات.", "Stock Audit": "الجرد والتدقيق الأولي", "We catalog your current inventory and locations as the starting baseline.": "نفهرس مخزونك الحالي ومواقع تخزينه كنقطة انطلاق وأساس معتمد.", "System Setup": "تهيئة وضبط النظام", "We configure reorder points, locations, and barcode labels for your items.": "نهيئ حدود إعادة الطلب وأماكن التخزين وملصقات الباركود لمنتجاتك.", "Warehouse staff are trained on scanning, receiving, and stock transfers.": "تدريب مسؤولي المستودعات على المسح والاستلام والتحويلات المخزنية بدقة.", "Your inventory goes live with ongoing support from our team.": "يبدأ نظام مخزونك بالعمل المباشر مع دعم فني مستمر من فريقنا.", "Talk to our team about deploying real-time Inventory Management for your business.": "تحدث مع فريقنا اليوم لتطبيق نظام إدارة المخزون الفوري في منشأتك.", "Inventory Management — real-time stock tracking and control across every location.": "إدارة المخزون — تتبع فوري وتحكم دقيق في المخزون عبر كافة المواقع.", "₹750/month": "750 روبية/شهرياً", "Most Selling Product": "المنتج الأكثر مبيعاً وطلباً", "Transform Your Inventory Management": "طوّر إدارة مخزونك ومستودعاتك بالكامل", "InventoryPro is our flagship inventory management solution designed for businesses of all sizes. With powerful features and an intuitive interface, manage your stock efficiently and grow your business with confidence.": "إنفنتوري برو هو حلنا الرائد لإدارة المخزون المصمم للشركات بمختلف أحجامها. بميزات فائقة القوة وواجهة بديهية، أدر مخزونك بكفاءة وطور أعمالك بكل ثقة.", "500+": "500+", "Active Users": "مستخدم نشط", "99.9%": "99.9%", "Full Pro Features": "كامل الميزات الاحترافية المتقدمة", "Access all premium features starting from just ₹750/month": "استمتع بكافة الميزات الاحترافية المتقدمة بأسعار تبدأ من 750 روبية فقط شهرياً", "See InventoryPro in Action": "شاهد إنفنتوري برو في الواقع العملي", "Watch how easy it is to manage your inventory": "شاهد مدى سهولة وسلاسة إدارة مخزونك", "Available on Multiple Platforms": "متوافر على منصات وأجهزة متعددة", "Access your inventory anywhere, on any device": "تحكم في مخزونك من أي مكان، وعبر أي جهاز", "Access from any browser, anywhere. No installation required.": "ادخل من أي متصفح ومن أي مكان، دون الحاجة لتثبيت أي برامج.", "Cross-browser compatible": "متوافق مع مختلف المتصفحات الحديثة", "Real-time updates": "تحديثات ومزامنة فورية", "Cloud-based": "سحابي وآمن بالكامل", "Most Popular": "الأكثر شعبية", "Android Application": "تطبيق أندرويد للهواتف", "Native Android app for on-the-go inventory management.": "تطبيق أندرويد أصلي لإدارة المخزون أثناء التنقل والميدان.", "Offline mode support": "دعم العمل دون اتصال بالإنترنت", "Barcode scanner integration": "دمج ماسح الباركود السريع", "Download App": "تحميل التطبيق", "Desktop Application": "تطبيق الحواسيب المكتبية", "Powerful desktop version for Windows, Mac, and Linux.": "نسخة مكتبية قوية لأنظمة Windows وMac وLinux.", "High-performance": "أداء فائق واستجابة فورية", "Advanced features": "ميزات وإعدادات متقدمة", "Offline capability": "قدرة العمل دون إنترنت", "Download Now": "تحميل الآن", "Beautiful, intuitive, and powerful": "تصميم أنيق وبديهي وفائق القوة", "Dashboard Overview": "نظرة شاملة على لوحة التحكم", "Monitor your entire inventory at a glance": "راقب كامل مخزونك ومبيعاتك بلمحة واحدة", "Product Management": "إدارة كتالوج المنتجات", "Easily manage products and categories": "إدارة المنتجات والأصناف والتصنيفات بكل سهولة", "Stock Transfer": "التحويل المخزني بين الفروع", "Seamlessly transfer stock between locations": "تحويل البضائع بسلاسة بين مختلف الفروع والمستودعات", "Enterprise-Ready Multi-Branch & Multi-Company Management": "إدارة الشركات والفروع المتعددة بمستوى المؤسسات الكبرى", "Scale your operations across unlimited branches and companies": "وسع عملياتك عبر فروع وشركات غير محدودة", "Multi-Company Operations": "إدارة الشركات والكيانات المتعددة", "Manage multiple companies from a single platform. Perfect for holding groups, franchises, and business portfolios.": "أدر عدة شركات من منصة واحدة موحدة؛ مثالي للمجموعات القابضة وسلاسل الامتياز التجاري والمحافظ الاستثمارية.", "Separate data isolation for each company": "عزل واستقلالية كاملة لبيانات كل شركة", "Consolidated reporting across companies": "تقارير مالية وجردية مجمعة للشركات", "Inter-company transactions": "معاملات وتبادلات تجارية بين الشركات", "Centralized user management": "إدارة مركزية موحدة لصلاحيات المستخدمين", "Multi-Branch Management": "إدارة الفروع والمنافذ المتعددة", "Seamlessly manage inventory across unlimited branches, warehouses, and retail locations.": "أدر المخزون بانسيابية تامة عبر عدد غير محدود من الفروع والمستودعات ومنافذ البيع.", "Real-time stock visibility across branches": "رؤية لحظية ومباشرة للمخزون عبر الفروع", "Branch-to-branch stock transfers": "تحويلات مخزنية مباشرة بين الفروع", "Branch-specific pricing and reorder points": "أسعار وحدود إعادة طلب مخصصة لكل فرع", "Location-based user permissions": "صلاحيات وصول محددة بحسب موقع العمل", "Everything you need to run your business smoothly": "كل ما يلزمك لتشغيل وتنمية أعمالك بسلاسة واحترافية", "Track stock levels, movements, and alerts in real time across multiple locations.": "تتبع مستويات المخزون وحركاته وتنبيهاته لحظياً عبر مواقع متعددة.", "Create invoices, track orders, manage customers, and monitor revenue effortlessly.": "إنشاء الفواتير وتتبع الطلبيات وإدارة بيانات العملاء ومراقبة الإيرادات بسهولة.", "Scan and generate barcodes for fast checkout, stock counting, and item tracking.": "مسح وتوليد ملصقات الباركود لتسريع الدفع والجرد وتتبع الأصناف بدقة.", "Manage purchase orders, suppliers, and incoming shipments with automated workflows.": "إدارة أوامر الشراء والموردين والشحنات القادمة عبر مسارات عمل مؤتمتة.", "Comprehensive sales, inventory, and financial reports with export capabilities.": "تقارير مبيعات ومخزون وقوائم مالية شاملة مع ميزات التصدير والطباعة.", "Manage roles, set granular permissions, and track user activities with audit logs.": "إدارة الأدوار وتعيين صلاحيات دقيقة ومراقبة أنشطة الموظفين بسجلات تدقيق.", "Choose the perfect plan for your business": "اختر الخطة المثالية الملائمة لحجم أعمالك", "Contact Us for Pricing": "اتصل بنا لمعرفة الأسعار والعروض", "Get started with our standard features": "ابدأ الآن مع باقة الميزات الأساسية المتكاملة", "All Core Features": "كافة الميزات الأساسية", "Single Branch": "فرع واحد", "Standard Support": "دعم فني قياسي", "Web & Android Access": "الوصول عبر الويب وتطبيق أندرويد", "Contact Sales": "تواصل مع فريق المبيعات", "Best value for growing operations": "أفضل قيمة وخيار للعمليات التشغيلية النامية", "Multi-Branch Support": "دعم الفروع المتعددة", "Desktop & Mobile Apps": "تطبيقات الحواسيب والهواتف الذكية", "Tailored solutions for large-scale operations": "حلول مخصصة للمؤسسات والعمليات الواسعة", "Multi-Company Support": "دعم وإدارة الشركات المتعددة", "Dedicated Server Option": "خيار الاستضافة على خادم خاص ومستقل", "API Access": "إمكانية الربط عبر واجهات البرمجة (APIs)", "Real impact for your bottom line": "تأثير حقيقي ومباشر على أرباحك وعوائدك", "Time Saved": "توفير في الوقت والجهد", "Hours saved per week on manual stocktaking and reconciliations": "ساعات عمل يتم توفيرها أسبوعياً في عمليات الجرد والتسويات اليدوية", "Accuracy": "دقة العمليات المحاسبية", "Inventory accuracy rate achieved by our active business users": "نسبة دقة الجرد والمخزون التي يحققها عملاؤنا النشطون", "Growth": "نمو المبيعات وتفادي النقص", "Average reduction in stockouts and lost sales opportunities": "متوسط خفض نفاد المخزون وتفادي فرص البيع الضائعة", "Cost Reduction": "خفض التكاليف التشغيلية", "Decrease in inventory holding costs and dead stock within 6 months": "انخفاض ملموس في تكاليف التخزين وهدر البضائع الراكدة خلال 6 أشهر", "Join hundreds of businesses that run on InventoryPro": "انضم إلى مئات الشركات التي تدير عملياتها بنجاح عبر إنفنتوري برو", "Schedule Demo": "احجز موعد عرض تجريبي", "Expense Ledger": "دفتر أستاذ المصروفات والنفقات", "Real screens from the application — a calm, focused workspace for daily spending control.": "شاشات حقيقية من التطبيق — بيئة عمل مريحة ومنظمة لإحكام السيطرة على الإنفاق اليومي.", "Clear Financial Workspace": "مساحة عمل مالية واضحة ومتكاملة", "Start from one polished workspace with Expense, Labour, Attendance, Sales, Accounting and Settings modules always within reach.": "ابدأ من بيئة عمل واحدة تضم وحدات المصروفات، وأجور العمالة، والحضور، والمبيعات، والمحاسبة، والإعدادات بمتناول يدك دائماً.", "Fast Daily Logging": "تسجيل يومي سريع وفوري", "Choose an expense type and reveal only the fields you need, so everyday entries are clean, consistent and quick to submit.": "اختر نوع المصروف لتظهر الحقول المطلوبة فقط، لتكون القيود اليومية دقيقة ومتسقة وسريعة الإدخال.", "Searchable Expense History": "سجل نفقات منظم وقابل للبحث الفوري", "Filter spending by category and date, then review each transaction with its note, owner and amount in a clear chronological record.": "تصفية النفقات حسب التصنيف والتاريخ ومراجعة كل عملية بملاحظاتها ومسؤولها ومبلغها في سجل زمني مرتب.", "Spending at a Glance": "نظرة شاملة وسريعة على حجم الإنفاق", "See filtered spend instantly and identify where money is going before exceptions become a surprise.": "شاهد الإنفاق المصفى فورياً واعرف أين تذهب أموال المنشأة قبل أن تتحول التجاوزات إلى مفاجأة غير سارة.", "A modern workflow that gives employees speed and finance complete control.": "مسار عمل عصري يمنح الموظفين السرعة والسهولة، ويوفر للإدارة المالية السيطرة والرقابة الكاملة.", "Submit expenses with receipts, category and business purpose in a clean, guided flow.": "رفع المطالبات مع الإيصالات والتصنيف والغرض التجاري عبر نموذج إرشادي سلس.", "Set category limits, spending rules and budget guardrails before costs reach finance.": "وضع حدود لكل تصنيف وقواعد للإنفاق وضوابط للميزانية قبل وصول النفقات للإدارة المالية.", "Route each claim to the right approver with clear status, reminders and full context.": "توجيه كل مطالبة للمسؤول المختص مع حالة واضحة وتنبيهات وسياق كامل للمصروف.", "Turn approved claims into timely, traceable reimbursements your people can trust.": "تحويل المطالبات المعتمدة إلى دفعات سداد منتظمة وموثوقة تضمن رضا وثقة موظفيك.", "Keep card, travel and out-of-pocket spend visible in one reconciled expense record.": "إبقاء نفقات البطاقات ومصروفات السفر والمدفوعات النثرية واضحة في سجل مالي موحد ومطابق.", "Spot trends, exceptions and budget pressure early with real-time reporting.": "اكتشاف الاتجاهات والتجاوزات وضغوط الميزانية مبكراً عبر تقارير حية وفورية.", "A simple experience for employees and a dependable control layer for finance.": "تجربة استخدام ميسرة للموظفين وطبقة رقابة مالية موثوقة ومحكمة للإدارة.", "Ready to Bring Clarity to": "هل أنت مستعد لإضفاء الوضوح والشفافية على", "Every Expense": "كل مصروف ونفقة في شركتك؟", "Talk to our team about an Expense Management rollout tailored to your policies and approval structure.": "تحدث مع فريقنا لتطبيق نظام إدارة المصروفات بما يتوافق مع سياساتك وهيكلية موافقاتك.", "Real screens from the platform — a single, intelligent workspace for international trade operations.": "شاشات حقيقية من المنصة — مساحة عمل واحدة ذكية تدير عمليات التجارة الدولية بكفاءة.", "Executive Trade Operations Cockpit": "لوحة القيادة التنفيذية لعمليات التجارة الدولية", "See active imports, exports, fleet transit, trade surplus and live currency exposure in one board. Leadership gets a clear, multi-region view while teams work from a shared source of truth.": "شاهد الواردات والصادرات النشطة، وحركة الأسطول، والميزان التجاري، ومخاطر العملات في لوحة واحدة؛ رؤية شاملة للإدارة التنفيذية وفريق عمل يعتمد على مصدر موحد للمعلومة.", "Import Operations & Customs Gateway": "عمليات الاستيراد وبوابة التخليص الجمركي", "Manage overseas suppliers, ports, Bills of Entry, customs duty, ICEGATE documents and Out-of-Charge milestones in one controlled import workflow — with every decision traceable.": "إدارة الموردين الخارجيين، والموانئ، وبيانات الاستيراد الجمركية، والرسوم، والوثائق الرسمية، وأذون الإفراج الجمركي في مسار عمل محكم وقابل للتتبع الكامل.", "Precision Landed Cost Engine": "محرك الحساب الدقيق للتكلفة الإجمالية الواصلة", "Allocate freight, customs duty, brokerage, insurance and taxes by value, quantity or weight. Capitalize costs accurately into inventory with reconciled, zero-discrepancy records.": "توزيع الشحن والجمارك والتخليص والتأمين والضرائب حسب القيمة أو الكمية أو الوزن؛ رسملة دقيقة للتكاليف في المخزون بسجلات مطابقة خالية من أي فروقات.", "Multi-Currency Intelligence": "نظام ذكي لإدارة العملات الدولية المتعددة", "Monitor USD, EUR, GBP, AED, JPY and more in real time, view base-currency equivalents and manage hedging exposure alongside import and export performance.": "متابعة الدولار واليورو والجنيه والدرهم والين وغيرها فورياً، وحساب المكافئ بالعملة الأساسية وإدارة التحوط المالي جنباً إلى جنب مع أداء الاستيراد والتصدير.", "Everything Global Trade": "كل ما تتطلبه وتفرضه", "Demands": "التجارة العالمية المعاصرة", "Purpose-built controls for the complexity of international buying, selling, shipping and settlement.": "أدوات وضوابط مصممة خصيصاً للتعامل مع تعقيدات الشراء والبيع والشحن والتسويات الدولية.", "Multi-Currency & Hedging": "تعدد العملات والتحوط المالي", "Price, settle and analyse foreign-currency exposure in your base currency, with live FX visibility across every trade.": "تسعير وتسوية وتحليل التعرض للعملات الأجنبية بعملتك الأساسية، مع رؤية حية لأسعار الصرف في كل صفقة.", "Multi-Region Operations": "إدارة العمليات عبر مناطق ودول متعددة", "Operate across ports, countries, legal entities and warehouses while retaining a consistent, consolidated trade view.": "أدر أنشطتك عبر الموانئ والدول والكيانات القانونية والمستودعات مع الحفاظ على رؤية تجارية موحدة ومتكاملة.", "Import, Export & Fleet": "إدارة الاستيراد والتصدير والأسطول", "Run purchase orders, export cases, shipments, vessel movement and delivery milestones from one operational timeline.": "إدارة أوامر الشراء، وملفات التصدير، والشحنات، وحركة السفن، ومحطات التسليم من جدول زمني تشغيلي موحد.", "Customs & Compliance": "الجمارك والامتثال للقوانين الدولية", "Control Bills of Entry, ICEGATE documentation, duty assessment, GST and clearance gates with a defensible audit trail.": "متابعة بيانات الاستيراد والوثائق الرسمية وتقدير الرسوم الجمركية والضرائب وبوابات الإفراج مع سجل تدقيق معتمد.", "Landed Cost Allocation": "توزيع التكلفة الواصلة على البضائع", "Allocate duties, freight, insurance and handling by value, quantity or weight — then post precise costs to inventory.": "توزيع الرسوم والشحن والتأمين والمناولة حسب القيمة أو الكمية أو الوزن — وترحيل التكاليف الدقيقة للمخزون.", "Trade Intelligence": "ذكاء الأعمال وتحليلات التجارة", "Turn import/export trajectories, profit, FX and logistics data into executive-ready insights for faster decisions.": "تحويل مسارات التجارة والأرباح وأسعار الصرف والخدمات اللوجستية إلى رؤى تنفيذية تسرع اتخاذ القرارات.", "Why Global IE Management": "لماذا نظام إدارة الاستيراد والتصدير؟", "Built for Trade Without": "مصمم لتجارة دولية خالية من", "Blind Spots": "أي نقاط عمياء أو ثغرات", "A calm, controlled operating layer for high-value, multi-party international transactions.": "طبقة تشغيلية محكمة ومستقرة للصفقات الدولية الكبرى التي تشترك فيها أطراف متعددة.", "One Trade Record": "سجل تجاري موحد لكل صفقة", "Commercial, logistics, customs, inventory and finance teams work from the same case — no duplicate data or broken handoffs.": "تعمل فرق التجارة واللوجستيات والجمارك والمخازن والمالية على نفس الملف — دون تكرار للبيانات أو انقطاع للمعلومات.", "Configurable by Region": "قابل للتخصيص بحسب المنطقة الجغرافية", "Adapt ports, trade lanes, approval rules, local duties and entity-level processes without losing governance.": "مواءمة الموانئ والخطوط الملاحية وقواعد الموافقات والرسوم المحلية وإجراءات الكيانات دون المساس بالحوكمة.", "Built for Scale": "مصمم للتوسع والنمو المستمر", "Start with one route or entity, then extend to regions, currencies, teams and warehouses as your trade footprint grows.": "ابدأ بخط ملاحي أو كيان واحد، ثم توسع نحو مناطق وعملات وفرق عمل ومستودعات جديدة مع نمو تجارتك.", "Audit-Ready by Design": "جاهزية تامة للتدقيق الجمركي والمالي", "Role-based controls, reconciled amounts and documented milestones make every trade decision easier to validate.": "صلاحيات محددة ومبالغ مطابقة ومحطات موثقة تجعل التحقق من أي قرار تجاري في غاية السهولة والموثوقية.", "We structure the rollout around your routes, entities, currencies, warehouses and compliance controls.": "ننظم عملية التطبيق والتشغيل حول خطوطك الملاحية وكياناتك وعملاتك ومستودعاتك وضوابط الامتثال لديك.", "We map trade lanes, entities, currencies, document flows and operating controls.": "نرسم خطوط التجارة والكيانات والعملات ودورة المستندات وضوابط العمليات التشغيلية.", "We configure roles, customs workflows, master data, cost rules and regional approvals.": "نهيئ الأدوار ومسارات الجمارك والبيانات الرئيسية وقواعد التكاليف والموافقات الإقليمية.", "We migrate counterparties, products, orders, opening stock and relevant trade history securely.": "نرحل بيانات الشركاء والمنتجات والطلبيات والأرصدة الافتتاحية وتاريخ العمليات بأمان تام.", "Your teams go live with hands-on training and responsive support for continuous improvement.": "تبدأ فرقك بالتشغيل الفعلي مع تدريب عملي ودعم سريع لتحقيق التطوير والتحسين المستمر.", "Ready to Command Your": "هل أنت مستعد لقيادة وتوجيه", "Talk to our team about a Global Import Export Management rollout tailored to your trade network.": "تحدث مع فريقنا لتطبيق نظام إدارة الاستيراد والتصدير العالمية بما يلائم شبكتك التجارية.", "Global Import Export Management — one connected platform for cross-border commerce, logistics and compliance.": "إدارة الاستيراد والتصدير العالمية — منصة واحدة مترابطة للتجارة العابرة للحدود واللوجستيات والامتثال الجمركي.", "We design, develop, and maintain tailor-made Odoo modules and addons that perfectly fit your business workflows — with full support for": "نصمم ونطور ونحافظ على وحدات وإضافات أودو المخصصة التي تلائم مسارات عملك تماماً — مع دعم كامل لـ", "New": "جديد", "Process": "مراحل التطوير", "Branch-to-branch transfers": "التحويلات المخزنية المباشرة بين الفروع", "Branch-specific pricing & promotions": "أسعار وعروض ترويجية مخصصة لكل فرع", "Individual branch performance tracking": "تتبع وتقييم أداء كل فرع بشكل مستقل", "Unlimited Branches": "عدد غير محدود من الفروع", "Add as many branches as your business grows": "أضف أي عدد من الفروع مع نمو وتوسع أعمالك", "Real-Time Sync": "مزامنة فورية ولحظية", "Instant synchronization across all locations": "مزامنة فورية ودقيقة عبر كافة المواقع والفروع", "Role-Based Access": "صلاحيات دقيقة بحسب الأدوار الوظيفية", "Control permissions at company & branch level": "التحكم في الصلاحيات على مستوى الشركة والفرع", "Unified Dashboard": "لوحة تحكم مركزية موحدة", "Complete overview of all operations": "رؤية وإشراف شامل لكافة العمليات التشغيلية", "Perfect for retail chains, franchises, distribution networks, and multi-location businesses": "مثالي لشبكات متاجر التجزئة وسلاسل الامتياز وشبكات التوزيع والشركات متعددة المواقع", "Request Enterprise Demo": "طلب عرض تجريبي مخصص للمؤسسات", "Powerful Features Included": "ميزات قوية ومتطورة مشمولة", "Everything you need to manage your inventory efficiently": "كل ما تحتاجه لإدارة مخزونك بأعلى درجات الكفاءة", "Real-time Stock Tracking": "تتبع فوري لمستويات المخزون", "Monitor your inventory levels in real-time across all locations. Get instant updates on stock movements and availability.": "راقب أرصدة المخزون لحظة بلحظة عبر كافة المواقع، واحصل على تحديثات فورية لحركات الأصناف وتوفرها.", "Quick and accurate stock management with integrated barcode scanning. Compatible with all standard barcode formats.": "إدارة سريعة ودقيقة للمخزون عبر مسح الباركود المدمج، المتوافق مع كافة صيغ الباركود القياسية.", "Smart Alerts": "تنبيهات وإشعارات ذكية", "Automated low stock alerts, expiry notifications, and reorder reminders to keep your business running smoothly.": "تنبيهات آلية عند انخفاض المخزون وإشعارات بتواريخ الصلاحية وتذكيرات إعادة الطلب لضمان سلاسة أعمالك.", "Multi-location Support": "دعم وإدارة المواقع المتعددة", "Manage inventory across multiple warehouses, stores, or locations from a single dashboard.": "إدارة المخزون عبر مستودعات ومتاجر ومواقع متعددة من لوحة تحكم واحدة.", "Generate detailed reports on stock levels, sales trends, and inventory valuation. Export data in multiple formats.": "توليد تقارير تفصيلية عن أرصدة المخزون ومعدلات المبيعات والتقييم المالي، مع إمكانية التصدير بصيغ متعددة.", "User Management": "إدارة المستخدمين والموظفين", "Role-based access control with customizable permissions. Track user activities and maintain audit logs.": "تحكم في الوصول بحسب الأدوار وصلاحيات مخصصة، مع تتبع أنشطة المستخدمين وسجلات تدقيق دقيقة.", "Mobile Access": "الوصول عبر تطبيقات الجوال", "Access your inventory data on the go with our mobile-responsive interface. Works on any device.": "الوصول إلى بيانات مخزونك أثناء التنقل بواجهة متجاوبة مع الهواتف تعمل بسلاسة على أي جهاز.", "Secure cloud storage with automatic backups. Access your data from anywhere, anytime.": "تخزين سحابي آمن مع نسخ احتياطي تلقائي يتيح لك الوصول إلى بياناتك من أي مكان وفي أي وقت.", "Full pro functionality at an affordable price": "كامل الميزات الاحترافية المتقدمة بأسعار اقتصادية في المتناول", "Full access to all pro features": "وصول كامل وشامل لكافة الميزات والخصائص الاحترافية", "Everything Included:": "كل ما تحتاجه مشمول بالكامل:", "Unlimited Products": "منتجات وأصناف غير محدودة", "Unlimited Users": "مستخدمون وحسابات غير محدودة", "Real-time Tracking": "تتبع لحظي وفوري", "Advanced Reports": "تقارير وتحليلات متقدمة", "Cloud Storage": "مساحة تخزين سحابية آمنة", "Automatic Backups": "نسخ احتياطي تلقائي منتظم", "Free Updates": "تحديثات وتحسينات مستمرة مجاناً", "Training & Onboarding": "تدريب شامل وتهيئة للفريق", "Get Started Now": "ابدأ الاستخدام الآن", "No setup fees • Cancel anytime • 30-day money-back guarantee": "بدون رسوم تأسيس • إلغاء في أي وقت • ضمان استرداد الأموال خلال 30 يوماً", "Why Choose InventoryPro?": "لماذا تختار إنفنتوري برو؟", "The smart choice for modern businesses": "الخيار الذكي والأنسب للشركات الحديثة", "Quick Setup": "تهيئة وتشغيل فوري وسريع", "Get started in minutes with our easy setup wizard and free onboarding support.": "ابدأ خلال دقائق مع معالج التهيئة السهل ودعم الإعداد المجاني.", "Bank-level encryption and 99.9% uptime guarantee ensure your data is always safe and accessible.": "تشفير متطور بمستوى أمان البنوك وضمان تشغيل بنسبة 99.9% لضمان حماية بياناتك وسهولة الوصول إليها دائماً.", "Cost-Effective": "قيمة اقتصادية استثنائية", "Full pro features at a fraction of the cost of enterprise solutions. No hidden fees.": "ميزات احترافية متكاملة بجزء بسيط من تكلفة حلول المؤسسات الكبرى، ودون أي رسوم خفية.", "Dedicated Support": "دعم فني مخصص ومستمر", "24/7 customer support via phone, email, and chat. We're here when you need us.": "دعم فني على مدار الساعة طوال أيام الأسبوع عبر الهاتف والبريد والمحادثة، متواجدون دائماً لمساعدتك.", "Ready to Streamline Your Inventory?": "هل أنت مستعد لتنظيم وتطوير إدارة مخزونك؟", "Join hundreds of businesses already using InventoryPro": "انضم إلى مئات الشركات التي تعتمد بالفعل على إنفنتوري برو في إدارة عملياتها", "Get Started Today": "ابدأ اليوم بكل ثقة", "Our Products | AKI Tech - AK International": "منتجاتنا | إيه كيه آي تك - إيه كيه إنترناشيونال", "Navbar": "شريط التنقل", "Products Overview": "نظرة عامة على المنتجات", "E-commerce Details": "تفاصيل منصة التجارة الإلكترونية", "Inventory Management Details": "تفاصيل نظام إدارة المخزون", "AK International": "إيه كيه إنترناشيونال", "Our Digital Products": "منتجاتنا الرقمية والبرمجية", "Professional web applications designed to streamline your business operations and boost productivity.": "تطبيقات ويب احترافية صُممت لتسهيل عمليات أعمالك ومضاعفة الإنتاجية.", "Explore Products": "استكشف منتجاتنا", "Our Product Portfolio": "باقة منتجاتنا البرمجية", "Simple E-commerce Platform": "منصة التجارة الإلكترونية المبسطة", "A comprehensive e-commerce solution perfect for small to medium businesses looking to establish their online presence.": "حل تجارة إلكترونية شامل ومثالي للشركات الصغيرة والمتوسطة التي تتطلع لترسيخ حضورها الرقمي ومبيعاتها.", "Inventory Management System": "نظام إدارة المخزون المتطور", "Advanced inventory tracking and management system to optimize your stock levels and reduce operational costs.": "نظام متقدم لتتبع وإدارة المخزون لتحسين مستويات البضائع وخفض التكاليف التشغيلية.", "Simple E-commerce Web Application": "تطبيق ويب للتجارة الإلكترونية المبسطة", "Transform your business with our user-friendly e-commerce platform designed specifically for small to medium enterprises.": "طوّر أعمالك مع منصة التجارة الإلكترونية سهلة الاستخدام المصممة خصيصاً للشركات الصغيرة والمتوسطة.", "Easy-to-use admin panel for adding, editing, and organizing your product catalog with images, descriptions, and pricing.": "لوحة تحكم إدارية ميسرة لإضافة وتعديل وتنظيم كتالوج المنتجات بالصور والأوصاف والأسعار.", "Shopping Cart & Checkout": "سلة التسوق وإتمام الدفع", "Seamless shopping experience with cart functionality, guest checkout options, and multiple payment methods.": "تجربة تسوق سلسة مع سلة مشتريات ذكية، وخيارات الشراء كزائر، وتعدد بوابات وطرق الدفع.", "Order Management": "إدارة ومتابعة الطلبيات", "Complete order tracking system from placement to delivery with automated email notifications.": "نظام متكامل لتتبع الطلبات من لحظة الشراء حتى التسليم مع إشعارات بريدية آلية للعملاء.", "Technology Stack:": "الحزمة التقنية:", "PHP": "PHP", "MySQL": "MySQL", "Bootstrap": "Bootstrap", "JavaScript": "JavaScript", "PayPal API": "PayPal API", "Comprehensive inventory solution that helps you maintain optimal stock levels and streamline your supply chain operations.": "حل جردي شامل يساعدك في الحفاظ على مستويات مخزون مثالية وتسهيل سلاسل الإمداد والتوريد.", "Monitor inventory levels in real-time with automatic alerts for low stock and reorder points.": "مراقبة مستويات المخزون فورياً مع تنبيهات تلقائية لانخفاض الرصيد وحدود إعادة الطلب.", "Supplier Management": "إدارة الموردين والمشتريات", "Maintain detailed supplier information, track purchase orders, and manage vendor relationships.": "حفظ بيانات الموردين التفصيلية ومتابعة أوامر الشراء وإدارة العلاقات مع الشركاء.", "Generate comprehensive reports on inventory turnover, sales trends, and stock performance.": "توليد تقارير شاملة عن معدل دوران المخزون واتجاهات المبيعات وأداء الأصناف.", "MongoDB": "MongoDB", "Express.js": "Express.js", "Chart.js": "Chart.js", "Why Choose AKI Tech Products?": "لماذا تختار منتجات إيه كيه آي تك؟", "Reliable & Secure": "موثوقية وأمان عالي", "Built with security best practices and robust architecture to ensure your data is always protected.": "مبني وفق أعلى ممارسات الأمان البرمجية وبنية تحتية متينة لضمان حماية بياناتك دائماً.", "Our dedicated support team is available round the clock to help you with any technical issues.": "فريق دعمنا الفني المتخصص متواجد على مدار الساعة لمساعدتك في أي استفسار تقني.", "Fast Deployment": "تنصيب وتشغيل فوري", "Quick setup and deployment process to get your business online and operational in minimal time.": "إعداد ونشر سريع يتيح لأعمالك الانطلاق وبدء العمل في أقصر وقت ممكن.", "Ready to Transform Your Business?": "هل أنت مستعد لتطوير وتنمية أعمالك؟", "Contact us today to discuss your requirements and get a customized solution for your business needs.": "تواصل معنا اليوم لمناقشة متطلباتك والحصول على حل مخصص يلائم أهدافك بدقة.", "Phone:": "الهاتف:", "Email:": "البريد الإلكتروني:", "Location:": "المقر:", "Send Inquiry": "إرسال الاستفسار", "Leather Products": "المنتجات الجلدية", "Instagram": "Instagram", "Business Management Light - AK International": "إدارة الأعمال الخفيفة - إيه كيه إنترناشيونال", "Get started with Business Management Light and run your small business with confidence.": "ابدأ الآن مع إدارة الأعمال الخفيفة وقُد شركتك الصغيرة بكل ثقة ونجاح.", "Business Management Light — a simple, affordable business tool for startups and small teams.": "إدارة الأعمال الخفيفة — أداة أعمال بسيطة واقتصادية مصممة للشركات الناشئة وفرق العمل الصغيرة.", "+919051867095": "‎+91 90518 67095‎", "+91-90518-67095": "‎+91 90518 67095‎", "+966564118034": "‎+966 564118034‎"};
    const originalTexts = new WeakMap();
    const originalAttrs = new WeakMap();
    let currentLang = 'en';
    try {
        currentLang = localStorage.getItem('site-language') || 'en';
    } catch (e) {}

    function normalizeKey(str) {
        return str ? str.replace(/\s+/g, ' ').trim() : '';
    }

    function translateTextNode(node, isAr) {
        const raw = node.nodeValue;
        const norm = normalizeKey(raw);
        if (!norm) return;

        if (isAr) {
            if (!originalTexts.has(node)) {
                originalTexts.set(node, raw);
            }
            if (norm.includes('+91') || norm.includes('+966') || /^\+?\d[\d\s-]{6,}\d$/.test(norm)) {
                const cleanPhone = norm.replace(/[^\d+\s-]/g, '');
                const leadMatch = raw.match(/^\s*/);
                const trailMatch = raw.match(/\s*$/);
                const lead = leadMatch ? leadMatch[0] : '';
                const trail = trailMatch ? trailMatch[0] : '';
                node.nodeValue = lead + '\u200E' + cleanPhone + '\u200E' + trail;
                return;
            }
            const translated = arabicDict[norm] || arabicDict[raw.trim()];
            if (translated) {
                const leadMatch = raw.match(/^\s*/);
                const trailMatch = raw.match(/\s*$/);
                const lead = leadMatch ? leadMatch[0] : '';
                const trail = trailMatch ? trailMatch[0] : '';
                node.nodeValue = lead + translated + trail;
            }
        } else {
            if (originalTexts.has(node)) {
                node.nodeValue = originalTexts.get(node);
            }
        }
    }

    function translateAttributes(el, isAr) {
        // Placeholders
        if (el.hasAttribute('placeholder')) {
            const raw = el.getAttribute('placeholder');
            const norm = normalizeKey(raw);
            if (isAr) {
                if (!originalAttrs.has(el)) originalAttrs.set(el, {});
                const store = originalAttrs.get(el);
                if (!('placeholder' in store)) store.placeholder = raw;
                const translated = arabicDict[norm] || arabicDict[raw];
                if (translated) el.setAttribute('placeholder', translated);
            } else if (originalAttrs.has(el) && 'placeholder' in originalAttrs.get(el)) {
                el.setAttribute('placeholder', originalAttrs.get(el).placeholder);
            }
        }
        // data-text
        if (el.hasAttribute('data-text')) {
            const raw = el.getAttribute('data-text');
            const norm = normalizeKey(raw);
            if (isAr) {
                if (!originalAttrs.has(el)) originalAttrs.set(el, {});
                const store = originalAttrs.get(el);
                if (!('data-text' in store)) store['data-text'] = raw;
                const translated = arabicDict[norm] || arabicDict[raw];
                if (translated) el.setAttribute('data-text', translated);
            } else if (originalAttrs.has(el) && 'data-text' in originalAttrs.get(el)) {
                el.setAttribute('data-text', originalAttrs.get(el)['data-text']);
            }
        }
        // title
        if (el.hasAttribute('title')) {
            const raw = el.getAttribute('title');
            const norm = normalizeKey(raw);
            if (isAr) {
                if (!originalAttrs.has(el)) originalAttrs.set(el, {});
                const store = originalAttrs.get(el);
                if (!('title' in store)) store.title = raw;
                const translated = arabicDict[norm] || arabicDict[raw];
                if (translated) el.setAttribute('title', translated);
            } else if (originalAttrs.has(el) && 'title' in originalAttrs.get(el)) {
                el.setAttribute('title', originalAttrs.get(el).title);
            }
        }
        // value on submit/button inputs
        if ((el.tagName === 'INPUT' && (el.type === 'submit' || el.type === 'button')) || el.tagName === 'BUTTON') {
            if (el.value) {
                const raw = el.value;
                const norm = normalizeKey(raw);
                if (isAr) {
                    if (!originalAttrs.has(el)) originalAttrs.set(el, {});
                    const store = originalAttrs.get(el);
                    if (!('value' in store)) store.value = raw;
                    const translated = arabicDict[norm] || arabicDict[raw];
                    if (translated) el.value = translated;
                } else if (originalAttrs.has(el) && 'value' in originalAttrs.get(el)) {
                    el.value = originalAttrs.get(el).value;
                }
            }
        }
    }

    function applyLanguage(nextLang) {
        currentLang = nextLang;
        try {
            localStorage.setItem('site-language', currentLang);
        } catch (e) {}

        const isAr = currentLang === 'ar';
        document.documentElement.lang = currentLang;
        document.documentElement.dir = isAr ? 'rtl' : 'ltr';
        document.documentElement.classList.toggle('site-arabic', isAr);
        if (document.body) {
            document.body.classList.toggle('site-arabic', isAr);
        }

        // Walk DOM
        const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            const parent = node.parentElement;
            if (!parent || parent.closest('script, style, code, pre, noscript, .footer-bottom, .footer-bottom__tech')) continue;
            translateTextNode(node, isAr);
        }

        // Attributes
        const attrElements = (document.body || document.documentElement).querySelectorAll('[placeholder], [data-text], [title], input[type="submit"], input[type="button"]');
        attrElements.forEach(el => translateAttributes(el, isAr));

        // Update button
        const buttons = document.querySelectorAll('.language-switcher');
        buttons.forEach(btn => {
            btn.innerHTML = isAr 
                ? '<span class="lang-globe">🌐</span> <span class="lang-text">English</span>' 
                : '<span class="lang-globe">🌐</span> <span class="lang-text">العربية</span>';
            btn.setAttribute('aria-label', isAr ? 'Switch to English' : 'التبديل إلى العربية');
            btn.setAttribute('title', isAr ? 'Switch to English' : 'التبديل إلى العربية');
        });
    }

    function initSwitcher() {
        const nav = document.querySelector('.foundation-nav');
        const navbarContainer = document.querySelector('.navbar .container');
        const target = nav || navbarContainer || document.querySelector('nav');
        if (!target) return;

        if (!document.querySelector('.language-switcher')) {
            const button = document.createElement('button');
            button.className = 'language-switcher';
            button.type = 'button';
            button.addEventListener('click', (e) => {
                e.preventDefault();
                applyLanguage(currentLang === 'ar' ? 'en' : 'ar');
            });

            const navActions = nav ? nav.querySelector('.foundation-nav__actions') : null;
            const hamburger = target.querySelector('.hamburger, .foundation-nav__toggle');

            if (navActions) {
                navActions.insertBefore(button, navActions.firstChild);
            } else if (hamburger) {
                target.insertBefore(button, hamburger);
            } else {
                target.appendChild(button);
            }
        }

        applyLanguage(currentLang);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSwitcher);
    } else {
        initSwitcher();
    }
})();


// Make the Global Import Export Management product available consistently from every product menu.
document.querySelectorAll('.nav-dropdown__link[aria-disabled="true"]').forEach((item) => {
    if (!item.textContent.includes('Global Import Export Management')) return;
    const link = document.createElement('a');
    link.href = 'global-import-export-management.html';
    link.className = item.className;
    link.innerHTML = item.innerHTML;
    item.replaceWith(link);
});

// Make Expense Management available beside the other product offerings.
document.querySelectorAll('.nav-dropdown').forEach((menu) => {
    if (menu.querySelector('a[href="expense-management.html"]')) return;
    const globalLink = menu.querySelector('a[href="global-import-export-management.html"]');
    if (globalLink) globalLink.closest('li').insertAdjacentHTML('beforebegin', '<li><a href="expense-management.html" class="nav-dropdown__link"><i class="fas fa-receipt"></i>Expense Management</a></li><li class="nav-dropdown__divider"></li>');
});

// Add the verified D-U-N-S registration mark once to every site footer.
document.querySelectorAll('.footer').forEach((footer) => {
    if (footer.querySelector('.duns-registration')) return;
    const registrations = document.createElement('div');
    registrations.className = 'footer-registrations';
    const registration = document.createElement('div');
    registration.className = 'duns-registration';
    registration.innerHTML = `
        <img src="assets/duns-registered.png" alt="Dun & Bradstreet D-U-N-S Registered" loading="lazy">
        <div>
            <span>Dun &amp; Bradstreet</span>
            <strong>D-U-N-S<sup>®</sup> Registered<sup>™</sup></strong>
        </div>`;
    const msmeRegistration = document.createElement('div');
    msmeRegistration.className = 'msme-registration';
    msmeRegistration.innerHTML = `
        <i class="fas fa-building-columns" aria-hidden="true"></i>
        <div>
            <span>Government of India</span>
            <strong>MSME Registered</strong>
        </div>`;
    registrations.append(registration, msmeRegistration);
    footer.querySelector('.footer-grid')?.insertAdjacentElement('afterend', registrations);
});
