// ./registry/registryUtilities.js
// Import registry for utility functions
// utilities that don't need permission metadata

export const utilityRegistry = {
    // Sorting utilities
    'sort-list': () => import('../utils/sortMyList.js'),
    'sort-advanced': () => import('../utils/sortAdvanced.js'),
    
    // Pagination utilities
    'paginate-list': () => import('../utils/paginate.js'),
    'paginate-advanced': () => import('../utils/paginateAdvanced.js'),
    
    // Data analysis utilities
    'analyze-data': () => import('../utils/analyzeData.js'),
    'statistics': () => import('../utils/statistics.js'),
    
    // remember utilities
    'remember-this': () => import('../utils/remeberThis.js'),
    
    
    // Helper function to load and execute a utility
    async execute(utilityName, panel, query) {
        if (!this[utilityName]) {
            throw new Error(`Utility '${utilityName}' not found in registry`);
        }
        
        try {
            const module = await this[utilityName]();
            // Most utilities will export a 'render' function as default or named export
            const handler = module.render || module.default || module;
            
            if (typeof handler !== 'function') {
                throw new Error(`Utility '${utilityName}' does not export a function`);
            }
            
            return await handler(panel, query);
        } catch (error) {
            console.error(`Error executing utility '${utilityName}':`, error);
            throw error;
        }
    },
    
    // Helper function to load utility without executing
    async load(utilityName) {
        if (!this[utilityName]) {
            throw new Error(`Utility '${utilityName}' not found in registry`);
        }
        
        try {
            return await this[utilityName]();
        } catch (error) {
            console.error(`Error loading utility '${utilityName}':`, error);
            throw error;
        }
    }
};