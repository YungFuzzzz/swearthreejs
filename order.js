// Add event listener to the order button
document.getElementById('buy-btn').addEventListener('click', async () => {
    // Get the selected values from the input fields
    const color = document.getElementById('color-picker').value;
    const material = document.getElementById('material-selector').value;
    const size = parseInt(document.getElementById('size-selector').value, 10);

    // Validate inputs
    if (!color || !material || !size) {
        alert('Please make a selection for all fields.');
        return;
    }

    // Prepare the order data
    const orderData = {
        color,
        material,
        size,
        status: 'pending', // Default status, can be updated later
    };

    try {
        // Send the order data to the backend API
        const response = await fetch('https://swear-api-uhq5.onrender.com/api/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            throw new Error('Failed to submit order');
        }

        // Parse the response from the API
        const result = await response.json();
        console.log('Order submitted successfully:', result);

        // Optionally, display a confirmation message or update the UI
        alert('Your order has been submitted successfully!');

    } catch (error) {
        // Handle any errors that occur during the fetch
        console.error('Error:', error.message);
        alert('Failed to submit order. Please try again.');
    }
});
