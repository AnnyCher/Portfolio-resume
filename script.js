/* =========================================================
   Анна — портфолио · script.js
   Функции: шапка при скролле, бургер-меню, reveal-анимации,
   анимация цифр, модальное окно просмотра, отправка формы.
   ========================================================= */
(function () {
    'use strict';

    var doc = document;
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Шапка: состояние при скролле ---------- */
    var header = doc.getElementById('siteHeader');
    if (header) {
        var onScroll = function () {
            header.classList.toggle('is-scrolled', window.scrollY > 8);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ---------- Бургер-меню ---------- */
    var burger = doc.getElementById('burger');
    var navLinks = doc.getElementById('navLinks');

    if (burger && navLinks) {
        var setOpen = function (open) {
            burger.classList.toggle('active', open);
            navLinks.classList.toggle('active', open);
            burger.setAttribute('aria-expanded', open ? 'true' : 'false');
            burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
        };

        burger.addEventListener('click', function (e) {
            e.stopPropagation();
            setOpen(!burger.classList.contains('active'));
        });

        navLinks.addEventListener('click', function (e) {
            if (e.target.closest('a')) setOpen(false);
        });

        doc.addEventListener('click', function (e) {
            if (!burger.classList.contains('active')) return;
            if (!navLinks.contains(e.target) && !burger.contains(e.target)) setOpen(false);
        });

        doc.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && burger.classList.contains('active')) {
                setOpen(false);
                burger.focus();
            }
        });

        var mq = window.matchMedia('(min-width: 769px)');
        if (mq.addEventListener) {
            mq.addEventListener('change', function (e) { if (e.matches) setOpen(false); });
        } else if (mq.addListener) {
            mq.addListener(function (e) { if (e.matches) setOpen(false); });
        }
    }

    /* ---------- Появление секций ---------- */
    var revealEls = doc.querySelectorAll('[data-reveal]');
    if (revealEls.length && !prefersReduced && 'IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
        revealEls.forEach(function (el) { io.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }

    /* ---------- Анимация цифр ---------- */
    var numbers = doc.querySelectorAll('.number[data-target]');
    var animateNumber = function (el) {
        var target = parseInt(el.dataset.target, 10) || 0;
        if (prefersReduced) { el.textContent = String(target); return; }
        var duration = 1400;
        var start = performance.now();
        var tick = function (now) {
            var t = Math.min(1, (now - start) / duration);
            var eased = 1 - Math.pow(1 - t, 3);
            el.textContent = String(Math.round(target * eased));
            if (t < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = String(target);
            }
        };
        requestAnimationFrame(tick);
    };

    if (numbers.length && 'IntersectionObserver' in window) {
        var ioNum = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateNumber(entry.target);
                    ioNum.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });
        numbers.forEach(function (el) { ioNum.observe(el); });
    } else {
        numbers.forEach(function (el) { el.textContent = el.dataset.target || '0'; });
    }

    /* ---------- Модальное окно просмотра ---------- */
    var modal = doc.getElementById('modal');
    var modalImg = doc.getElementById('modalImage');
    var modalClose = doc.getElementById('modalClose');

    if (modal && modalImg && modalClose) {
        var lastFocused = null;

        var openModal = function (src, alt) {
            lastFocused = doc.activeElement;
            modalImg.src = src;
            modalImg.alt = alt || '';
            modal.classList.add('is-open');
            doc.body.classList.add('modal-open');
            modalClose.focus();
        };

        var closeModal = function () {
            modal.classList.remove('is-open');
            doc.body.classList.remove('modal-open');
            modalImg.src = '';
            modalImg.alt = '';
            if (lastFocused && typeof lastFocused.focus === 'function') {
                lastFocused.focus();
            }
        };

        doc.querySelectorAll('.case__media').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var img = btn.querySelector('img');
                if (img) openModal(img.currentSrc || img.src, img.alt);
            });
        });

        modalClose.addEventListener('click', closeModal);

        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });

        doc.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) {
                closeModal();
            }
        });
    }

    /* ---------- Форма ---------- */
    var form = doc.getElementById('contactForm');
    var formMessage = doc.getElementById('formMessage');

    if (form && formMessage) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var nameEl = doc.getElementById('name');
            var emailEl = doc.getElementById('email');
            var msgEl = doc.getElementById('message');

            var name = (nameEl && nameEl.value || '').trim();
            var email = (emailEl && emailEl.value || '').trim();
            var message = (msgEl && msgEl.value || '').trim();

            if (!name || !email || !message) {
                formMessage.textContent = 'Заполните все поля.';
                formMessage.classList.remove('is-success');
                return;
            }

            /* Здесь можно добавить отправку на сервер (fetch) */
            formMessage.textContent = 'Спасибо. Заявка отправлена, отвечу в течение рабочего дня.';
            formMessage.classList.add('is-success');
            form.reset();

            setTimeout(function () {
                formMessage.textContent = '';
                formMessage.classList.remove('is-success');
            }, 6000);
        });
    }
})();