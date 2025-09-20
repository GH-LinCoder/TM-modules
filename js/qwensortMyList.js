// ./utils/sortMyList.js
/*
 * Pure sorting utility - returns sorted array, no side effects
 * Parameters in query object:
 * 1. listToBeSorted: array of objects from database
 * 2. columnName: name of the column to sort by
 * 3. columnType: 'numerical' or 'string' 
 * 4. sortOrder: 'smallest' or 'largest' (for numerical: smallest=ascending, largest=descending)
 *               (for strings: smallest=a-z, largest=z-a)
 */

export async function render(panel, query = {}) {
    const {
        listToBeSorted,
        columnName,
        columnType,
        sortOrder
    } = query;

    // Validate presence and types
    if (!Array.isArray(listToBeSorted)) {
        throw new Error("Invalid or missing 'listToBeSorted': must be an array");
    }

    if (typeof columnName !== 'string' || !columnName.trim()) {
        throw new Error("Invalid or missing 'columnName': must be a non-empty string");
    }

    if (!['numerical', 'string'].includes(columnType)) {
        throw new Error("Invalid 'columnType': must be 'numerical' or 'string'");
    }

    if (!['smallest', 'largest'].includes(sortOrder)) {
        throw new Error("Invalid 'sortOrder': must be 'smallest' or 'largest'");
    }

    // Check if at least one object has the specified column
    const hasColumn = listToBeSorted.some(item => 
        item && typeof item === 'object' && columnName in item
    );
    
    if (!hasColumn && listToBeSorted.length > 0) {
        console.warn(`Column '${columnName}' not found in any objects`);
    }

    let sorter;
    if (columnType === 'numerical') {
        sorter = new SortNumerical(columnName, sortOrder);
    } else {
        sorter = new SortString(columnName, sortOrder);
    }

    const sortedList = sorter.sort(listToBeSorted);
    return sortedList;
}

class SortNumerical {
    constructor(columnName, sortOrder) {
        this.columnName = columnName;
        this.sortOrder = sortOrder;
    }

    sort(data) {
        return [...data].sort((a, b) => {
            // Handle null/undefined values
            const aVal = a[this.columnName] != null ? Number(a[this.columnName]) : 0;
            const bVal = b[this.columnName] != null ? Number(b[this.columnName]) : 0;
            
            // Check for NaN
            const aNum = isNaN(aVal) ? 0 : aVal;
            const bNum = isNaN(bVal) ? 0 : bVal;
            
            return this.sortOrder === 'smallest' ? aNum - bNum : bNum - aNum;
        });
    }
}

class SortString {
    constructor(columnName, sortOrder) {
        this.columnName = columnName;
        this.sortOrder = sortOrder;
    }

    sort(data) {
        return [...data].sort((a, b) => {
            const aVal = String(a[this.columnName] ?? '').toLowerCase();
            const bVal = String(b[this.columnName] ?? '').toLowerCase();
            const comparison = aVal.localeCompare(bVal);
            return this.sortOrder === 'smallest' ? comparison : -comparison;
        });
    }
}

// Additional utility: Get default sort configuration for common use cases
export function getDefaultSortConfig(tableName) {
    const defaults = {
        'approfile': { columnName: 'name', columnType: 'string', sortOrder: 'smallest' },
        'tasks': { columnName: 'created_at', columnType: 'numerical', sortOrder: 'largest' },
        'assignments': { columnName: 'due_date', columnType: 'numerical', sortOrder: 'smallest' }
    };
    return defaults[tableName] || { columnName: 'id', columnType: 'numerical', sortOrder: 'largest' };
}