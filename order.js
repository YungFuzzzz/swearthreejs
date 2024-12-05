document.getElementById('buy-btn').addEventListener('click', async () => {
    // Get selected values from inputs
    const color = document.getElementById('color-picker').value;
    const material = document.getElementById('material-selector').value;
    const size = parseInt(document.getElementById('size-selector').value, 10);

    // Validate inputs
    if (!color || !material || !size) {
        alert('Please make a selection for all fields.');
        return;
    }

    // Create the order data object
    const orderData = {
        color,
        material,
        size,
        status: 'pending',
    };

    try {
        // Send order data to the backend API
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

        const result = await response.json();
        console.log('Order submitted successfully:', result);

        // Optional: Update Three.js scene with order data
        updateSceneWithOrderData(orderData);
    } catch (error) {
        console.error('Error:', error.message);
        alert('Failed to submit order. Please try again.');
    }
});

function updateSceneWithOrderData(order) {
    // Check if the shoe is available globally (from window.shoe)
    console.log('Checking if shoe is available...');
    const shoe = window.shoe;  // Access the global shoe object
    const shoeLoaded = window.shoeLoaded;  // Access the global shoeLoaded variable

    if (shoe && shoeLoaded) {
        console.log('Shoe is available, updating...');

        shoe.material.color.set(order.color); // Set color
        console.log('Color updated to:', order.color);

        // Apply texture based on material (assuming textures are preloaded)
        const textureLoader = new THREE.TextureLoader();
        const texturePath = `/assets/materials/${order.material}/${order.material}_diffuse.jpg`;

        // Ensure the texture path is correct and the texture is applied
        console.log('Loading texture from:', texturePath);
        shoe.material.map = textureLoader.load(texturePath, () => {
            console.log('Texture loaded successfully!');
        });

        shoe.material.needsUpdate = true;

        // Scale shoe based on size
        shoe.scale.set(order.size / 40, order.size / 40, order.size / 40); // Scale shoe based on size
        console.log('Shoe scaled to:', order.size);
    } else {
        console.error('Shoe is not available or not loaded yet.');
    }
}
