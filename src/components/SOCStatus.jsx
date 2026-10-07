import { motion } from "framer-motion";

export default function SOCStatus({ stats }) {

  const statusCards = [
    {
      title: "System Status",
      value: stats.systemStatus ?? "UNKNOWN",
      textClass: "text-green-400"
    },
    {
      title: "Active Threats",
      value: stats.threatIntelligence?.totalThreats ?? 0,
      textClass: "text-red-400"
    },
    {
      title: "High Risk Events",
      value: stats.highRiskEvents ?? 0,
      textClass: "text-yellow-400"
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-6 mb-8">

      {statusCards.map((card) => (

        <motion.div
          key={card.title}
          whileHover={{ scale: 1.05 }}
          className="
            bg-white/10
            backdrop-blur-xl
            border
            border-white/20
            rounded-2xl
            p-6
          "
        >

          <h3 className="text-gray-400">
            {card.title}
          </h3>

          <p
            className={`
              text-3xl
              font-bold
              mt-3
              ${card.textClass}
            `}
          >
            {card.value}
          </p>

        </motion.div>

      ))}

    </div>
  );
}