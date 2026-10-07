import { useEffect, useState } from "react";
import api from "../services/api";
import { motion } from "framer-motion";
import SOCStatus from "../components/SOCStatus";
import LiveAlerts from "../components/LiveAlerts";
import LiveThreatFeed from "../components/LiveThreatFeed";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function Dashboard() {

  const [stats, setStats] = useState(null);

  useEffect(() => {

    api.get("/dashboard")
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

  }, []);

  if (!stats) {
    return (
      <div className="text-xl">
        Loading SOC Dashboard...
      </div>
    );
  }

  const cards = [
    {
      title: "Total IOC",
      value: stats.ioc?.totalIOCs ?? 0
    },
    {
      title: "Malicious IOC",
      value: stats.ioc?.maliciousIOCs ?? 0
    },
    {
      title: "Total Incidents",
      value: stats.incidents?.totalIncidents ?? 0
    },
    {
      title: "Open Incidents",
      value: stats.incidents?.openIncidents ?? 0
    },
    {
      title: "High Risk Events",
      value: stats.highRiskEvents ?? 0
    }
  ];

  return (
    <div>

      <h1 className="text-4xl font-bold mb-8">
        Security Operations Dashboard
      </h1>

      <SOCStatus stats={stats} />

      <div className="grid grid-cols-5 gap-5">

        {cards.map((card, index) => (

          <motion.div
            key={index}
            whileHover={{
              scale: 1.05
            }}
            className="
              bg-white/10
              backdrop-blur-xl
              border
              border-white/20
              rounded-2xl
              p-6
              shadow-xl
            "
          >

            <h2 className="text-gray-300">
              {card.title}
            </h2>

            <p className="
              text-3xl
              font-bold
              text-cyan-400
              mt-3
            ">
              {card.value}
            </p>

          </motion.div>

        ))}

      </div>

      <div className="
        mt-10
        bg-white/10
        backdrop-blur-xl
        rounded-2xl
        p-6
        h-96
      ">

        <h2 className="text-xl mb-5">
          Threat Activity
        </h2>

        <ResponsiveContainer>

          <LineChart
            data={[
              {
                time: "10:00",
                risk: 20
              },
              {
                time: "10:10",
                risk: 50
              },
              {
                time: "10:20",
                risk: 80
              }
            ]}
          >

            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="risk"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

        <LiveAlerts />

        <div className="mt-10">
          <LiveThreatFeed />
        </div>

      </div>

    </div>
  );
}