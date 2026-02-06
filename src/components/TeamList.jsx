import { Plus } from "lucide-react";
import styles from "./TeamList.module.css";

const TeamList = ({ embedded = false, members = [], loading = false }) => {
    // members prop should be an array of { name, role, status, img }


    return (
        <div className={embedded ? styles.embedded : styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>Team Collaboration</h3>
                {/* Add Member button removed */}
            </div>

            <div className={styles.list}>
                {loading ? (
                    // Loading Skeletons
                    Array.from({ length: 1 }).map((_, i) => (
                        <div key={i} className={styles.item} style={{ opacity: 0.7 }}>
                            <div className={styles.avatar} style={{ backgroundColor: 'var(--border-color)', animation: 'pulse 1.5s infinite' }} />
                            <div className={styles.details} style={{ width: '100%' }}>
                                <div style={{ width: '60%', height: '14px', backgroundColor: 'var(--border-color)', marginBottom: '8px', borderRadius: '4px' }}></div>
                                <div style={{ width: '40%', height: '12px', backgroundColor: 'var(--border-color)', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    ))
                ) : members.length > 0 ? (
                    members.map((member, index) => (
                        <div key={`${member.name}-${index}`} className={styles.item}>
                            <img
                                src={member.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                                alt={member.name}
                                className={styles.avatar}
                            />
                            <div className={styles.details}>
                                <h4 className={styles.name}>{member.name}</h4>
                                <p className={styles.role}>{member.role}</p>
                            </div>
                            <span className={`${styles.status} ${styles[member.status.replace(" ", "")]}`}>
                                {member.status}
                            </span>
                        </div>
                    ))
                ) : (
                    <div style={{ padding: '20px', color: '#888', textAlign: 'center' }}>
                        No collaboration history yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamList;
