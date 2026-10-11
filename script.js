// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.padding = '12px 0';
    } else {
        navbar.style.padding = '16px 0';
    }

    lastScroll = currentScroll;
});

// Scroll reveal animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe elements for fade-in animation
document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('.about-card, .game-card, .player-card, .product-card, .program-card');

    fadeElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
});

// Form submission handler
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        // Show success message (in real implementation, send to backend)
        alert('Thank you for your interest! We will contact you soon.');
        contactForm.reset();
    });
}

// Add hover sound effect (optional - can be removed)
const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-large, .btn-outline');
buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
        button.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    const heroBg = document.querySelector('.hero-bg');

    if (heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
    }

    if (heroBg) {
        heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Counter animation for stats
const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target + (element.dataset.suffix || '');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start) + (element.dataset.suffix || '');
        }
    }, 16);
};

// Trigger counter animation when stats are in view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            const number = entry.target.querySelector('.stat-number');
            const targetValue = parseInt(number.textContent);

            if (number.textContent.includes('%')) {
                number.dataset.suffix = '%';
            } else if (number.textContent.includes('+')) {
                number.dataset.suffix = '+';
            }

            animateCounter(number, targetValue);
            entry.target.classList.add('animated');
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-item').forEach(stat => {
    statsObserver.observe(stat);
});

// Product card tilt effect
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// Player card hover effect
document.querySelectorAll('.player-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        const playerImage = card.querySelector('.player-image');
        playerImage.style.transform = 'scale(1.05)';
        playerImage.style.transition = 'transform 0.5s ease';
    });

    card.addEventListener('mouseleave', () => {
        const playerImage = card.querySelector('.player-image');
        playerImage.style.transform = 'scale(1)';
    });
});

// Add active state to navigation on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Add stagger animation delay to grid items
document.querySelectorAll('.team-grid .player-card').forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
});

document.querySelectorAll('.products-grid .product-card').forEach((card, index) => {
    card.style.animationDelay = `${index * 0.15}s`;
});

// Loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});
