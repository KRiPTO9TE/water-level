"use client";
import { child, getDatabase, ref, onValue, DataSnapshot } from "firebase/database";
import { initializeApp } from "firebase/app";
import { useEffect, useState } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import moment from "moment";

type WaterLevelData = {
  id: string;
  distance: number;
  dateTime: string;
};

export default function Home() {
  const firebaseConfig = {
    databaseURL: "https://arduino-flood-alert-default-rtdb.asia-southeast1.firebasedatabase.app",
  };

  const app = initializeApp(firebaseConfig);
  const dbRef = ref(getDatabase(app));

  const [listData, setListData] = useState<WaterLevelData[]>([]);
  const [filteredData, setFilteredData] = useState<WaterLevelData[]>([]);
  const [currentHeight, setCurrentHeight] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    const handleDataUpdate = (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const list = snapshot.val();
        const updatedListData: WaterLevelData[] = [];
        for (const item in list) {
          updatedListData.push({
            id: item,
            distance: list[item].distance,
            dateTime: moment.unix(list[item].unixTimestamp).format("YYYY-MM-DD"),
          });
        }
        updatedListData.sort((a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        );
        setListData(updatedListData);
        setFilteredData(updatedListData); // Initialize filteredData
        setCurrentHeight(updatedListData[updatedListData.length - 1]?.distance || 0);
      } else {
        console.error("No data available");
      }
    };
    const waterLevelRef = child(dbRef, `water-level`);
    const unsubscribe = onValue(waterLevelRef, handleDataUpdate);

    return () => {
      unsubscribe();
    };
  }, []);

  const handleFilter = () => {
    const filtered = listData.filter((data) => {
      const date = moment(data.dateTime, "YYYY-MM-DD").toDate();
      const start = startDate ? moment(startDate, "YYYY-MM-DD").toDate() : null;
      const end = endDate ? moment(endDate, "YYYY-MM-DD").toDate() : null;

      return (!start || date >= start) && (!end || date <= end);
    });
    setFilteredData(filtered);
  };

  const xAxisInterval = Math.round(filteredData.length / 5);

  const getColor = (distance: number) => {
    if (distance < 50) {
      return "#d32f2f";
    } else if (distance < 100) {
      return "#ed6c02";
    } else if (distance < 200) {
      return "#fdf0e6";
    } else {
      return "#82ca9d";
    }
  };

  return (
    <main className="bg-black min-w-screen flex flex-col lg:flex-row">
      <div className="bg-stone-900 p-8 mt-8 lg:mb-8 mr-8 lg:mr-4 ml-8 rounded-xl lg:w-2/12 flex lg:flex-col flex-row justify-between lg:justify-start">
        <div>
          <p style={{ color: "#ffff" }}>Current Distance</p>
          <div className="flex flex-row">
            <p className="text-8xl mt-8" style={{ color: getColor(currentHeight) }}>
              {currentHeight}
            </p>
            <p className="mt-8" style={{ color: getColor(currentHeight) }}>
              cm
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex flex-row">
            <div
              style={{
                width: 16,
                height: 16,
                background: "#d32f2f",
                marginRight: 8,
                marginTop: 4,
                borderRadius: 99,
              }}
            />
            <p className="text-white">Tenggelam</p>
          </div>
          <div className="flex flex-row">
            <div
              style={{
                width: 16,
                height: 16,
                background: "#ed6c02",
                marginRight: 8,
                marginTop: 4,
                borderRadius: 99,
              }}
            />
            <p className="text-white">Waspada</p>
          </div>
          <div className="flex flex-row">
            <div
              style={{
                width: 16,
                height: 16,
                background: "#fdf0e6",
                marginRight: 8,
                marginTop: 4,
                borderRadius: 99,
              }}
            />
            <p className="text-white">Siaga</p>
          </div>
          <div className="flex flex-row">
            <div
              style={{
                width: 16,
                height: 16,
                background: "#82ca9d",
                marginRight: 8,
                marginTop: 4,
                borderRadius: 99,
              }}
            />
            <p className="text-white">Aman</p>
          </div>
        </div>
      </div>
      <div className="bg-stone-900 p-8 mt-8 mb-8 mr-8 ml-8 lg:ml-4 rounded-xl lg:w-10/12">
        <div className="flex flex-col lg:flex-row justify-between">
          <p style={{ color: "#ffff" }} className="mt-4 mb-4">
            Log Water Level
          </p>
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-y-0 space-y-4">
            <div className="flex flex-col lg:flex-row lg:space-y-0 space-y-4">
              <label 
                style={{ 
                  color: "#fff", 
                  border: "solid white",
                  borderRadius: 8,
                  padding: 10
                }}>
                Start Date:
                <input
                  style={{
                    colorScheme: 'dark',
                    background: '#0000',
                    color: "#fff", 
                    outlineStyle: 'none'
                  }}
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="ml-2"
                />
              </label>
              <label 
                className="lg:ml-2"
                style={{
                  color: "#fff", 
                  border: "solid white",
                  borderRadius: 8,
                  padding: 10
                }}>
                End Date:
                <input
                  type="date"
                  style={{
                    colorScheme: 'dark',
                    background: '#0000',
                    color: "#fff", 
                    outlineStyle: 'none'
                  }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="ml-2"
                />
              </label>
            </div>
            <div>
              <button
                onClick={handleFilter}
                className="bg-[#82ca9d] text-white py-1 px-4 ml-2 rounded"
              >
                Apply Filter
              </button>
              <button
                onClick={()=>{
                  setStartDate('');
                  setEndDate('');
                  setFilteredData(listData);
                }}
                className=" text-white py-1 px-4 ml-2 rounded border-white"
              >
                Clear Filter
              </button>
            </div>
          </div>
        </div>
        <ResponsiveContainer className="mt-8 w-full" height={450}>
          <AreaChart data={filteredData}>
            <Area
              type="monotone"
              dataKey="distance"
              strokeWidth={2}
              stroke="#82ca9d"
              fill="url(#82ca9d)"
            />
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dateTime" padding={{ left: 30, right: 30 }} interval={xAxisInterval} />
            <YAxis dataKey="distance" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="distance" stroke="#82ca9d" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
