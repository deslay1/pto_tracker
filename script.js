document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculate-btn');
    const currentPTOInput = document.getElementById('current-pto');
    const monthlyAccrualInput = document.getElementById('monthly-accrual');
    const futureDateInput = document.getElementById('future-date');
    const resultElement = document.getElementById('pto-result');
    const addDayBtn = document.getElementById('add-day-btn');
    const plannedDaysList = document.getElementById('planned-days-list');

    // Initialize Flatpickr for future date
    const futureDatePicker = flatpickr(futureDateInput, {
        dateFormat: 'Y-m-d',
        allowInput: true,
        maxDate: new Date().fp_incr(365) // Maximum 1 year from today
    });

    // Function to initialize date pickers for all planned days
    function initializeDatePickers() {
        // Initialize start date pickers
        flatpickr('.date-picker[data-datepicker="start"]', {
            dateFormat: 'Y-m-d',
            allowInput: true,
            minDate: new Date(), // Minimum date is today
            onChange: function(selectedDates, dateStr, instance) {
                // Update the minimum date for the corresponding end date picker
                const parent = instance.input.closest('.planned-day-item');
                if (parent) {
                    const endDatePicker = parent.querySelector('.date-picker[data-datepicker="end"]');
                    if (endDatePicker && endDatePicker.flatpickr) {
                        endDatePicker.flatpickr.set('minDate', dateStr);
                    }
                }
            }
        });

        // Initialize end date pickers
        flatpickr('.date-picker[data-datepicker="end"]', {
            dateFormat: 'Y-m-d',
            allowInput: true,
            minDate: new Date() // Minimum date is today
        });
    }

    // Initialize date pickers for existing items
    initializeDatePickers();

    // Add event listener for adding new planned days
    addDayBtn.addEventListener('click', () => {
        const newDayItem = document.createElement('div');
        newDayItem.className = 'planned-day-item';
        newDayItem.innerHTML = `
            <div class="date-range">
                <input type="text" class="date-picker start-date" placeholder="Start Date" data-datepicker="start">
                <span class="to">to</span>
                <input type="text" class="date-picker end-date" placeholder="End Date" data-datepicker="end">
                <button type="button" class="remove-day">Remove</button>
            </div>
        `;

        plannedDaysList.appendChild(newDayItem);
        
        // Reinitialize all date pickers after adding a new one
        initializeDatePickers();

        // Add remove button functionality
        const removeBtn = newDayItem.querySelector('.remove-day');
        removeBtn.addEventListener('click', (e) => {
            const parent = e.target.closest('.planned-day-item');
            const allItems = document.querySelectorAll('.planned-day-item');
            
            if (allItems.length === 1) {
                // If this is the only row, clear the date fields
                parent.querySelectorAll('.date-picker').forEach(input => {
                    input.value = '';
                });
            } else {
                // If there are multiple rows, remove this one
                parent.remove();
                // Reinitialize date pickers after removal
                initializeDatePickers();
            }
        });
    });

    // Add remove button functionality to existing items
    document.querySelectorAll('.planned-day-item .remove-day').forEach(removeBtn => {
        removeBtn.addEventListener('click', (e) => {
            const parent = e.target.closest('.planned-day-item');
            const allItems = document.querySelectorAll('.planned-day-item');
            
            if (allItems.length === 1) {
                // If this is the only row, clear the date fields
                parent.querySelectorAll('.date-picker').forEach(input => {
                    input.value = '';
                });
            } else {
                // If there are multiple rows, remove this one
                parent.remove();
                // Reinitialize date pickers after removal
                initializeDatePickers();
            }
        });
    });

    calculateBtn.addEventListener('click', calculatePTO);

    function calculatePTO() {
        const currentPTO = parseFloat(currentPTOInput.value) || 0;
        const monthlyAccrual = parseFloat(monthlyAccrualInput.value) || 0;
        const futureDate = new Date(futureDateInput.value);
        const today = new Date();

        // Calculate months between today and future date
        const months = (futureDate.getFullYear() - today.getFullYear()) * 12 + 
                      (futureDate.getMonth() - today.getMonth());

        // Calculate total PTO before planned days
        let totalPTO = currentPTO + (monthlyAccrual * months);

        // Subtract planned time off
        const plannedDays = document.querySelectorAll('.planned-day-item');
        plannedDays.forEach(day => {
            const startDateInput = day.querySelector('.date-picker[data-datepicker="start"]').value;
            const endDateInput = day.querySelector('.date-picker[data-datepicker="end"]').value;
            
            if (startDateInput && endDateInput) {
                const startDate = new Date(startDateInput);
                const endDate = new Date(endDateInput);
                
                // Only count dates that are before or equal to the future date
                const validStartDate = startDate <= futureDate ? startDate : futureDate;
                const validEndDate = endDate <= futureDate ? endDate : futureDate;
                
                // Calculate number of days between start and end date
                const timeDiff = validEndDate.getTime() - validStartDate.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
                
                // Calculate total hours for this interval (8 hours per day)
                const totalHours = daysDiff * 8;
                totalPTO -= totalHours;
            }
        });

        // Update result
        resultElement.textContent = totalPTO.toFixed(1);
    }

    // Add keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            calculatePTO();
        }
    });
});
