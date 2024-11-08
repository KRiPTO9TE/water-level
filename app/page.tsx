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

  // State for data
  const [listData, setListData] = useState<WaterLevelData[]>([]);
  const [currentHeight, setCurrentHeight] = useState<number>(0);

  useEffect(() => {
    // Function to handle data updates
    const handleDataUpdate = (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const list = snapshot.val();
        const updatedListData: WaterLevelData[] = [];
        
        // Process snapshot data and update list
        for (const item in list) {
          updatedListData.push({
            id: item,
            distance: list[item].distance,
            dateTime: moment.unix(list[item].unixTimestamp).format("DD MMMM YYYY"),
          });
        }

        // Sort data by date and update state
        updatedListData.sort((a, b) => 
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        );

        setListData(updatedListData);
        setCurrentHeight(updatedListData[updatedListData.length - 1]?.distance || 0);
      } else {
        console.error("No data available");
      }
    };

    // Set up Firebase listener and store unsubscribe function
    const waterLevelRef = child(dbRef, `water-level`);
    const unsubscribe = onValue(waterLevelRef, handleDataUpdate);

    // Clean up the listener on component unmount
    return () => {
      unsubscribe(); // Properly removes the onValue listener
    };
  }, []);

  const xAxisInterval = Math.round(listData.length / 5);

  return (
    <main className="bg-black min-w-screen flex flex-row">
      <div className="bg-stone-900 p-8 mt-8 mb-8 mr-4 ml-8 rounded-xl w-2/12">
        <p>Current Height</p>
        <p className="text-9xl mt-8 text-[#82ca9d]">{currentHeight}</p>
      </div>
      <div className="bg-stone-900 p-8 mt-8 mb-8 mr-8 ml-4 rounded-xl w-10/12">
        <p>Log Water Level</p>
        <ResponsiveContainer className="mt-8 w-full" height={450}>
          <AreaChart data={listData}>
            <Area
              type="monotone"
              dataKey="distance"
              strokeWidth={2}
              stroke="#82ca9d"
              fill="url(#82ca9d)"
            />
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="dateTime"     
              padding={{ left: 30, right: 30 }} 
              interval={xAxisInterval}
            />
            <YAxis dataKey="distance"/>
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="distance" stroke="#82ca9d" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
