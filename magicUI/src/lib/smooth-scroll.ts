export function smoothScrollTo(elementId: string) {
  const element = document.getElementById(elementId.replace('#', ''));
  if (element) {
    const headerOffset = 64 + 56; // Urgency banner (64px) + Header (56px)
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

export function handleSmoothScroll(e: React.MouseEvent<HTMLAnchorElement>) {
  const href = e.currentTarget.getAttribute('href');
  
  if (href && href.startsWith('#')) {
    e.preventDefault();
    smoothScrollTo(href);
  }
}