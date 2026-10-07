import { useEffect, useState } from "react";
import api from "../services/api";
import { motion } from "framer-motion";


const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const ACTIONS = ["BLOCK_IP", "ISOLATE_HOST", "DISABLE_ACCOUNT", "KILL_PROCESS"];


export default function Playbooks(){

    const [playbooks, setPlaybooks] = useState([]);

    const [form, setForm] = useState({
        name: "",
        triggerType: "BRUTE_FORCE",
        severity: "HIGH",
        action: "BLOCK_IP"
    });

    const [error, setError] = useState("");


    useEffect(() => {

        fetchPlaybooks();

    }, []);


    const fetchPlaybooks = async () => {

        try {

            const res = await api.get("/playbooks");

            setPlaybooks(res.data.playbooks || []);

        } catch (err) {

            console.log(err);

        }

    };


    const handleCreate = async (e) => {

        e.preventDefault();

        setError("");

        try {

            await api.post("/playbooks", form);

            setForm({
                name: "",
                triggerType: "BRUTE_FORCE",
                severity: "HIGH",
                action: "BLOCK_IP"
            });

            fetchPlaybooks();

        } catch (err) {

            setError(
                err.response?.data?.error || "Failed to create playbook"
            );

        }

    };


    const handleToggle = async (id) => {

        try {

            const res = await api.patch(`/playbooks/${id}/toggle`);

            setPlaybooks(prev =>
                prev.map(p => p.id === id ? res.data.playbook : p)
            );

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

                🤖 Automated Response Playbooks

            </h1>


            <motion.form

                onSubmit={handleCreate}

                whileHover={{ scale: 1.01 }}

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

                <div className="md:col-span-2">
                    <label className="text-sm text-gray-400">Playbook Name</label>
                    <input
                        required
                        placeholder="e.g. Block Brute Force Source IP"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 outline-none mt-1"
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-400">Trigger Attack Type</label>
                    <input
                        required
                        placeholder="e.g. BRUTE_FORCE"
                        value={form.triggerType}
                        onChange={e => setForm({ ...form, triggerType: e.target.value.toUpperCase() })}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 outline-none mt-1"
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-400">Severity</label>
                    <select
                        value={form.severity}
                        onChange={e => setForm({ ...form, severity: e.target.value })}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 outline-none mt-1"
                    >
                        {SEVERITIES.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-sm text-gray-400">Action</label>
                    <select
                        value={form.action}
                        onChange={e => setForm({ ...form, action: e.target.value })}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 outline-none mt-1"
                    >
                        {ACTIONS.map(a => (
                            <option key={a} value={a}>{a}</option>
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
                    md:col-span-5
                    "
                >
                    + Create Playbook
                </button>

                {error && (
                    <p className="md:col-span-5 text-red-400 text-sm">{error}</p>
                )}

            </motion.form>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {playbooks.length === 0 && (
                    <p className="text-gray-400">No playbooks configured yet.</p>
                )}

                {playbooks.map(playbook => (

                    <motion.div

                        key={playbook.id}

                        whileHover={{ scale: 1.02 }}

                        className="
                        bg-black/40
                        backdrop-blur-xl
                        border
                        border-cyan-400/30
                        rounded-2xl
                        p-6
                        shadow-xl
                        "
                    >

                        <div className="flex justify-between items-start">

                            <h2 className="text-xl font-bold text-white">
                                {playbook.name}
                            </h2>

                            <button
                                onClick={() => handleToggle(playbook.id)}
                                className={
                                    playbook.enabled
                                        ? "px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-400/40"
                                        : "px-3 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-400/40"
                                }
                            >
                                {playbook.enabled ? "ENABLED" : "DISABLED"}
                            </button>

                        </div>

                        <div className="mt-4 space-y-2 text-gray-300 text-sm">

                            <p>🎯 Trigger: <span className="text-cyan-300">{playbook.triggerType}</span></p>

                            <p>⚠ Severity: <span className="text-purple-300">{playbook.severity}</span></p>

                            <p>⚡ Action: <span className="text-red-400 font-bold">{playbook.action}</span></p>

                        </div>

                    </motion.div>

                ))}

            </div>

        </div>

    );

}
