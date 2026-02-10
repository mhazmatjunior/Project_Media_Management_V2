import { Plus, Play, ArrowRight, CheckCircle, ChevronDown, User, Clock } from "lucide-react";
import styles from "./ProjectList.module.css";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const AssignmentDropdown = ({ members, assignedTo, onAssign }) => {
    // ... (rest of AssignmentDropdown remains same)
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const dropdownRef = useRef(null);
    const portalRef = useRef(null);

    useEffect(() => {
        const handleGlobalClick = (e) => {
            // Close if click is NOT in the toggle button (dropdownRef) AND NOT in the portal menu (portalRef)
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                portalRef.current &&
                !portalRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleGlobalClick);
            window.addEventListener("scroll", () => setIsOpen(false));
            window.addEventListener("resize", () => setIsOpen(false));
        }

        return () => {
            document.removeEventListener("mousedown", handleGlobalClick);
            window.removeEventListener("scroll", () => setIsOpen(false));
            window.removeEventListener("resize", () => setIsOpen(false));
        };
    }, [isOpen]);

    const toggle = () => {
        if (!isOpen) {
            const rect = dropdownRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + 4,
                left: rect.left,
                width: Math.max(rect.width, 200) // Ensure at least 200px
            });
        }
        setIsOpen(!isOpen);
    };

    const handleSelect = (userId) => {
        onAssign(userId);
        setIsOpen(false);
    };

    return (
        <div className={styles.dropdownWrapper} ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
            {assignedTo ? (
                <button
                    className={styles.assignedButton}
                    onClick={toggle}
                >
                    <CheckCircle size={14} />
                    <span>Assigned</span>
                </button>
            ) : (
                <button
                    className={styles.assignTrigger}
                    onClick={toggle}
                >
                    <span>Assign</span>
                    <ChevronDown size={14} />
                </button>
            )}

            {isOpen && createPortal(
                <div
                    ref={portalRef}
                    className={styles.dropdownMenu}
                    style={{
                        position: 'fixed',
                        top: coords.top,
                        left: coords.left,
                        margin: 0,
                        zIndex: 9999,
                        minWidth: coords.width
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {assignedTo && (
                        <div
                            className={styles.dropdownItem}
                            onClick={() => handleSelect(null)}
                            style={{ color: '#ef4444' }}
                        >
                            Unassign
                        </div>
                    )}
                    {members.map(member => (
                        <div
                            key={member.id}
                            className={`${styles.dropdownItem} ${assignedTo === member.id ? styles.activeItem : ''} `}
                            onClick={() => handleSelect(member.id)}
                        >
                            <User size={14} className={styles.memberIcon} />
                            <span>{member.name}</span>
                        </div>
                    ))}
                    {members.length === 0 && (
                        <div className={styles.emptyMessage}>No members found</div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
};

const ProjectTimer = ({ startTime }) => {
    const [elapsed, setElapsed] = useState("00:00:00");

    useEffect(() => {
        if (!startTime) return;

        const updateTimer = () => {
            const start = new Date(startTime).getTime();
            const now = new Date().getTime();
            const diff = now - start;

            if (diff < 0) {
                setElapsed("00:00:00");
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setElapsed(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        };

        updateTimer();
        const id = setInterval(updateTimer, 1000);
        return () => clearInterval(id);
    }, [startTime]);

    return (
        <span className={styles.projectTimer}>
            {elapsed}
        </span>
    );
};

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
    members = [],
    onAssign,
    title = "Videos List",
    onSelect,
    onTimeClick, // New prop for time tracking
    showTimer = false, // New prop to control timer visibility
    selectedTaskId,
    loading = false,
    finishButtonText = "Finish",
    currentUserId = null
}) => {
    // ... (rest of ProjectList)

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
                {loading ? (
                    // Loading Skeletons
                    Array.from({ length: 1 }).map((_, i) => (
                        <div key={i} className={`${styles.item} ${styles.skeletonItem}`}>
                            <div className={`${styles.icon} ${styles.skeletonPulse}`} style={{ backgroundColor: 'var(--border-color)' }}></div>
                            <div className={styles.details}>
                                <div className={`${styles.skeletonText} ${styles.skeletonPulse}`} style={{ width: '60%', height: '14px', marginBottom: '8px' }}></div>
                                <div className={`${styles.skeletonText} ${styles.skeletonPulse}`} style={{ width: '40%', height: '12px' }}></div>
                            </div>
                        </div>
                    ))
                ) : projects.length > 0 ? (
                    projects.map((project, index) => (
                        <div
                            key={index}
                            className={styles.item}
                            onClick={() => onSelect && onSelect(project)}
                            style={{ cursor: onSelect ? 'pointer' : 'default' }}
                        >
                            <div className={styles.icon} style={{ color: project.color || 'var(--primary-color)' }}>
                                ◆
                            </div>
                            <div className={styles.details}>
                                <h4 className={styles.name}>{project.name}</h4>
                                <div className={styles.metaRow}>
                                    <p className={styles.date}>{project.date || project.description}</p>
                                    {showTimer && project.status === 'running' && project.departmentEnteredAt && (
                                        <ProjectTimer startTime={project.departmentEnteredAt} />
                                    )}
                                </div>
                                {project.status === 'ended' ? (
                                    <span className={styles.assignedTo} style={{ color: 'var(--success-color, #10B981)' }}>
                                        Completed
                                    </span>
                                ) : (project.assigneeName && (
                                    <span className={styles.assignedTo}>
                                        Assigned to: {project.assigneeName}
                                    </span>
                                ))}
                            </div>

                            {onAssign && (
                                <div className={styles.assignContainer}>
                                    <AssignmentDropdown
                                        members={members}
                                        assignedTo={project.assignedTo}
                                        onAssign={(userId) => onAssign(project.id, userId)}
                                    />
                                </div>
                            )}

                            {onTimeClick && (
                                <button
                                    className={`${styles.timerButton} ${selectedTaskId === project.id ? styles.timerActive : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTimeClick(project);
                                    }}
                                    title="Track Time"
                                >
                                    <Clock size={16} />
                                </button>
                            )}

                            {showDepartmentBadge && project.currentDepartment && (
                                <span className={styles.departmentBadge}>
                                    {project.currentDepartment.charAt(0).toUpperCase() + project.currentDepartment.slice(1)}
                                </span>
                            )}
                            {showStartButton && onStartClick && (
                                <button
                                    className={styles.startButton}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onStartClick(project.id);
                                    }}
                                    title="Start video"
                                >
                                    <Play size={16} />
                                    <span>Start</span>
                                </button>
                            )}
                            {showForwardButton && onForwardClick && (
                                <button
                                    className={styles.forwardButton}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onForwardClick(project.id);
                                    }}
                                    title="Forward to next department"
                                >
                                    <ArrowRight size={16} />
                                    <span>Forward</span>
                                </button>
                            )}
                            {(showFinishButton || (currentUserId && String(project.assignedTo) === String(currentUserId))) && onFinishClick && (
                                <button
                                    className={styles.finishButton}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onFinishClick(project.id);
                                    }}
                                    title="Mark as finished"
                                >
                                    <CheckCircle size={16} />
                                    <span>{finishButtonText}</span>
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div style={{ padding: '20px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        No tasks found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectList;
