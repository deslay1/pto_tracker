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
                <label class="single-day-label">
                    <input type="checkbox" class="single-day-checkbox">
                    <span class="checkmark"></span>
                    Single Day
                </label>
                <button type="button" class="remove-day">Remove</button>
            </div>
        `;

        plannedDaysList.appendChild(newDayItem);
        initializeDatePickers();

        // Add single day checkbox functionality
        const singleDayCheckbox = newDayItem.querySelector('.single-day-checkbox');
        const endDateInput = newDayItem.querySelector('.date-picker.end-date');
        
        singleDayCheckbox.addEventListener('change', () => {
            endDateInput.disabled = singleDayCheckbox.checked;
            if (singleDayCheckbox.checked) {
                endDateInput.value = '';
            }
        });

        // Add remove button functionality
        const removeBtn = newDayItem.querySelector('.remove-day');
        removeBtn.addEventListener('click', (e) => {
            const parent = e.target.closest('.planned-day-item');
            const allItems = document.querySelectorAll('.planned-day-item');
            
            if (allItems.length === 1) {
                // If this is the only row, clear all fields
                parent.querySelectorAll('.date-picker').forEach(input => {
                    input.value = '';
                });
                parent.querySelector('.single-day-checkbox').checked = false;
                parent.querySelector('.date-picker.end-date').disabled = false;
            } else {
                // If there are multiple rows, remove this one
                parent.remove();
                initializeDatePickers();
            }
        });
    });

    // Add single day checkbox functionality to existing items
    document.querySelectorAll('.planned-day-item').forEach(item => {
        const singleDayCheckbox = item.querySelector('.single-day-checkbox');
        const endDateInput = item.querySelector('.date-picker.end-date');
        
        singleDayCheckbox.addEventListener('change', () => {
            endDateInput.disabled = singleDayCheckbox.checked;
            if (singleDayCheckbox.checked) {
                endDateInput.value = '';
            }
        });
    });

    // Add remove button functionality to existing items
    document.querySelectorAll('.planned-day-item .remove-day').forEach(removeBtn => {
        removeBtn.addEventListener('click', (e) => {
            const parent = e.target.closest('.planned-day-item');
            const allItems = document.querySelectorAll('.planned-day-item');
            
            if (allItems.length === 1) {
                // If this is the only row, clear all fields
                parent.querySelectorAll('.date-picker').forEach(input => {
                    input.value = '';
                });
                parent.querySelector('.single-day-checkbox').checked = false;
                parent.querySelector('.date-picker.end-date').disabled = false;
            } else {
                // If there are multiple rows, remove this one
                parent.remove();
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

        // Calculate total PTO before planned days
        let totalPTO = currentPTO;

        // Calculate number of complete months between today and future date
        // Only count complete months (accrual happens at end of month)
        let currentDate = new Date(today);
        while (currentDate <= futureDate) {
            // Check if we've reached the end of the month
            if (currentDate.getDate() === new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()) {
                // Add monthly accrual at the end of the month
                totalPTO += monthlyAccrual;
            }
            
            // Move to next day
            currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
        }

        // Subtract planned time off
        const plannedDays = document.querySelectorAll('.planned-day-item');
        plannedDays.forEach(day => {
            const startDateInput = day.querySelector('.date-picker[data-datepicker="start"]').value;
            const endDateInput = day.querySelector('.date-picker[data-datepicker="end"]').value;
            const singleDayCheckbox = day.querySelector('.single-day-checkbox');
            
            if (startDateInput) {
                const startDate = new Date(startDateInput);
                
                // If it's a single day, only count one day
                if (singleDayCheckbox.checked) {
                    if (startDate <= futureDate) {
                        totalPTO -= 8; // 8 hours for a single day
                    }
                } else if (endDateInput) {
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
