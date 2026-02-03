import Header from "@/components/Header";
import ProjectList from "@/components/ProjectList";
import TimeTracker from "@/components/TimeTracker";

export default function SpeakerPage() {
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header title="Speaker Department" />
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                <div style={{ marginBottom: '24px', padding: '24px', background: 'var(--surface-color)', borderRadius: 'var(--border-radius-md)' }}>
                    <h2>Speaker Analytics</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
                        Speaker performance and metrics.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    <ProjectList title="Tasks List" />
                    <TimeTracker />
                </div>
            </div>
        </div>
    );
}
