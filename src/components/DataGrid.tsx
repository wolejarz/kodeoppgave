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
  columnNames: string[] = ["Station_id", "Name", "Address", "Available locks", "Available bikes"];

  componentDidMount() {
    const url = "https://gbfs.urbansharing.com/oslobysykkel.no/station_information.json";
    fetch(url)
      .then(response => response.json())
      .then(dataAsJson => {
        this.stationInformation = dataAsJson.data.stations.map((station: any) => {
          return {
            Station_id: station.station_id,
            Name: station.name,
            Address: station.address
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
    console.log("fetchStationStatus");
    const url = "https://gbfs.urbansharing.com/oslobysykkel.no/station_status.json";
    fetch(url)
      .then(response => response.json())
      .then(dataAsJson => {
        this.stationStatus = dataAsJson.data.stations.map((station: any) => {
          return {
            Station_id: station.station_id,
            "Available locks": station.num_docks_available,
            "Available bikes": station.num_bikes_available
          };
        });
        this.stationStatus.forEach(station => {
          const stationInformation = this.stationInformation.find(
            stationInformation => stationInformation.Station_id === station.Station_id
          );
          if (stationInformation) {
            stationInformation["Available locks"] = station["Available locks"];
            stationInformation["Available bikes"] = station["Available bikes"];
          }
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
            <tr>
              {this.columnNames.map((column, index) => (
                <th>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {Object.keys(row).map((column, index) => (
                  <td key={index}>{row[column]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }
}

export default DataGrid;
