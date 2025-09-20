// ./js/sortMyList.js

/*
Inside query there has to be an 

1) object which contains an array list from the database which is an array of objects.
2) The name of one of the columns which is hat the sort will be based on
3) A definition whther this column contains strings or numbers (sort_int & created_at are numbers)
4) The order for the sorting either smaller or larger  (newer is larger as newwer times are bigger than older times)
5)
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
  
    if (typeof columnName !== 'string') {
      throw new Error("Invalid or missing 'columnName': must be a string");
    }
  
    if (!['numerical', 'string'].includes(columnType)) {
      throw new Error("Invalid 'columnType': must be 'numerical' or 'string'");
    }
  
    if (!['smallest', 'largest'].includes(sortOrder)) {
      throw new Error("Invalid 'sortOrder': must be 'smallest' or 'largest'");
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
        const aVal = a[this.columnName] ?? 0;
        const bVal = b[this.columnName] ?? 0;
        return this.sortOrder === 'smallest' ? aVal - bVal : bVal - aVal;
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
        return this.sortOrder === 'smallest'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }
  }
  