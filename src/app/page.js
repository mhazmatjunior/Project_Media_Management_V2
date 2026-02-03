"use client";
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addVideo } from '@/lib/features/videoSlice';
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import OngoingVideoAnalytics from "@/components/OngoingVideoAnalytics";
import ReminderCard from "@/components/ReminderCard";
import ProjectList from "@/components/ProjectList";
import AddProjectModal from "@/components/AddProjectModal";
import styles from "./page.module.css";

export default function Home() {
  const [selectedStat, setSelectedStat] = useState('Total Videos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dispatch = useDispatch();
  const videos = useSelector((state) => state.videos.videos);

  // Filter lists based on status
  const endedVideos = videos.filter(v => v.status === 'ended');
  const runningVideos = videos.filter(v => v.status === 'running');
  const pendingVideos = videos.filter(v => v.status === 'pending');

  const totalCount = endedVideos.length + runningVideos.length + pendingVideos.length;

  // Helper to get correct data
  const getListForStat = () => {
    switch (selectedStat) {
      case 'Ended Videos': return endedVideos;
      case 'Running Videos': return runningVideos;
      case 'Pending Videos': return pendingVideos;
      default: return [];
    }
  };

  const handleAddProject = (newProject) => {
    dispatch(addVideo({
      name: newProject.name,
      description: newProject.description,
      date: `Details: ${newProject.description}`, // Formatting for list view if needed
    }));
  };

  return (
    <div className={styles.dashboard}>
      <Header title="Dashboard" />

      <div className={styles.mainGrid}>
        {/* Row 1: Stats (Tabs) */}
        <div className={styles.statsRow}>
          <StatCard
            title="Total Videos"
            count={totalCount}
            subtitle="All projects"
            variant={selectedStat === 'Total Videos' ? 'primary' : 'default'}
            onClick={() => setSelectedStat("Total Videos")}
          />
          <StatCard
            title="Ended Videos"
            count={endedVideos.length}
            subtitle="Completed"
            variant={selectedStat === 'Ended Videos' ? 'primary' : 'default'}
            onClick={() => setSelectedStat("Ended Videos")}
          />
          <StatCard
            title="Running Videos"
            count={runningVideos.length}
            subtitle="In Progress"
            variant={selectedStat === 'Running Videos' ? 'primary' : 'default'}
            onClick={() => setSelectedStat("Running Videos")}
          />
          <StatCard
            title="Pending Videos"
            count={pendingVideos.length}
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
