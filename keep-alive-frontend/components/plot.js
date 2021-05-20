import React, { useEffect, useState } from "react";
import { ResponsiveLine } from "@nivo/line";

export default function PlotMon(data) {
  if (!data || JSON.stringify(data.data) === JSON.stringify({})) {
    return <div>No data to show</div>;
  }

  let [plotData, setPlotData] = useState(null);
  useEffect(() => {
    let data_temp = data.data.map((d) => {
      return { x: d.timestamp.split("T")[1].split(".")[0], y: d.cpu };
    });
    setPlotData([{ id: "cpu", color: "hsl(38, 70%, 50%)", data: data_temp }]);
  }, [data]);

  return (
    <div style={{ height: "640px" }}>
      <ResponsiveLine
        data={plotData}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
          stacked: true,
          reverse: false,
        }}
        yFormat=" >-.2f"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          orient: "bottom",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Timestamp",
          legendOffset: 36,
          legendPosition: "middle",
        }}
        axisLeft={{
          orient: "left",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "percent",
          legendOffset: -40,
          legendPosition: "middle",
        }}
        pointSize={10}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabelYOffset={-12}
        useMesh={true}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: "left-to-right",
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: "circle",
            symbolBorderColor: "rgba(0, 0, 0, .5)",
            effects: [
              {
                on: "hover",
                style: {
                  itemBackground: "rgba(0, 0, 0, .03)",
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </div>
  );
}
