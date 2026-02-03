import Header from "@/components/Header";

export default function HelpPage() {
    return (
        <div>
            <Header title="Help Center" />
            <div style={{ padding: '40px', background: 'var(--surface-color)', borderRadius: 'var(--border-radius-md)' }}>
                <h2>Help & Support</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
                    FAQs and support contact information.
                </p>
            </div>
        </div>
    );
}
