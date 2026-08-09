document.addEventListener('DOMContentLoaded', () => {
  const typeSelect = document.getElementById('type');

  if (!typeSelect) {
    return;
  }

  const optionsSection = document.getElementById('optionsSection');
  const ratingSection = document.getElementById('ratingSection');
  const optionList = document.getElementById('optionList');
  const addOptionButton = document.getElementById('addOption');

  function showSectionsForType() {
    const isChoice = typeSelect.value === 'single_choice' || typeSelect.value === 'multiple_choice';
    optionsSection.hidden = !isChoice;
    ratingSection.hidden = typeSelect.value !== 'rating';
  }

  function addOptionRow() {
    const row = document.createElement('div');
    row.className = 'input-group mb-2 option-row';
    row.innerHTML =
      '<input type="hidden" name="optionIds" value="">' +
      '<input class="form-control" type="text" name="options" placeholder="Option text">' +
      '<button class="btn btn-outline-danger remove-option" type="button"><i class="fa-solid fa-xmark"></i></button>';
    optionList.appendChild(row);
  }

  optionList.addEventListener('click', (event) => {
    const removeButton = event.target.closest('.remove-option');

    if (removeButton && optionList.querySelectorAll('.option-row').length > 1) {
      removeButton.closest('.option-row').remove();
    }
  });

  typeSelect.addEventListener('change', showSectionsForType);
  addOptionButton.addEventListener('click', addOptionRow);

  showSectionsForType();
});
