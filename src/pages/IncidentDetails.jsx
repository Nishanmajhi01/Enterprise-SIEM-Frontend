import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function IncidentDetails() {
  const { id } = useParams();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [assignedUser, setAssignedUser] = useState("");
  const [containAction, setContainAction] = useState("");
  const [target, setTarget] = useState("");

  const isClosed = incident?.status === "CLOSED";

  // ==========================================
  // LOAD INCIDENT DETAILS
  // ==========================================

  const loadIncident = async () => {
    try {
      const res = await api.get(`/incidents/${id}`);

      setIncident(res.data.incident);
      setError("");
    } catch (err) {
      console.error("Incident details error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load incident details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadIncident();
  }, [id]);

  // ==========================================
  // UPDATE INCIDENT STATUS
  // ==========================================

  const updateStatus = async (status) => {
    if (isClosed) return;

    try {
      await api.put(`/incidents/${id}`, {
        status,
      });

      await loadIncident();
    } catch (err) {
      console.error("Status update failed:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update incident status."
      );
    }
  };

  // ==========================================
  // ASSIGN INCIDENT
  // ==========================================

  const assignIncident = async () => {
    if (isClosed) return;

    if (!assignedUser.trim()) {
      alert("Please enter an analyst user ID.");
      return;
    }

    try {
      await api.patch(`/incidents/${id}/assign`, {
        userId: assignedUser,
        username: "SOC_ANALYST",
      });

      await loadIncident();
      setAssignedUser("");
    } catch (err) {
      console.error("Assignment failed:", err);
      alert(
        err.response?.data?.message ||
          "Failed to assign incident."
      );
    }
  };

  // ==========================================
  // EXECUTE CONTAINMENT
  // ==========================================

  const containIncident = async () => {
    if (isClosed) return;

    if (!containAction || !target.trim()) {
      alert("Please select an action and enter a target.");
      return;
    }

    const confirmed = window.confirm(
      `Execute ${containAction} against ${target}? ` +
        "This may change firewall rules or affect a host."
    );

    if (!confirmed) return;

    try {
      await api.patch(`/incidents/${id}/contain`, {
        action: containAction,
        target: target.trim(),
      });

      await loadIncident();

      setContainAction("");
      setTarget("");
    } catch (err) {
      console.error("Containment failed:", err);
      alert(
        err.response?.data?.message ||
          "Failed to execute containment."
      );
    }
  };

  // ==========================================

  // ==========================================
  // RECORD MANUAL CONTAINMENT
  // ==========================================

  const manualContainIncident = async () => {
    if (incident?.status !== "INVESTIGATING") {
      alert("Manual containment requires an INVESTIGATING incident.");
      return;
    }

    const description = window.prompt(
      "Describe the containment action you actually performed:"
    );

    if (description === null) return;

    if (!description.trim() || description.length > 5000) {
      alert("Enter a valid containment description (maximum 5000 characters).");
      return;
    }

    const verification = window.prompt(
      "Describe the evidence supporting containment:"
    );

    if (verification === null) return;

    if (!verification.trim() || verification.length > 5000) {
      alert("Enter valid verification evidence (maximum 5000 characters).");
      return;
    }

    const confirmed = window.confirm(
      "Record analyst-reported manual containment? " +
      "This changes the incident status but does NOT execute firewall actions."
    );

    if (!confirmed) return;

    try {
      await api.patch(`/incidents/${id}/manual-contain`, {
        description: description.trim(),
        verification: verification.trim(),
      });

      await loadIncident();

      alert("Manual containment recorded successfully.");
    } catch (err) {
      console.error("Manual containment failed:", err);
      alert(
        err.response?.data?.message ||
        "Failed to record manual containment."
      );
    }
  };

  
  // ==========================================
  // RESOLVE INCIDENT
  // ==========================================

  const resolveIncident = async () => {
    if (incident?.status !== "CONTAINED") {
      alert("Incident must be CONTAINED before resolution.");
      return;
    }

    const resolutionNote = window.prompt(
      "Enter the resolution note explaining how the incident was resolved:"
    );

    if (resolutionNote === null) return;

    if (!resolutionNote.trim() || resolutionNote.length > 5000) {
      alert("A valid resolution note is required (maximum 5000 characters).");
      return;
    }

    const confirmed = window.confirm(
      "Resolve this incident? This will record the resolution in the incident timeline."
    );

    if (!confirmed) return;

    try {
      await api.patch(`/incidents/${id}/resolve`, {
        resolutionNote: resolutionNote.trim(),
      });

      await loadIncident();

      alert("Incident resolved successfully.");
    } catch (err) {
      console.error("Incident resolution failed:", err);
      alert(
        err.response?.data?.message ||
        "Failed to resolve incident."
      );
    }
  };

  // LOADING AND ERROR STATES
  // ==========================================

  if (loading) {
    return (
      <div className="text-cyan-400 text-xl">
        Loading investigation...
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-red-400">
        {error || "Incident not found."}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <h1 className="text-4xl font-bold text-cyan-400">
        Incident Investigation
      </h1>

      {error && (
        <div
          role="alert"
          className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 text-red-300"
        >
          {error}
        </div>
      )}

      {/* ======================================
          INCIDENT OVERVIEW
      ====================================== */}

      <div className="bg-black/40 border border-white/20 rounded-xl p-6">

        <h2 className="text-2xl text-white font-bold">
          {incident.title}
        </h2>

        <p className="text-gray-300 mt-3">
          {incident.description || "No description available."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

          {/* SEVERITY */}

          <div>
            <p className="text-gray-400">Severity</p>

            <p className="text-orange-400 font-bold">
              {incident.severity || "UNKNOWN"}
            </p>
          </div>

          {/* RISK SCORE */}

          <div>
            <p className="text-gray-400">Risk Score</p>

            <p className="text-red-400 font-bold">
              {incident.riskScore ?? "N/A"}
            </p>
          </div>

          {/* STATUS */}

          <div>
            <p className="text-gray-400">Status</p>

            <p
              className={`font-bold ${
                isClosed
                  ? "text-green-400"
                  : "text-cyan-300"
              }`}
            >
              {incident.status || "UNKNOWN"}
            </p>
          </div>

        </div>

        {/* ==================================
            RESOLUTION AND CLOSURE
        ================================== */}

        {(incident.resolutionNote ||
          incident.closureNote ||
          incident.closedAt ||
          incident.closedBy != null) && (

          <div className="mt-6 border-t border-white/20 pt-5">

            <h3 className="text-xl font-bold text-green-300 mb-4">
              Resolution &amp; Closure
            </h3>

            <div className="space-y-3 text-gray-300">

              {incident.resolutionNote && (
                <p>
                  <strong>Resolution Note:</strong>{" "}
                  {incident.resolutionNote}
                </p>
              )}

              {incident.closureNote && (
                <p>
                  <strong>Closure Note:</strong>{" "}
                  {incident.closureNote}
                </p>
              )}

              {incident.resolvedBy != null && (
                <p>
                  <strong>Resolved By User ID:</strong>{" "}
                  {incident.resolvedBy}
                </p>
              )}

              {incident.closedBy != null && (
                <p>
                  <strong>Closed By User ID:</strong>{" "}
                  {incident.closedBy}
                </p>
              )}

              {incident.closedAt && (
                <p>
                  <strong>Closed At:</strong>{" "}
                  {new Date(
                    incident.closedAt
                  ).toLocaleString()}
                </p>
              )}

            </div>

          </div>
        )}

        {/* ==================================
            INCIDENT LIFECYCLE ACTIONS
        ================================== */}

        {!isClosed && (

          <div className="mt-6 border-t border-white/20 pt-5">

            <h3 className="text-lg font-bold text-cyan-300 mb-4">
              Incident Management
            </h3>

            <div className="flex flex-wrap gap-3">

              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
                onClick={() =>
                  updateStatus("INVESTIGATING")
                }
              >
                Investigate
              </button>

              <button
                type="button"
                className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-white disabled:opacity-40"
                disabled={incident.status !== "INVESTIGATING"}
                onClick={manualContainIncident}
              >
                Record Manual Containment
              </button>

              <button
                type="button"
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={incident.status !== "CONTAINED"}
                onClick={resolveIncident}
              >
                Resolve
              </button>

            </div>

            {/* ASSIGN INCIDENT */}

            <div className="mt-5 flex flex-wrap gap-3">

              <input
                type="number"
                min="1"
                className="bg-black border border-white/20 p-2 rounded text-white"
                placeholder="Analyst User ID"
                value={assignedUser}
                onChange={(e) =>
                  setAssignedUser(e.target.value)
                }
              />

              <button
                type="button"
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white"
                onClick={assignIncident}
              >
                Assign
              </button>

            </div>

          </div>
        )}

        {/* CLOSED INCIDENT MESSAGE */}

        {isClosed && (
          <div className="mt-6 p-4 rounded-lg bg-green-900/20 border border-green-500/30">

            <p className="text-green-300 font-semibold">
              Incident Closed
            </p>

            <p className="text-gray-400 text-sm mt-1">
              This incident has completed its lifecycle.
              Investigation and response controls are
              unavailable for this closed case.
            </p>

          </div>
        )}

      </div>

      {/* ======================================
          RELATED ALERTS
      ====================================== */}

      <div className="bg-black/40 border border-white/20 rounded-xl p-6">

        <h2 className="text-xl text-cyan-300 font-bold">
          Related Alerts
        </h2>

        {incident.alerts?.length > 0 ? (

          incident.alerts.map((alert) => (

            <div
              key={alert.id}
              className="mt-3 p-3 bg-white/5 rounded-lg"
            >
              <p>
                <strong>Alert ID:</strong> #{alert.id}
              </p>

              <p>
                <strong>Title:</strong>{" "}
                {alert.title || "N/A"}
              </p>

              <p>
                <strong>Source IP:</strong>{" "}
                {alert.sourceIP || "N/A"}
              </p>
            </div>

          ))

        ) : (

          <p className="text-gray-400 mt-4">
            No related alerts available.
          </p>

        )}

      </div>

      {/* ======================================
          MITRE ATT&CK
      ====================================== */}

      <div className="bg-black/40 border border-white/20 rounded-xl p-6">

        <h2 className="text-xl text-purple-300 font-bold">
          MITRE ATT&amp;CK
        </h2>

        <div className="mt-4 space-y-2 text-gray-300">

          <p>
            <strong>Technique:</strong>{" "}
            {incident.mitreTechnique || "UNKNOWN"}
          </p>

          <p>
            <strong>Tactic:</strong>{" "}
            {incident.tactic || "UNKNOWN"}
          </p>

          <p>
            <strong>Attack Type:</strong>{" "}
            {incident.attackType || "UNKNOWN"}
          </p>

          {incident.scanType && (
            <p>
              <strong>Scan Type:</strong>{" "}
              {incident.scanType}
            </p>
          )}

          <p>
            <strong>Source IP:</strong>{" "}
            {incident.sourceIP || "UNKNOWN"}
          </p>

        </div>

      </div>

      {/* ======================================
          EVIDENCE
      ====================================== */}

      <div className="bg-black/40 border border-white/20 rounded-xl p-6">

        <h2 className="text-xl text-yellow-300 font-bold">
          Evidence
        </h2>

        {incident.evidenceItems?.length > 0 ? (

          incident.evidenceItems.map((item, index) => (

            <div
              key={item.id || index}
              className="mt-3 p-4 bg-white/5 rounded-lg text-gray-300"
            >

              <p>
                <strong>Type:</strong>{" "}
                {item.type || "N/A"}
              </p>

              <p>
                <strong>Source:</strong>{" "}
                {item.source || "N/A"}
              </p>

              <p>
                <strong>Description:</strong>{" "}
                {item.description || "N/A"}
              </p>

              <p>
                <strong>Alert ID:</strong>{" "}
                {item.data?.alertId || "N/A"}
              </p>

              <p>
                <strong>Source IP:</strong>{" "}
                {item.data?.sourceIP || "N/A"}
              </p>

              <p>
                <strong>Attack Type:</strong>{" "}
                {item.data?.attackType || "N/A"}
              </p>

            </div>

          ))

        ) : (

          <p className="text-gray-400 mt-4">
            No evidence available.
          </p>

        )}

      </div>

      {/* ======================================
          INVESTIGATION TIMELINE
      ====================================== */}

      <div className="bg-black/40 border border-white/20 rounded-xl p-6">

        <h2 className="text-xl text-green-300 font-bold">
          Investigation Timeline
        </h2>

        {incident.timeline?.length > 0 ? (

          <div className="mt-4 space-y-3">

            {incident.timeline.map((item, index) => (

              <div
                key={index}
                className="p-3 bg-white/5 rounded-lg border border-white/10"
              >

                <p className="text-cyan-300 font-semibold">
                  {item.action || "UNKNOWN ACTION"}
                </p>

                <p className="text-gray-400 text-sm mt-1">
                  Performed By:{" "}
                  {item.user || "SYSTEM"}
                </p>

                {(item.timestamp || item.createdAt) && (
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(
                      item.timestamp || item.createdAt
                    ).toLocaleString()}
                  </p>
                )}

              </div>

            ))}

          </div>

        ) : (

          <p className="text-gray-400 mt-4">
            No investigation history available.
          </p>

        )}

      </div>

      {/* ======================================
          RESPONSE ACTIONS
      ====================================== */}

      <div className="bg-black/40 border border-white/20 rounded-xl p-6">

        <h2 className="text-xl text-red-300 font-bold">
          Response Actions
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-3">

          {/* ACTION SELECTOR */}

          <select
            className="bg-black border border-white/20 p-2 rounded text-white disabled:opacity-40"
            value={containAction}
            disabled={isClosed}
            onChange={(e) =>
              setContainAction(e.target.value)
            }
          >
            <option value="">
              Select Action
            </option>

            <option value="BLOCK_IP">
              Block IP
            </option>

            <option value="DISABLE_ACCOUNT">
              Disable Account
            </option>

            <option value="ISOLATE_HOST">
              Isolate Host
            </option>

            <option value="KILL_PROCESS">
              Kill Process
            </option>
          </select>

          {/* TARGET INPUT */}

          <input
            className="bg-black border border-white/20 p-2 rounded text-white disabled:opacity-40"
            placeholder="Target"
            value={target}
            disabled={isClosed}
            onChange={(e) =>
              setTarget(e.target.value)
            }
          />

          {/* EXECUTE CONTAINMENT BUTTON */}

          <button
            type="button"
            className={`
              px-4
              py-2
              rounded
              font-semibold
              ${
                isClosed
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed opacity-50"
                  : "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              }
            `}
            disabled={true}
            onClick={undefined}
          >
            {isClosed
              ? "Incident Closed"
              : "Execute Containment"}
          </button>

        </div>

        {/* ==================================
            RESPONSE ACTION HISTORY
        ================================== */}

        {incident.responseActions?.length > 0 ? (

          incident.responseActions.map((action, index) => (

            <div
              key={action.id || index}
              className="mt-5 p-4 bg-white/5 border border-white/10 rounded-lg"
            >

              <p className="text-green-400 font-bold text-lg">
                Recorded Response Action
              </p>

              <p className="mt-2">
                <strong>Action:</strong>{" "}
                {action.action || "N/A"}
              </p>

              <p>
                <strong>Target:</strong>{" "}
                {action.target || "N/A"}
              </p>

              <p>
                <strong>Status:</strong>{" "}

                <span
                  className={
                    action.status === "SUCCESS"
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {action.status || "UNKNOWN"}
                </span>
              </p>

              <p>
                <strong>Playbook:</strong>{" "}
                {action.details?.playbook || "N/A"}
              </p>

              <p>
                <strong>Simulated:</strong>{" "}

                {action.details?.simulated === false
                  ? "No - Real action"
                  : action.details?.simulated === true
                    ? "Yes - Simulation"
                    : "Unknown"}
              </p>

              <p>
                <strong>Result:</strong>{" "}
                {action.details?.message || "N/A"}
              </p>

              {action.createdAt && (
                <p className="text-gray-400 text-sm mt-2">
                  {new Date(
                    action.createdAt
                  ).toLocaleString()}
                </p>
              )}

            </div>

          ))

        ) : (

          <p className="text-gray-400 mt-4">
            No response actions yet.
          </p>

        )}

      </div>

    </div>
  );
}
