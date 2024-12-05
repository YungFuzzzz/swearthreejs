import { scene } from './main.js';

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
    // Example: Update the 3D shoe with the selected properties
    const shoe = scene.getObjectByName('shoe');
    if (shoe) {
        shoe.material.color.set(order.color); // Set color
        // Apply texture based on material (assuming textures are preloaded)
        const textureLoader = new THREE.TextureLoader();
        const texturePath = `/assets/materials/${order.material}/${order.material}_diffuse.jpg`;
        shoe.material.map = textureLoader.load(texturePath);
        shoe.material.needsUpdate = true;
        shoe.scale.set(order.size / 40, order.size / 40, order.size / 40); // Scale shoe based on size
    }
}
