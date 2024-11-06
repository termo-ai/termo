// app/static/js/ui/sidebar.js

const directoryTree = document.getElementById('directory-tree');
const expandedFolders = new Set();

function createTreeItem(name, isFolder = false, path = '', level = 0) {
    const indentation = 'ml-' + (level * 4);
    return `
        <div class="directory-item ${indentation}" data-path="${path}">
            <div class="flex items-center py-1 px-2 hover:bg-gray-700 rounded cursor-pointer">
                ${isFolder ?
                    `<i class="fas fa-chevron-right text-gray-500 mr-1 toggle-icon"></i>` :
                    `<span class="mr-4"></span>`
                }
                <i class="fas ${isFolder ? 'fa-folder text-yellow-500' : 'fa-file text-gray-400'} mr-2"></i>
                <span>${name}</span>
            </div>
            ${isFolder ? '<div class="subfolder hidden"></div>' : ''}
        </div>
    `;
}

async function fetchDirectory(path = '') {
    try {
        const response = await fetch(`/api/directory?path=${encodeURIComponent(path)}`);
        if (!response.ok) throw new Error('Failed to fetch directory structure');
        return await response.json();
    } catch (error) {
        console.error('Error fetching directory:', error);
        return [];
    }
}

async function loadSubfolder(folderElement, path) {
    const subfolderContainer = folderElement.querySelector('.subfolder');
    if (!subfolderContainer) return;

    try {
        const items = await fetchDirectory(path);
        const content = items.map(item =>
            createTreeItem(
                item.name,
                item.isFolder,
                item.path,
                (path.match(/\//g) || []).length + 1
            )
        ).join('');

        subfolderContainer.innerHTML = content;
        setupFolderListeners(subfolderContainer);
    } catch (error) {
        console.error('Error loading subfolder:', error);
        subfolderContainer.innerHTML = '<div class="text-red-500 px-2">Error loading folder contents</div>';
    }
}

function setupFolderListeners(container) {
    container.querySelectorAll('.directory-item').forEach(item => {
        const toggleIcon = item.querySelector('.toggle-icon');
        if (!toggleIcon) return; // Skip if not a folder

        item.querySelector('.flex').addEventListener('click', async () => {
            const path = item.dataset.path;
            const subfolderContainer = item.querySelector('.subfolder');
            const isExpanded = expandedFolders.has(path);

            if (isExpanded) {
                expandedFolders.delete(path);
                toggleIcon.classList.remove('fa-chevron-down');
                toggleIcon.classList.add('fa-chevron-right');
                subfolderContainer.classList.add('hidden');
            } else {
                expandedFolders.add(path);
                toggleIcon.classList.remove('fa-chevron-right');
                toggleIcon.classList.add('fa-chevron-down');
                subfolderContainer.classList.remove('hidden');

                // Load contents if not already loaded
                if (!subfolderContainer.children.length) {
                    await loadSubfolder(item, path);
                }
            }
        });
    });
}

// Initial load of root directory
async function initializeDirectoryTree() {
    try {
        directoryTree.innerHTML = '<div class="text-gray-500 p-2">Loading...</div>';
        const items = await fetchDirectory();
        const content = items.map(item =>
            createTreeItem(item.name, item.isFolder, item.path, 0)
        ).join('');

        directoryTree.innerHTML = content;
        setupFolderListeners(directoryTree);
    } catch (error) {
        console.error('Error initializing directory tree:', error);
        directoryTree.innerHTML = '<div class="text-red-500 p-2">Error loading directory structure</div>';
    }
}

// Initialize directory tree when the page loads
document.addEventListener('DOMContentLoaded', initializeDirectoryTree);