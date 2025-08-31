class ResponsiveCircularSlider {
    constructor() {
        this.currentSlide = 3;
        this.totalSlides = 5;
        this.isAnimating = false;
        this.autoPlayInterval = null;
        this.touchStartX = 0;
        this.touchEndX = 0;

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateSlider();
        this.startAutoPlay();
        this.handleResize();
    }

    bindEvents() {
        const sliderContainer = document.querySelector('.slider-container');

        // Navigation buttons
        document.getElementById('prevBtn')?.addEventListener('click', () => this.prevSlide());
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextSlide());

        // Dot navigation
        document.querySelectorAll('.dot').forEach(dot => {
            dot.addEventListener('click', e => {
                const slideNumber = parseInt(e.target.dataset.slide);
                this.goToSlide(slideNumber);
            });

            dot.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const slideNumber = parseInt(e.target.dataset.slide);
                    this.goToSlide(slideNumber);
                }
            });
        });

        // Slide click navigation
        document.querySelectorAll('.slide').forEach(slide => {
            slide.addEventListener('click', e => {
                const slideNumber = parseInt(e.currentTarget.dataset.slide);
                if (slideNumber !== this.currentSlide) {
                    this.goToSlide(slideNumber);
                }
            });

            slide.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const slideNumber = parseInt(e.currentTarget.dataset.slide);
                    if (slideNumber !== this.currentSlide) {
                        this.goToSlide(slideNumber);
                    }
                }
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextSlide();
            }
        });

        // Touch support
        sliderContainer.addEventListener('touchstart', e => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        sliderContainer.addEventListener('touchend', e => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });

        // Mouse swipe support
        let isMouseDown = false;

        sliderContainer.addEventListener('mousedown', e => {
            isMouseDown = true;
            this.touchStartX = e.clientX;
        });

        sliderContainer.addEventListener('mousemove', e => {
            if (isMouseDown) e.preventDefault();
        });

        sliderContainer.addEventListener('mouseup', e => {
            if (!isMouseDown) return;
            isMouseDown = false;
            this.touchEndX = e.clientX;
            this.handleSwipe();
        });

        // Pause/resume on hover or focus
        sliderContainer.addEventListener('mouseenter', () => this.pauseAutoPlay());
        sliderContainer.addEventListener('mouseleave', () => this.startAutoPlay());
        sliderContainer.addEventListener('focusin', () => this.pauseAutoPlay());
        sliderContainer.addEventListener('focusout', () => this.startAutoPlay());

        // Resize handler
        window.addEventListener('resize', () => this.handleResize());

        // Tab visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoPlay();
            } else {
                this.startAutoPlay();
            }
        });
    }

    handleSwipe() {
        const threshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > threshold) {
            diff > 0 ? this.nextSlide() : this.prevSlide();
        }
    }

    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => this.updateSlidePositions(), 100);
    }

    nextSlide() {
        if (this.isAnimating) return;
        const next = this.currentSlide === this.totalSlides ? 1 : this.currentSlide + 1;
        this.goToSlide(next);
    }

    prevSlide() {
        if (this.isAnimating) return;
        const prev = this.currentSlide === 1 ? this.totalSlides : this.currentSlide - 1;
        this.goToSlide(prev);
    }

    goToSlide(slideNumber) {
        if (this.isAnimating || slideNumber === this.currentSlide) return;

        this.isAnimating = true;
        this.currentSlide = slideNumber;
        this.updateSlider();

        setTimeout(() => {
            this.isAnimating = false;
        }, 600);
    }

    updateSlider() {
        // Update active slide
        document.querySelectorAll('.slide').forEach(slide => {
            slide.classList.remove('active');
            slide.setAttribute('aria-selected', 'false');
        });

        const activeSlide = document.querySelector(`[data-slide="${this.currentSlide}"]`);
        activeSlide?.classList.add('active');
        activeSlide?.setAttribute('aria-selected', 'true');

        // Update active dot
        document.querySelectorAll('.dot').forEach(dot => {
            dot.classList.remove('active');
            dot.setAttribute('aria-selected', 'false');
        });

        const activeDot = document.querySelector(`.dot[data-slide="${this.currentSlide}"]`);
        activeDot?.classList.add('active');
        activeDot?.setAttribute('aria-selected', 'true');

        // Update slide title
        const desc = activeSlide?.querySelector('.slide-description')?.textContent || '';
        document.getElementById('slide-title').textContent = desc;

        // Update layout
        this.updateSlidePositions();

        // Screen reader announcement
        this.announceSlideChange();
    }

    updateSlidePositions() {
        const slides = document.querySelectorAll('.slide');

        slides.forEach(slide => {
            const slideNumber = parseInt(slide.dataset.slide);
            const pos = this.getSlidePosition(slideNumber);

            Object.assign(slide.style, {
                transform: pos.transform,
                left: pos.left,
                right: pos.right,
                top: pos.top,
                width: pos.width,
                height: pos.height,
                zIndex: pos.zIndex
            });
        });
    }

    getSlidePosition(slideNumber) {
        const w = window.innerWidth;
        const isMobile = w <= 768;
        const isSmallMobile = w <= 480;

        const rel = (slideNumber - this.currentSlide + 5) % 5;

        const positions = isSmallMobile ? {
            0: { transform: 'translateX(-50%)', left: '50%', right: 'auto', top: '-15px', width: '160px', height: '160px', zIndex: 4 },
            1: { transform: 'translateX(0)', left: 'auto', right: '30px', top: '20px', width: '110px', height: '110px', zIndex: 2 },
            2: { transform: 'translateX(0)', left: 'auto', right: '5px', top: '50px', width: '90px', height: '90px', zIndex: 1 },
            3: { transform: 'translateX(0)', left: '5px', right: 'auto', top: '50px', width: '90px', height: '90px', zIndex: 2 },
            4: { transform: 'translateX(0)', left: '30px', right: 'auto', top: '20px', width: '110px', height: '110px', zIndex: 3 }
        } : isMobile ? {
            0: { transform: 'translateX(-50%)', left: '50%', right: 'auto', top: '-15px', width: '200px', height: '200px', zIndex: 4 },
            1: { transform: 'translateX(0)', left: 'auto', right: '120px', top: '25px', width: '130px', height: '130px', zIndex: 1 },
            2: { transform: 'translateX(0)', left: 'auto', right: '10px', top: '65px', width: '110px', height: '110px', zIndex: 1 },
            3: { transform: 'translateX(0)', left: '10px', right: 'auto', top: '65px', width: '110px', height: '110px', zIndex: 2 },
            4: { transform: 'translateX(0)', left: '120px', right: 'auto', top: '25px', width: '130px', height: '130px', zIndex: 3 }
        } : {
            0: { transform: 'translateX(-50%)', left: '50%', right: 'auto', top: '0px', width: '280px', height: '280px', zIndex: 4 },
            1: { transform: 'translateX(0)', left: 'auto', right: '200px', top: '60px', width: '180px', height: '180px', zIndex: 2 },
            2: { transform: 'translateX(0)', left: 'auto', right: '80px', top: '110px', width: '150px', height: '150px', zIndex: 1 },
            3: { transform: 'translateX(0)', left: '100px', right: 'auto', top: '110px', width: '150px', height: '150px', zIndex: 2 },
            4: { transform: 'translateX(0)', left: '200px', right: 'auto', top: '60px', width: '180px', height: '180px', zIndex: 3 }
        };

        return positions[rel];
    }

    announceSlideChange() {
        let liveRegion = document.getElementById('slide-announcement');

        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'slide-announcement';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            Object.assign(liveRegion.style, {
                position: 'absolute',
                left: '-10000px',
                width: '1px',
                height: '1px',
                overflow: 'hidden'
            });
            document.body.appendChild(liveRegion);
        }

        const desc = document.querySelector(`[data-slide="${this.currentSlide}"] .slide-description`)?.textContent || '';
        liveRegion.textContent = `Slide ${this.currentSlide}: ${desc}`;
    }

    startAutoPlay() {
        this.pauseAutoPlay();
        this.autoPlayInterval = setInterval(() => this.nextSlide(), 5000);
    }

    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

// Initialize slider when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ResponsiveCircularSlider();

    // Preload slide images
    document.querySelectorAll('.slide img').forEach(img => {
        const preloader = new Image();
        preloader.src = img.src;
    });
});
