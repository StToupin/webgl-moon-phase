const baseDate = new Date();
export let currentDate = new Date(baseDate);

export function initDateSelector({ onChange }: { onChange?: () => void } = {}): void {
  // Update the date display initially
  const dateDisplay = document.getElementById('date-display');
  if (dateDisplay) {
    dateDisplay.textContent = currentDate.toLocaleString();
  }

  // Set up slider functionality
  const slider = document.getElementById('time-slider') as HTMLInputElement;
  if (slider) {
    slider.addEventListener('input', () => {
      const dayOffset = parseFloat(slider.value);
      currentDate = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);

      const dateDisplay = document.getElementById('date-display');
      if (dateDisplay) {
        dateDisplay.textContent = currentDate.toLocaleString();
      }

      if (onChange) onChange();
    });
  }
}
