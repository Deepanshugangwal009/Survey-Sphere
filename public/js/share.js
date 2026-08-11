document.addEventListener('DOMContentLoaded', () => {
  const copyButton = document.getElementById('copyShareLink');

  if (!copyButton) {
    return;
  }

  const shareInput = document.getElementById('shareLink');

  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(shareInput.value);
    } catch {
      shareInput.select();
      return;
    }

    copyButton.textContent = 'Copied';
    setTimeout(() => {
      copyButton.textContent = 'Copy';
    }, 2000);
  });
});
