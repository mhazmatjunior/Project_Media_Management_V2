import { Plus } from "lucide-react";
import styles from "./TeamList.module.css";

const TeamList = ({ embedded = false, members = [] }) => {
    // members prop should be an array of { name, role, status, img }


    return (
        <div className={embedded ? styles.embedded : styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>Team Collaboration</h3>
                <button className={styles.addButton}>
                    <Plus size={14} />
                    <span>Add Member</span>
                </button>
            </div>

            <div className={styles.list}>
                {members.length > 0 ? (
                    members.map((member, index) => (
                        <div key={`${member.name}-${index}`} className={styles.item}>
                            <img src={member.img} alt={member.name} className={styles.avatar} />
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
