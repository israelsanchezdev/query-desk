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

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function Brand() {
  return (
    <div className="brand-row">
      <div className="brand-dot" />
      <div className="brand-name">Query Desk</div>
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
    <nav className="top-nav">
      {items.map((item) => {
        const active = item.key === current;
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={active ? "nav-pill active" : "nav-pill"}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

function SidebarCard({ children }: { children: React.ReactNode }) {
  return <div className="sidebar-card">{children}</div>;
}

function PrimaryButton({
  children,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button type={type} onClick={onClick} className="primary-button">
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button type={type} onClick={onClick} className="secondary-button">
      {children}
    </button>
  );
}

function PlainInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="plain-input" />;
}

function PlainTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="plain-input plain-textarea" />;
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
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="icon-button">
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
      // Ignore bad localStorage data.
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
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <Brand />
          <TopNav current={nav} onChange={setNav} />
          <div className="header-actions">
            <button className="icon-button">
              <SunMedium size={20} />
            </button>
            <div className="avatar">JS</div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="layout-grid">
          <aside className="sidebar">
            <div className="sidebar-stack">
              <SidebarCard>
                <div className="card-pad">
                  <p className="eyebrow-soft">Project</p>
                  <div className="select-row">
                    <select
                      value={selectedProject.id}
                      onChange={(e) => handleProjectChange(e.target.value)}
                      className="clean-select"
                    >
                      {state.projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} />
                  </div>
                  <button onClick={() => setShowProjectModal(true)} className="link-button">
                    <Plus size={16} />
                    New project
                  </button>
                </div>
              </SidebarCard>

              <div>
                <p className="section-label">This draft is for</p>
                <SidebarCard>
                  <div className="card-pad roomy">
                    <div className="select-row">
                      <select
                        value={selectedAgent?.id || ""}
                        onChange={(e) => handleAgentChange(e.target.value)}
                        className="clean-select agent-select"
                      >
                        {projectAgents.length === 0 && <option value="">No agent yet</option>}
                        {projectAgents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} />
                    </div>
                    <p className="muted-large">{selectedAgent?.agency || "No agent yet"}</p>
                    <div className="button-row small-gap">
                      <button className="small-secondary">
                        View profile
                        <ArrowRight size={16} />
                      </button>
                      <button onClick={() => setShowAgentModal(true)} className="link-button no-margin">
                        <Plus size={16} />
                        Add agent
                      </button>
                    </div>
                  </div>
                </SidebarCard>
              </div>

              <div>
                <p className="section-label">Agent fit</p>
                <div className="fit-box">
                  <div className="fit-row">
                    <div className="sparkle-circle">
                      <Sparkles size={12} />
                    </div>
                    <p>{selectedAgent?.fitNotes || "Add an agent to start tailoring this query."}</p>
                  </div>
                  <button className="text-link">Edit fit notes</button>
                </div>
              </div>

              <div>
                <p className="section-label">Materials</p>
                <div className="materials-list">
                  {state.materials.map((material) => (
                    <div key={material.id} className="material-row">
                      <div className="material-name">
                        <BookOpen size={16} />
                        <span>{material.name}</span>
                      </div>
                      <button className="icon-button tiny">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  ))}
                  <button className="link-button no-margin">
                    <Plus size={16} />
                    Add material
                  </button>
                </div>
              </div>

              <SidebarCard>
                <div className="pro-card">
                  <div className="pro-label">
                    <Sparkles size={16} />
                    <span>Pro feature</span>
                  </div>
                  <h3>Import from agency URL</h3>
                  <p>Paste an agency website and we’ll extract key details for you.</p>
                  <button
                    onClick={() => {
                      if (!isPro) setShowProModal(true);
                    }}
                    className="orange-button"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              </SidebarCard>

              <div className="settings-row-wrap">
                <button className="settings-row">
                  <span>
                    <Settings size={16} />
                    Settings
                  </span>
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          </aside>

          <section className="content-area">
            {nav === "drafts" && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
              >
                <div className="page-header">
                  <div>
                    <h1>Draft</h1>
                    <p>Write a thoughtful, personalized query.</p>
                  </div>
                  <div className="saved-label">
                    <Check size={16} />
                    {savedLabel}
                  </div>
                </div>

                <div className="subject-block">
                  <label>Subject line</label>
                  <PlainInput value={state.subject} onChange={(e) => updateSubject(e.target.value)} />
                </div>

                <div className="draft-helper-row">
                  <div className="intentional-label">
                    <span />
                    <p>This email feels specific and intentional.</p>
                  </div>
                  <div className="tone-actions">
                    <button>make shorter</button>
                    <button>warmer</button>
                    <button>more formal</button>
                    <button>add achievements</button>
                    <button>
                      more
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>

                <div className="editor-card">
                  <textarea
                    ref={textareaRef}
                    value={state.body}
                    onChange={(e) => updateBody(e.target.value)}
                    className="draft-textarea"
                  />
                  <div className="word-count">
                    {state.body.trim().split(/\s+/).filter(Boolean).length} words
                  </div>
                </div>

                <div className="action-footer">
                  <div className="button-row">
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
              <div className="narrow-page">
                <div className="list-page-header">
                  <div>
                    <h1>Projects</h1>
                    <p>Keep your manuscripts organized and ready to send.</p>
                  </div>
                  <PrimaryButton onClick={() => setShowProjectModal(true)}>
                    <Plus size={16} />
                    New project
                  </PrimaryButton>
                </div>

                <div className="project-grid">
                  {state.projects.map((project) => (
                    <SidebarCard key={project.id}>
                      <div className="card-pad">
                        <div className="project-card-row">
                          <div>
                            <h3>{project.title}</h3>
                            <p>
                              {project.genre} · {project.wordCount.toLocaleString()} words
                            </p>
                          </div>
                          <button onClick={() => handleProjectChange(project.id)} className="text-link">
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
              <div className="wide-page">
                <div className="list-page-header">
                  <div>
                    <h1>People</h1>
                    <p>Save agents and why they fit this project.</p>
                  </div>
                  <PrimaryButton onClick={() => setShowAgentModal(true)}>
                    <Plus size={16} />
                    Add agent
                  </PrimaryButton>
                </div>

                <div className="people-list">
                  {projectAgents.length === 0 ? (
                    <SidebarCard>
                      <div className="empty-card">No agents yet for this project.</div>
                    </SidebarCard>
                  ) : (
                    projectAgents.map((agent) => (
                      <SidebarCard key={agent.id}>
                        <div className="card-pad">
                          <div className="person-row">
                            <div>
                              <h3>{agent.name}</h3>
                              <p className="muted-large">{agent.agency}</p>
                              <p className="person-notes">{agent.fitNotes}</p>
                            </div>
                            <button onClick={() => handleAgentChange(agent.id)} className="text-link">
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
              <div className="wide-page">
                <h1 className="list-title">Sent</h1>
                <p className="list-subtitle">A simple record of what you’ve already sent.</p>

                <div className="people-list">
                  {state.sent.length === 0 ? (
                    <SidebarCard>
                      <div className="empty-card">Nothing marked as sent yet.</div>
                    </SidebarCard>
                  ) : (
                    state.sent.map((record) => {
                      const project = state.projects.find((p) => p.id === record.projectId);
                      const agent = state.agents.find((a) => a.id === record.agentId);
                      return (
                        <SidebarCard key={record.id}>
                          <div className="card-pad">
                            <div className="sent-row">
                              <div>
                                <h3>{agent?.name || "Unknown agent"}</h3>
                                <p>{project?.title || "Unknown project"}</p>
                              </div>
                              <div>Sent {record.sentAt}</div>
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
              <div className="narrow-page">
                <h1 className="list-title">Notes</h1>
                <p className="list-subtitle">
                  A place for later: submission reminders, strategy notes, and follow-ups.
                </p>
                <div className="people-list">
                  <SidebarCard>
                    <div className="empty-card">This screen is ready for your next feature.</div>
                  </SidebarCard>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Modal open={showProjectModal} onClose={() => setShowProjectModal(false)} title="New project">
        <form
          className="form-stack"
          onSubmit={(e) => {
            e.preventDefault();
            addProject(new FormData(e.currentTarget));
          }}
        >
          <PlainInput name="title" placeholder="Book title" />
          <PlainInput name="genre" placeholder="Genre" />
          <PlainInput name="wordCount" type="number" placeholder="Word count" />
          <div className="modal-actions">
            <SecondaryButton onClick={() => setShowProjectModal(false)}>Cancel</SecondaryButton>
            <PrimaryButton type="submit">Create project</PrimaryButton>
          </div>
        </form>
      </Modal>

      <Modal open={showAgentModal} onClose={() => setShowAgentModal(false)} title="Add agent">
        <form
          className="form-stack"
          onSubmit={(e) => {
            e.preventDefault();
            addAgent(new FormData(e.currentTarget));
          }}
        >
          <PlainInput name="name" placeholder="Agent name" />
          <PlainInput name="agency" placeholder="Agency" />
          <PlainInput name="email" placeholder="Email (optional)" />
          <PlainTextarea name="fitNotes" placeholder="Why this agent fits this project" rows={6} />
          <div className="modal-actions">
            <SecondaryButton onClick={() => setShowAgentModal(false)}>Cancel</SecondaryButton>
            <PrimaryButton type="submit">Save agent</PrimaryButton>
          </div>
        </form>
      </Modal>

      <Modal open={showProModal} onClose={() => setShowProModal(false)} title="Upgrade to Pro">
        <div className="form-stack">
          <p className="modal-copy">
            Paste any agency URL and we’ll pull out the details that matter: submission guidelines,
            interests, and public contact paths.
          </p>
          <div className="soft-note">
            Pro makes research faster so the writing can stay front and center.
          </div>
          <div className="modal-actions">
            <SecondaryButton onClick={() => setShowProModal(false)}>Maybe later</SecondaryButton>
            <button className="orange-button">Upgrade</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
