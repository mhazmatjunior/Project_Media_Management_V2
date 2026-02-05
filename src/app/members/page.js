"use client";

import { useMemo } from "react";
import { Trash2, Edit2 } from "lucide-react";
import Header from "@/components/Header";
import styles from "./page.module.css";

export default function MembersPage() {
    const members = useMemo(() => [
        {
            id: 1,
            name: "John Smith",
            handle: "@j.smith",
            email: "johnsmith@dashco.com",
            status: "Active",
            teams: ["Design", "Product"],
            image: "11"
        },
        {
            id: 2,
            name: "Ahmed Medi",
            handle: "@ahmed.medi",
            email: "ahmedmedi@dashco.com",
            status: "Active",
            teams: ["Development", "Product"],
            moreTeams: 2,
            image: "8"
        },
        {
            id: 3,
            name: "Mitchell Luo",
            handle: "@mitchell.luo",
            email: "mitchellluo@dashco.com",
            status: "Active",
            teams: ["Marketing", "Product"],
            image: "12"
        },
        {
            id: 4,
            name: "Milie Nose",
            handle: "@milie.nose",
            email: "milienose@dashco.com",
            status: "Active",
            teams: ["Marketing", "Product"],
            image: "5"
        },
        {
            id: 5,
            name: "Aditi Sharma",
            handle: "@aditi.s",
            email: "aditi.sharma@dashco.com",
            status: "Offline",
            teams: ["Management", "Product"],
            image: "9"
        },
        {
            id: 6,
            name: "Irfan Khan",
            handle: "@irfan.khan",
            email: "irfan.khan@dashco.com",
            status: "Active",
            teams: ["Development", "Design"],
            moreTeams: 2,
            image: "3"
        },
        {
            id: 7,
            name: "Natali Craig",
            handle: "@natali.craig",
            email: "natalicraig@dashco.com",
            status: "Offline",
            teams: ["Development", "Design"],
            moreTeams: 2,
            image: "10"
        },
        {
            id: 8,
            name: "Orlando Diggs",
            handle: "@orlando.diggs",
            email: "orlandodiggs@dashco.com",
            status: "Active",
            teams: ["Marketing", "Product"],
            image: "4"
        },
        {
            id: 9,
            name: "Drew Cano",
            handle: "@drew.cano",
            email: "drewcano@dashco.com",
            status: "Active",
            teams: ["Marketing", "Management"],
            image: "2"
        }
    ], []);

    return (
        <div className={styles.container}>
            <Header title="Members" />

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>

                            <th>Name</th>
                            <th>Status ↓</th>
                            <th>Email address</th>
                            <th>Teams</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((member) => (
                            <tr key={member.id}>

                                <td>
                                    <div className={styles.userCell}>
                                        <img
                                            src={`https://i.pravatar.cc/150?img=${member.image}`}
                                            alt={member.name}
                                            className={styles.avatar}
                                        />
                                        <div className={styles.userInfo}>
                                            <span className={styles.userName}>{member.name}</span>
                                            <span className={styles.userHandle}>{member.handle}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`${styles.statusBadge} ${member.status === 'Active' ? styles.statusActive : styles.statusOffline}`}>
                                        <span className={styles.dot}></span>
                                        {member.status}
                                    </span>
                                </td>
                                <td className={styles.email}>{member.email}</td>
                                <td>
                                    <div className={styles.teamsCell}>
                                        {member.teams.map((team, index) => (
                                            <span key={index} className={`${styles.teamBadge} ${index === 0 ? styles.primary : ''}`}>
                                                {team}
                                            </span>
                                        ))}
                                        {member.moreTeams && (
                                            <span className={styles.moreBadge}>+{member.moreTeams}</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <button className={styles.actionBtn}><Trash2 size={18} /></button>
                                        <button className={styles.actionBtn}><Edit2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
