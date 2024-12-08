document.getElementById('buy-btn').addEventListener('click', async () => {
    // Get the selected values from the input fields (color, material, size)
    const color = document.getElementById('color-picker').value;
    const material = document.getElementById('material-selector').value;
    const size = parseInt(document.getElementById('size-selector').value, 10);

    // Get the color and material for each component from the 3D model
    const lacesColor = getComponentColor("laces");
    const lacesMaterial = getComponentMaterial("laces");  // Get the material for laces

    const soleColor = getComponentColor("sole_bottom");
    const soleMaterial = getComponentMaterial("sole_bottom");  // Get the material for sole

    const insideColor = getComponentColor("inside");
    const insideMaterial = getComponentMaterial("inside");  // Get the material for inside

    const outside1Color = getComponentColor("outside_1");
    const outside1Material = getComponentMaterial("outside_1");  // Get the material for outside_1

    const outside2Color = getComponentColor("outside_2");
    const outside2Material = getComponentMaterial("outside_2");  // Get the material for outside_2

    const outside3Color = getComponentColor("outside_3");
    const outside3Material = getComponentMaterial("outside_3");  // Get the material for outside_3

    // Log the colors and materials for debugging (optional)
    console.log('Component Details:');
    console.log('Laces Color:', lacesColor, 'Laces Material:', lacesMaterial);
    console.log('Sole Color:', soleColor, 'Sole Material:', soleMaterial);
    console.log('Inside Color:', insideColor, 'Inside Material:', insideMaterial);
    console.log('Outside 1 Color:', outside1Color, 'Outside 1 Material:', outside1Material);
    console.log('Outside 2 Color:', outside2Color, 'Outside 2 Material:', outside2Material);
    console.log('Outside 3 Color:', outside3Color, 'Outside 3 Material:', outside3Material);

    if (!color || !material || !size) {
        alert('Please make a selection for all fields.');
        return;
    }

    const orderData = {
        size,
        status: 'pending', // Default status, can be updated later
        components: {
            laces: {
                color: lacesColor,
                material: lacesMaterial || "leather",  // Default material if not assigned
            },
            sole: {
                color: soleColor,
                material: soleMaterial || "leather",  // Default material if not assigned
            },
            inside: {
                color: insideColor,
                material: insideMaterial || "leather",  // Default material if not assigned
            },
            outside: {
                part1: {
                    color: outside1Color,
                    material: outside1Material || "leather",  // Default material if not assigned
                },
                part2: {
                    color: outside2Color,
                    material: outside2Material || "leather",  // Default material if not assigned
                },
                part3: {
                    color: outside3Color,
                    material: outside3Material || "leather",  // Default material if not assigned
                },
            },
        },
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

// Function to get the color of a specific component from the 3D model
function getComponentColor(component) {
    const object = shoe.getObjectByName(component);
    if (object) {
        const colorHex = object.material.color.getHexString();
        console.log(`${component} Color:`, colorHex);  // Log color for debugging
        return colorHex;
    }
    return "#ffffff"; // Default color
}

// Function to get the material of a specific component from the 3D model
function getComponentMaterial(component) {
    const object = shoe.getObjectByName(component);
    if (object && object.material) {
        // Access the material's name directly
        const materialName = object.material.name;  // Get the name of the material
        console.log(`${component} Material:`, materialName);  // Log material name for debugging
        return materialName || "default";  // Return material name directly or "default" if not assigned
    }
    return "default";  // Default material if component not found
}
