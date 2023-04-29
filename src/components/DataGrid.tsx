import React from "react";
import { STATION_INFORMATION_URL, STATION_STATUS_URL } from "../utilities/constants";
import { fetchData } from "../utilities/DataFetching";

class DataGrid extends React.Component {
  state = {
    data: new Array<any>()
  };
  stationInformation: any[] = [];
  stationInformationTTL: number = 10;
  columnNames: string[] = ["Navn", "Tilgjengelige låser", "Ledige sykler"];

  componentDidMount() {
    fetchData(STATION_INFORMATION_URL, this.transformStationInformationData.bind(this)).then(() => {
      this.setState({ data: this.stationInformation });
      this.fetchStationStatus();
      setInterval(() => {
        this.fetchStationStatus();
      }, this.stationInformationTTL * 1000);
    });
  }

  private transformStationInformationData(stationInformationAsJSON: any) {
    this.stationInformationTTL = stationInformationAsJSON.ttl;
    this.stationInformation = stationInformationAsJSON.data.stations.map((station: any) => {
      return {
        Id: station.station_id,
        Name: station.name,
        "Available locks": 0,
        "Available bikes": 0
      };
    });
  }

  private fetchStationStatus() {
    fetchData(STATION_STATUS_URL, this.transformStationStatusData.bind(this));
  }

  private transformStationStatusData(stationStatusAsJSON: any) {
    stationStatusAsJSON.data.stations.forEach((station: any) => {
      const stationIndex = this.stationInformation.findIndex(
        stationInformation => stationInformation.Id === station.station_id
      );
      if (stationIndex === -1) {
        return;
      }
      this.stationInformation[stationIndex]["Available locks"] = station.num_docks_available;
      this.stationInformation[stationIndex]["Available bikes"] = station.num_bikes_available;
    });
    this.setState({ data: this.stationInformation });
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
                <th key={index}>{column}</th>
              ))}
            </tr>
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
