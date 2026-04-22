import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  Mail,
  MoreHorizontal,
  Plus,
  Settings,
  Sparkles,
  SunMedium,
  X,
} from "lucide-react";

type Project = {
  id: string;
  title: string;
  genre: string;
  wordCount: number;
};

type Agent = {
  id: string;
  projectId: string;
  name: string;
  agency: string;
  fitNotes: string;
  email?: string;
};

type Material = {
  id: string;
  name: string;
};

type SentRecord = {
  id: string;
  projectId: string;
  agentId: string;
  sentAt: string;
  subject: string;
};

type NavKey = "projects" | "people" | "drafts" | "sent" | "notes";

type AppState = {
  projects: Project[];
  agents: Agent[];
  materials: Material[];
  sent: SentRecord[];
  selectedProjectId: string;
  selectedAgentId: string;
  subject: string;
  body: string;
};

const STORAGE_KEY = "querydesk-v1";

const defaultProjects: Project[] = [
  { id: "p1", title: "Untitled Memoir", genre: "Memoir", wordCount: 85000 },
  { id: "p2", title: "The Quiet Authority", genre: "Thriller", wordCount: 92000 },
];

const defaultAgents: Agent[] = [
  {
    id: "a1",
    projectId: "p1",
    name: "Jessica Regel",
    agency: "Foundry Literary + Media",
    fitNotes:
      "Jessica represents narrative nonfiction with a focus on memoir and psychological true stories.",
    email: "jessica@example.com",
  },
  {
    id: "a2",
    projectId: "p2",
    name: "Noah Price",
    agency: "Ridgeway Literary",
    fitNotes:
      "Noah is a strong fit for high-concept thrillers with institutional stakes and moral tension.",
    email: "noah@example.com",
  },
];

const defaultMaterials: Material[] = [
  { id: "m1", name: "Query Letter.pdf" },
  { id: "m2", name: "Synopsis.pdf" },
];

function createInitialState(): AppState {
  return {
    projects: defaultProjects,
    agents: defaultAgents,
    materials: defaultMaterials,
    sent: [],
    selectedProjectId: defaultProjects[0].id,
    selectedAgentId: defaultAgents[0].id,
    subject: "Query: Untitled Memoir",
    body: `Dear Jessica,

I’m writing to query you with my memoir, Untitled Memoir, an 85,000-word exploration of childhood, identity, and the long arc of becoming.

As someone who represents powerful narrative nonfiction that explores the psychological underpinnings of personal transformation, I believe this story would be a strong fit for your list.

I’ve attached my query letter and synopsis for your consideration. Thank you for your time and for all the important work you do.

Warmly,
Israel Sanchez`,
  };
}

function makeBody(project: Project, agent: Agent | undefined) {
  const first = agent?.name?.split(" ")[0] || "there";
  const fit = agent?.fitNotes || "the kinds of books you champion";
  return `Dear ${first},

I’m writing to query you with my ${project.genre.toLowerCase()}, ${project.title}, a ${project.wordCount.toLocaleString()}-word project.

Based on your interest in ${fit.toLowerCase()}, I believe this could be a strong fit for your list.

I’ve attached my query letter and synopsis for your consideration. Thank you for your time and for all the important work you do.

Warmly,
Israel Sanchez`;
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div
        style={{
          height: 12,
          width: 12,
          borderRadius: "999px",
          background: "#ff6a00",
        }}
      />
      <div
        className="font-serif"
        style={{
          fontSize: 22,
          fontWeight: 600,
          fontStyle: "italic",
          letterSpacing: "-0.02em",
          color: "#1f1a17",
        }}
      >
        Query Desk
      </div>
    </div>
  );
}

function TopNav({
  current,
  onChange,
}: {
  current: NavKey;
  onChange: (key: NavKey) => void;
}) {
  const items: { key: NavKey; label: string }[] = [
    { key: "projects", label: "Projects" },
    { key: "people", label: "People" },
    { key: "drafts", label: "Drafts" },
    { key: "sent", label: "Sent" },
    { key: "notes", label: "Notes" },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {items.map((item) => {
        const active = item.key === current;
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            style={{
              border: "none",
              borderRadius: 16,
              padding: "10px 16px",
              fontSize: 15,
              background: active ? "#fff0e4" : "transparent",
              color: active ? "#ff6a00" : "#5f5750",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function SidebarCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        borderRadius: 18,
        border: "1px solid #e8dfd5",
        background: "#fbf8f4",
      }}
    >
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 18,
        border: "none",
        background: "#1e1815",
        padding: "14px 20px",
        fontSize: 15,
        fontWeight: 500,
        color: "white",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 18,
        border: "1px solid #e8dfd5",
        background: "#fbf8f4",
        padding: "14px 20px",
        fontSize: 15,
        fontWeight: 500,
        color: "#2a2420",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function PlainInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        borderRadius: 18,
        border: "1px solid #e8dfd5",
        background: "#fbf8f4",
        padding: "14px 16px",
        color: "#1f1a17",
        outline: "none",
      }}
    />
  );
}

function PlainTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        width: "100%",
        borderRadius: 18,
        border: "1px solid #e8dfd5",
        background: "#fbf8f4",
        padding: "14px 16px",
        color: "#1f1a17",
        outline: "none",
      }}
    />
  );
}

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.25)",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          borderRadius: 24,
          border: "1px solid #e8dfd5",
          background: "#fdfaf6",
          padding: 24,
          boxShadow: "0 30px 80px rgba(0,0,0,0.16)",
        }}
      >
        <div
          style={{
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3
            className="font-serif"
            style={{ fontSize: 28, fontWeight: 600, color: "#1f1a17", margin: 0 }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              borderRadius: 999,
              padding: 8,
              cursor: "pointer",
              color: "#7e756e",
            }}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CopyAndOpenGmail({ subject, body }: { subject: string; body: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}`,
        "_blank"
      );
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}`,
        "_blank"
      );
    }
  }

  return (
    <SecondaryButton onClick={handleClick}>
      <Mail size={16} />
      {copied ? "Copied" : "Copy & open Gmail"}
    </SecondaryButton>
  );
}

export default function App() {
  const [nav, setNav] = useState<NavKey>("drafts");
  const [isPro] = useState(false);
  const [state, setState] = useState<AppState>(createInitialState);
  const [savedLabel, setSavedLabel] = useState("Draft saved");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const selectedProject = useMemo(
    () => state.projects.find((p) => p.id === state.selectedProjectId) ?? state.projects[0],
    [state.projects, state.selectedProjectId]
  );

  const projectAgents = useMemo(
    () => state.agents.filter((a) => a.projectId === selectedProject.id),
    [state.agents, selectedProject.id]
  );

  const selectedAgent = useMemo(
    () => projectAgents.find((a) => a.id === state.selectedAgentId) ?? projectAgents[0],
    [projectAgents, state.selectedAgentId]
  );

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as AppState;
      setState(parsed);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (nav === "drafts") textareaRef.current?.focus();
  }, [nav]);

  function updateSubject(subject: string) {
    setState((prev) => ({ ...prev, subject }));
    setSavedLabel("Saving...");
    window.setTimeout(() => setSavedLabel("Draft saved"), 350);
  }

  function updateBody(body: string) {
    setState((prev) => ({ ...prev, body }));
    setSavedLabel("Saving...");
    window.setTimeout(() => setSavedLabel("Draft saved"), 350);
  }

  function handleProjectChange(projectId: string) {
    const nextProject = state.projects.find((p) => p.id === projectId);
    if (!nextProject) return;
    const nextAgents = state.agents.filter((a) => a.projectId === projectId);
    const nextAgent = nextAgents[0];

    setState((prev) => ({
      ...prev,
      selectedProjectId: projectId,
      selectedAgentId: nextAgent?.id || "",
      subject: `Query: ${nextProject.title}`,
      body: makeBody(nextProject, nextAgent),
    }));
  }

  function handleAgentChange(agentId: string) {
    const nextAgent = state.agents.find((a) => a.id === agentId);
    if (!nextAgent) return;
    setState((prev) => ({
      ...prev,
      selectedAgentId: agentId,
      body: makeBody(selectedProject, nextAgent),
    }));
  }

  function addProject(formData: FormData) {
    const title = String(formData.get("title") || "").trim();
    const genre = String(formData.get("genre") || "Memoir").trim();
    const wordCount = Number(formData.get("wordCount") || 0);
    if (!title) return;

    const nextProject: Project = {
      id: uid(),
      title,
      genre,
      wordCount: wordCount || 70000,
    };

    setState((prev) => ({
      ...prev,
      projects: [nextProject, ...prev.projects],
      selectedProjectId: nextProject.id,
      selectedAgentId: "",
      subject: `Query: ${nextProject.title}`,
      body: `Dear [Agent Name],

I’m writing to query you with my ${nextProject.genre.toLowerCase()}, ${nextProject.title}, a ${nextProject.wordCount.toLocaleString()}-word project.

Thank you for your time and consideration.

Warmly,
Israel Sanchez`,
    }));
    setShowProjectModal(false);
    setNav("projects");
  }

  function addAgent(formData: FormData) {
    const name = String(formData.get("name") || "").trim();
    const agency = String(formData.get("agency") || "").trim();
    const fitNotes = String(formData.get("fitNotes") || "").trim();
    const email = String(formData.get("email") || "").trim();
    if (!name) return;

    const nextAgent: Agent = {
      id: uid(),
      projectId: selectedProject.id,
      name,
      agency,
      fitNotes,
      email,
    };

    setState((prev) => ({
      ...prev,
      agents: [nextAgent, ...prev.agents],
      selectedAgentId: nextAgent.id,
      body: makeBody(selectedProject, nextAgent),
    }));
    setShowAgentModal(false);
    setNav("people");
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(state.body);
      setSavedLabel("Email copied");
      window.setTimeout(() => setSavedLabel("Draft saved"), 1400);
    } catch {
      setSavedLabel("Draft saved");
    }
  }

  function markSent() {
    if (!selectedAgent) return;
    const record: SentRecord = {
      id: uid(),
      projectId: selectedProject.id,
      agentId: selectedAgent.id,
      sentAt: new Date().toLocaleDateString(),
      subject: state.subject,
    };
    setState((prev) => ({ ...prev, sent: [record, ...prev.sent] }));
    setSavedLabel("Marked as sent");
    setNav("sent");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f6f3ef", color: "#1f1a17" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          borderBottom: "1px solid #e8dfd5",
          background: "rgba(246,243,239,0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            margin: "0 auto",
            maxWidth: 1480,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 40px",
          }}
        >
          <Brand />
          <TopNav current={nav} onChange={setNav} />
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              style={{
                border: "none",
                background: "transparent",
                borderRadius: 999,
                padding: 8,
                color: "#7a736c",
                cursor: "pointer",
              }}
            >
              <SunMedium size={20} />
            </button>
            <div
              style={{
                display: "flex",
                height: 44,
                width: 44,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                border: "1px solid #e8dfd5",
                background: "#f3ede7",
                fontSize: 15,
                color: "#4c4540",
              }}
            >
              JS
            </div>
          </div>
        </div>
      </header>

      <main style={{ margin: "0 auto", maxWidth: 1480, padding: "0 20px" }}>
        <div
          style={{
            display: "grid",
            minHeight: "calc(100vh - 88px)",
            gridTemplateColumns: "335px minmax(0,1fr)",
          }}
        >
          <aside
            style={{
              borderRight: "1px solid #e8dfd5",
              padding: "24px 20px",
              opacity: 0.95,
            }}
          >
            <div style={{ display: "grid", gap: 28 }}>
              <SidebarCard className="sidebar-card">
                <div style={{ padding: 16 }}>
                  <p style={{ margin: "0 0 8px", fontSize: 14, color: "#8f867d" }}>Project</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <select
                      value={selectedProject.id}
                      onChange={(e) => handleProjectChange(e.target.value)}
                      style={{
                        width: "100%",
                        appearance: "none",
                        background: "transparent",
                        border: "none",
                        fontSize: 16,
                        color: "#2a2420",
                        outline: "none",
                      }}
                    >
                      {state.projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} color="#8d857d" />
                  </div>
                  <button
                    onClick={() => setShowProjectModal(true)}
                    style={{
                      marginTop: 16,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      border: "none",
                      background: "transparent",
                      color: "#ff6a00",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={16} />
                    New project
                  </button>
                </div>
              </SidebarCard>

              <div>
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#958c84",
                  }}
                >
                  This draft is for
                </p>
                <SidebarCard>
                  <div style={{ padding: 20 }}>
                    <div style={{ display: "grid", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <select
                          value={selectedAgent?.id || ""}
                          onChange={(e) => handleAgentChange(e.target.value)}
                          style={{
                            width: "100%",
                            appearance: "none",
                            background: "transparent",
                            border: "none",
                            fontSize: 18,
                            fontWeight: 500,
                            color: "#1f1a17",
                            outline: "none",
                          }}
                        >
                          {projectAgents.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                              {agent.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={16} color="#8d857d" />
                      </div>
                      <p style={{ margin: 0, fontSize: 16, color: "#6f675f" }}>
                        {selectedAgent?.agency || "No agent yet"}
                      </p>
                    </div>
                    <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 12 }}>
                      <button
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          borderRadius: 14,
                          border: "1px solid #e8dfd5",
                          background: "#f8f3ee",
                          padding: "10px 16px",
                          fontSize: 15,
                          color: "#2e2824",
                          cursor: "pointer",
                        }}
                      >
                        View profile
                        <ArrowRight size={16} />
                      </button>
                      <button
                        onClick={() => setShowAgentModal(true)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          border: "none",
                          background: "transparent",
                          color: "#ff6a00",
                          fontSize: 15,
                          cursor: "pointer",
                        }}
                      >
                        <Plus size={16} />
                        Add agent
                      </button>
                    </div>
                  </div>
                </SidebarCard>
              </div>

              <div>
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#958c84",
                  }}
                >
                  Agent fit
                </p>
                <div style={{ padding: "0 12px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div
                      style={{
                        marginTop: 4,
                        display: "flex",
                        height: 20,
                        width: 20,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 999,
                        background: "#fff0e4",
                        color: "#ff6a00",
                      }}
                    >
                      <Sparkles size={12} />
                    </div>
                    <p
                      style={{
                        maxWidth: 230,
                        margin: 0,
                        fontSize: 16,
                        lineHeight: 2,
                        color: "#5f5750",
                      }}
                    >
                      {selectedAgent?.fitNotes || "Add an agent to start tailoring this query."}
                    </p>
                  </div>
                  <button
                    style={{
                      marginTop: 16,
                      border: "none",
                      background: "transparent",
                      color: "#ff6a00",
                      fontSize: 16,
                      cursor: "pointer",
                    }}
                  >
                    Edit fit notes
                  </button>
                </div>
              </div>

              <div>
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#958c84",
                  }}
                >
                  Materials
                </p>
                <div style={{ display: "grid", gap: 16, padding: "0 4px" }}>
                  {state.materials.map((material) => (
                    <div
                      key={material.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                        fontSize: 16,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#2f2925" }}>
                        <BookOpen size={16} color="#6f675f" />
                        <span>{material.name}</span>
                      </div>
                      <button
                        style={{
                          border: "none",
                          background: "transparent",
                          borderRadius: 999,
                          padding: 4,
                          color: "#8f867d",
                          cursor: "pointer",
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 12,
                      border: "none",
                      background: "transparent",
                      color: "#ff6a00",
                      fontSize: 16,
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={16} />
                    Add material
                  </button>
                </div>
              </div>

              <SidebarCard>
                <div style={{ background: "#f3ece5", padding: 20, borderRadius: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#ff6a00" }}>
                    <Sparkles size={16} />
                    <span style={{ fontSize: 15, fontWeight: 500 }}>Pro feature</span>
                  </div>
                  <h3
                    style={{
                      margin: "16px 0 0",
                      fontSize: 28,
                      lineHeight: 1,
                      fontWeight: 600,
                      letterSpacing: "-0.03em",
                      color: "#1f1a17",
                    }}
                  >
                    Import from agency URL
                  </h3>
                  <p
                    style={{
                      margin: "12px 0 0",
                      fontSize: 16,
                      lineHeight: 1.8,
                      color: "#5f5750",
                    }}
                  >
                    Paste an agency website and we’ll extract key details for you.
                  </p>
                  <button
                    onClick={() => {
                      if (!isPro) setShowProModal(true);
                    }}
                    style={{
                      marginTop: 20,
                      border: "none",
                      borderRadius: 12,
                      background: "#ff6a00",
                      padding: "14px 20px",
                      fontSize: 16,
                      fontWeight: 500,
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    Upgrade to Pro
                  </button>
                </div>
              </SidebarCard>

              <div style={{ borderTop: "1px solid #e8dfd5", paddingTop: 20 }}>
                <button
                  style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "none",
                    background: "transparent",
                    fontSize: 16,
                    color: "#5f5750",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                    <Settings size={16} />
                    Settings
                  </span>
                  <ChevronDown size={16} style={{ transform: "rotate(-90deg)" }} />
                </button>
              </div>
            </div>
          </aside>

          <section style={{ padding: "32px 40px" }}>
            {nav === "drafts" && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 24,
                  }}
                >
                  <div>
                    <h1
                      className="font-serif"
                      style={{
                        margin: 0,
                        fontSize: 62,
                        fontWeight: 600,
                        lineHeight: 1,
                        letterSpacing: "-0.04em",
                        color: "#1f1a17",
                      }}
                    >
                      Draft
                    </h1>
                    <p style={{ margin: "12px 0 0", fontSize: 16, color: "#6f675f" }}>
                      Write a thoughtful, personalized query.
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      paddingTop: 12,
                      fontSize: 15,
                      color: "#7f7770",
                    }}
                  >
                    <Check size={16} />
                    {savedLabel}
                  </div>
                </div>

                <div style={{ marginTop: 40 }}>
                  <label
                    style={{
                      marginBottom: 12,
                      display: "block",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#2d2824",
                    }}
                  >
                    Subject line
                  </label>
                  <PlainInput
                    value={state.subject}
                    onChange={(e) => updateSubject(e.target.value)}
                  />
                </div>

                <div
                  style={{
                    marginTop: 40,
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 20,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 16, color: "#7b7169" }}>
                    <span
                      style={{
                        height: 10,
                        width: 10,
                        borderRadius: 999,
                        background: "#ff6a00",
                        display: "inline-block",
                      }}
                    />
                    <span>This email feels specific and intentional.</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 28,
                      fontSize: 16,
                      color: "#6f675f",
                    }}
                  >
                    <button style={{ border: "none", background: "transparent", color: "inherit", cursor: "pointer" }}>
                      make shorter
                    </button>
                    <button style={{ border: "none", background: "transparent", color: "inherit", cursor: "pointer" }}>
                      warmer
                    </button>
                    <button style={{ border: "none", background: "transparent", color: "inherit", cursor: "pointer" }}>
                      more formal
                    </button>
                    <button style={{ border: "none", background: "transparent", color: "inherit", cursor: "pointer" }}>
                      add achievements
                    </button>
                    <button
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        border: "none",
                        background: "transparent",
                        color: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      more
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 32,
                    borderRadius: 18,
                    border: "1px solid #e8dfd5",
                    background: "#fbf8f4",
                    padding: 28,
                  }}
                >
                  <textarea
                    ref={textareaRef}
                    value={state.body}
                    onChange={(e) => updateBody(e.target.value)}
                    style={{
                      minHeight: 510,
                      width: "100%",
                      resize: "none",
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      fontFamily: '"Instrument Serif", Georgia, serif',
                      fontSize: 20,
                      lineHeight: 2.2,
                      color: "#2d2824",
                      outline: "none",
                    }}
                  />
                  <div style={{ marginTop: 20, fontSize: 15, color: "#867d75" }}>
                    {state.body.trim().split(/\s+/).filter(Boolean).length} words
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 28,
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
                    <PrimaryButton onClick={copyEmail}>
                      <Copy size={16} />
                      Copy email
                    </PrimaryButton>
                    <CopyAndOpenGmail subject={state.subject} body={state.body} />
                  </div>

                  <SecondaryButton onClick={markSent}>
                    <Check size={16} />
                    Mark as sent
                  </SecondaryButton>
                </div>
              </motion.div>
            )}

            {nav === "projects" && (
              <div style={{ maxWidth: 900 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 20,
                  }}
                >
                  <div>
                    <h1 className="font-serif" style={{ margin: 0, fontSize: 54, fontWeight: 600 }}>
                      Projects
                    </h1>
                    <p style={{ marginTop: 8, fontSize: 16, color: "#6f675f" }}>
                      Keep your manuscripts organized and ready to send.
                    </p>
                  </div>
                  <PrimaryButton onClick={() => setShowProjectModal(true)}>
                    <Plus size={16} />
                    New project
                  </PrimaryButton>
                </div>
                <div
                  style={{
                    marginTop: 40,
                    display: "grid",
                    gap: 16,
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  }}
                >
                  {state.projects.map((project) => (
                    <SidebarCard key={project.id}>
                      <div style={{ padding: 20 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 16,
                          }}
                        >
                          <div>
                            <h3 style={{ margin: 0, fontSize: 24, fontWeight: 500, color: "#1f1a17" }}>
                              {project.title}
                            </h3>
                            <p style={{ margin: "4px 0 0", fontSize: 16, color: "#6f675f" }}>
                              {project.genre} · {project.wordCount.toLocaleString()} words
                            </p>
                          </div>
                          <button
                            onClick={() => handleProjectChange(project.id)}
                            style={{
                              border: "none",
                              background: "transparent",
                              color: "#ff6a00",
                              fontSize: 15,
                              cursor: "pointer",
                            }}
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    </SidebarCard>
                  ))}
                </div>
              </div>
            )}

            {nav === "people" && (
              <div style={{ maxWidth: 1100 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 20,
                  }}
                >
                  <div>
                    <h1 className="font-serif" style={{ margin: 0, fontSize: 54, fontWeight: 600 }}>
                      People
                    </h1>
                    <p style={{ marginTop: 8, fontSize: 16, color: "#6f675f" }}>
                      Save agents and why they fit this project.
                    </p>
                  </div>
                  <PrimaryButton onClick={() => setShowAgentModal(true)}>
                    <Plus size={16} />
                    Add agent
                  </PrimaryButton>
                </div>
                <div style={{ marginTop: 40, display: "grid", gap: 16 }}>
                  {projectAgents.length === 0 ? (
                    <SidebarCard>
                      <div style={{ padding: 32 }}>
                        <p style={{ margin: 0, fontSize: 16, color: "#6f675f" }}>
                          No agents yet for this project.
                        </p>
                      </div>
                    </SidebarCard>
                  ) : (
                    projectAgents.map((agent) => (
                      <SidebarCard key={agent.id}>
                        <div style={{ padding: 20 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: 24,
                            }}
                          >
                            <div>
                              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 500 }}>
                                {agent.name}
                              </h3>
                              <p style={{ margin: "4px 0 0", fontSize: 16, color: "#6f675f" }}>
                                {agent.agency}
                              </p>
                              <p
                                style={{
                                  margin: "16px 0 0",
                                  maxWidth: 720,
                                  fontSize: 16,
                                  lineHeight: 2,
                                  color: "#5f5750",
                                }}
                              >
                                {agent.fitNotes}
                              </p>
                            </div>
                            <button
                              onClick={() => handleAgentChange(agent.id)}
                              style={{
                                border: "none",
                                background: "transparent",
                                color: "#ff6a00",
                                fontSize: 15,
                                cursor: "pointer",
                              }}
                            >
                              Use in draft
                            </button>
                          </div>
                        </div>
                      </SidebarCard>
                    ))
                  )}
                </div>
              </div>
            )}

            {nav === "sent" && (
              <div style={{ maxWidth: 1100 }}>
                <h1 className="font-serif" style={{ margin: 0, fontSize: 54, fontWeight: 600 }}>
                  Sent
                </h1>
                <p style={{ marginTop: 8, fontSize: 16, color: "#6f675f" }}>
                  A simple record of what you’ve already sent.
                </p>
                <div style={{ marginTop: 40, display: "grid", gap: 16 }}>
                  {state.sent.length === 0 ? (
                    <SidebarCard>
                      <div style={{ padding: 32 }}>
                        <p style={{ margin: 0, fontSize: 16, color: "#6f675f" }}>
                          Nothing marked as sent yet.
                        </p>
                      </div>
                    </SidebarCard>
                  ) : (
                    state.sent.map((record) => {
                      const project = state.projects.find((p) => p.id === record.projectId);
                      const agent = state.agents.find((a) => a.id === record.agentId);
                      return (
                        <SidebarCard key={record.id}>
                          <div style={{ padding: 20 }}>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 16,
                              }}
                            >
                              <div>
                                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>
                                  {agent?.name || "Unknown agent"}
                                </h3>
                                <p style={{ margin: "4px 0 0", fontSize: 16, color: "#6f675f" }}>
                                  {project?.title || "Unknown project"}
                                </p>
                              </div>
                              <div style={{ fontSize: 15, color: "#7e756e" }}>
                                Sent {record.sentAt}
                              </div>
                            </div>
                          </div>
                        </SidebarCard>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {nav === "notes" && (
              <div style={{ maxWidth: 900 }}>
                <h1 className="font-serif" style={{ margin: 0, fontSize: 54, fontWeight: 600 }}>
                  Notes
                </h1>
                <p style={{ marginTop: 8, fontSize: 16, color: "#6f675f" }}>
                  A place for later: submission reminders, strategy notes, and follow-ups.
                </p>
                <div style={{ marginTop: 40 }}>
                  <SidebarCard>
                    <div style={{ padding: 32 }}>
                      <p style={{ margin: 0, fontSize: 16, color: "#6f675f" }}>
                        This screen is ready for your next feature.
                      </p>
                    </div>
                  </SidebarCard>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Modal open={showProjectModal} onClose={() => setShowProjectModal(false)} title="New project">
        <form
          style={{ display: "grid", gap: 16 }}
          onSubmit={(e) => {
            e.preventDefault();
            addProject(new FormData(e.currentTarget));
          }}
        >
          <PlainInput name="title" placeholder="Book title" />
          <PlainInput name="genre" placeholder="Genre" />
          <PlainInput name="wordCount" type="number" placeholder="Word count" />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 8 }}>
            <SecondaryButton onClick={() => setShowProjectModal(false)}>Cancel</SecondaryButton>
            <PrimaryButton type="submit">Create project</PrimaryButton>
          </div>
        </form>
      </Modal>

      <Modal open={showAgentModal} onClose={() => setShowAgentModal(false)} title="Add agent">
        <form
          style={{ display: "grid", gap: 16 }}
          onSubmit={(e) => {
            e.preventDefault();
            addAgent(new FormData(e.currentTarget));
          }}
        >
          <PlainInput name="name" placeholder="Agent name" />
          <PlainInput name="agency" placeholder="Agency" />
          <PlainInput name="email" placeholder="Email (optional)" />
          <PlainTextarea name="fitNotes" placeholder="Why this agent fits this project" rows={6} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 8 }}>
            <SecondaryButton onClick={() => setShowAgentModal(false)}>Cancel</SecondaryButton>
            <PrimaryButton type="submit">Save agent</PrimaryButton>
          </div>
        </form>
      </Modal>

      <Modal open={showProModal} onClose={() => setShowProModal(false)} title="Upgrade to Pro">
        <div style={{ display: "grid", gap: 16 }}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.8, color: "#5f5750" }}>
            Paste any agency URL and we’ll pull out the details that matter: submission guidelines,
            interests, and public contact paths.
          </p>
          <div
            style={{
              borderRadius: 16,
              background: "#f7efe7",
              padding: 16,
              fontSize: 15,
              color: "#6a6058",
            }}
          >
            Pro makes research faster so the writing can stay front and center.
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 8 }}>
            <SecondaryButton onClick={() => setShowProModal(false)}>Maybe later</SecondaryButton>
            <button
              style={{
                border: "none",
                borderRadius: 18,
                background: "#ff6a00",
                padding: "14px 20px",
                fontSize: 15,
                fontWeight: 500,
                color: "white",
                cursor: "pointer",
              }}
            >
              Upgrade
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}