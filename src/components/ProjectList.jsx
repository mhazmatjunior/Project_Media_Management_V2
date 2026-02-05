import { Plus, Play, ArrowRight, CheckCircle } from "lucide-react";
import styles from "./ProjectList.module.css";

const ProjectList = ({
    projects = [],
    showAddButton = false,
    onAddClick,
    showStartButton = false,
    onStartClick,
    showForwardButton = false,
    onForwardClick,
    showFinishButton = false,
    onFinishClick,
    showDepartmentBadge = false,
    title = "Videos List"
}) => {
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
                            {showDepartmentBadge && project.currentDepartment && (
                                <span className={styles.departmentBadge}>
                                    {project.currentDepartment.charAt(0).toUpperCase() + project.currentDepartment.slice(1)}
                                </span>
                            )}
                            {showStartButton && onStartClick && (
                                <button
                                    className={styles.startButton}
                                    onClick={() => onStartClick(project.id)}
                                    title="Start video"
                                >
                                    <Play size={16} />
                                    <span>Start</span>
                                </button>
                            )}
                            {showForwardButton && onForwardClick && (
                                <button
                                    className={styles.forwardButton}
                                    onClick={() => onForwardClick(project.id)}
                                    title="Forward to next department"
                                >
                                    <ArrowRight size={16} />
                                    <span>Forward</span>
                                </button>
                            )}
                            {showFinishButton && onFinishClick && (
                                <button
                                    className={styles.finishButton}
                                    onClick={() => onFinishClick(project.id)}
                                    title="Mark as finished"
                                >
                                    <CheckCircle size={16} />
                                    <span>Finish</span>
                                </button>
                            )}
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
