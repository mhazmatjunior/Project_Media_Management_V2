"use client";
import { useState } from 'react';
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import OngoingVideoAnalytics from "@/components/OngoingVideoAnalytics";
import ReminderCard from "@/components/ReminderCard";
import ProjectList from "@/components/ProjectList";
import AddProjectModal from "@/components/AddProjectModal";
import styles from "./page.module.css";

// --- Mock Data ---
const endedData = [
  { name: "Q3 Marketing Video", date: "Completed: Nov 10", color: "#3B82F6" },
  { name: "Product Launch Teaser", date: "Completed: Nov 15", color: "#10B981" },
  { name: "Tutorial Series Ep.1", date: "Completed: Nov 20", color: "#F59E0B" },
];

const runningData = [
  { name: "Holiday Promo 2024", date: "Due: Dec 20", color: "#EF4444" },
  { name: "CEO Interview Edit", date: "Due: Dec 22", color: "#8B5CF6" },
  { name: "Website Background Loop", date: "Due: Dec 25", color: "#EC4899" },
  { name: "Social Media Shorts", date: "Due: Dec 28", color: "#14B8A6" },
];

const pendingData = [
  { name: "Concept Art Review", description: "Waiting for feedback", color: "#6366F1" },
  { name: "Script Approval", description: "Pending CEO review", color: "#8B5CF6" },
];

export default function Home() {
  const [selectedStat, setSelectedStat] = useState('Total Videos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingList, setPendingList] = useState(pendingData);

  // Helper to get correct data
  const getListForStat = () => {
    switch (selectedStat) {
      case 'Ended Videos': return endedData;
      case 'Running Videos': return runningData;
      case 'Pending Videos': return pendingList;
      default: return [];
    }
  };

  const handleAddProject = (newProject) => {
    const project = {
      name: newProject.name,
      description: newProject.description, // using description as substitute for date in this view
      color: "var(--primary-color)"
    };
    setPendingList([...pendingList, project]);
  };

  return (
    <div className={styles.dashboard}>
      <Header title="Dashboard" />

      <div className={styles.mainGrid}>
        {/* Row 1: Stats (Tabs) */}
        <div className={styles.statsRow}>
          <StatCard
            title="Total Videos"
            count="24"
            subtitle="Increased from last month"
            variant={selectedStat === 'Total Videos' ? 'primary' : 'default'}
            onClick={() => setSelectedStat("Total Videos")}
          />
          <StatCard
            title="Ended Videos"
            count={endedData.length}
            subtitle="Increased from last month"
            variant={selectedStat === 'Ended Videos' ? 'primary' : 'default'}
            onClick={() => setSelectedStat("Ended Videos")}
          />
          <StatCard
            title="Running Videos"
            count={runningData.length}
            subtitle="Increased from last month"
            variant={selectedStat === 'Running Videos' ? 'primary' : 'default'}
            onClick={() => setSelectedStat("Running Videos")}
          />
          <StatCard
            title="Pending Videos"
            count={pendingList.length}
            subtitle="On Discuss"
            variant={selectedStat === 'Pending Videos' ? 'primary' : 'default'}
            onClick={() => setSelectedStat("Pending Videos")}
          />
        </div>

        {/* Dynamic Content Row */}
        <div className={styles.splitRow}>
          {selectedStat === 'Total Videos' ? (
            <>
              <div className={styles.analyticsWrapper}>
                <OngoingVideoAnalytics />
              </div>
              <div className={styles.reminderWrapper}>
                <ReminderCard />
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
              <h2 style={{ fontSize: '18px', color: 'var(--secondary-color)', paddingLeft: '4px' }}>
                {selectedStat} List
              </h2>
              <ProjectList
                projects={getListForStat()}
                showAddButton={selectedStat === 'Pending Videos'} // Only show in Pending
                onAddClick={() => setIsModalOpen(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddProject}
      />
    </div>
  );
}
