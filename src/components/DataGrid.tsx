import React from "react";
// import TableBody from "./TableBody";
// import TableHead from "./TableHead";

interface ColumnDef {
  name: string;
  dataType: "text" | "number";
}

class Table extends React.Component {
  state = {
    data: new Array<any>(),
    TTL: 10
  };

  columnDefinitions: ColumnDef[] = [];

  componentDidMount() {
    const url = "http://" + document.location.host + "/Dataset.csv";
    fetch(url)
      .then(response => response.text())
      .then(text => {
        const data = text.split("\n").map(row => {
          const cells = row.split(",");
          return {
            seriesId: cells[0],
            date: cells[1],
            screen: cells[2],
            views: cells[3]
          };
        });
        const columnNames = Object.keys(data[0]);
        this.columnDefinitions = columnNames.map(columnName => {
          return {
            name: columnName,
            dataType: columnName === "views" ? "number" : "text"
          };
        });
        const dataSet = data.slice(1, data.length);
        this.setState({ data: dataSet });
        const filters = this.columnDefinitions.map(column => {
          return {
            minValue: "",
            maxValue: ""
          };
        });
        this.setState({ filters: filters });
      });
  }

  private getSortedAndFileredData = () => {
    const { data, sortColumn, sortDirection, filters } = this.state;
    const sortColumnType = this.columnDefinitions.find(column => column.name === sortColumn)?.dataType;
    const sortDirectionAsNegator = sortDirection === "asc" ? 1 : -1;
    const sortedData = data
      .sort((a, b) => comparator(a[sortColumn], b[sortColumn], sortColumnType) * sortDirectionAsNegator)
      .filter(dataRow => this.dataRowIsFiltered(dataRow, filters));
    return sortedData;
  };

  private dataRowIsFiltered = (dataRow: any, filters: any[]) => {
    let isFiltered = true;
    for (let i = 0; i < filters.length; i++) {
      const columnType = this.columnDefinitions[i].dataType;
      const columnName = this.columnDefinitions[i].name;
      const value = dataRow[columnName];
      if (filters[i].minValue !== "" && comparator(filters[i].minValue, value, columnType) > 0) {
        isFiltered = false;
      }
      if (filters[i].maxValue !== "" && comparator(filters[i].maxValue, value, columnType) < 0) {
        isFiltered = false;
      }
    }
    return isFiltered;
  };

  private handleSortChange = (columnName: string) => {
    if (columnName === this.state.sortColumn) {
      const direction = this.state.sortDirection === "asc" ? "desc" : "asc";
      this.setState({ sortDirection: direction });
    } else {
      this.setState({ sortColumn: columnName });
    }
  };

  private handleFilterChange = (column: string, valueMin: string, valueMax: string) => {
    const copyOfFilters = [...this.state.filters];
    const columnNumber = this.columnDefinitions.findIndex(columnDefinition => columnDefinition.name === column);
    copyOfFilters[columnNumber] = { minValue: valueMin, maxValue: valueMax };
    this.setState({ filters: copyOfFilters });
  };

  render() {
    const { filters, sortColumn, sortDirection } = this.state;
    return (
      <>
        <table>
          <caption>NRK PROGRAMMER</caption>
          <TableHead
            columns={this.columnDefinitions}
            filters={filters}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSortChange={this.handleSortChange}
            onFilterChange={this.handleFilterChange}
          />
          <TableBody data={this.getSortedAndFileredData()} columns={this.columnDefinitions} />
        </table>
      </>
    );
  }
}

export default Table;
