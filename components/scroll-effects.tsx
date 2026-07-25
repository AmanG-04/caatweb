"use client";
import { useEffect } from "react";
export function ScrollEffects() {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>("main > section");
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: 0.12 });
    items.forEach(item => { item.classList.add("scroll-reveal"); observer.observe(item); });
    return () => observer.disconnect();
  }, []);
  return null;
}
