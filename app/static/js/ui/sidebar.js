// app/static/js/ui/sidebar.js

const directoryTree = document.getElementById('directory-tree');
const expandedFolders = new Set();

function createFileUploader() {
    return `
        <div class="px-2 py-2">
            <form id="upload-form" class="relative">
                <label class="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-600 rounded cursor-pointer hover:bg-gray-700 transition-colors group">
                    <div class="flex items-center space-x-2">
                        <i class="fas fa-upload text-gray-400 group-hover:text-gray-300"></i>
                        <span class="text-gray-400 group-hover:text-gray-300">Upload file</span>
                    </div>
                    <input id="file-upload" type="file" class="hidden" />
                </label>
                <div id="upload-status" class="absolute inset-0 flex items-center justify-center bg-gray-800/90 rounded hidden">
                    <div class="flex items-center space-x-2 text-sm">
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span class="text-gray-300">Uploading...</span>
                    </div>
                </div>
            </form>
        </div>
    `;
}

function createEmptyState() {
    return `
        <div class="px-4 py-8 text-center">
            <i class="fas fa-folder-open text-gray-500 text-2xl mb-2"></i>
            <p class="text-sm text-gray-500">No files in data directory</p>
        </div>
    `;
}

function createTreeItem(name, isFolder = false, path = '', level = 0) {
    const indentation = 'ml-' + (level * 4);
    return `
        <div class="directory-item ${indentation}" data-path="${path}">
            <div class="flex items-center py-1 px-2 hover:bg-gray-700 rounded cursor-pointer text-sm">
                ${isFolder ?
                    `<i class="fas fa-chevron-right text-gray-500 mr-1 toggle-icon"></i>` :
                    `<span class="mr-4"></span>`
                }
                <i class="fas ${isFolder ? 'fa-folder text-yellow-500' : 'fa-file text-gray-400'} mr-2"></i>
                <span class="text-gray-300">${name}</span>
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
        // Get only the contents of this specific subfolder
        const items = await fetchDirectory(path);
        
        // Filter out the current folder from the results to prevent recursion
        const subfolderItems = items.filter(item => 
            item.path !== path && item.path.startsWith(path)
        );

        const content = subfolderItems.map(item => {
            // Calculate relative path level for proper indentation
            const pathDepth = item.path.split('/').length - path.split('/').length;
            return createTreeItem(
                item.name,
                item.isFolder,
                item.path,
                pathDepth
            );
        }).join('');

        subfolderContainer.innerHTML = content || '<div class="text-gray-500 px-4 py-2 text-sm">Empty folder</div>';
        setupFolderListeners(subfolderContainer);
    } catch (error) {
        console.error('Error loading subfolder:', error);
        subfolderContainer.innerHTML = '<div class="text-red-500 px-2 text-sm">Error loading folder contents</div>';
    }
}

function setupFolderListeners(container) {
    container.querySelectorAll('.directory-item').forEach(item => {
        const toggleIcon = item.querySelector('.toggle-icon');
        if (!toggleIcon) return;

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

                if (!subfolderContainer.children.length) {
                    await loadSubfolder(item, path);
                }
            }
        });
    });
}

function setupFileUploader() {
    const fileInput = document.getElementById('file-upload');
    const uploadStatus = document.getElementById('upload-status');
    const form = document.getElementById('upload-form');

    form.addEventListener('dragover', (e) => {
        e.preventDefault();
        form.classList.add('bg-gray-700');
    });

    form.addEventListener('dragleave', (e) => {
        e.preventDefault();
        form.classList.remove('bg-gray-700');
    });

    form.addEventListener('drop', (e) => {
        e.preventDefault();
        form.classList.remove('bg-gray-700');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileUpload(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
}

async function handleFileUpload(file) {
    const uploadStatus = document.getElementById('upload-status');
    const formData = new FormData();
    formData.append('file', file);

    try {
        uploadStatus.classList.remove('hidden');
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        await initializeDirectoryTree();

    } catch (error) {
        console.error('Error uploading file:', error);
        uploadStatus.innerHTML = `
            <div class="text-red-500 text-sm flex items-center justify-center space-x-2">
                <i class="fas fa-exclamation-circle"></i>
                <span>Upload failed</span>
            </div>
        `;
        
        setTimeout(() => {
            uploadStatus.classList.add('hidden');
        }, 3000);
    }
}

async function initializeDirectoryTree() {
    try {
        directoryTree.innerHTML = '<div class="text-gray-500 p-2 text-sm">Loading...</div>';
        const items = await fetchDirectory();
        
        let content = createFileUploader();
        
        if (items.length === 0) {
            content += createEmptyState();
        } else {
            content += items.map(item => 
                createTreeItem(item.name, item.isFolder, item.path, 0)
            ).join('');
        }
        
        directoryTree.innerHTML = content;
        setupFolderListeners(directoryTree);
        setupFileUploader();
    } catch (error) {
        console.error('Error initializing directory tree:', error);
        directoryTree.innerHTML = '<div class="text-red-500 p-2 text-sm">Error loading directory structure</div>';
    }
}

// Initialize directory tree when the page loads
document.addEventListener('DOMContentLoaded', initializeDirectoryTree);