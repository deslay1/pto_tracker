document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculate-btn');
    const currentPTOInput = document.getElementById('current-pto');
    const monthlyAccrualInput = document.getElementById('monthly-accrual');
    const futureDateInput = document.getElementById('future-date');
    const resultElement = document.getElementById('pto-result');

    calculateBtn.addEventListener('click', calculatePTO);

    function calculatePTO() {
        const currentPTO = parseFloat(currentPTOInput.value) || 0;
        const monthlyAccrual = parseFloat(monthlyAccrualInput.value) || 0;
        const futureDate = new Date(futureDateInput.value);
        const today = new Date();

        // Calculate months between today and future date
        const months = (futureDate.getFullYear() - today.getFullYear()) * 12 + 
                      (futureDate.getMonth() - today.getMonth());

        // Calculate total PTO
        const totalPTO = currentPTO + (monthlyAccrual * months);

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
