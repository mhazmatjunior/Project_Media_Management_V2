import Header from "@/components/Header";

export default function SettingsPage() {
    return (
        <div>
            <Header title="Settings" />
            <div style={{ padding: '40px', background: 'var(--surface-color)', borderRadius: 'var(--border-radius-md)' }}>
                <h2>Settings</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
                    Application configuration options.
                </p>
            </div>
        </div>
    );
}
