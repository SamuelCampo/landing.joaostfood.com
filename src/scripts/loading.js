const overlay = document.querySelector("#loading-overlay");
const sitePage = document.querySelector("#site-page");

if (overlay && sitePage) {
  const art = overlay.querySelector(".loading-art");
  const progressBar = overlay.querySelector("#loading-progress");
  const progressFill = overlay.querySelector("#loading-progress-fill");
  const progressValue = overlay.querySelector("#loading-progress-value");
  const message = overlay.querySelector("#loading-message");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const finishLoading = () => {
    sitePage.inert = false;
    document.body.classList.remove("is-loading");
    overlay.remove();
  };

  if (reducedMotion.matches) {
    finishLoading();
  } else {
    sitePage.inert = true;
    document.body.classList.add("is-loading");
    const duration = 1750;
    let startedAt;

    const updateProgress = (time) => {
      if (startedAt === undefined) startedAt = time;
      const ratio = Math.min((time - startedAt) / duration, 1);
      const percent = Math.round(ratio * 100);
      const negative = (1 - ratio).toFixed(3);
      const saturation = (0.35 + ratio * 0.65).toFixed(3);

      progressValue.textContent = `${percent}%`;
      progressBar.setAttribute("aria-valuenow", String(percent));
      progressFill.style.width = `${percent}%`;
      art.style.filter = `grayscale(${negative}) invert(${negative}) saturate(${saturation})`;

      if (ratio < 1) {
        requestAnimationFrame(updateProgress);
      } else {
        message.textContent = "¡Listo para pedir!";
        window.setTimeout(finishLoading, 850);
      }
    };

    requestAnimationFrame(updateProgress);
  }
}
