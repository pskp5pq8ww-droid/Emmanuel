"use client";

import { useEffect } from "react";

const reviews = [
  ["Maria G.", "Wedding - Maria & John", "Incredible experience. The photos and videos exceeded all our expectations."],
  ["Vertice Team", "Corporate", "The creativity and attention to detail make all the difference. Amazing work."],
  ["Lumo Studio", "Branding", "The quality and aesthetic of the content is simply outstanding."],
  ["James T.", "Portrait", "Professional, fast and so talented. The results were perfect."],
];

export default function HomePortal() {
  useEffect(() => {
    const controls = document.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>(
      "button,.primary-btn,.ghost-btn,.text-btn,.icon-btn",
    );
    const cleanups = Array.from(controls).map((control) => {
      const onPointerDown: EventListener = (event) => {
        const pointerEvent = event as PointerEvent;
        const rect = control.getBoundingClientRect();
        control.style.setProperty("--x", `${pointerEvent.clientX - rect.left}px`);
        control.style.setProperty("--y", `${pointerEvent.clientY - rect.top}px`);
        control.classList.remove("is-pressed");
        void control.offsetWidth;
        control.classList.add("is-pressed");
      };
      const clear = () => setTimeout(() => control.classList.remove("is-pressed"), 260);
      control.addEventListener("pointerdown", onPointerDown);
      control.addEventListener("pointerup", clear);
      return () => {
        control.removeEventListener("pointerdown", onPointerDown);
        control.removeEventListener("pointerup", clear);
      };
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return (
    <main className="page">
      <header className="topbar">
        <img className="logo-mark" src="/assets/ogo-er-black.png" alt="Emmanuel Rojas ER" />
        <nav className="nav" aria-label="Principal">
          <a href="#portal">Client Portal</a>
          <a href="#digitalProjects">Projects</a>
          <a href="#trust">Contact</a>
        </nav>
        <div className="nav-actions">
          <a className="icon-btn" href="/admin" title="Panel admin" aria-label="Panel admin"><img src="/assets/ogo-er-black.png" alt="" /></a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="kicker">Creative Direction · Visual Production · Digital Identity</div>
          <h1>Your projects.<br />Your memories.<br />Always <span className="serif">accessible.</span></h1>
          <p className="lead">Access, download and review your private photo and video galleries in one secure place designed with the Emmanuel Rojas visual identity.</p>
          <div className="hero-actions">
            <a className="primary-btn" href="#portal">Access your gallery →</a>
            <a className="ghost-btn" href="#digitalProjects">Check projects →</a>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true" />
      </section>

      <section className="portfolio-section" id="digitalProjects">
        <div className="section-head"><div><div className="kicker">Digital Projects</div><h2>Portfolio spaces</h2></div><p>Photography, identity and digital builds working together as one visual system.</p></div>
        <div className="portfolio-grid">
          <article className="portfolio-card"><div className="kicker">01</div><h3>Photography Portals</h3><p>Private galleries, downloads, reviews and client delivery systems.</p></article>
          <article className="portfolio-card"><div className="kicker">02</div><h3>Brand Websites</h3><p>Minimal websites for creatives, events, products and service brands.</p></article>
          <article className="portfolio-card"><div className="kicker">03</div><h3>Digital Identity</h3><p>Visual direction, assets, layouts and launch-ready creative systems.</p></article>
        </div>
      </section>

      <section className="portal-row" id="portal">
        <div className="login-panel">
          <img className="logo-mark" src="/assets/ogo-er-black.png" alt="ER" style={{ width: 52, marginBottom: 28 }} />
          <div className="kicker">Client Portal</div>
          <h2>Access Your<br />Private Gallery</h2>
          <p>Please enter your credentials to access your project.</p>
          <form action="/gallery">
            <div className="field"><label htmlFor="clientUser">Username or Email</label><input id="clientUser" name="login" autoComplete="username" placeholder="Enter username or email" required /></div>
            <div className="field"><label htmlFor="clientPin">PIN</label><input id="clientPin" name="pin" type="password" inputMode="numeric" autoComplete="current-password" placeholder="Enter PIN" required /></div>
            <button className="primary-btn" type="submit">Access gallery →</button>
          </form>
        </div>
        <div className="brand-panel"><div className="device-card"><img className="logo-mark" src="/assets/ogo-er-black.png" alt="ER" /></div></div>
      </section>

      <section className="review-section" id="reviews">
        <div className="section-head"><div><div className="kicker">Client Reviews</div><h2>What clients say</h2></div><p>Reviews submitted inside private galleries appear here automatically as a moving testimonial panel.</p></div>
        <div className="review-rail" aria-label="Client reviews"><div className="review-track">
          {reviews.concat(reviews).map(([name, project, text], index) => (
            <article className="review-card" key={`${name}-${index}`}><blockquote>&quot;{text}&quot;</blockquote><strong>{name}</strong><span>{project}</span></article>
          ))}
        </div></div>
      </section>

      <section className="trust-section" id="trust">
        <div><div className="kicker">Trust & Contact</div><h2>Professional visual stories, delivered with clarity.</h2><p>Based in Brisbane, Australia. Available worldwide for photography, visual production and digital development.</p></div>
        <a href="https://www.instagram.com/emmanuelrojasfotografo" target="_blank" rel="noreferrer">@emmanuelrojasfotografo</a>
      </section>

      <footer className="footer"><span>Emmanuel Rojas Studio</span><span className="footer-location">Brisbane, Australia · Worldwide</span></footer>
    </main>
  );
}
