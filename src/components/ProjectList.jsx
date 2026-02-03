import { Plus } from "lucide-react";
import styles from "./ProjectList.module.css";

const ProjectList = ({ projects = [], showAddButton = false, onAddClick, title = "Videos List" }) => {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
                {showAddButton && (
                    <button className={styles.addButton} onClick={onAddClick}>
                        <Plus size={14} />
                        <span>New</span>
                    </button>
                )}
            </div>

            <div className={styles.list}>
                {projects.length > 0 ? (
                    projects.map((project, index) => (
                        <div key={index} className={styles.item}>
                            <div className={styles.icon} style={{ color: project.color || 'var(--primary-color)' }}>
                                ◆
                            </div>
                            <div className={styles.details}>
                                <h4 className={styles.name}>{project.name}</h4>
                                <p className={styles.date}>{project.date || project.description}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ padding: '20px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        No videos found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectList;
