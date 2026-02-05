"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import OngoingVideoAnalytics from "@/components/OngoingVideoAnalytics";
import ReminderCard from "@/components/ReminderCard";
import ProjectList from "@/components/ProjectList";
import AddProjectModal from "@/components/AddProjectModal";
import styles from "./page.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const [selectedStat, setSelectedStat] = useState('Total Videos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication
  // Check authentication and role
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
    } else {
      const session = JSON.parse(localStorage.getItem('user_session'));
      if (session?.role !== 'main_team') {
        // Redirect unauthorized users to their department
        let dest = '/research';
        if (session.departments) {
          try {
            const deps = JSON.parse(session.departments);
            if (Array.isArray(deps) && deps.length > 0) dest = `/${deps[0].toLowerCase()}`;
          } catch (e) {
            const deps = session.departments.split(',');
            if (deps.length > 0 && deps[0].trim()) dest = `/${deps[0].trim().toLowerCase()}`;
          }
        }
        router.push(dest);
      } else {
        setAuthChecked(true);
      }
    }
  }, [router]);

  // Fetch videos from API
  useEffect(() => {
    if (authChecked) {
      fetchVideos();
    }
  }, [authChecked]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/videos');

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      setVideos(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter lists based on status
  const endedVideos = videos.filter(v => v.status === 'ended');
  const runningVideos = videos.filter(v => v.status === 'running');
  const pendingVideos = videos.filter(v => v.status === 'pending');

  const totalCount = videos.length;

  // Helper to get correct data
  const getListForStat = () => {
    switch (selectedStat) {
      case 'Ended Videos': return endedVideos;
      case 'Running Videos': return runningVideos;
      case 'Pending Videos': return pendingVideos;
      default: return [];
    }
  };

  const handleAddProject = async (newProject) => {
    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProject.name,
          description: newProject.description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create video');
      }

      // Refresh the videos list
      await fetchVideos();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding video:', err);
      alert('Failed to add video. Please try again.');
    }
  };

  const handleStartVideo = async (videoId) => {
    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'running',
          currentDepartment: 'research',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start video');
      }

      // Refresh the videos list
      await fetchVideos();
    } catch (err) {
      console.error('Error starting video:', err);
      alert('Failed to start video. Please try again.');
    }
  };



  // Don't render content until auth is verified
  if (!authChecked) {
    return null;
  }

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <Header title="Dashboard" />
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--secondary-color)' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <Header title="Dashboard" />
        <div style={{ padding: '40px', textAlign: 'center', color: '#EF4444' }}>
          Error: {error}
        </div>
      </div>
    );
  }

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
                <OngoingVideoAnalytics videos={runningVideos} />
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
                showStartButton={selectedStat === 'Pending Videos'} // Show Start button for pending
                onStartClick={handleStartVideo}
                showDepartmentBadge={selectedStat === 'Running Videos'} // Show department badge for running videos
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
