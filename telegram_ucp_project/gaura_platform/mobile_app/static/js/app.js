// Tab Switching Logic
const tabBuyer = document.getElementById('tab-buyer');
const tabSeller = document.getElementById('tab-seller');
const viewBuyer = document.getElementById('view-buyer');
const viewSeller = document.getElementById('view-seller');

tabBuyer.onclick = () => {
    tabBuyer.classList.add('active');
    tabSeller.classList.remove('active');
    viewBuyer.classList.remove('hidden');
    viewSeller.classList.add('hidden');
};

tabSeller.onclick = () => {
    tabSeller.classList.add('active');
    tabBuyer.classList.remove('active');
    viewSeller.classList.remove('hidden');
    viewBuyer.classList.add('hidden');
};

// Search Logic
const searchInput = document.getElementById('market-search');
const productFeed = document.getElementById('product-feed');

searchInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value;
        const res = await fetch(`/market_search?q=${query}`);
        const items = await res.json();

        renderProducts(items);
    }
});

function renderProducts(items) {
    if (items.length === 0) {
        productFeed.innerHTML = '<div class="empty-state">No items found on the network.</div>';
        return;
    }

    productFeed.innerHTML = items.map(item => `
        <div class="product-item glass" onclick="viewDetails('${item.node_id}', '${item.id}')">
            <div class="img-container">
                ${item.ai_generated_image_url ? `<img src="${item.ai_generated_image_url}" alt="${item.name}">` : '<div class="placeholder-img">📦</div>'}
            </div>
            <h4>${item.name}</h4>
            <div class="price">$${item.base_price}</div>
        </div>
    `).join('');
}

// Seller Upload Logic
const uploadForm = document.getElementById('upload-form');
const processingOverlay = document.getElementById('processing-overlay');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

dropZone.onclick = () => fileInput.click();

uploadForm.onsubmit = async (e) => {
    e.preventDefault();
    processingOverlay.classList.remove('hidden');

    const formData = new FormData(uploadForm);

    try {
        const res = await fetch('/upload_product', {
            method: 'POST',
            body: formData
        });
        const result = await res.json();

        if (result.status === 'success') {
            alert('Gaura AI: Product indexed and reports generated locally!');
            uploadForm.reset();
        }
    } catch (err) {
        alert('Processing failed. Ensure backend nodes are running.');
    } finally {
        processingOverlay.classList.add('hidden');
    }
};

// Details Modal Logic
const modal = document.getElementById('modal-details');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close-btn');

closeBtn.onclick = () => modal.classList.add('hidden');

async function viewDetails(nodeId, productId) {
    modal.classList.remove('hidden');
    modalBody.innerHTML = '<div class="loading">⏳ Relaying to Mobile Node...</div>';

    try {
        const res = await fetch(`/product_details/${nodeId}/${productId}`);
        const result = await res.json();

        if (result.status === 'success' || result.specs) {
            const data = result.data || result;
            const specs = data.specs || data;

            modalBody.innerHTML = `
                <div class="report-view">
                    <h3>Technical AI Report</h3>
                    <div class="tag">Grade A Verified</div>
                    <pre>${JSON.stringify(specs.technical_specs, null, 2)}</pre>
                    <p class="description">${specs.marketing_description || 'Verified via Gaura Edge.'}</p>
                    <button class="premium-btn">Purchase via Node</button>
                </div>
            `;
        } else {
            modalBody.innerHTML = `<div>Error fetching details from node: ${result.message}</div>`;
        }
    } catch (err) {
        modalBody.innerHTML = `<div>Could not reach the target phone node.</div>`;
    }
}
