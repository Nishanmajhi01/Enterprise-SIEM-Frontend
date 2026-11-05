import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import socket from "../services/socket";

export default function LiveAlerts() {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const handleAlert = (alert) => {
            console.log("New Security Alert:", alert);
            setAlerts((prev) => [alert, ...prev].slice(0, 5));
        };

        socket.on("security-alert", handleAlert);
        return () => socket.off("security-alert", handleAlert);
    }, []);

    return (
        <div className="mt-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-5">
                🚨 Live Security Alerts
            </h2>

            {alerts.length === 0 ? (
                <p className="text-gray-400">Waiting for threats...</p>
            ) : (
                alerts.map((alert, index) => (
                    <motion.div
                        key={alert.id ?? `${alert.createdAt}-${index}`}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-3 p-4 rounded-xl bg-red-500/20 border border-red-400/30"
                    >
                        <h3 className="font-bold text-red-400">
                            {alert.title || alert.attackType || "Security Alert"}
                        </h3>
                        <p>Severity: {alert.severity || "UNKNOWN"}</p>
                        <p>Attack: {alert.attackType || "Unknown"}</p>
                        <p>Source IP: {alert.sourceIP || "Unknown"}</p>
                        <p>Destination IP: {alert.destinationIP || "Unknown"}</p>
                        <p>Risk Score: {alert.riskScore ?? 0}/100</p>

                        {(alert.detection?.scanType || alert.scanType) && (
                            <p>
                                Scan Type: {alert.detection?.scanType || alert.scanType}
                            </p>
                        )}

                        {alert.detection?.hosts?.length > 0 && (
                            <p className="break-words">
                                Destination Hosts: {alert.detection.hosts.join(", ")}
                            </p>
                        )}

                        {alert.mitreTechnique && (
                            <p>MITRE ATT&CK: {alert.mitreTechnique}</p>
                        )}

                        {alert.incidentId != null && (
                            <p>Incident ID: {alert.incidentId}</p>
                        )}
                    </motion.div>
                ))
            )}
        </div>
    );
}
