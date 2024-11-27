"use client";
import { child, getDatabase, ref, onValue, DataSnapshot } from "firebase/database";
import { initializeApp } from "firebase/app";
import { FC, PureComponent, useEffect, useState } from "react";
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

interface CustomizedAxisTickProps {
  x: number;
  y: number;
  stroke: string;
  payload: {
    value: string | number;
  };
}

interface CustomTooltipProps {
  active: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any[] | undefined;
  label: string;
}

const getColor = (distance: number) => {
  if (distance < 50) {
    return "#d32f2f";
  } else if (distance < 100) {
    return "#ed6c02";
  } else if (distance < 200) {
    return "#ffff00";
  } else {
    return "#82ca9d";
  }
};

const getStage = (distance: number) => {
  if (distance < 50) {
    return "TENGGELAM";
  } else if (distance < 100) {
    return "Waspada";
  } else if (distance < 200) {
    return "Siaga";
  } else {
    return "Aman";
  }
};

const getHourFormat = (timestamp: string, format: string | undefined) =>{
  const date = new Date(timestamp);
  return moment(date).format( format ? format : 'HH:mm DD-MMMM-YYYY');
}

const CustomTooltip: FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-black p-4 rounded-xl">
        <p className="label" style={{ color: getColor(payload[0].value)}}>{payload[0].value}</p>
        <p className="intro" style={{ color: "#fff"}}>{getHourFormat(label, undefined)}</p>
        <p className="desc" style={{ color: getColor(payload[0].value)}}>{getStage(payload[0].value)}</p>
      </div>
    );
  }

  return null;
};

class CustomizedAxisTick extends PureComponent<CustomizedAxisTickProps> {
  render() {
    const { x, y, payload } = this.props;
    const date = new Date(payload.value);
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">
          {moment(date).format('MMMM-YYYY')}
        </text>
      </g>
    );
  }
}

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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  useEffect(() => {
    const handleDataUpdate = (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const list = snapshot.val();
        const updatedListData: WaterLevelData[] = [];
        for (const item in list) {
          updatedListData.push({
            id: item,
            distance: list[item].distance,
            dateTime: moment.unix(list[item].unixTimestamp).format("YYYY-MM-DDTHH:mm"),
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
      const date = moment(data.dateTime, "YYYY-MM-DDTHH:mm").toDate();
      const start = startDate ? moment(startDate, "YYYY-MM-DDTHH:mm").toDate() : null;
      const end = endDate ? moment(endDate, "YYYY-MM-DDTHH:mm").toDate() : null;

      return (!start || date >= start) && (!end || date <= end);
    });
    setFilteredData(filtered);
  };

  const xAxisInterval = Math.round(filteredData.length / 5);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <main className="bg-black min-w-screen">
      <div className="min-w-screen flex flex-col lg:flex-row">
        <div className="bg-stone-900 p-8 mt-8 lg:mb-8 mr-8 lg:mr-4 ml-8 rounded-xl lg:w-3/12 flex lg:flex-col flex-row justify-between lg:justify-start">
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
                  background: "#ffff00",
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
        <div className="bg-stone-900 lg:p-8 mt-8 mb-8 mr-8 ml-8 lg:ml-4 rounded-xl lg:w-9/12">
          <div className="flex flex-col lg:flex-row justify-between lg:pt-0 pt-8 lg:pr-0 pr-8 lg:pl-0 pl-8">
            <p style={{ color: "#ffff" }} className="mt-4 mb-4">
              Water Level Chart
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
          <ResponsiveContainer className="mt-8 mb-8 lg:mb-0 w-full" height={450}>
            <AreaChart data={filteredData}>
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
                height={60} 
                tick={(props)=><CustomizedAxisTick x={props.x} y={props.y} stroke={props.stroke} payload={props.payload}/>}  
              />
              <YAxis dataKey="distance" />
              <Tooltip content={(props)=><CustomTooltip active={props.active ?? false} payload={props.payload} label={props.label} />} />
              <Legend />
              <Line type="monotone" dataKey="distance" stroke="#82ca9d" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-stone-900 pr-8 pl-8 pb-6 pt-6 mb-8 mr-8 ml-8 rounded-xl log-distance">
        <div className="flex flex-row justify-between items-center mb-4">
          <p style={{ color: "#ffff" }}>Log Distance</p>
          <div>
            <label htmlFor="itemsPerPage" style={{ color: "#fff" }}>
              Items per page:{" "}
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page
              }}
              style={{
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid #fff",
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Paginated Data */}
        {paginatedData.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "row",
              borderWidth: "2px",
              borderColor: getColor(item.distance),
              color: "white",
              padding: "16px",
              borderRadius: "16px",
              justifyContent: "space-between",
              marginTop: "8px",
              marginBottom: "8px",
            }}
          >
            <p>{getHourFormat(item.dateTime, "HH:mm | DD MMMM YYYY")}</p>
            <p>Jarak: {item.distance} cm</p>
            <p>Status: {getStage(item.distance)}</p>
          </div>
        ))}

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: "8px 16px",
              background: currentPage === 1 ? "#555" : "#82ca9d",
              color: "#fff",
              borderRadius: "4px",
              border: "none",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            Previous
          </button>
          <p style={{ color: "#fff" }}>
            Page {currentPage} of {totalPages}
          </p>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 16px",
              background: currentPage === totalPages ? "#555" : "#82ca9d",
              color: "#fff",
              borderRadius: "4px",
              border: "none",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
