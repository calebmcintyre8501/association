import { useEffect, useMemo, useState } from "react";
import {
  assets,
  contracts,
  guildInfo,
  guildLore,
  type Contract,
  type Asset,
} from "./data";

type Section =
  | "overview"
  | "lore"
  | "contracts"
  | "bounties"
  | "members"
  | "assets";

type Member = {
  id: number;
  name: string;
  title: string;
  specialty: string;
  status: string;
  quote: string;
  image?: string;
};

type Bounty = {
  id: number;
  title: string;
  target: string;
  reward: string;
  risk: string;
  status: string;
  issuer: string;
  summary: string;
  image?: string;
  location?: string;
  alignment?: string;
};

type RequestForm = {
  title: string;
  target: string;
  reward: string;
  risk: string;
  status: string;
  issuer: string;
  summary: string;
  image: string;
  location: string;
  alignment: string;
};

type BountyRequest = {
  timestamp: string;
  title: string;
  target: string;
  reward: string;
  risk: string;
  status: string;
  issuer: string;
  summary: string;
  image?: string;
  location?: string;
  alignment?: string;
};

function getStatusClass(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "member-status active";
    case "reserve":
      return "member-status reserve";
    case "deployed":
      return "member-status deployed";
    case "unavailable":
      return "member-status unavailable";
    default:
      return "member-status";
  }
}

function getRankBadgeClass(title?: string) {
  if (!title) return "rank-badge";

  switch (title.toLowerCase()) {
    case "director":
      return "rank-badge director";
    case "assistant director":
      return "rank-badge assistant-director";
    case "associate":
      return "rank-badge associate";
    default:
      return "rank-badge";
  }
}

function getRankSymbol(title?: string) {
  if (!title) return "◆";

  switch (title.toLowerCase()) {
    case "director":
      return "✦"; // top
    case "assistant director":
      return "✧"; // mid-tier
    case "associate":
      return "◆"; // base
    default:
      return "◆";
  }
}

function getBountyRiskClass(risk: string) {
  switch (risk.toLowerCase()) {
    case "standard":
      return "difficulty difficulty-standard";
    case "elevated":
      return "difficulty difficulty-elevated";
    case "extreme":
      return "difficulty difficulty-extreme";
    default:
      return "difficulty";
  }
}

function getLocationClass(location?: string) {
  if (!location) return "location-tag";

  switch (location.toLowerCase()) {
    case "tython":
      return "location-tag tython";
    case "korriban":
      return "location-tag korriban";
    case "ilum":
      return "location-tag ilum";
    case "tatooine":
      return "location-tag tatooine";
    case "nar shaddaa":
      return "location-tag narshaddaa";
    default:
      return "location-tag";
  }
}

function getAlignmentClass(alignment?: string) {
  if (!alignment) return "alignment-tag";

  switch (alignment.toLowerCase()) {
    case "jedi":
      return "alignment-tag jedi";
    case "sith":
      return "alignment-tag sith";
    case "neutral":
      return "alignment-tag neutral";
    default:
      return "alignment-tag";
  }
}

function getInfluenceClass(alignment: string) {
  switch (alignment.toLowerCase()) {
    case "jedi":
      return "influence-card jedi";
    case "sith":
      return "influence-card sith";
    case "neutral":
      return "influence-card neutral";
    default:
      return "influence-card";
  }
}

function getBountyStatusClass(status?: string) {
  if (!status) return "bounty-status-tag";

  switch (status.toLowerCase()) {
    case "open":
      return "bounty-status-tag open";
    case "completed":
      return "bounty-status-tag completed";
    case "cancelled":
      return "bounty-status-tag cancelled";
    default:
      return "bounty-status-tag";
  }
}

const rewardTable: Record<string, Record<string, string>> = {
  Escort: {
    Standard: "18000 credits",
    Elevated: "26000 credits",
    Extreme: "38000 credits",
  },
  Bounty: {
    Standard: "30000 credits",
    Elevated: "45000 credits",
    Extreme: "60000 credits",
  },
  Recover: {
    Standard: "22000 credits",
    Elevated: "32000 credits",
    Extreme: "46000 credits",
  },
  Military: {
    Standard: "35000 credits",
    Elevated: "50000 credits",
    Extreme: "70000 credits",
  },
  Security: {
    Standard: "20000 credits",
    Elevated: "27000 credits",
    Extreme: "40000 credits",
  },
};

const EMPTY_REQUEST_FORM: RequestForm = {
  title: "Escort",
  target: "",
  reward: "18000 credits",
  risk: "Standard",
  status: "Pending Review",
  issuer: "",
  summary: "",
  image: "",
  location: "",
  alignment: "Neutral",
};

const ADMIN_PASSWORD = "association123";

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);

  const [members, setMembers] = useState<Member[]>([]);
  const [bounties, setBounties] = useState<Bounty[]>([]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Roster standby");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [requestForm, setRequestForm] =
    useState<RequestForm>(EMPTY_REQUEST_FORM);
  const [requestStatus, setRequestStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const [bountyActionStatus, setBountyActionStatus] = useState<
    "idle" | "updating" | "success" | "error"
  >("idle");

  const [memberForm, setMemberForm] = useState({
    name: "",
    title: "Associate",
    specialty: "",
    status: "Active",
    quote: "",
    image: "",
  });

  const [memberFormStatus, setMemberFormStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const [memberEditForm, setMemberEditForm] = useState({
    id: 0,
    name: "",
    title: "Associate",
    specialty: "",
    status: "Active",
    quote: "",
    image: "",
  });

  const [memberEditStatus, setMemberEditStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const [bountyRequests, setBountyRequests] = useState<BountyRequest[]>([]);
  const [requestActionStatus, setRequestActionStatus] = useState<
    "idle" | "updating" | "success" | "error"
  >("idle");

  const [isAdmin, setIsAdmin] = useState(
    sessionStorage.getItem("association-admin") === "true",
  );
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminError, setAdminError] = useState("");

  const MEMBER_SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vS7MqQGBxn9CmGVWZ2aVN4L-DBkwrPBzxFCDZLYNxw6m9a431QGbP39WmIpsNC-35hta0qyY1EHGHdJ/pub?gid=0&single=true&output=csv";

  const BOUNTY_SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vS7MqQGBxn9CmGVWZ2aVN4L-DBkwrPBzxFCDZLYNxw6m9a431QGbP39WmIpsNC-35hta0qyY1EHGHdJ/pub?gid=1281151237&single=true&output=csv";

  const BOUNTY_REQUEST_SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vS7MqQGBxn9CmGVWZ2aVN4L-DBkwrPBzxFCDZLYNxw6m9a431QGbP39WmIpsNC-35hta0qyY1EHGHdJ/pub?gid=2063085278&single=true&output=csv";

  const CONTRACT_REQUEST_URL =
    "https://script.google.com/macros/s/AKfycbyr4UJlR7eHmkc0Jp_EOgi4-NfrUBc4UAHTJwuRCuJuC6M4nmYYt6DOJjKdxIPL2BTGKg/exec";

  const ADMIN_ACTION_URL = CONTRACT_REQUEST_URL;

  useEffect(() => {
    const reward = rewardTable[requestForm.title]?.[requestForm.risk] ?? "";
    setRequestForm((prev) => ({ ...prev, reward }));
  }, [requestForm.title, requestForm.risk]);

  useEffect(() => {
    const fetchMembers = async () => {
      setIsSyncing(true);
      setSyncStatus("Syncing roster...");

      try {
        const res = await fetch(`${MEMBER_SHEET_URL}&t=${Date.now()}`);
        const text = await res.text();

        const rows = text
          .split("\n")
          .slice(1)
          .map((row) => row.trim())
          .filter(Boolean);

        const parsed = rows
          .map((row) => {
            const cols = row.split(",");
            return {
              id: Number(cols[0]),
              name: cols[1]?.trim() ?? "",
              title: cols[2]?.trim() ?? "",
              specialty: cols[3]?.trim() ?? "",
              status: cols[4]?.trim() ?? "",
              quote: cols[5]?.trim() ?? "",
              image: cols[6]?.trim() ?? "",
            };
          })
          .filter((member) => member.name);

        setMembers(parsed);
        setSyncStatus("Roster updated");
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (error) {
        console.error("Failed to load members:", error);
        setSyncStatus("Sync failed");
      } finally {
        setIsSyncing(false);
      }
    };

    fetchMembers();
    const interval = setInterval(fetchMembers, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchBounties = async () => {
      try {
        const res = await fetch(`${BOUNTY_SHEET_URL}&t=${Date.now()}`);
        const text = await res.text();

        const rows = text
          .split("\n")
          .slice(1)
          .map((row) => row.trim())
          .filter(Boolean);

        const parsed = rows
          .map((row) => {
            const cols = row.split(",");
            return {
              id: Number(cols[0]),
              title: cols[1]?.trim() ?? "",
              target: cols[2]?.trim() ?? "",
              reward: cols[3]?.trim() ?? "",
              risk: cols[4]?.trim() ?? "",
              status: cols[5]?.trim() ?? "",
              issuer: cols[6]?.trim() ?? "",
              summary: cols[7]?.trim() ?? "",
              image: cols[8]?.trim() ?? "",
              location: cols[9]?.trim() ?? "",
              alignment: cols[10]?.trim() ?? "",
            };
          })
          .filter((bounty) => bounty.title);

        setBounties(parsed);
      } catch (error) {
        console.error("Failed to load bounties:", error);
      }
    };

    fetchBounties();
    const interval = setInterval(fetchBounties, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchBountyRequests = async () => {
      try {
        const res = await fetch(`${BOUNTY_REQUEST_SHEET_URL}&t=${Date.now()}`);
        const text = await res.text();

        const rows = text
          .split("\n")
          .slice(1)
          .map((row) => row.trim())
          .filter(Boolean);

        const parsed = rows
          .map((row) => {
            const cols = row.split(",");
            return {
              timestamp: cols[0]?.trim() ?? "",
              title: cols[1]?.trim() ?? "",
              target: cols[2]?.trim() ?? "",
              reward: cols[3]?.trim() ?? "",
              risk: cols[4]?.trim() ?? "",
              status: cols[5]?.trim() ?? "",
              issuer: cols[6]?.trim() ?? "",
              summary: cols[7]?.trim() ?? "",
              image: cols[8]?.trim() ?? "",
              location: cols[9]?.trim() ?? "",
              alignment: cols[10]?.trim() ?? "",
            };
          })
          .filter((request) => request.title);

        setBountyRequests(parsed);
      } catch (error) {
        console.error("Failed to load bounty requests:", error);
      }
    };

    fetchBountyRequests();
    const interval = setInterval(fetchBountyRequests, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAdminLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (adminPasswordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      sessionStorage.setItem("association-admin", "true");
      setAdminPasswordInput("");
      setAdminError("");
    } else {
      setAdminError("Invalid access code.");
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem("association-admin");
    setAdminPasswordInput("");
    setAdminError("");
  };

  const handleRequestChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setRequestForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRequestSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!CONTRACT_REQUEST_URL) {
      setRequestStatus("error");
      return;
    }

    setRequestStatus("submitting");

    try {
      const res = await fetch(CONTRACT_REQUEST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(requestForm),
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (!data.success) {
        throw new Error(data.error || "Request failed");
      }

      setRequestStatus("success");
      setRequestForm(EMPTY_REQUEST_FORM);
    } catch (error) {
      console.error("Contract request failed:", error);
      setRequestStatus("error");
    }
  };

  const handleMemberChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setMemberForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMemberSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMemberFormStatus("submitting");

    try {
      const res = await fetch(CONTRACT_REQUEST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          action: "addMember",
          ...memberForm,
        }),
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (!data.success) {
        throw new Error(data.error || "Failed to add member");
      }

      setMemberFormStatus("success");
      setMemberForm({
        name: "",
        title: "Associate",
        specialty: "",
        status: "Active",
        quote: "",
        image: "",
      });
    } catch (error) {
      console.error("Failed to add member:", error);
      setMemberFormStatus("error");
    }
  };

  const openMemberEditor = (member: Member) => {
    setSelectedMember(member);
    setMemberEditStatus("idle");
    setMemberEditForm({
      id: member.id,
      name: member.name,
      title: member.title,
      specialty: member.specialty,
      status: member.status,
      quote: member.quote,
      image: member.image ?? "",
    });
  };

  const handleMemberEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setMemberEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMemberUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMemberEditStatus("submitting");

    try {
      const res = await fetch(CONTRACT_REQUEST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          action: "updateMember",
          ...memberEditForm,
        }),
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (!data.success) {
        throw new Error(data.error || "Failed to update member");
      }

      setMembers((prev) =>
        prev.map((member) =>
          member.id === memberEditForm.id
            ? {
                ...member,
                name: memberEditForm.name,
                title: memberEditForm.title,
                specialty: memberEditForm.specialty,
                status: memberEditForm.status,
                quote: memberEditForm.quote,
                image: memberEditForm.image,
              }
            : member,
        ),
      );

      setSelectedMember((prev) =>
        prev && prev.id === memberEditForm.id
          ? {
              ...prev,
              name: memberEditForm.name,
              title: memberEditForm.title,
              specialty: memberEditForm.specialty,
              status: memberEditForm.status,
              quote: memberEditForm.quote,
              image: memberEditForm.image,
            }
          : prev,
      );

      setMemberEditStatus("success");
    } catch (error) {
      console.error("Failed to update member:", error);
      setMemberEditStatus("error");
    }
  };

  const sortedMembers = useMemo(() => {
    const rankOrder: Record<string, number> = {
      Director: 1,
      "Assistant Director": 2,
      Associate: 3,
    };

    return [...members].sort((a, b) => {
      return (rankOrder[a.title] || 99) - (rankOrder[b.title] || 99);
    });
  }, [members]);

  const handleReviewRequest = async (
    requestTimestamp: string,
    newStatus: "Accepted" | "Denied",
  ) => {
    setRequestActionStatus("updating");

    try {
      const res = await fetch(CONTRACT_REQUEST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          action: "reviewBountyRequest",
          timestamp: requestTimestamp,
          status: newStatus,
        }),
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (!data.success) {
        throw new Error(data.error || "Failed to review request");
      }

      setBountyRequests((prev) =>
        prev.map((request) =>
          request.timestamp === requestTimestamp
            ? { ...request, status: newStatus }
            : request,
        ),
      );

      setRequestActionStatus("success");
    } catch (error) {
      console.error("Failed to review request:", error);
      setRequestActionStatus("error");
    }
  };

  const handleBountyStatusUpdate = async (
    bountyId: number,
    newStatus: "Completed" | "Cancelled",
  ) => {
    setBountyActionStatus("updating");

    try {
      const res = await fetch(ADMIN_ACTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          action: "updateBountyStatus",
          id: bountyId,
          status: newStatus,
        }),
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (!data.success) {
        throw new Error(data.error || "Failed to update bounty");
      }

      setBounties((prev) =>
        prev.map((bounty) =>
          bounty.id === bountyId ? { ...bounty, status: newStatus } : bounty,
        ),
      );

      setSelectedBounty((prev) =>
        prev && prev.id === bountyId ? { ...prev, status: newStatus } : prev,
      );

      setBountyActionStatus("success");
    } catch (error) {
      console.error("Failed to update bounty status:", error);
      setBountyActionStatus("error");
    }
  };

  const filteredContracts = useMemo(() => {
    return contracts.filter((contract: Contract) => {
      const matchesSearch =
        contract.title.toLowerCase().includes(search.toLowerCase()) ||
        contract.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || contract.category === selectedCategory;

      const matchesDifficulty =
        selectedDifficulty === "All" ||
        contract.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [search, selectedCategory, selectedDifficulty]);

  const completedBounties = useMemo(() => {
    return bounties.filter(
      (bounty) => bounty.status?.toLowerCase() === "completed",
    );
  }, [bounties]);

  const openBounties = useMemo(() => {
    return bounties.filter(
      (bounty) => bounty.status?.trim().toLowerCase() === "open",
    );
  }, [bounties]);

  const sectorActivity = useMemo(() => {
    const counts: Record<string, number> = {};

    completedBounties.forEach((bounty) => {
      const location = bounty.location?.trim();
      if (!location) return;
      counts[location] = (counts[location] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([location, count]) => ({ location, count }));
  }, [completedBounties]);

  const alignmentInfluence = useMemo(() => {
    const counts: Record<string, number> = {
      Jedi: 0,
      Sith: 0,
      Neutral: 0,
    };

    completedBounties.forEach((bounty) => {
      const alignment = bounty.alignment?.trim();
      if (!alignment) return;
      if (alignment in counts) counts[alignment] += 1;
    });

    return counts;
  }, [completedBounties]);

  const dominantAlignment = useMemo(() => {
    const entries = Object.entries(alignmentInfluence);
    const sorted = entries.sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0 || sorted[0][1] === 0) {
      return "Neutral";
    }

    return sorted[0][0];
  }, [alignmentInfluence]);

  const terminalFeed = [
    isSyncing
      ? "Personnel registry synchronization in progress"
      : "Personnel registry synchronized",
    `${members.length} personnel files loaded into the registry`,
    `${openBounties.length} active bounty postings available`,
    "Outer Rim contract traffic remains elevated",
  ];

  return (
    <div className="page-shell">
      <header className="hero">
        <div className="hero-backdrop" />
        <div className="scanline" />

        <div className="hero-inner">
          <div className="hero-copy">
            <p className="hero-kicker">Independent Mercenary Registry</p>

            <div className="group-title-block">
              <h1>{guildInfo.name}</h1>
              <p className="aurebesh-subtitle title-aurebesh">
                {guildInfo.name}
              </p>
            </div>

            <p className="hero-tagline">{guildInfo.tagline}</p>

            <div className="hero-badges">
              <span>Outer Rim Contracts</span>
              <span>Private Security</span>
              <span>Bounty Operations</span>
            </div>

            <div className="hero-actions">
              <button onClick={() => setActiveSection("contracts")}>
                View Pricing
              </button>
              <button
                className="secondary"
                onClick={() => setActiveSection("members")}
              >
                View Roster
              </button>
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-frame">
              <div>
                <p className="panel-label">Guild Motto</p>
                <p className="panel-value">{guildInfo.motto}</p>
                <p className="panel-value-sub">{guildInfo.motto}</p>
              </div>

              <div className="divider" />

              <div>
                <p className="panel-label">Transmission</p>
                <p className="aurebesh-subtitle small">Transmission Active</p>
                <p className="panel-small">
                  Contract acceptance subject to advance payment, operational
                  scope, and hazard tier approval.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="top-nav">
        <button
          className={activeSection === "overview" ? "active" : ""}
          onClick={() => setActiveSection("overview")}
        >
          Overview
        </button>
        <button
          className={activeSection === "lore" ? "active" : ""}
          onClick={() => setActiveSection("lore")}
        >
          Lore
        </button>
        <button
          className={activeSection === "contracts" ? "active" : ""}
          onClick={() => setActiveSection("contracts")}
        >
          Contracts
        </button>
        <button
          className={activeSection === "bounties" ? "active" : ""}
          onClick={() => setActiveSection("bounties")}
        >
          Bounties
        </button>
        <button
          className={activeSection === "members" ? "active" : ""}
          onClick={() => setActiveSection("members")}
        >
          Members
        </button>
        <button
          className={activeSection === "assets" ? "active" : ""}
          onClick={() => setActiveSection("assets")}
        >
          Assets
        </button>
      </nav>

      <main className="content">
        {activeSection === "overview" && (
          <section className="panel">
            <div className="section-heading">
              <p className="section-kicker">Guild Overview</p>
              <h2>The Association</h2>
            </div>

            <p className="section-text">
              A contract-driven mercenary guild offering armed escorts,
              recoveries, enforcement operations, bounty work, and tactical
              deployments across unstable systems.
            </p>

            <div className="stats-grid">
              <div className="stat-card">
                <span>{contracts.length}</span>
                <p>Active Contract Types</p>
              </div>
              <div className="stat-card">
                <span>{members.length}</span>
                <p>Registered Members</p>
              </div>
              <div className="stat-card">
                <span>{openBounties.length}</span>
                <p>Open Bounties</p>
              </div>
              <div className="stat-card">
                <span>{completedBounties.length}</span>
                <p>Completed Operations</p>
              </div>
              <div className="stat-card">
                <span>{assets.length}</span>
                <p>Known Assets</p>
              </div>
              <div className="stat-card">
                <span>{isSyncing ? "LIVE" : "READY"}</span>
                <p>Registry Status</p>
              </div>
            </div>

            <div className="terminal-feed">
              <p className="panel-label">Transmission Feed</p>
              <div className="divider" />
              {terminalFeed.map((item, index) => (
                <p key={index} className="terminal-line">
                  &gt; {item}
                </p>
              ))}
            </div>

            <div className="overview-grid">
              <div className="overview-subpanel">
                <p className="panel-label">Sector Activity</p>
                <div className="divider" />

                {sectorActivity.length > 0 ? (
                  <div className="sector-list">
                    {sectorActivity.map((sector) => (
                      <div key={sector.location} className="sector-row">
                        <span className={getLocationClass(sector.location)}>
                          {sector.location}
                        </span>
                        <span className="sector-count">{sector.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="panel-small">
                    No completed operations recorded yet.
                  </p>
                )}
              </div>

              <div className="overview-subpanel">
                <p className="panel-label">Faction Influence</p>
                <div className="divider" />

                <div className="influence-grid">
                  <div className={getInfluenceClass("Jedi")}>
                    <span className="influence-title">Jedi</span>
                    <span className="influence-value">
                      {alignmentInfluence.Jedi}
                    </span>
                  </div>

                  <div className={getInfluenceClass("Sith")}>
                    <span className="influence-title">Sith</span>
                    <span className="influence-value">
                      {alignmentInfluence.Sith}
                    </span>
                  </div>

                  <div className={getInfluenceClass("Neutral")}>
                    <span className="influence-title">Neutral</span>
                    <span className="influence-value">
                      {alignmentInfluence.Neutral}
                    </span>
                  </div>
                </div>

                <p className="panel-small dominant-line">
                  Current lean:{" "}
                  <span className="gold-text">{dominantAlignment}</span>
                </p>
              </div>
            </div>

            <div className="admin-panel">
              <p className="panel-label">Bounty Request Queue</p>
              <div className="divider" />

              {!isAdmin ? (
                <p className="panel-small">
                  Admin access required to review incoming contracts.
                </p>
              ) : bountyRequests.filter(
                  (request) =>
                    request.status?.trim().toLowerCase() === "pending review",
                ).length > 0 ? (
                <div className="request-queue">
                  {bountyRequests
                    .filter(
                      (request) =>
                        request.status?.trim().toLowerCase() ===
                        "pending review",
                    )
                    .map((request) => (
                      <div key={request.timestamp} className="request-card">
                        <div className="card-top">
                          <h3>{request.title}</h3>
                          <span className={getBountyRiskClass(request.risk)}>
                            {request.risk}
                          </span>
                        </div>

                        <p>
                          <strong>Target:</strong> {request.target}
                        </p>
                        <p>
                          <strong>Issuer:</strong> {request.issuer}
                        </p>

                        <div className="bounty-tag-row">
                          {request.location && (
                            <span
                              className={getLocationClass(request.location)}
                            >
                              {request.location}
                            </span>
                          )}
                          {request.alignment && (
                            <span
                              className={getAlignmentClass(request.alignment)}
                            >
                              {request.alignment}
                            </span>
                          )}
                          <span className="reward-tag">{request.reward}</span>
                        </div>

                        <p>{request.summary}</p>

                        <div className="admin-bounty-actions">
                          <button
                            type="button"
                            onClick={() =>
                              handleReviewRequest(request.timestamp, "Accepted")
                            }
                            disabled={requestActionStatus === "updating"}
                          >
                            Accept
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Deny this bounty request?")) {
                                handleReviewRequest(
                                  request.timestamp,
                                  "Denied",
                                );
                              }
                            }}
                            disabled={requestActionStatus === "updating"}
                          >
                            Deny
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="panel-small">No pending requests.</p>
              )}

              {isAdmin && requestActionStatus === "success" && (
                <p className="contract-form-note">
                  Request updated successfully.
                </p>
              )}

              {isAdmin && requestActionStatus === "error" && (
                <p className="contract-form-note">Failed to update request.</p>
              )}
            </div>

            <div className="admin-panel">
              <p className="panel-label">Admin Access</p>
              <div className="divider" />

              {!isAdmin ? (
                <form className="admin-login-form" onSubmit={handleAdminLogin}>
                  <input
                    type="password"
                    placeholder="Enter access code"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                  />
                  <button type="submit">Unlock Admin Mode</button>

                  {adminError && (
                    <p className="contract-form-note">{adminError}</p>
                  )}
                </form>
              ) : (
                <div className="admin-unlocked">
                  <p className="panel-small">
                    Administrative tools are enabled for this console.
                  </p>
                  <button type="button" onClick={handleAdminLogout}>
                    Disable Admin Mode
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {activeSection === "lore" && (
          <section className="panel">
            <div className="section-heading">
              <p className="section-kicker">Archive Entry</p>
              <h2>Guild Lore</h2>
            </div>

            <p className="lore-text">{guildLore}</p>
          </section>
        )}

        {activeSection === "contracts" && (
          <section className="panel">
            <div className="section-heading">
              <p className="section-kicker">Operational Board</p>
              <h2>Contract Pricing</h2>
            </div>

            <div className="filters">
              <input
                type="text"
                placeholder="Search contracts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Security">Security</option>
                <option value="Bounty">Bounty</option>
                <option value="Recovery">Recovery</option>
                <option value="Escort">Escort</option>
                <option value="Military">Military</option>
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                <option value="All">All Risk Levels</option>
                <option value="Standard">Standard</option>
                <option value="Elevated">Elevated</option>
                <option value="Extreme">Extreme</option>
              </select>
            </div>

            <div className="card-grid">
              {filteredContracts.map((contract: Contract) => (
                <article
                  key={contract.id}
                  className="info-card contract-card"
                  onClick={() => setSelectedContract(contract)}
                >
                  <div className="card-top">
                    <h3>{contract.title}</h3>
                    <span
                      className={`difficulty difficulty-${contract.difficulty.toLowerCase()}`}
                    >
                      {contract.difficulty}
                    </span>
                  </div>

                  <p className="contract-category">{contract.category}</p>
                  <p>{contract.description}</p>
                  <strong>{contract.price}</strong>
                </article>
              ))}
            </div>

            <form className="contract-form" onSubmit={handleRequestSubmit}>
              <h3>Request Contract Review</h3>

              <div className="contract-form-grid">
                <select
                  name="title"
                  value={requestForm.title}
                  onChange={handleRequestChange}
                >
                  <option value="Escort">Escort</option>
                  <option value="Bounty">Bounty</option>
                  <option value="Recover">Recover</option>
                  <option value="Military">Military</option>
                  <option value="Security">Security</option>
                </select>

                <select
                  name="risk"
                  value={requestForm.risk}
                  onChange={handleRequestChange}
                >
                  <option value="Standard">Standard</option>
                  <option value="Elevated">Elevated</option>
                  <option value="Extreme">Extreme</option>
                </select>

                <input
                  type="text"
                  name="target"
                  placeholder="Target / objective"
                  value={requestForm.target}
                  onChange={handleRequestChange}
                  required
                />

                <input
                  type="text"
                  name="issuer"
                  placeholder="Issuer"
                  value={requestForm.issuer}
                  onChange={handleRequestChange}
                  required
                />

                <select
                  name="location"
                  value={requestForm.location}
                  onChange={handleRequestChange}
                  required
                >
                  <option value="">Select Location</option>
                  <option value="Tython">Tython</option>
                  <option value="Korriban">Korriban</option>
                  <option value="Ilum">Ilum</option>
                  <option value="Tatooine">Tatooine</option>
                  <option value="Nar Shaddaa">Nar Shaddaa</option>
                </select>

                <select
                  name="alignment"
                  value={requestForm.alignment}
                  onChange={handleRequestChange}
                >
                  <option value="Neutral">Neutral</option>
                  <option value="Jedi">Jedi</option>
                  <option value="Sith">Sith</option>
                </select>

                <input
                  type="text"
                  name="reward"
                  value={requestForm.reward}
                  readOnly
                />

                <input
                  type="text"
                  name="image"
                  placeholder="Image URL (optional)"
                  value={requestForm.image}
                  onChange={handleRequestChange}
                />
              </div>

              <textarea
                name="summary"
                placeholder="Describe the operation..."
                value={requestForm.summary}
                onChange={handleRequestChange}
                required
              />

              <button type="submit" disabled={requestStatus === "submitting"}>
                {requestStatus === "submitting"
                  ? "Transmitting..."
                  : "Transmit Request"}
              </button>

              {requestStatus === "success" && (
                <p className="contract-form-note">
                  Request transmitted successfully.
                </p>
              )}

              {requestStatus === "error" && (
                <p className="contract-form-note">
                  Transmission failed. Try again.
                </p>
              )}
            </form>
          </section>
        )}

        {activeSection === "bounties" && (
          <section className="panel">
            <div className="section-heading">
              <p className="section-kicker">Target Registry</p>
              <h2>Bounty Board</h2>
            </div>

            <div className="card-grid">
              {bounties.map((bounty) => (
                <article
                  key={bounty.id}
                  className="info-card bounty-card"
                  onClick={() => setSelectedBounty(bounty)}
                >
                  {bounty.image && bounty.image.trim() ? (
                    <div className="bounty-image-wrap">
                      <img
                        className="bounty-image"
                        src={bounty.image.trim()}
                        alt={bounty.title}
                      />
                    </div>
                  ) : null}

                  <div className="card-top">
                    <h3>{bounty.title}</h3>
                    <span className={getBountyRiskClass(bounty.risk)}>
                      {bounty.risk}
                    </span>
                  </div>

                  <p className="asset-type">Target: {bounty.target}</p>
                  <p>{bounty.summary}</p>

                  <div className="bounty-tag-row">
                    {bounty.alignment && (
                      <span className={getAlignmentClass(bounty.alignment)}>
                        {bounty.alignment}
                      </span>
                    )}

                    {bounty.location && (
                      <span className={getLocationClass(bounty.location)}>
                        {bounty.location}
                      </span>
                    )}

                    <span className="reward-tag">{bounty.reward}</span>

                    <span className={getBountyStatusClass(bounty.status)}>
                      {bounty.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <div className="admin-panel">
              <p className="panel-label">Admin Access</p>
              <div className="divider" />

              {!isAdmin ? (
                <form className="admin-login-form" onSubmit={handleAdminLogin}>
                  <input
                    type="password"
                    placeholder="Enter access code"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                  />
                  <button type="submit">Unlock Admin Mode</button>

                  {adminError && (
                    <p className="contract-form-note">{adminError}</p>
                  )}
                </form>
              ) : (
                <div className="admin-unlocked">
                  <p className="panel-small">
                    Administrative tools are enabled for this console.
                  </p>
                  <button type="button" onClick={handleAdminLogout}>
                    Disable Admin Mode
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {activeSection === "members" && (
          <section className="panel">
            <div className="section-heading">
              <p className="section-kicker">Roster</p>
              <h2>Guild Personnel</h2>
            </div>

            <p
              className={
                isSyncing ? "sync-indicator syncing" : "sync-indicator"
              }
            >
              {isSyncing
                ? "[SYNC ACTIVE] Updating personnel registry..."
                : syncStatus === "Sync failed"
                  ? "[SYNC FAILURE] Registry link unstable"
                  : `[SYNC COMPLETE] Last update: ${lastUpdated ?? "Standby"}`}
            </p>

            <div className="card-grid">
              {sortedMembers.map((member) => (
                <article
                  key={member.id}
                  className="info-card member-card"
                  onClick={() => openMemberEditor(member)}
                >
                  <div className="member-header">
                    {member.image && member.image.trim() ? (
                      <div className="member-avatar">
                        <img
                          src={member.image.trim()}
                          alt={member.name}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        className="member-avatar fallback"
                        aria-hidden="true"
                      >
                        {member.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                    )}

                    <div className="member-meta">
                      <div className="member-name-block">
                        <h3>{member.name}</h3>
                        <p className="aurebesh-subtitle small member-aurebesh">
                          {member.name}
                        </p>
                      </div>

                      <div className="member-rank-row">
                        <span className={getRankBadgeClass(member.title)}>
                          <span className="rank-symbol">
                            {getRankSymbol(member.title)}
                          </span>
                          {member.title}
                        </span>
                      </div>

                      <p className={getStatusClass(member.status)}>
                        {member.status}
                      </p>
                    </div>
                  </div>

                  <p>
                    <strong>Specialty:</strong> {member.specialty}
                  </p>

                  <blockquote>“{member.quote}”</blockquote>
                </article>
              ))}
            </div>

            {isAdmin && (
              <form className="contract-form" onSubmit={handleMemberSubmit}>
                <h3>Add Member</h3>

                <div className="contract-form-grid">
                  <input
                    type="text"
                    name="name"
                    placeholder="Member name"
                    value={memberForm.name}
                    onChange={handleMemberChange}
                    required
                  />

                  <select
                    name="title"
                    value={memberForm.title}
                    onChange={handleMemberChange}
                  >
                    <option value="Associate">Associate</option>
                    <option value="Assistant Director">
                      Assistant Director
                    </option>
                    <option value="Director">Director</option>
                  </select>

                  <input
                    type="text"
                    name="specialty"
                    placeholder="Specialty"
                    value={memberForm.specialty}
                    onChange={handleMemberChange}
                    required
                  />

                  <select
                    name="status"
                    value={memberForm.status}
                    onChange={handleMemberChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Reserve">Reserve</option>
                    <option value="Deployed">Deployed</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>

                  <input
                    type="text"
                    name="image"
                    placeholder="Image URL (optional)"
                    value={memberForm.image}
                    onChange={handleMemberChange}
                  />
                </div>

                <textarea
                  name="quote"
                  placeholder="Quote"
                  value={memberForm.quote}
                  onChange={handleMemberChange}
                  required
                />

                <button
                  type="submit"
                  disabled={memberFormStatus === "submitting"}
                >
                  {memberFormStatus === "submitting"
                    ? "Adding..."
                    : "Add Member"}
                </button>

                {memberFormStatus === "success" && (
                  <p className="contract-form-note">
                    Member added successfully.
                  </p>
                )}

                {memberFormStatus === "error" && (
                  <p className="contract-form-note">Failed to add member.</p>
                )}
              </form>
            )}

            <div className="admin-panel">
              <p className="panel-label">Admin Access</p>
              <div className="divider" />

              {!isAdmin ? (
                <form className="admin-login-form" onSubmit={handleAdminLogin}>
                  <input
                    type="password"
                    placeholder="Enter access code"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                  />
                  <button type="submit">Unlock Admin Mode</button>

                  {adminError && (
                    <p className="contract-form-note">{adminError}</p>
                  )}
                </form>
              ) : (
                <div className="admin-unlocked">
                  <p className="panel-small">
                    Administrative tools are enabled for this console.
                  </p>
                  <button type="button" onClick={handleAdminLogout}>
                    Disable Admin Mode
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {activeSection === "assets" && (
          <section className="panel">
            <div className="section-heading">
              <p className="section-kicker">Equipment Manifest</p>
              <h2>Guild Assets</h2>
            </div>

            <div className="card-grid">
              {assets.map((asset: Asset) => (
                <article key={asset.id} className="info-card">
                  <h3>{asset.name}</h3>
                  <p className="asset-type">{asset.type}</p>
                  <p>{asset.description}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      {selectedContract && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedContract(null)}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <p className="section-kicker">Contract Detail</p>
            <h3>{selectedContract.title}</h3>
            <p className="contract-category">{selectedContract.category}</p>
            <p>{selectedContract.description}</p>

            <div className="modal-meta">
              <span>{selectedContract.price}</span>
              <span>{selectedContract.difficulty}</span>
            </div>

            <button onClick={() => setSelectedContract(null)}>Close</button>
          </div>
        </div>
      )}

      {selectedMember && (
        <div className="modal-backdrop" onClick={() => setSelectedMember(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <p className="section-kicker">Personnel File</p>
            <h3>{selectedMember.name}</h3>
            <p className="aurebesh-subtitle small">{selectedMember.name}</p>

            <div className="modal-meta">
              <span>{selectedMember.title}</span>
              <span>{selectedMember.status}</span>
            </div>

            <p>
              <strong>Specialty:</strong> {selectedMember.specialty}
            </p>

            <blockquote>“{selectedMember.quote}”</blockquote>

            {isAdmin && (
              <form className="contract-form" onSubmit={handleMemberUpdate}>
                <h3>Edit Member</h3>

                <div className="contract-form-grid">
                  <input
                    type="text"
                    name="name"
                    placeholder="Member name"
                    value={memberEditForm.name}
                    onChange={handleMemberEditChange}
                    required
                  />

                  <select
                    name="title"
                    value={memberEditForm.title}
                    onChange={handleMemberEditChange}
                  >
                    <option value="Associate">Associate</option>
                    <option value="Assistant Director">
                      Assistant Director
                    </option>
                    <option value="Director">Director</option>
                  </select>

                  <input
                    type="text"
                    name="specialty"
                    placeholder="Specialty"
                    value={memberEditForm.specialty}
                    onChange={handleMemberEditChange}
                    required
                  />

                  <select
                    name="status"
                    value={memberEditForm.status}
                    onChange={handleMemberEditChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Reserve">Reserve</option>
                    <option value="Deployed">Deployed</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>

                  <input
                    type="text"
                    name="image"
                    placeholder="Image URL (optional)"
                    value={memberEditForm.image}
                    onChange={handleMemberEditChange}
                  />
                </div>

                <textarea
                  name="quote"
                  placeholder="Quote"
                  value={memberEditForm.quote}
                  onChange={handleMemberEditChange}
                  required
                />

                <button
                  type="submit"
                  disabled={memberEditStatus === "submitting"}
                >
                  {memberEditStatus === "submitting"
                    ? "Saving..."
                    : "Save Changes"}
                </button>

                {memberEditStatus === "success" && (
                  <p className="contract-form-note">
                    Member updated successfully.
                  </p>
                )}

                {memberEditStatus === "error" && (
                  <p className="contract-form-note">Failed to update member.</p>
                )}
              </form>
            )}

            <button onClick={() => setSelectedMember(null)}>Close</button>
          </div>
        </div>
      )}

      {selectedBounty && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setSelectedBounty(null);
            setBountyActionStatus("idle");
          }}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <p className="section-kicker">Bounty Detail</p>
            <h3>{selectedBounty.title}</h3>

            <div className="modal-meta">
              <span>Target: {selectedBounty.target}</span>
              <span>Reward: {selectedBounty.reward}</span>
              <span>{selectedBounty.risk}</span>
              <span>{selectedBounty.status}</span>
            </div>

            <p>
              <strong>Issuer:</strong> {selectedBounty.issuer}
            </p>

            <div className="bounty-tag-row modal-location-row">
              {selectedBounty.location && (
                <span className={getLocationClass(selectedBounty.location)}>
                  {selectedBounty.location}
                </span>
              )}

              {selectedBounty.alignment && (
                <span className={getAlignmentClass(selectedBounty.alignment)}>
                  {selectedBounty.alignment}
                </span>
              )}
            </div>

            <p>{selectedBounty.summary}</p>

            {isAdmin && selectedBounty.status === "Open" && (
              <div className="admin-bounty-actions">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Mark this bounty as Completed?")) {
                      handleBountyStatusUpdate(selectedBounty.id, "Completed");
                    }
                  }}
                  disabled={bountyActionStatus === "updating"}
                >
                  {bountyActionStatus === "updating"
                    ? "Updating..."
                    : "Mark Completed"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Cancel this bounty?")) {
                      handleBountyStatusUpdate(selectedBounty.id, "Cancelled");
                    }
                  }}
                  disabled={bountyActionStatus === "updating"}
                >
                  {bountyActionStatus === "updating"
                    ? "Updating..."
                    : "Cancel Bounty"}
                </button>
              </div>
            )}

            {bountyActionStatus === "success" && (
              <p className="contract-form-note">Bounty status updated.</p>
            )}

            {bountyActionStatus === "error" && (
              <p className="contract-form-note">Failed to update bounty.</p>
            )}

            <button
              onClick={() => {
                setSelectedBounty(null);
                setBountyActionStatus("idle");
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
