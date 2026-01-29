// timeline.js - Main Application Logic

document.addEventListener('DOMContentLoaded', async () => {
    // Auth check is handled by guards.js synchronously before this,
    // but let's double check we have the user object for logic
    const user = Auth.getUser();
    if (!user) return; // Should have redirected

    // Elements
    const els = {
        feed: document.getElementById('timeline-feed'),
        loader: document.getElementById('loader'),
        empty: document.getElementById('empty-state'),
        addBtn: document.getElementById('add-btn'),
        logoutBtn: document.getElementById('logout-btn'),
        modal: document.getElementById('add-modal'),
        closeModals: document.querySelectorAll('.close-modal'),
        form: document.getElementById('add-form'),
        saveBtn: document.getElementById('save-btn'),
        dateInput: document.getElementById('entry-date')
    };

    // Set Default Date
    els.dateInput.valueAsDate = new Date();

    // Init Logic
    loadMemories();

    // Event Listeners
    els.addBtn.addEventListener('click', () => {
        els.modal.classList.add('open');
    });

    els.closeModals.forEach(btn => {
        btn.addEventListener('click', () => {
            els.modal.classList.remove('open');
            els.form.reset();
            els.dateInput.valueAsDate = new Date();
        });
    });

    els.logoutBtn.addEventListener('click', () => {
        Auth.logout();
    });

    els.form.addEventListener('submit', handleAddMemory);


    // --- Functions ---

    async function loadMemories() {
        els.loader.style.display = 'block';
        els.feed.style.display = 'none';
        els.empty.style.display = 'none';

        try {
            const memories = await API.getMemories();

            if (memories.length === 0) {
                els.loader.style.display = 'none';
                els.empty.style.display = 'block';
                return;
            }

            renderFeed(memories);
            els.loader.style.display = 'none';
            els.feed.style.display = 'flex';

        } catch (e) {
            console.error(e);
            alert("Failed to load memories. Please try again.");
            els.loader.style.display = 'none';
        }
    }

    function renderFeed(memories) {
        els.feed.innerHTML = '';

        memories.forEach(mem => {
            const card = document.createElement('div');
            card.className = 'memory-card';

            const dateStr = new Date(mem.date).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            card.innerHTML = `
                <img src="${mem.image_url}" class="memory-img" loading="lazy">
                <div class="memory-body">
                    <div class="memory-meta">
                        <span>${dateStr}</span>
                        ${mem.favorite ? '<i class="ph-fill ph-star" style="color: var(--accent);"></i>' : ''}
                    </div>
                    <h3 class="memory-title">${mem.title}</h3>
                    ${mem.note ? `<p class="memory-note">${mem.note}</p>` : ''}
                </div>
            `;
            els.feed.appendChild(card);
        });
    }

    async function handleAddMemory(e) {
        e.preventDefault();

        const file = document.getElementById('entry-file').files[0];
        const title = document.getElementById('entry-title').value;
        const date = document.getElementById('entry-date').value;
        const note = document.getElementById('entry-note').value;
        const favorite = document.getElementById('entry-favorite').checked;

        if (!file) return;

        // UI Loading State
        const originalText = els.saveBtn.textContent;
        els.saveBtn.textContent = 'Uploading...';
        els.saveBtn.disabled = true;

        try {
            // 1. Upload Image
            const imageUrl = await Images.upload(file);

            if (!imageUrl) throw new Error("Image upload failed");

            // 2. Save to Supabase
            els.saveBtn.textContent = 'Saving...';

            await API.addMemory({
                title,
                date,
                note,
                favorite,
                image_url: imageUrl
            });

            // 3. Success
            els.modal.classList.remove('open');
            els.form.reset();
            loadMemories(); // Refresh feed

        } catch (err) {
            console.error(err);
            alert("Error: " + err.message);
        } finally {
            els.saveBtn.textContent = originalText;
            els.saveBtn.disabled = false;
        }
    }
});
