import React from "react";
// import TableBody from "./TableBody";
// import TableHead from "./TableHead";

class DataGrid extends React.Component {
  state = {
    data: new Array<any>()
  };
  stationInformation: any[] = [];
  stationStatus: any[] = [];
  stationInformationTTL: number = 10;
  columnNames: string[] = ["Id", "Navn", "Tilgjengelige låser", "Ledige sykler"];

  componentDidMount() {
    const url = "https://gbfs.urbansharing.com/oslobysykkel.no/station_information.json";
    fetch(url)
      .then(response => response.json())
      .then(dataAsJson => {
        this.stationInformation = dataAsJson.data.stations.map((station: any) => {
          return {
            Id: station.station_id,
            Name: station.name
          };
        });
        this.stationInformationTTL = dataAsJson.ttl;
        this.stationInformation.forEach(station => {
          station["Available locks"] = 0;
          station["Available bikes"] = 0;
        });
        this.setState({ data: this.stationInformation });
        this.fetchStationStatus();
        setInterval(() => {
          this.fetchStationStatus();
        }, this.stationInformationTTL * 1000);
      });
  }

  fetchStationStatus() {
    const url = "https://gbfs.urbansharing.com/oslobysykkel.no/station_status.json";
    fetch(url)
      .then(response => response.json())
      .then(dataAsJson => {
        console.log("fetchStationStatus", dataAsJson);
        this.stationStatus = dataAsJson.data.stations.map((station: any) => {
          const stationIndex = this.stationInformation.findIndex(
            stationInformation => stationInformation.Id === station.station_id
          );
          if (stationIndex === -1) {
            return null;
          }
          this.stationInformation[stationIndex]["Available locks"] = station.num_docks_available;
          this.stationInformation[stationIndex]["Available bikes"] = station.num_bikes_available;
        });
        this.setState({ data: this.stationInformation });
      });
  }

  render() {
    const { data } = this.state;
    return (
      <>
        <table>
          <caption>OSLOBYSYKKEL</caption>
          <thead>
            <tr>{this.columnNames.map((column, index) => (column !== "Id" ? <th>{column}</th> : null))}</tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {Object.keys(row).map((column, index) => (column !== "Id" ? <td key={index}>{row[column]}</td> : null))}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }
}

export default DataGrid;
