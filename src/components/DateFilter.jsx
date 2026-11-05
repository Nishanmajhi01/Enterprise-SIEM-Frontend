import React from "react";

const fieldStyle = {
  background: "#0b1626",
  border: "1px solid #344760",
  borderRadius: 8,
  padding: "11px 13px",
  color: "#eaf3ff"
};

export function matchesDateFilter(
  createdAt,
  mode,
  singleDate,
  startDate,
  endDate
) {
  if (mode === "ALL") return true;
  if (!createdAt) return false;

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return false;

  const sydneyDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const parts = Object.fromEntries(
    sydneyDate.map(part => [part.type, part.value])
  );

  const recordDate =
    `${parts.year}-${parts.month}-${parts.day}`;

  if (mode === "SINGLE") {
    return Boolean(singleDate) && recordDate === singleDate;
  }

  if (mode === "RANGE") {
    return Boolean(startDate && endDate) &&
      startDate <= endDate &&
      recordDate >= startDate &&
      recordDate <= endDate;
  }

  return true;
}

export function formatSydneyDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export default function DateFilter({
  mode,
  setMode,
  singleDate,
  setSingleDate,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}) {
  return (
    <div style={{
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
      alignItems: "center",
      marginBottom: 18
    }}>
      <label style={{ color: "#90a5be" }}>
        Date Filter
      </label>

      <select
        aria-label="Date filter mode"
        style={fieldStyle}
        value={mode}
        onChange={e => setMode(e.target.value)}
      >
        <option value="ALL">All Dates</option>
        <option value="SINGLE">Single Date</option>
        <option value="RANGE">Date Range</option>
      </select>

      {mode === "SINGLE" && (
        <input
          type="date"
          aria-label="Select date"
          style={fieldStyle}
          value={singleDate}
          onChange={e => setSingleDate(e.target.value)}
        />
      )}

      {mode === "RANGE" && (
        <>
          <label style={{ color: "#90a5be" }}>
            From
          </label>
          <input
            type="date"
            aria-label="Start date"
            style={fieldStyle}
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />

          <label style={{ color: "#90a5be" }}>
            To
          </label>
          <input
            type="date"
            aria-label="End date"
            style={fieldStyle}
            value={endDate}
            min={startDate || undefined}
            onChange={e => setEndDate(e.target.value)}
          />
        </>
      )}
    </div>
  );
}
