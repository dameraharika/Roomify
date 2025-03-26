async function handleFormActions() {
    const imageInput = document.getElementById('imageUpload').files[0];
    const prompt = document.getElementById('promptInput').value;
    const roomType = document.getElementById('room-type').value;
    const costRange = document.getElementById('cost-range').value;

    if (!roomType || !costRange) {
        alert('Please select both room type and cost range.');
        return;
    }

    try {
        // Fetch items based on room type and cost range
        const responseItems = await fetch(`http://localhost:5000/items?room=${encodeURIComponent(roomType)}&range=${encodeURIComponent(costRange)}`);
        
        if (!responseItems.ok) {
            throw new Error('Network response was not ok: ' + responseItems.statusText);
        }

        const items = await responseItems.json();
        const itemsBody = document.getElementById('items-body');
        itemsBody.innerHTML = '';

        if (items.length === 0) {
            itemsBody.innerHTML = '<tr><td colspan="3">No items found.</td></tr>';
        } else {
            items.forEach(item => {
                const row = document.createElement('tr');
                const itemNameCell = document.createElement('td');
                const priceRangeCell = document.createElement('td');
                const linkCell = document.createElement('td');

                itemNameCell.textContent = item.name;
                priceRangeCell.textContent = `₹${item.price_min} - ₹${item.price_max}`;

                // Create a link for the item
                const link = document.createElement('a');
                link.href = item.link;
                link.textContent = 'View Item';
                link.target = '_blank';
                linkCell.appendChild(link);

                row.appendChild(itemNameCell);
                row.appendChild(priceRangeCell);
                row.appendChild(linkCell);
                itemsBody.appendChild(row);
            });
        }

        document.getElementById('items-table').style.display = 'table';

        // Generate image if an image is uploaded and prompt is provided
        if (imageInput && prompt) {
            const formData = new FormData();
            formData.append('image', imageInput);
            formData.append('prompt', prompt);

            // Add additional parameters if necessary
            formData.append('control_strength', '0.7');
            formData.append('seed', '0');
            formData.append('output_format', 'webp');

            const responseImage = await fetch('/generate', {
                method: 'POST',
                body: formData
            });

            if (responseImage.ok) {
                const blob = await responseImage.blob();
                const imageUrl = URL.createObjectURL(blob);
                document.getElementById('resultImage').src = imageUrl;
            } else {
                alert('Image generation failed.');
            }
        } else {
            alert('Please upload an image and enter a prompt.');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please check the console for more details.');
    }
}
