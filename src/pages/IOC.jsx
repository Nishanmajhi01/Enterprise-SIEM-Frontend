import { useEffect, useState } from "react";
import api from "../services/api";



const IOC_TYPES = ["IP", "DOMAIN", "URL", "HASH", "EMAIL"];
const CONFIDENCE_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];


export default function IOC(){

    const [iocs, setIocs] = useState([]);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    const [form, setForm] = useState({
        type: "IP",
        value: "",
        confidence: "MEDIUM",
        source: "Manual"
    });

    const [error, setError] = useState("");


    useEffect(() => {

        fetchIOCs();

    }, []);


    const fetchIOCs = async () => {

        try {

            const res = await api.get("/iocs");

            setIocs(res.data.iocs || []);

        } catch (err) {

            setError(err.response?.data?.message || "Unable to load IOC data.");

        }

    };


    const handleSearch = async () => {

        try {

            const res = await api.get("/iocs/search", {

                params: {
                    value: search || undefined,
                    type: typeFilter || undefined
                }

            });

            setIocs(res.data.iocs || []);

        } catch (err) {

            console.log(err);

        }

    };


    const handleCreate = async (e) => {

        e.preventDefault();

        setError("");

        try {

            await api.post("/iocs", form);

            setForm({
                type: "IP",
                value: "",
                confidence: "MEDIUM",
                source: "Manual"
            });

            fetchIOCs();

        } catch (err) {

            setError(
                err.response?.data?.error || "Failed to create IOC"
            );

        }

    };


    const handleDelete = async (id) => {

        try {

            await api.delete(`/iocs/${id}`);

            setIocs(prev => prev.filter(ioc => ioc.id !== id));

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

                IOC Database

            </h1>


            <p className="text-gray-400 mb-6">Manage active indicators of compromise and analyst-curated threat intelligence.</p>
            {/* ADD IOC FORM */}

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
                    <label className="text-sm text-gray-400">Type</label>
                    <select
                        value={form.type}
                        onChange={e => setForm({ ...form, type: e.target.value })}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 outline-none mt-1"
                    >
                        {IOC_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="text-sm text-gray-400">Value</label>
                    <input
                        required
                        placeholder="e.g. 192.168.1.50"
                        value={form.value}
                        onChange={e => setForm({ ...form, value: e.target.value })}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 outline-none mt-1"
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-400">Confidence</label>
                    <select
                        value={form.confidence}
                        onChange={e => setForm({ ...form, confidence: e.target.value })}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 outline-none mt-1"
                    >
                        {CONFIDENCE_LEVELS.map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
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
                    + Add IOC
                </button>

                {error && (
                    <p className="md:col-span-5 text-red-400 text-sm">{error}</p>
                )}

            </form>


            {/* SEARCH BAR */}

            <div className="flex flex-col md:flex-row gap-4 mb-6">

                <input
                    placeholder="Search by value..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                    className="
                    flex-1
                    p-3
                    rounded-xl
                    bg-white/10
                    border
                    border-white/20
                    outline-none
                    "
                />

                <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    className="p-3 rounded-xl bg-white/10 border border-white/20 outline-none"
                >
                    <option value="">All Types</option>
                    {IOC_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>

                <button
                    onClick={handleSearch}
                    className="p-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
                >
                    Search
                </button>

                <button
                    onClick={() => { setSearch(""); setTypeFilter(""); fetchIOCs(); }}
                    className="p-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
                >
                    Reset
                </button>

            </div>


            {/* IOC TABLE */}

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
                            <th className="p-4">Type</th>
                            <th className="p-4">Value</th>
                            <th className="p-4">Confidence</th>
                            <th className="p-4">Reputation</th>
                            <th className="p-4">Source</th>
                            <th className="p-4">Active</th>
                            <th className="p-4">Last Seen</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>

                    <tbody>

                        {iocs.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-6 text-center text-gray-400">
                                    No IOCs found
                                </td>
                            </tr>
                        )}

                        {iocs.map(ioc => (
                            <tr key={ioc.id} className="border-t border-white/10">
                                <td className="p-4 text-cyan-300">{ioc.type}</td>
                                <td className="p-4">{ioc.value}</td>
                                <td className="p-4">{ioc.confidence}</td>
                                <td className="p-4">{ioc.reputation || "-"}</td>
                                <td className="p-4">{ioc.source}</td>
                                <td className="p-4">
                                    {ioc.isActive ? (
                                        <span className="text-green-400">Active</span>
                                    ) : (
                                        <span className="text-gray-500">Inactive</span>
                                    )}
                                </td>
                                <td className="p-4 text-sm text-gray-400">
                                    {ioc.lastSeen ? new Date(ioc.lastSeen).toLocaleString() : "-"}
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => { if(window.confirm(`Delete IOC ${ioc.value}?`)) handleDelete(ioc.id); }}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        Delete
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
