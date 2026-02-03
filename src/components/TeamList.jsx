import { Plus } from "lucide-react";
import styles from "./TeamList.module.css";

const TeamList = ({ embedded = false }) => {
    const members = [
        { name: "Alexandra Deff", role: "Working on Github Project Repository", status: "Completed", img: "https://i.pravatar.cc/150?img=5" },
        { name: "Edwin Adenike", role: "Working on Integrate User Authentication", status: "In Progress", img: "https://i.pravatar.cc/150?img=3" },
        { name: "Isaac Oluwate", role: "Working on Develop Search Functionality", status: "Pending", img: "https://i.pravatar.cc/150?img=8" },
        { name: "David Oshodi", role: "Working on Responsive Layout for Homepage", status: "In Progress", img: "https://i.pravatar.cc/150?img=11" },
    ];

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
                {members.map((member) => (
                    <div key={member.name} className={styles.item}>
                        <img src={member.img} alt={member.name} className={styles.avatar} />
                        <div className={styles.details}>
                            <h4 className={styles.name}>{member.name}</h4>
                            <p className={styles.role}>{member.role}</p>
                        </div>
                        <span className={`${styles.status} ${styles[member.status.replace(" ", "")]}`}>
                            {member.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamList;
