import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import "./Certificates.css";

const API_URL = 'http://localhost:5000';

const statusStyles = {
  Unapproved: { bg: "#FFF4E5", fg: "#D97706", border: "#FCD34D" }, // orange
  Approved: { bg: "#ECFDF5", fg: "#059669", border: "#6EE7B7" }, // green
  Rejected: { bg: "#FEF2F2", fg: "#DC2626", border: "#FCA5A5" }, // red
};

function normalizeStatus(status) {
  if (!status) return "Unapproved";
  const s = String(status).trim();
  const lower = s.toLowerCase();
  if (lower === "unapproved") return "Unapproved";
  if (lower === "approved") return "Approved";
  if (lower === "rejected") return "Rejected";
  return s;
}

function StatusBadge({ status }) {
  const s = normalizeStatus(status);
  const styles = statusStyles[s] || { bg: "#F3F4F6", fg: "#374151", border: "#D1D5DB" };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        background: styles.bg,
        color: styles.fg,
        border: `1px solid ${styles.border}`,
        fontSize: 12,
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      {s}
    </span>
  );
}

export default function Certificates({ user, onLogout }) {
  const fileInputRef = useRef(null);

  const [certificates, setCertificates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError] = useState('');
  
  
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  }, []);

  const fetchCertificates = useCallback(async () => {
    setError("");
    setLoadingList(true);

    try {
      const resp = await axios.get(`${API_URL}/certificates`, {
        headers: { ...getAuthHeaders() },
      });

      const list = Array.isArray(resp.data) ? resp.data : resp.data?.data || [];
      setCertificates(list);

      if (list.length > 0) setSelected((prev) => prev ?? list[0]);
      else setSelected(null);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Failed to load certificates.");
    } finally {
      setLoadingList(false);
    }
  }, [getAuthHeaders]);

    useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const openCertificatePdf = useCallback(
    async (certificateId) => {
      if (!certificateId) return;

      setError("");
      setLoadingPdf(true);

      try {
        const resp = await axios.get(`${API_URL}/certificates/${certificateId}`, {
          headers: getAuthHeaders(),
          responseType: "blob",
        });

        const contentType = resp.headers?.["content-type"] || "application/pdf";
        const blob = new Blob([resp.data], { type: contentType });

        const url = URL.createObjectURL(blob);
        window.open(url, "_blank", "noopener,noreferrer");

        // cleanup
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } catch (err) {
        setError(err?.response?.data?.error || err?.message || "Failed to open PDF.");
      } finally {
        setLoadingPdf(false);
      }
    },
    [getAuthHeaders]
  );

  const selectedName = selected ? `${selected.firstname ?? ""} ${selected.lastname ?? ""}`.trim() : "";

  const updateCertificateStatus = useCallback(
    async (certificateId, newStatus) => {
      if (!certificateId || !newStatus) return;

      setError("");

      try {
        const payload = { id: certificateId, status: newStatus };

        console.log("im updating");
        console.log(payload);
        await axios.put(`${API_URL}/certificates`, payload, {
          headers: getAuthHeaders(),
        });

        setSelected((prev) => (prev?.id === certificateId ? { ...prev, status: newStatus } : prev));

        setCertificates((prev) =>
          prev.map((c) => (c.id === certificateId ? { ...c, status: newStatus } : c))
        );
      } catch (err) {
        setError(err?.response?.data?.error || err?.message || "Failed to update status.");
      }
    },
    [getAuthHeaders, setCertificates, setSelected, setError]
  );

const removeCertificate = useCallback(
  async (certificateId) => {
    if (!certificateId) return;

    setError("");
    setCertificates((prev) => (prev ?? []).filter((c) => c.id !== certificateId));
    setSelected((prev) => (prev?.id === certificateId ? null : prev));

    try {
      await axios.delete(`${API_URL}/certificates/${certificateId}`, {
        headers: { ...getAuthHeaders() },
      });

      if (typeof fetchCertificates === "function") {
        await fetchCertificates();
      }
    } catch (err) {
      console.log("REMOVE ERROR:", err);

      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to remove certificate."
      );

      if (typeof fetchCertificates === "function") {
        await fetchCertificates();
      }
    }
  },
  [getAuthHeaders, fetchCertificates]
);

  const handleFileUpload = async (file) => {
    setError("");

    try {
      if (!file) return;

      const maxSizeBytes = 15 * 1024 * 1024;
      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

      if (!isPdf) {
        setError("Only PDF files are allowed.");
        return;
      }

      if (file.size > maxSizeBytes) {
        setError("File is too large. Max size is 15MB.");
        return;
      }

      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API_URL}/certificates`, formData, {
        headers: getAuthHeaders(),
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            console.log(`Upload: ${percent}%`);
          }
        },
      });

      await fetchCertificates();
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Upload failed.";
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isUploading) return;

    const file = e.dataTransfer.files?.[0];
    await handleFileUpload(file);
  };

  const onFilePick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    await handleFileUpload(file);
  };




  if (!user) return null;
  return (
    <div>
      <div>
        <div style={{ padding: 24, background: "#F6F7F9", minHeight: "50vh" }}>
          <h1 style={{ margin: 0, marginBottom: 18, fontSize: 34, fontWeight: 800, color: "#111827" }}>
            Student Certificates
          </h1>

          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 10,
                background: "#FEF2F2",
                border: "1px solid #FCA5A5",
                color: "#991B1B",
                fontWeight: 700,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 22 }}>
            {/* LEFT: list */}
            <div
              style={{
                background: "#FFF",
                borderRadius: 16,
                boxShadow: "0 8px 20px rgba(16,24,40,0.08)",
                padding: 18,
                border: "1px solid rgba(17,24,39,0.06)",
                minHeight: 520,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#111827" }}>
                  All Certificates ({certificates.length})
                </div>

                
              </div>

              <div style={{ height: 1, background: "#EEF0F3", marginTop: 14, marginBottom: 14 }} />

              {loadingList && certificates.length === 0 ? (
                <div style={{ color: "#6B7280", padding: 12 }}>Loading certificates…</div>
              ) : certificates.length === 0 ? (
                <div style={{ color: "#6B7280", padding: 12 }}>No certificates found.</div>
              ) : (
                <div
                    className="certificates-scroll"
                    style={{ maxHeight: 420, overflowY: "auto", paddingRight: 6 }}
                  >
                  {certificates.map((c) => {
                    const isActive = selected?.id === c.id;
                    const name = `${c.firstname ?? ""} ${c.lastname ?? ""}`.trim() || "Unknown student";

                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelected(c)}
                        style={{
                          all: "unset",
                          width: "90%",
                          margin: "2px",
                          cursor: "pointer",
                          padding: 14,
                          borderRadius: 14,
                          border: isActive ? "2px solid #111827" : "1px solid #E5E7EB",
                          background: isActive ? "#F9FAFB" : "#FFFFFF",
                          boxShadow: isActive ? "0 6px 16px rgba(16,24,40,0.08)" : "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 900,
                              color: "#111827",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: 280,
                            }}
                            title={name}
                          >
                            {name}
                          </div>

                          <div style={{ marginTop: 6, fontSize: 13, color: "#6B7280" }}>
                            {c.certificate_name || "Certificate"}
                          </div>
                        </div>

                        <StatusBadge status={c.status} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT: details */}
            <div
              style={{
                background: "#FFF",
                borderRadius: 16,
                boxShadow: "0 8px 20px rgba(16,24,40,0.08)",
                padding: 18,
                border: "1px solid rgba(17,24,39,0.06)",
                minHeight: 520,
              }}
            >
              {!selected ? (
                <div
                  style={{
                    height: "100%",
                    display: "grid",
                    placeItems: "center",
                    color: "#9CA3AF",
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  Select a certificate from the list to view details.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 950, color: "#111827" }}>{selectedName}</div>
                      <div style={{ marginTop: 6, color: "#6B7280" }}>{selected.certificate_name}</div>
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <StatusBadge status={selected.status} />
                      <button
                        onClick={() => openCertificatePdf(selected.id)}
                        disabled={loadingPdf}
                        style={{
                          border: "1px solid #111827",
                          background: "#111827",
                          color: "#FFFFFF",
                          borderRadius: 12,
                          padding: "10px 14px",
                          fontWeight: 900,
                          cursor: loadingPdf ? "not-allowed" : "pointer",
                        }}
                      >
                        {loadingPdf ? "Opening…" : "Open"}
                      </button>
                      {user.role === "student" ? (
                        <button
                        onClick={() => removeCertificate(selected.id)}
                        disabled={loadingPdf}
                        style={{
                          border: "1px solid #f01212ff",
                          background: "#c71212ff",
                          color: "#FFFFFF",
                          borderRadius: 12,
                          padding: "10px 14px",
                          fontWeight: 900,
                        }}
                      >
                        {"Remove"}
                      </button>
                      ) : (<></>)}
                    </div>
                  </div>

                  <div style={{ height: 1, background: "#EEF0F3", marginTop: 16, marginBottom: 16 }} />

                  {/* Details */}
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", rowGap: 10, columnGap: 16 }}>
                    <div style={{ color: "#6B7280", fontWeight: 900 }}>ID</div>
                    <div style={{ color: "#111827", fontWeight: 700, wordBreak: "break-all" }}>{selected.id}</div>

                    <div style={{ color: "#6B7280", fontWeight: 900 }}>Firstname</div>
                    <div style={{ color: "#111827", fontWeight: 700 }}>{selected.firstname}</div>

                    <div style={{ color: "#6B7280", fontWeight: 900 }}>Lastname</div>
                    <div style={{ color: "#111827", fontWeight: 700 }}>{selected.lastname}</div>

                    <div style={{ color: "#6B7280", fontWeight: 900 }}>Application ID</div>
                    <div style={{ color: "#111827", fontWeight: 700, wordBreak: "break-all" }}>
                      {selected.application_id}
                    </div>

                    <div style={{ color: "#6B7280", fontWeight: 900 }}>Certificate Name</div>
                    <div style={{ color: "#111827", fontWeight: 700 }}>{selected.certificate_name}</div>

                    <div style={{ color: "#6B7280", fontWeight: 900 }}>Status</div>
                    {
                      user.role === "student" ? 
                      (<div style={{ color: "#111827", fontWeight: 700 }}>{normalizeStatus(selected.status)}</div>)
                      :
                      (
                        <select
                          value={normalizeStatus(selected.status)}
                          onChange={(e) => updateCertificateStatus(selected.id, e.target.value)}
                          style={{
                            border: "1px solid #E5E7EB",
                            background: "#FFFFFF",
                            borderRadius: 12,
                            padding: "10px 12px",
                            fontWeight: 800,
                            outline: "none",
                          }}
                        >
                          <option value="Unapproved">Unapproved</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      )
                    }
                  </div>

                  <div style={{ marginTop: 18 }}>
                    <div style={{ color: "#6B7280", fontWeight: 950, marginBottom: 10 }}>Raw JSON</div>
                    <pre
                      style={{
                        margin: 0,
                        padding: 14,
                        borderRadius: 14,
                        background: "#0B1220",
                        color: "#E5E7EB",
                        overflow: "auto",
                        fontSize: 12,
                        lineHeight: 1.5,
                        maxHeight: 260,
                      }}
                    >
                      {JSON.stringify(selected, null, 2)}
                    </pre>
                  </div>

                  <div style={{ flex: 1 }} />
                </div>
              )}
            </div>
          </div>
        </div>
        {user.role === "student" ? (
        <div style={{ padding: 24, background: "#F6F7F9"}}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (!isUploading && (e.key === "Enter" || e.key === " ")) {
                fileInputRef.current?.click();
              }
            }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            style={{
              border: "2px dashed #999",
              borderRadius: 12,
              padding: 28,
              textAlign: "center",
              cursor: isUploading ? "not-allowed" : "pointer",
              opacity: isUploading ? 0.7 : 1,
              background: isDragging ? "#f4f8ff" : "transparent",
              userSelect: "none",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={onFilePick}
              hidden
            />

            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {isUploading
                ? "Uploading…"
                : isDragging
                ? "Drop your PDF to upload"
                : "Drag & drop a PDF here, or click to choose"}
            </div>

            <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
              PDF only • Max 15MB
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 12, color: "#b00020", fontSize: 14 }}>
              {error}
            </div>
          )}
        </div>
        )
        :
        (<div></div>)}
      </div>
    </div>
  );
}
