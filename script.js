// Electron API integration
let electronAPI = null;
if (window.electronAPI) {
    electronAPI = window.electronAPI;
    
    // Listen for navigation commands from menu
    electronAPI.onNavigate((event, sectionId) => {
        showSection(sectionId);
    });
    
    // Listen for export/import commands
    electronAPI.onExportProgress((event, filePath) => {
        exportProgressToFile(filePath);
    });
    
    electronAPI.onImportProgress((event, data) => {
        importProgressFromData(data);
    });
}

// Show selected section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionId) {
            item.classList.add('active');
        }
    });
    
    // Update progress bar
    updateProgressBar(sectionId);
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Initialize navigation
function initializeNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            showSection(item.dataset.section);
        });
    });
}

// Initialize accordions
function initializeAccordions() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const accordion = header.parentElement;
            accordion.classList.toggle('active');
        });
    });
}

// Initialize checklist
function initializeChecklist() {
    document.querySelectorAll('.checklist li').forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('checked');
            saveChecklistState();
        });
    });
}

// Save checklist state to localStorage
function saveChecklistState() {
    const checkedItems = [];
    document.querySelectorAll('.checklist li.checked').forEach(item => {
        checkedItems.push(item.textContent.trim());
    });
    localStorage.setItem('yolotech-checklist', JSON.stringify(checkedItems));
}

// Load checklist state from localStorage
function loadChecklistState() {
    const checkedItems = JSON.parse(localStorage.getItem('yolotech-checklist')) || [];
    document.querySelectorAll('.checklist li').forEach(item => {
        if (checkedItems.includes(item.textContent.trim())) {
            item.classList.add('checked');
        }
    });
}

// Update progress bar based on section
function updateProgressBar(sectionId) {
    const progressMap = {
        'welcome': '0%',
        'getting-started': '10%',
        'inside-yolo': '25%',
        'team-dynamics': '50%',
        'onedrive': '75%',
        'outlook': '100%',
        'faq': '100%',
        'contacts': '100%',
        'checklist': '100%'
    };
    
    const sections = ['inside-yolo', 'team-dynamics', 'onedrive', 'outlook'];
    if (sections.includes(sectionId)) {
        document.querySelectorAll('.progress-fill').forEach(fill => {
            fill.style.width = progressMap[sectionId];
        });
    }
}

// Simple search functionality
function initializeSearch() {
    const searchInput = document.getElementById('guideSearch');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.toLowerCase();
                let found = false;
                
                document.querySelectorAll('.section').forEach(section => {
                    const content = section.textContent.toLowerCase();
                    if (content.includes(searchTerm)) {
                        showSection(section.id);
                        found = true;
                        return;
                    }
                });
                
                if (!found) {
                    showNotification('No results found for: ' + searchTerm, 'info');
                }
            }
        });
    }
}

// Enhanced export function for Electron
async function exportProgressToFile(filePath) {
    try {
        const progressData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            checklist: getChecklistState(),
            sections: getSectionProgress(),
            userPreferences: getUserPreferences()
        };
        
        const jsonData = JSON.stringify(progressData, null, 2);
        
        if (electronAPI) {
            const result = await electronAPI.saveFile(filePath, jsonData);
            if (result.success) {
                showNotification('Progress exported successfully!', 'success');
            } else {
                showNotification('Export failed: ' + result.error, 'error');
            }
        } else {
            // Fallback for browser version
            downloadFile(jsonData, 'onboarding-progress.json');
        }
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Export failed!', 'error');
    }
}

// Browser fallback for export
function downloadFile(content, filename) {
    const blob = new Blob([content], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Standard export function (for browser use)
function exportProgress() {
    try {
        const progressData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            checklist: getChecklistState(),
            sections: getSectionProgress(),
            userPreferences: getUserPreferences()
        };
        
        const jsonData = JSON.stringify(progressData, null, 2);
        downloadFile(jsonData, 'onboarding-progress.json');
        showNotification('Progress exported successfully!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Export failed!', 'error');
    }
}

// Enhanced import function
function importProgressFromData(data) {
    try {
        const progressData = JSON.parse(data);
        
        // Restore checklist state
        if (progressData.checklist) {
            restoreChecklistState(progressData.checklist);
        }
        
        // Restore section progress
        if (progressData.sections) {
            restoreSectionProgress(progressData.sections);
        }
        
        showNotification('Progress imported successfully!', 'success');
    } catch (error) {
        console.error('Import error:', error);
        showNotification('Import failed! Invalid file format.', 'error');
    }
}

// Utility functions
function getChecklistState() {
    const checkedItems = [];
    document.querySelectorAll('.checklist li.checked').forEach(item => {
        checkedItems.push(item.textContent.trim());
    });
    return checkedItems;
}

function getSectionProgress() {
    const progress = {};
    document.querySelectorAll('.nav-item').forEach(item => {
        const section = item.dataset.section;
        if (section) {
            progress[section] = {
                visited: item.classList.contains('visited') || false,
                completed: item.classList.contains('completed') || false
            };
        }
    });
    return progress;
}

function getUserPreferences() {
    return {
        currentSection: document.querySelector('.nav-item.active')?.dataset.section || 'welcome',
        theme: 'default',
        lastVisited: new Date().toISOString()
    };
}

function restoreChecklistState(checkedItems) {
    // Clear all checked items first
    document.querySelectorAll('.checklist li').forEach(item => {
        item.classList.remove('checked');
    });
    
    // Restore checked items
    document.querySelectorAll('.checklist li').forEach(item => {
        if (checkedItems.includes(item.textContent.trim())) {
            item.classList.add('checked');
        }
    });
}

function restoreSectionProgress(sections) {
    Object.keys(sections).forEach(sectionId => {
        const navItem = document.querySelector(`[data-section="${sectionId}"]`);
        if (navItem && sections[sectionId]) {
            if (sections[sectionId].visited) {
                navItem.classList.add('visited');
            }
            if (sections[sectionId].completed) {
                navItem.classList.add('completed');
            }
        }
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeNavigation();
    initializeAccordions();
    initializeChecklist();
    initializeSearch();
    loadChecklistState();
    
    // App-specific initialization
    console.log('YoloTech New Hire Guide loaded');
    if (electronAPI) {
        console.log('Running in Electron app mode');
    }
});
