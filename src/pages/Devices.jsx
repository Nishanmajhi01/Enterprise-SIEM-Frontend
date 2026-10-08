import { useEffect, useState } from "react";
import api from "../services/api";



const DEVICE_TYPES = ["WINDOWS", "LINUX", "FIREWALL", "SERVER", "ROUTER", "APPLICATION"];


export default function Devices(){

    const [devices, setDevices] = useState([]);

    const [form, setForm] = useState({
        name: "",
        hostname: "",
        type: "LINUX",
        ipAddress: "",
        location: ""
    });

    const [error, setError] = useState("");
    const [revealedKey, setRevealedKey] = useState(null);


    useEffect(() => {

        fetchDevices();

    }, []);


    const fetchDevices = async () => {

        try {

            const res = await api.get("/devices");

            setDevices(res.data.devices || []);

        } catch (err) {

            setError(err.response?.data?.message || "Unable to load or update devices.");

        }

    };


    const handleCreate = async (e) => {

        e.preventDefault();

        setError("");

        try {

            const res = await api.post("/devices", form);

            setRevealedKey({
                name: res.data.device.name,
                apiKey: res.data.device.apiKey
            });

            setForm({
                name: "",
                hostname: "",
                type: "LINUX",
                ipAddress: "",
                location: ""
            });

            fetchDevices();

        } catch (err) {

            setError(
                err.response?.data?.error || "Failed to register device"
            );

        }

    };


    const handleToggleStatus = async (device) => {

        const nextStatus = device.status === "ACTIVE" ? "DISABLED" : "ACTIVE";

        try {

            const res = await api.patch(`/devices/${device.id}/status`, {
                status: nextStatus
            });

            setDevices(prev =>
                prev.map(d => d.id === device.id ? res.data.device : d)
            );

        } catch (err) {

            console.log(err);

        }

    };


    const handleRegenerate = async (id) => {

        try {

            const res = await api.patch(`/devices/${id}/regenerate-key`);

            setRevealedKey({
                name: res.data.device.name,
                apiKey: res.data.device.apiKey
            });

            fetchDevices();

        } catch (err) {

            console.log(err);

        }

    };


    return (

        <div>

            <h1 className="
            text-4xl
            font-bold
            mb-8
            text-cyan-400
            ">

                🖥 Log Source Devices

            </h1>


            <p className="text-gray-400 mb-6 text-sm max-w-2xl">
                Register each VM/firewall that will forward logs to this SIEM
                (via <code>POST /api/ingest</code> with the <code>x-api-key</code> header
                shown below). Kali is the attacker box and does not need to be
                registered — only the targets you collect logs from.
            </p>


            {revealedKey && (

                <div className="
                bg-yellow-500/10
                border
                border-yellow-400/40
                rounded-2xl
                p-5
                mb-8
                ">

                    <p className="text-yellow-300 font-bold mb-1">
                        API key for {revealedKey.name} (copy it now — shown once)
                    </p>

                    <code className="text-sm break-all text-white">
                        {revealedKey.apiKey}
                    </code>

                    <button
                        onClick={() => setRevealedKey(null)}
                        className="block mt-3 text-xs text-gray-400 hover:text-white"
                    >
                        Dismiss
                    </button>

                </div>

            )}


            <form

                onSubmit={handleCreate}

                

                className="
                bg-black/40
                backdrop-blur-xl
                border
                border-cyan-400/30
                rounded-2xl
                p-6
                shadow-xl
                mb-8
                grid
                grid-cols-1
                md:grid-cols-5
                gap-4
                items-end
                "
            >

                <div>
                    <label className="text-sm text-gray-400">Name</label>
                    <input
                        required
                        placeholder="e.g. Ubuntu Log Server"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 outline-none mt-1"
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-400">Hostname</label>
                    <input
                        placeholder="e.g. ubuntu-target"
                        value={form.hostname}
                        onChange={e => setForm({ ...form, hostname: e.target.value })}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 outline-none mt-1"
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-400">Type</label>
                    <select
                        value={form.type}
                        onChange={e => setForm({ ...form, type: e.target.value })}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 outline-none mt-1"
                    >
                        {DEVICE_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-sm text-gray-400">IP Address</label>
                    <input
                        required
                        placeholder="e.g. 10.10.10.20"
                        value={form.ipAddress}
                        onChange={e => setForm({ ...form, ipAddress: e.target.value })}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 outline-none mt-1"
                    />
                </div>

                <button
                    type="submit"
                    className="
                    p-3
                    rounded-xl
                    bg-cyan-500/80
                    hover:bg-cyan-400
                    text-black
                    font-bold
                    transition
                    "
                >
                    + Register Device
                </button>

                {error && (
                    <p className="md:col-span-5 text-red-400 text-sm">{error}</p>
                )}

            </form>


            <div className="
            bg-black/40
            backdrop-blur-xl
            border
            border-cyan-400/30
            rounded-2xl
            overflow-hidden
            shadow-xl
            ">

                <table className="w-full text-left">

                    <thead className="bg-white/5 text-gray-400 text-sm">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">IP Address</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Last Heartbeat</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>

                    <tbody>

                        {devices.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-6 text-center text-gray-400">
                                    No devices registered yet
                                </td>
                            </tr>
                        )}

                        {devices.map(device => (
                            <tr key={device.id} className="border-t border-white/10">
                                <td className="p-4">{device.name}</td>
                                <td className="p-4 text-cyan-300">{device.type}</td>
                                <td className="p-4">{device.ipAddress}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => { if(window.confirm(`Change ingestion status for ${device.name}?`)) handleToggleStatus(device); }}
                                        className={
                                            device.status === "ACTIVE"
                                                ? "text-green-400"
                                                : "text-gray-500"
                                        }
                                    >
                                        {device.status}
                                    </button>
                                </td>
                                <td className="p-4 text-sm text-gray-400">
                                    {device.lastHeartbeat
                                        ? new Date(device.lastHeartbeat).toLocaleString()
                                        : "Never"}
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => { if(window.confirm(`Regenerate the API key for ${device.name}? The existing collector key will stop working until updated.`)) handleRegenerate(device.id); }}
                                        className="text-cyan-400 hover:text-cyan-300 text-sm"
                                    >
                                        Regenerate Key
                                    </button>
                                </td>
                            </tr>
                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    );

}
