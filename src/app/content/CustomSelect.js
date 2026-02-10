import { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';
import { ChevronUp, ChevronDown } from 'lucide-react';

const CustomSelect = ({ options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className={styles.customSelect} ref={dropdownRef}>
            <div
                className={`${styles.selectTrigger} ${isOpen ? styles.selectOpen : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{value || placeholder}</span>
                {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </div>

            {isOpen && (
                <div className={styles.selectOptions}>
                    {options.map((option) => (
                        <div
                            key={option}
                            className={`${styles.selectOption} ${value === option ? styles.selected : ''}`}
                            onClick={() => handleSelect(option)}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
